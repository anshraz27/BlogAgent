from fastapi import APIRouter, Depends, HTTPException
from fastapi.responses import StreamingResponse
import json
import uuid
from datetime import datetime, date
from sqlalchemy.ext.asyncio import AsyncSession

from backend.schemas.blog import GenerateRequest, StreamRequest, BlogResponse
from backend.db.database import get_db
from backend.db.models import Blog, User
from backend.api.routes.auth import get_current_user

# Safely import the graph
try:
    from backend.ai_engine.graphs.main_graph import build_graph
except ModuleNotFoundError:
    from backend.ai_engine.graphs.main_graph import build_graph

router = APIRouter(
    prefix="/api",
    tags=["generate"]
)

graph = build_graph()

@router.post("/generate", response_model=BlogResponse)
async def generate_blog(request: GenerateRequest, db: AsyncSession = Depends(get_db), current_user: User = Depends(get_current_user)):
    """Generate a new blog and save it."""
    topic = request.topic.strip()
    if not topic:
        raise HTTPException(status_code=400, detail="Topic is required")

    thread_id = str(uuid.uuid4())

    initial_state = {
        "topic": topic,
        "as_of": str(date.today()),
        "sections": [],
    }

    config = {
        "configurable": {
            "thread_id": thread_id
        }
    }

    result = graph.invoke(initial_state, config=config)
    
    blog_content = result.get("final")
    if not blog_content:
        raise HTTPException(status_code=500, detail="Blog generation did not return content")

    blog_id = str(uuid.uuid4())
    
    new_blog = Blog(
        id=blog_id,
        topic=topic,
        content=blog_content,
        created_at=datetime.utcnow(),
        thread_id=thread_id,
        user_id=current_user.id
    )
    
    db.add(new_blog)
    await db.commit()
    await db.refresh(new_blog)

    return new_blog

@router.post("/stream")
def stream_blog(request: StreamRequest, current_user: User = Depends(get_current_user)):
    """Stream blog generation events."""
    initial_state = {
        "topic": request.topic,
        "as_of": str(date.today()),
        "sections": [],
    }

    config = {
        "configurable": {
            "thread_id": request.thread_id
        }
    }

    def generate():
        for event in graph.stream(initial_state, config=config):
            # Server-Sent Events format
            yield f"data: {json.dumps(event, default=str)}\n\n"

    return StreamingResponse(generate(), media_type="text/event-stream")
