from fastapi import Depends, HTTPException, status
from jose import JWTError, jwt
from passlib.context import CryptContext
from sqlalchemy.orm import Session
from datetime import datetime, timedelta
from typing import Optional

from app.config import settings
from app.models import User
from app.schemas import TokenData
from app.database import get_db
from fastapi.security import OAuth2PasswordBearer

# Password hashing context
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

# OAuth2 scheme for token extraction
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/api/auth/token")

# Password hashing and verification

def verify_password(plain_password: str, hashed_password: str) -> bool:
    return pwd_context.verify(plain_password, hashed_password)

def get_password_hash(password: str) -> str:
    return pwd_context.hash(password)

# JWT token creation and verification

def create_access_token(data: dict, expires_delta: Optional[timedelta] = None) -> str:
    to_encode = data.copy()
    if expires_delta:
        expire = datetime.utcnow() + expires_delta
    else:
        expire = datetime.utcnow() + timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, settings.SECRET_KEY, algorithm=settings.ALGORITHM)
    return encoded_jwt

def verify_token(token: str) -> Optional[TokenData]:
    try:
        payload = jwt.decode(token, settings.SECRET_KEY, algorithms=[settings.ALGORITHM])
        username = payload.get("sub")
        if not isinstance(username, str):
            return None
        return TokenData(username=username)
    except JWTError:
        return None

# User authentication

def authenticate_user(db: Session, username: str, password: str) -> Optional[User]:
    user = db.query(User).filter(User.username == username).first()
    if not user:
        return None
    hashed_password = getattr(user, "hashed_password", None)
    if not isinstance(hashed_password, str):
        return None
    if not verify_password(password, hashed_password):
        return None
    return user

# Dependency to get current user from token

def get_current_user(
    token: str = Depends(oauth2_scheme),
    db: Session = Depends(get_db)
) -> User:
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )
    token_data = verify_token(token)
    if token_data is None:
        raise credentials_exception
    user = db.query(User).filter(User.username == token_data.username).first()
    if user is None:
        raise credentials_exception
    return user

def get_current_active_user(current_user: User = Depends(get_current_user)) -> User:
    if not getattr(current_user, "is_active", False):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Inactive user"
        )
    return current_user

# Permission check for page access

def check_page_permission(
    page_id: str,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db),
    required_permission: str = "read"
) -> bool:
    from app.models import Page, PageCollaboration
    page = db.query(Page).filter(Page.id == page_id).first()
    if page is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Page not found"
        )
    if getattr(page, "owner_id", None) == current_user.id:
        return True
    # Ensure is_public is a boolean value, even if it's a SQLAlchemy column element
    is_public_value = getattr(page, "is_public", False)
    if (isinstance(is_public_value, bool) and is_public_value) or (not isinstance(is_public_value, bool) and bool(int(is_public_value))):
        if required_permission == "read":
            return True
    collaboration = db.query(PageCollaboration).filter(
        PageCollaboration.page_id == page_id,
        PageCollaboration.user_id == current_user.id
    ).first()
    if collaboration is not None and (
        collaboration.permission == required_permission or
        collaboration.permission == "admin"
    ):
        return True
    raise HTTPException(
        status_code=status.HTTP_403_FORBIDDEN,
        detail="Insufficient permissions"
    )
