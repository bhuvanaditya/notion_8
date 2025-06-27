from fastapi import APIRouter, Depends, HTTPException, status, Request
from fastapi.security import OAuth2PasswordRequestForm
from sqlalchemy.orm import Session
from datetime import timedelta, datetime
import httpx
import secrets
from sqlalchemy.sql import func
from sqlalchemy import inspect
from dateutil.parser import parse as parse_datetime
import os
import requests

from app.database import get_db
from app.auth import authenticate_user, create_access_token, get_current_active_user, get_password_hash
from app.models import User, PasswordResetToken
from app.schemas import UserCreate, UserResponse, Token, LoginRequest, PasswordResetRequest, PasswordReset
from app.config import settings

router = APIRouter()

def send_email(to_email: str, subject: str, content: str):
    api_key = os.getenv("SENDGRID_API_KEY")
    sender = os.getenv("SENDGRID_SENDER_EMAIL")
    if not api_key or not sender:
        print("[SendGrid] Missing API key or sender email.")
        return
    data = {
        "personalizations": [
            {"to": [{"email": to_email}]}
        ],
        "from": {"email": sender},
        "subject": subject,
        "content": [
            {"type": "text/plain", "value": content}
        ]
    }
    resp = requests.post(
        "https://api.sendgrid.com/v3/mail/send",
        headers={
            "Authorization": f"Bearer {api_key}",
            "Content-Type": "application/json"
        },
        json=data
    )
    if resp.status_code >= 400:
        print(f"[SendGrid] Failed to send email: {resp.text}")
    else:
        print(f"[SendGrid] Email sent to {to_email}")

@router.post("/register", response_model=UserResponse)
async def register(user_data: UserCreate, db: Session = Depends(get_db)):
    """Register a new user."""
    # Check if user already exists
    existing_user = db.query(User).filter(
        (User.email == user_data.email) | (User.username == user_data.username)
    ).first()
    
    if existing_user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Email or username already registered"
        )
    
    # Create new user
    hashed_password = get_password_hash(user_data.password)
    db_user = User(
        email=user_data.email,
        username=user_data.username,
        full_name=user_data.full_name,
        hashed_password=hashed_password
    )
    
    db.add(db_user)
    db.commit()
    db.refresh(db_user)
    
    return db_user

@router.post("/login", response_model=Token)
async def login(login_data: LoginRequest, db: Session = Depends(get_db)):
    """Login user and return access token."""
    user = authenticate_user(db, login_data.username, login_data.password)
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect username or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    access_token_expires = timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = create_access_token(
        data={"sub": user.username}, expires_delta=access_token_expires
    )
    
    return {
        "access_token": access_token,
        "token_type": "bearer",
        "user": user
    }

@router.post("/token", response_model=Token)
async def login_for_access_token(
    form_data: OAuth2PasswordRequestForm = Depends(),
    db: Session = Depends(get_db)
):
    """OAuth2 compatible token login."""
    user = authenticate_user(db, form_data.username, form_data.password)
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect username or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    access_token_expires = timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = create_access_token(
        data={"sub": user.username}, expires_delta=access_token_expires
    )
    
    return {
        "access_token": access_token,
        "token_type": "bearer",
        "user": user
    }

@router.get("/me", response_model=UserResponse)
async def read_users_me(current_user: User = Depends(get_current_active_user)):
    """Get current user information."""
    return current_user

@router.post("/logout")
async def logout(current_user: User = Depends(get_current_active_user)):
    """Logout user (client should discard token)."""
    return {"message": "Successfully logged out"}

@router.post("/oauth/google", response_model=Token)
async def oauth_google(request: Request, db: Session = Depends(get_db)):
    data = await request.json()
    code = data.get("code")
    if not code:
        raise HTTPException(status_code=400, detail="Missing code")

    # Exchange code for tokens
    async with httpx.AsyncClient() as client:
        token_resp = await client.post(
            "https://oauth2.googleapis.com/token",
            data={
                "client_id": settings.GOOGLE_CLIENT_ID,
                "client_secret": settings.GOOGLE_CLIENT_SECRET,
                "code": code,
                "grant_type": "authorization_code",
                "redirect_uri": data.get("redirect_uri"),
            },
            headers={"Content-Type": "application/x-www-form-urlencoded"},
        )
        token_json = token_resp.json()
        access_token = token_json.get("access_token")
        id_token = token_json.get("id_token")
        if not access_token:
            raise HTTPException(status_code=400, detail="Failed to get access token from Google")

        # Get user info
        userinfo_resp = await client.get(
            "https://www.googleapis.com/oauth2/v2/userinfo",
            headers={"Authorization": f"Bearer {access_token}"}
        )
        userinfo = userinfo_resp.json()
        email = userinfo.get("email")
        sub = userinfo.get("id")
        name = userinfo.get("name")
        if not email or not sub:
            raise HTTPException(status_code=400, detail="Failed to get user info from Google")

    # Find or create user
    user = db.query(User).filter_by(provider="google", provider_id=sub).first()
    if not user:
        user = db.query(User).filter_by(email=email).first()
        if user:
            user.provider = "google"
            user.provider_id = sub
        else:
            user = User(
                email=email,
                username=email,
                full_name=name,
                is_active=True,
                is_verified=True,
                provider="google",
                provider_id=sub,
                hashed_password="oauth2"
            )
            db.add(user)
        db.commit()
        db.refresh(user)

    access_token_expires = timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = create_access_token(
        data={"sub": user.username}, expires_delta=access_token_expires
    )
    return {"access_token": access_token, "token_type": "bearer", "user": user}

