from pydantic import BaseModel, EmailStr
from typing import Optional, List
from datetime import datetime

# User schemas
class UserBase(BaseModel):
    email: EmailStr
    username: str
    full_name: Optional[str] = None

class UserCreate(UserBase):
    password: str

class UserUpdate(BaseModel):
    email: Optional[EmailStr] = None
    username: Optional[str] = None
    full_name: Optional[str] = None
    password: Optional[str] = None

class UserResponse(UserBase):
    id: str
    is_active: bool
    is_verified: bool
    created_at: datetime
    updated_at: Optional[datetime] = None

    class Config:
        from_attributes = True

# Authentication schemas
class Token(BaseModel):
    access_token: str
    token_type: str
    user: UserResponse

class TokenData(BaseModel):
    username: Optional[str] = None

class LoginRequest(BaseModel):
    username: str
    password: str

# Page schemas
class PageBase(BaseModel):
    title: str
    content: Optional[str] = ""
    icon: Optional[str] = "📄"
    parent_id: Optional[str] = None
    is_public: Optional[bool] = False

class PageCreate(PageBase):
    pass

class PageUpdate(BaseModel):
    title: Optional[str] = None
    content: Optional[str] = None
    icon: Optional[str] = None
    parent_id: Optional[str] = None
    is_public: Optional[bool] = None
    is_archived: Optional[bool] = None

class PageResponse(PageBase):
    id: str
    owner_id: str
    is_archived: bool
    metadata: dict
    created_at: datetime
    updated_at: Optional[datetime] = None
    owner: UserResponse
    children: List['PageResponse'] = []
    collaboration_count: Optional[int] = 0

    class Config:
        from_attributes = True

# Collaboration schemas
class CollaborationCreate(BaseModel):
    user_id: str
    permission: str = "read"  # read, write, admin

class CollaborationResponse(BaseModel):
    id: str
    page_id: str
    user_id: str
    permission: str
    created_at: datetime
    user: UserResponse

    class Config:
        from_attributes = True

# Comment schemas
class CommentBase(BaseModel):
    content: str
    parent_comment_id: Optional[str] = None

class CommentCreate(CommentBase):
    pass

class CommentUpdate(BaseModel):
    content: str

class CommentResponse(CommentBase):
    id: str
    page_id: str
    author_id: str
    created_at: datetime
    updated_at: Optional[datetime] = None
    author: UserResponse
    replies: List['CommentResponse'] = []

    class Config:
        from_attributes = True

# Real-time schemas
class WebSocketMessage(BaseModel):
    type: str  # page_update, comment_added, user_joined, etc.
    data: dict
    user_id: Optional[str] = None
    page_id: Optional[str] = None

class PageUpdateMessage(BaseModel):
    page_id: str
    content: str
    user_id: str
    timestamp: datetime

class CommentMessage(BaseModel):
    comment_id: str
    page_id: str
    content: str
    author_id: str
    timestamp: datetime

# AI schemas
class AIRequest(BaseModel):
    prompt: str
    command: str
    context: Optional[str] = None
    page_id: Optional[str] = None

class AIResponse(BaseModel):
    success: bool
    result: str
    usage: Optional[dict] = None
    error: Optional[str] = None

# Search schemas
class SearchRequest(BaseModel):
    query: str
    user_id: str
    include_public: bool = True
    limit: int = 20

class SearchResponse(BaseModel):
    pages: List[PageResponse]
    total: int
    query: str

class PasswordResetRequest(BaseModel):
    email: EmailStr

class PasswordReset(BaseModel):
    token: str
    new_password: str 