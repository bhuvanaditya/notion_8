from fastapi import APIRouter, WebSocket, WebSocketDisconnect, Query
from app.websocket import websocket_endpoint

router = APIRouter()

@router.websocket("/{page_id}")
async def websocket_route(
    websocket: WebSocket,
    page_id: str,
    token: str = Query(...)
):
    """WebSocket endpoint for real-time collaboration."""
    await websocket_endpoint(websocket, page_id, token) 