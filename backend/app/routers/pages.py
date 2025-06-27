from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session
from typing import List, Optional
from datetime import datetime

from app.database import get_db
from app.auth import get_current_active_user, check_page_permission
from app.models import User, Page, PageCollaboration, PageVersion, Comment
from app.schemas import (
    PageCreate, PageUpdate, PageResponse, 
    CollaborationCreate, CollaborationResponse,
    CommentCreate, CommentResponse, SearchRequest, SearchResponse
)
from app.websocket import manager

router = APIRouter()

@router.post("/", response_model=PageResponse)
async def create_page(
    page_data: PageCreate,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """Create a new page."""
    db_page = Page(
        **page_data.dict(),
        owner_id=current_user.id
    )
    
    db.add(db_page)
    db.commit()
    db.refresh(db_page)
    
    return db_page

@router.get("/", response_model=List[PageResponse])
async def get_pages(
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db),
    parent_id: Optional[str] = Query(None),
    include_archived: bool = False
):
    """Get user's pages."""
    query = db.query(Page).filter(Page.owner_id == current_user.id)
    
    if parent_id:
        query = query.filter(Page.parent_id == parent_id)
    else:
        query = query.filter(Page.parent_id.is_(None))
    
    if not include_archived:
        query = query.filter(Page.is_archived == False)
    
    pages = query.all()
    return pages

@router.get("/{page_id}", response_model=PageResponse)
async def get_page(
    page_id: str,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """Get a specific page."""
    # Check permissions
    check_page_permission(page_id, current_user, db, "read")
    
    page = db.query(Page).filter(Page.id == page_id).first()
    if not page:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Page not found"
        )
    
    return page

@router.put("/{page_id}", response_model=PageResponse)
async def update_page(
    page_id: str,
    page_data: PageUpdate,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """Update a page."""
    # Check permissions
    check_page_permission(page_id, current_user, db, "write")
    
    page = db.query(Page).filter(Page.id == page_id).first()
    if not page:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Page not found"
        )
    
    # Create version before updating
    if page_data.content is not None and page_data.content != page.content:
        version = PageVersion(
            page_id=page_id,
            content=page.content,
            version_number=len(page.versions) + 1,
            created_by=current_user.id
        )
        db.add(version)
    
    # Update page
    update_data = page_data.dict(exclude_unset=True)
    for field, value in update_data.items():
        setattr(page, field, value)
    
    setattr(page, "updated_at", datetime.utcnow())
    db.commit()
    db.refresh(page)
    
    # Broadcast update via WebSocket
    await manager.broadcast_page_update(
        page_id, page.content, current_user.id, current_user.username
    )
    
    return page

@router.delete("/{page_id}")
async def delete_page(
    page_id: str,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """Delete a page."""
    # Check permissions
    check_page_permission(page_id, current_user, db, "admin")
    
    page = db.query(Page).filter(Page.id == page_id).first()
    if not page:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Page not found"
        )
    
    # Archive instead of delete
    page.is_archived = True
    setattr(page, "updated_at", datetime.utcnow())
    db.commit()
    
    return {"message": "Page archived successfully"}

@router.post("/{page_id}/duplicate", response_model=PageResponse)
async def duplicate_page(
    page_id: str,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """Duplicate a page."""
    # Check permissions
    check_page_permission(page_id, current_user, db, "read")
    
    original_page = db.query(Page).filter(Page.id == page_id).first()
    if not original_page:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Page not found"
        )
    
    # Create duplicate
    new_page = Page(
        title=f"{original_page.title} (Copy)",
        content=original_page.content,
        icon=original_page.icon,
        parent_id=original_page.parent_id,
        owner_id=current_user.id,
        is_public=False
    )
    
    db.add(new_page)
    db.commit()
    db.refresh(new_page)
    
    return new_page

@router.post("/{page_id}/collaborate", response_model=CollaborationResponse)
async def add_collaborator(
    page_id: str,
    collaboration_data: CollaborationCreate,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """Add a collaborator to a page."""
    # Check permissions
    check_page_permission(page_id, current_user, db, "admin")
    
    # Check if user exists
    user = db.query(User).filter(User.id == collaboration_data.user_id).first()
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found"
        )
    
    # Check if collaboration already exists
    existing = db.query(PageCollaboration).filter(
        PageCollaboration.page_id == page_id,
        PageCollaboration.user_id == collaboration_data.user_id
    ).first()
    
    if existing:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Collaboration already exists"
        )
    
    # Create collaboration
    collaboration = PageCollaboration(
        page_id=page_id,
        user_id=collaboration_data.user_id,
        permission=collaboration_data.permission
    )
    
    db.add(collaboration)
    db.commit()
    db.refresh(collaboration)
    
    return collaboration

@router.get("/{page_id}/collaborators", response_model=List[CollaborationResponse])
async def get_collaborators(
    page_id: str,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """Get page collaborators."""
    # Check permissions
    check_page_permission(page_id, current_user, db, "read")
    
    collaborations = db.query(PageCollaboration).filter(
        PageCollaboration.page_id == page_id
    ).all()
    
    return collaborations

@router.post("/{page_id}/comments", response_model=CommentResponse)
async def add_comment(
    page_id: str,
    comment_data: CommentCreate,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """Add a comment to a page."""
    # Check permissions
    check_page_permission(page_id, current_user, db, "read")
    
    comment = Comment(
        page_id=page_id,
        author_id=current_user.id,
        content=comment_data.content,
        parent_comment_id=comment_data.parent_comment_id
    )
    
    db.add(comment)
    db.commit()
    db.refresh(comment)
    
    # Broadcast comment via WebSocket
    await manager.broadcast_comment(
        page_id, comment.id, comment.content, current_user.id, current_user.username
    )
    
    return comment

@router.get("/{page_id}/comments", response_model=List[CommentResponse])
async def get_comments(
    page_id: str,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """Get page comments."""
    # Check permissions
    check_page_permission(page_id, current_user, db, "read")
    
    comments = db.query(Comment).filter(
        Comment.page_id == page_id,
        Comment.parent_comment_id.is_(None)  # Only top-level comments
    ).all()
    
    return comments

@router.post("/search", response_model=SearchResponse)
async def search_pages(
    search_data: SearchRequest,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """Search pages."""
    query = db.query(Page).filter(Page.owner_id == current_user.id)
    
    if search_data.query:
        query = query.filter(Page.title.ilike(f"%{search_data.query}%"))
    
    if not search_data.include_public:
        query = query.filter(Page.is_public == False)
    
    pages = query.limit(search_data.limit).all()
    total = query.count()
    
    page_responses = [PageResponse.model_validate(page) for page in pages]
    return SearchResponse(pages=page_responses, total=total, query=search_data.query) 