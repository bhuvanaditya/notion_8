from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
import httpx
import os

from app.database import get_db
from app.auth import get_current_active_user
from app.models import User
from app.schemas import AIRequest, AIResponse
from app.config import settings

router = APIRouter()

@router.post("/claude", response_model=AIResponse)
async def claude_ai(
    request: AIRequest,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """Generate content using Claude AI."""
    
    if not settings.CLAUDE_API_KEY:
        # Return mock response if no API key
        mock_responses = {
            "improve": "Here's an improved version of your text with better clarity and structure.",
            "continue": "Continuing from where you left off, here are some additional thoughts...",
            "summarize": "Summary: This text discusses the main points concisely.",
            "expand": "Let me expand on this topic with more details and examples...",
            "simplify": "Here's a simplified version that's easier to understand...",
            "formal": "Here's a more formal version of your text...",
            "casual": "Here's a more casual, friendly version...",
            "bullets": "Here are the key points in bullet format:\n• Point 1\n• Point 2\n• Point 3",
            "custom": f"Here's a response to your custom request: {request.prompt}"
        }
        
        response = mock_responses.get(request.command, "Processing your request...")
        
        return AIResponse(
            success=True,
            result=response,
            usage={"tokens": 100}
        )
    
    try:
        # Real Claude API integration
        async with httpx.AsyncClient() as client:
            response = await client.post(
                "https://api.anthropic.com/v1/messages",
                headers={
                    "Content-Type": "application/json",
                    "x-api-key": settings.CLAUDE_API_KEY,
                    "anthropic-version": "2023-06-01"
                },
                json={
                    "model": "claude-3-opus-20240229",
                    "max_tokens": 1024,
                    "messages": [{
                        "role": "user",
                        "content": f"{request.command}: {request.prompt}\n\nContext: {request.context or ''}"
                    }]
                },
                timeout=30.0
            )
            
            if response.status_code == 200:
                data = response.json()
                content = data["content"][0]["text"]
                
                return AIResponse(
                    success=True,
                    result=content,
                    usage=data.get("usage", {})
                )
            else:
                return AIResponse(
                    success=False,
                    result="",
                    error=f"Claude API error: {response.status_code}"
                )
                
    except Exception as e:
        return AIResponse(
            success=False,
            result="",
            error=f"Failed to process AI request: {str(e)}"
        ) 