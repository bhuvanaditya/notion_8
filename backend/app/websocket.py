import json
import asyncio
from typing import Dict, Set, Optional
from fastapi import WebSocket, WebSocketDisconnect
from app.schemas import WebSocketMessage, PageUpdateMessage, CommentMessage

class ConnectionManager:
    def __init__(self):
        # Store active connections by page_id
        self.page_connections: Dict[str, Set[WebSocket]] = {}
        # Store user info for each connection
        self.connection_users: Dict[WebSocket, dict] = {}
    
    async def connect(self, websocket: WebSocket, page_id: str, user_id: str, username: str):
        """Connect a user to a page's WebSocket."""
        await websocket.accept()
        
        if page_id not in self.page_connections:
            self.page_connections[page_id] = set()
        
        self.page_connections[page_id].add(websocket)
        self.connection_users[websocket] = {
            "user_id": user_id,
            "username": username,
            "page_id": page_id
        }
        
        # Notify others that user joined
        await self.broadcast_to_page(
            page_id,
            {
                "type": "user_joined",
                "data": {
                    "user_id": user_id,
                    "username": username,
                    "message": f"{username} joined the page"
                }
            },
            exclude_websocket=websocket
        )
    
    def disconnect(self, websocket: WebSocket):
        """Disconnect a user from WebSocket."""
        user_info = self.connection_users.get(websocket)
        if user_info:
            page_id = user_info["page_id"]
            username = user_info["username"]
            
            # Remove from page connections
            if page_id in self.page_connections:
                self.page_connections[page_id].discard(websocket)
                if not self.page_connections[page_id]:
                    del self.page_connections[page_id]
            
            # Remove user info
            del self.connection_users[websocket]
            
            # Notify others that user left
            asyncio.create_task(self.broadcast_to_page(
                page_id,
                {
                    "type": "user_left",
                    "data": {
                        "username": username,
                        "message": f"{username} left the page"
                    }
                }
            ))
    
    async def send_personal_message(self, message: dict, websocket: WebSocket):
        """Send a message to a specific user."""
        try:
            await websocket.send_text(json.dumps(message))
        except:
            # Connection might be closed
            pass
    
    async def broadcast_to_page(self, page_id: str, message: dict, exclude_websocket: Optional[WebSocket] = None):
        """Broadcast a message to all users on a specific page."""
        if page_id not in self.page_connections:
            return
        
        disconnected_websockets = set()
        
        for websocket in self.page_connections[page_id]:
            if websocket == exclude_websocket:
                continue
            
            try:
                await websocket.send_text(json.dumps(message))
            except:
                # Mark for removal if connection is broken
                disconnected_websockets.add(websocket)
        
        # Clean up disconnected websockets
        for websocket in disconnected_websockets:
            self.disconnect(websocket)
    
    async def broadcast_page_update(self, page_id: str, content: str, user_id: str, username: str):
        """Broadcast a page content update."""
        message = {
            "type": "page_update",
            "data": {
                "page_id": page_id,
                "content": content,
                "user_id": user_id,
                "username": username,
                "timestamp": str(asyncio.get_event_loop().time())
            }
        }
        await self.broadcast_to_page(page_id, message)
    
    async def broadcast_comment(self, page_id: str, comment_id: str, content: str, user_id: str, username: str):
        """Broadcast a new comment."""
        message = {
            "type": "comment_added",
            "data": {
                "comment_id": comment_id,
                "page_id": page_id,
                "content": content,
                "user_id": user_id,
                "username": username,
                "timestamp": str(asyncio.get_event_loop().time())
            }
        }
        await self.broadcast_to_page(page_id, message)
    
    async def broadcast_cursor_position(self, page_id: str, user_id: str, username: str, position: dict):
        """Broadcast cursor position for collaborative editing."""
        message = {
            "type": "cursor_position",
            "data": {
                "user_id": user_id,
                "username": username,
                "position": position,
                "timestamp": str(asyncio.get_event_loop().time())
            }
        }
        await self.broadcast_to_page(page_id, message, exclude_websocket=None)
    
    def get_page_users(self, page_id: str) -> list:
        """Get list of users currently on a page."""
        if page_id not in self.page_connections:
            return []
        
        users = []
        for websocket in self.page_connections[page_id]:
            user_info = self.connection_users.get(websocket)
            if user_info and user_info["page_id"] == page_id:
                users.append({
                    "user_id": user_info["user_id"],
                    "username": user_info["username"]
                })
        
        return users

# Global connection manager instance
manager = ConnectionManager()

async def websocket_endpoint(websocket: WebSocket, page_id: str, token: str):
    """WebSocket endpoint for real-time collaboration."""
    # TODO: Validate token and get user info
    # For now, using mock user info
    user_id = "mock_user_id"
    username = "mock_username"
    
    try:
        await manager.connect(websocket, page_id, user_id, username)
        
        # Send current page users to the new connection
        users = manager.get_page_users(page_id)
        await manager.send_personal_message({
            "type": "page_users",
            "data": {"users": users}
        }, websocket)
        
        # Listen for messages
        while True:
            try:
                data = await websocket.receive_text()
                message = json.loads(data)
                
                # Handle different message types
                if message["type"] == "page_update":
                    await manager.broadcast_page_update(
                        page_id,
                        message["data"]["content"],
                        user_id,
                        username
                    )
                
                elif message["type"] == "cursor_position":
                    await manager.broadcast_cursor_position(
                        page_id,
                        user_id,
                        username,
                        message["data"]["position"]
                    )
                
                elif message["type"] == "typing_start":
                    await manager.broadcast_to_page(page_id, {
                        "type": "typing_start",
                        "data": {
                            "user_id": user_id,
                            "username": username
                        }
                    }, exclude_websocket=websocket)
                
                elif message["type"] == "typing_stop":
                    await manager.broadcast_to_page(page_id, {
                        "type": "typing_stop",
                        "data": {
                            "user_id": user_id,
                            "username": username
                        }
                    }, exclude_websocket=websocket)
                
            except json.JSONDecodeError:
                # Invalid JSON, ignore
                continue
                
    except WebSocketDisconnect:
        manager.disconnect(websocket)
    except Exception as e:
        print(f"WebSocket error: {e}")
        manager.disconnect(websocket) 