from sqlalchemy import Column, String, Text, DateTime, ForeignKey
from sqlalchemy.orm import relationship
from datetime import datetime
from backend.db.database import Base

class User(Base):
    __tablename__ = "users"

    id = Column(String, primary_key=True, index=True)
    email = Column(String, unique=True, index=True, nullable=False)
    hashed_password = Column(String, nullable=False)
    
    # Setup mapping to blogs
    blogs = relationship("Blog", back_populates="owner", cascade="all, delete-orphan")

class Blog(Base):
    __tablename__ = "blogs"

    id = Column(String, primary_key=True, index=True)
    topic = Column(String, index=True, nullable=False)
    content = Column(Text, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    thread_id = Column(String, nullable=False)
    
    # Establish Foreign Key connecting to User
    user_id = Column(String, ForeignKey("users.id"), nullable=False, index=True)
    
    owner = relationship("User", back_populates="blogs")

