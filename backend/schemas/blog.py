from pydantic import BaseModel
from typing import Optional
from datetime import datetime

class GenerateRequest(BaseModel):
    topic: str

class StreamRequest(BaseModel):
    topic: str
    thread_id: Optional[str] = "default_user"

class BlogUpdate(BaseModel):
    topic: Optional[str] = None
    content: Optional[str] = None

class BlogResponse(BaseModel):
    id: str
    topic: str
    content: str
    created_at: datetime
    thread_id: str
    user_id: Optional[str] = None

    class Config:
        from_attributes = True
