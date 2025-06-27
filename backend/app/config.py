from pydantic_settings import BaseSettings
from typing import Optional
import os

class Settings(BaseSettings):
    # Database
    DATABASE_URL: str = "postgresql://bhuvan_6:Bhuvan1234@localhost/notion_new_6"
    
    # Security
    SECRET_KEY: str = "your-secret-key-change-in-production"
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 30
    
    # Redis (for real-time features)
    REDIS_URL: str = "redis://localhost:6379"
    
    # CORS
    ALLOWED_ORIGINS: list = ["http://localhost:3000", "https://your-frontend-domain.vercel.app"]
    
    # AI Integration
    CLAUDE_API_KEY: Optional[str] = None
    
    # OAuth2
    GOOGLE_CLIENT_ID: Optional[str] = os.getenv("GOOGLE_CLIENT_ID")
    GOOGLE_CLIENT_SECRET: Optional[str] = os.getenv("GOOGLE_CLIENT_SECRET")
    GITHUB_CLIENT_ID: Optional[str] = os.getenv("GITHUB_CLIENT_ID")
    GITHUB_CLIENT_SECRET: Optional[str] = os.getenv("GITHUB_CLIENT_SECRET")
    
    # Environment
    ENVIRONMENT: str = "development"
    DEBUG: bool = True
    
    # Email
    SENDGRID_API_KEY: Optional[str] = os.getenv("SENDGRID_API_KEY")
    SENDGRID_SENDER_EMAIL: Optional[str] = os.getenv("SENDGRID_SENDER_EMAIL")
    
    class Config:
        env_file = ".env"
        case_sensitive = False

settings = Settings()

# Database URL for different environments
def get_database_url():
    if settings.ENVIRONMENT == "production":
        # Use DATABASE_URL from environment (e.g., from Vercel)
        return os.getenv("DATABASE_URL", settings.DATABASE_URL)
    else:
        return settings.DATABASE_URL 