@router.post("/oauth/github", response_model=Token)
async def oauth_github(request: Request, db: Session = Depends(get_db)):
    data = await request.json()
    code = data.get("code")
    if not code:
        raise HTTPException(status_code=400, detail="Missing code")

    # Exchange code for access token
    async with httpx.AsyncClient() as client:
        token_resp = await client.post(
            "https://github.com/login/oauth/access_token",
            data={
                "client_id": settings.GITHUB_CLIENT_ID,
                "client_secret": settings.GITHUB_CLIENT_SECRET,
                "code": code,
                "redirect_uri": data.get("redirect_uri"),
            },
            headers={"Accept": "application/json"},
        )
        token_json = token_resp.json()
        access_token = token_json.get("access_token")
        if not access_token:
            raise HTTPException(status_code=400, detail="Failed to get access token from GitHub")

        # Get user info
        userinfo_resp = await client.get(
            "https://api.github.com/user",
            headers={"Authorization": f"Bearer {access_token}"}
        )
        userinfo = userinfo_resp.json()
        github_id = str(userinfo.get("id"))
        email = userinfo.get("email")
        name = userinfo.get("name") or userinfo.get("login")
        if not github_id:
            raise HTTPException(status_code=400, detail="Failed to get user info from GitHub")
        # GitHub may not return email if it's private, fetch from /emails
        if not email:
            emails_resp = await client.get(
                "https://api.github.com/user/emails",
                headers={"Authorization": f"Bearer {access_token}"}
            )
            emails = emails_resp.json()
            if isinstance(emails, list):
                primary = next((e for e in emails if e.get("primary")), None)
                email = primary["email"] if primary else emails[0]["email"] if emails else None
        if not email:
            raise HTTPException(status_code=400, detail="Failed to get email from GitHub")

    # Find or create user
    user = db.query(User).filter_by(provider="github", provider_id=github_id).first()
    if not user:
        user = db.query(User).filter_by(email=email).first()
        if user:
            user.provider = "github"
            user.provider_id = github_id
        else:
            user = User(
                email=email,
                username=email,
                full_name=name,
                is_active=True,
                is_verified=True,
                provider="github",
                provider_id=github_id,
                hashed_password="oauth2"
            )
            db.add(user)
        db.commit()
        db.refresh(user)

    access_token_expires = timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = create_access_token(
        data={"sub": user.username}, expires_delta=access_token_expires
    )
    return {"access_token": access_token, "token_type": "bearer", "user": user}

@router.post("/password-reset/request")
async def password_reset_request(data: PasswordResetRequest, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.email == data.email).first()
    if not user:
        # For security, do not reveal if user exists
        return {"message": "If that email exists, a reset link has been sent."}
    # Generate token
    token = secrets.token_urlsafe(32)
    expires_at = datetime.utcnow() + timedelta(hours=1)
    reset_token = PasswordResetToken(user_id=user.id, token=token, expires_at=expires_at)
    db.add(reset_token)
    db.commit()
    # Send email with reset link
    reset_link = f"http://localhost:3000/reset-password?token={token}"
    send_email(
        to_email=user.email,
        subject="Password Reset for Notion Clone",
        content=f"Click the following link to reset your password: {reset_link}\nIf you did not request this, you can ignore this email."
    )
    return {"message": "If that email exists, a reset link has been sent."}

@router.post("/password-reset/reset")
async def password_reset(data: PasswordReset, db: Session = Depends(get_db)):
    reset_token = db.query(PasswordResetToken).filter(PasswordResetToken.token == data.token).first()
    if not reset_token:
        raise HTTPException(status_code=400, detail="Invalid or expired token")
    expires_at = reset_token.expires_at
    # Convert to Python datetime if needed
    if not isinstance(expires_at, datetime):
        expires_at = parse_datetime(str(expires_at))
    if expires_at.replace(tzinfo=None) < datetime.utcnow():
        raise HTTPException(status_code=400, detail="Invalid or expired token")
    user = db.query(User).filter(User.id == reset_token.user_id).first()
    if not user:
        raise HTTPException(status_code=400, detail="User not found")
    user.hashed_password = get_password_hash(data.new_password)
    db.delete(reset_token)
    db.commit()
    return {"message": "Password has been reset successfully."} 