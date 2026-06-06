from fastapi import APIRouter, HTTPException, Depends
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from typing import List
from backend.db.database import get_db
from backend.db.models import Blog, User
from backend.schemas.blog import BlogResponse, BlogUpdate
from backend.api.routes.auth import get_current_user

router = APIRouter(
    prefix="/api/blogs",
    tags=["blogs"]
)

@router.get("/", response_model=List[BlogResponse])
async def get_blogs(db: AsyncSession = Depends(get_db), current_user: User = Depends(get_current_user)):
    """Fetch all generated blogs for the logged-in user."""
    result = await db.execute(
        select(Blog)
        .where(Blog.user_id == current_user.id)
        .order_by(Blog.created_at.desc())
    )
    return result.scalars().all()

@router.get("/{blog_id}", response_model=BlogResponse)
async def get_blog(blog_id: str, db: AsyncSession = Depends(get_db), current_user: User = Depends(get_current_user)):
    """Fetch a specific blog by ID, ensuring it belongs to the logged-in user."""
    result = await db.execute(
        select(Blog).where(Blog.id == blog_id, Blog.user_id == current_user.id)
    )
    blog = result.scalar_one_or_none()
    if not blog:
        raise HTTPException(status_code=404, detail="Blog not found or unauthorized")
    return blog

@router.patch("/{blog_id}", response_model=BlogResponse)
async def update_blog(
    blog_id: str,
    payload: BlogUpdate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Update a blog title or markdown content for the logged-in user."""
    result = await db.execute(
        select(Blog).where(Blog.id == blog_id, Blog.user_id == current_user.id)
    )
    blog = result.scalar_one_or_none()

    if not blog:
        raise HTTPException(status_code=404, detail="Blog not found or unauthorized")

    if payload.topic is not None:
        blog.topic = payload.topic
    if payload.content is not None:
        blog.content = payload.content

    await db.commit()
    await db.refresh(blog)
    return blog

@router.delete("/{blog_id}")
async def delete_blog(blog_id: str, db: AsyncSession = Depends(get_db), current_user: User = Depends(get_current_user)):
    """Delete a blog by ID, ensuring it belongs to the logged-in user."""
    result = await db.execute(
        select(Blog).where(Blog.id == blog_id, Blog.user_id == current_user.id)
    )
    blog = result.scalar_one_or_none()
    
    if not blog:
        raise HTTPException(status_code=404, detail="Blog not found or unauthorized")
        
    await db.delete(blog)
    await db.commit()
    return {"message": "Blog deleted successfully"}
