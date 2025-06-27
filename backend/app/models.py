import uuid
from sqlalchemy import Column, String, Text, DateTime, Boolean, ForeignKey, Integer, JSON
from sqlalchemy.orm import relationship, Mapped, mapped_column
from sqlalchemy.sql import func
from app.database import Base

def generate_uuid() -> str:
    return str(uuid.uuid4())

class User(Base):
    __tablename__ = "users"

    id: Mapped[str] = mapped_column(String, primary_key=True, default=generate_uuid)
    email: Mapped[str] = mapped_column(String, unique=True, index=True, nullable=False)
    username: Mapped[str] = mapped_column(String, unique=True, index=True, nullable=False)
    hashed_password: Mapped[str] = mapped_column(String, nullable=False)
    full_name: Mapped[str] = mapped_column(String, nullable=True)
    is_active: Mapped[bool] = mapped_column(Boolean, default=True)
    is_verified: Mapped[bool] = mapped_column(Boolean, default=False)
    created_at: Mapped[DateTime] = mapped_column(DateTime(timezone=True), server_default=func.now())
    updated_at: Mapped[DateTime] = mapped_column(DateTime(timezone=True), onupdate=func.now(), nullable=True)
    provider: Mapped[str] = mapped_column(String, nullable=True)  # 'google', 'github', or None
    provider_id: Mapped[str] = mapped_column(String, nullable=True)  # The unique user id from the provider

    # Relationships
    pages = relationship("Page", back_populates="owner", cascade="all, delete-orphan")
    collaborations = relationship("PageCollaboration", back_populates="user", cascade="all, delete-orphan")
    comments = relationship("Comment", back_populates="author", cascade="all, delete-orphan")

class Page(Base):
    __tablename__ = "pages"

    id: Mapped[str] = mapped_column(String, primary_key=True, default=generate_uuid)
    title: Mapped[str] = mapped_column(String, nullable=False)
    content: Mapped[str] = mapped_column(Text, default="")
    icon: Mapped[str] = mapped_column(String, default="📄")
    parent_id: Mapped[str] = mapped_column(String, ForeignKey("pages.id"), nullable=True)
    owner_id: Mapped[str] = mapped_column(String, ForeignKey("users.id"), nullable=False)
    is_public: Mapped[bool] = mapped_column(Boolean, default=False)
    is_archived: Mapped[bool] = mapped_column(Boolean, default=False)
    page_metadata: Mapped[dict] = mapped_column(JSON, default=dict)
    created_at: Mapped[DateTime] = mapped_column(DateTime(timezone=True), server_default=func.now())
    updated_at: Mapped[DateTime] = mapped_column(DateTime(timezone=True), onupdate=func.now(), nullable=True)

    # Relationships
    owner = relationship("User", back_populates="pages")
    parent = relationship("Page", remote_side=[id], back_populates="children")
    children = relationship("Page", back_populates="parent", cascade="all, delete-orphan")
    collaborations = relationship("PageCollaboration", back_populates="page", cascade="all, delete-orphan")
    comments = relationship("Comment", back_populates="page", cascade="all, delete-orphan")
    versions = relationship("PageVersion", back_populates="page", cascade="all, delete-orphan")

class PageCollaboration(Base):
    __tablename__ = "page_collaborations"

    id: Mapped[str] = mapped_column(String, primary_key=True, default=generate_uuid)
    page_id: Mapped[str] = mapped_column(String, ForeignKey("pages.id"), nullable=False)
    user_id: Mapped[str] = mapped_column(String, ForeignKey("users.id"), nullable=False)
    permission: Mapped[str] = mapped_column(String, default="read")  # read, write, admin
    created_at: Mapped[DateTime] = mapped_column(DateTime(timezone=True), server_default=func.now())

    # Relationships
    page = relationship("Page", back_populates="collaborations")
    user = relationship("User", back_populates="collaborations")

class PageVersion(Base):
    __tablename__ = "page_versions"

    id: Mapped[str] = mapped_column(String, primary_key=True, default=generate_uuid)
    page_id: Mapped[str] = mapped_column(String, ForeignKey("pages.id"), nullable=False)
    content: Mapped[str] = mapped_column(Text, nullable=False)
    version_number: Mapped[int] = mapped_column(Integer, nullable=False)
    created_by: Mapped[str] = mapped_column(String, ForeignKey("users.id"), nullable=False)
    created_at: Mapped[DateTime] = mapped_column(DateTime(timezone=True), server_default=func.now())

    # Relationships
    page = relationship("Page", back_populates="versions")

class Comment(Base):
    __tablename__ = "comments"

    id: Mapped[str] = mapped_column(String, primary_key=True, default=generate_uuid)
    page_id: Mapped[str] = mapped_column(String, ForeignKey("pages.id"), nullable=False)
    author_id: Mapped[str] = mapped_column(String, ForeignKey("users.id"), nullable=False)
    content: Mapped[str] = mapped_column(Text, nullable=False)
    parent_comment_id: Mapped[str] = mapped_column(String, ForeignKey("comments.id"), nullable=True)
    created_at: Mapped[DateTime] = mapped_column(DateTime(timezone=True), server_default=func.now())
    updated_at: Mapped[DateTime] = mapped_column(DateTime(timezone=True), onupdate=func.now(), nullable=True)

    # Relationships
    page = relationship("Page", back_populates="comments")
    author = relationship("User", back_populates="comments")
    parent_comment = relationship("Comment", remote_side=[id], back_populates="replies")
    replies = relationship("Comment", back_populates="parent_comment", cascade="all, delete-orphan")

class UserSession(Base):
    __tablename__ = "user_sessions"

    id: Mapped[str] = mapped_column(String, primary_key=True, default=generate_uuid)
    user_id: Mapped[str] = mapped_column(String, ForeignKey("users.id"), nullable=False)
    session_token: Mapped[str] = mapped_column(String, unique=True, nullable=False)
    expires_at: Mapped[DateTime] = mapped_column(DateTime(timezone=True), nullable=False)
    created_at: Mapped[DateTime] = mapped_column(DateTime(timezone=True), server_default=func.now())
    is_active: Mapped[bool] = mapped_column(Boolean, default=True)

class PasswordResetToken(Base):
    __tablename__ = "password_reset_tokens"

    id: Mapped[str] = mapped_column(String, primary_key=True, default=generate_uuid)
    user_id: Mapped[str] = mapped_column(String, ForeignKey("users.id"), nullable=False)
    token: Mapped[str] = mapped_column(String, unique=True, nullable=False)
    expires_at: Mapped[DateTime] = mapped_column(DateTime(timezone=True), nullable=False)
    created_at: Mapped[DateTime] = mapped_column(DateTime(timezone=True), server_default=func.now())

    user = relationship("User") 