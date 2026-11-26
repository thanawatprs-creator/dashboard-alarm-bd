"""
WebSocket Connection Manager for Real-Time Dashboard Broadcasting.
Supports multiple concurrent clients, heartbeats, and typed industrial events.
"""
import json
import logging
from datetime import datetime
from typing import List, Dict, Any, Optional
from fastapi import WebSocket, WebSocketDisconnect

logger = logging.getLogger("websocket_manager")


class ConnectionManager:
    def __init__(self):
        self.active_connections: List[WebSocket] = []

    async def connect(self, websocket: WebSocket):
        await websocket.accept()
        self.active_connections.append(websocket)
        logger.info(f"WebSocket client connected. Active connections: {len(self.active_connections)}")
        # Send initial system status event
        await self.send_personal_message(
            {
                "event": "system_status",
                "timestamp": datetime.utcnow().isoformat(),
                "data": {
                    "status": "connected",
                    "clients_connected": len(self.active_connections),
                    "message": "Connected to Dashboard Alarm BD Real-Time Engine (ระบบเชื่อมต่อเรียลไทม์แล้ว)"
                }
            },
            websocket
        )

    def disconnect(self, websocket: WebSocket):
        if websocket in self.active_connections:
            self.active_connections.remove(websocket)
            logger.info(f"WebSocket client disconnected. Remaining active: {len(self.active_connections)}")

    async def send_personal_message(self, message: Dict[str, Any], websocket: WebSocket):
        try:
            await websocket.send_text(json.dumps(message, default=str))
        except Exception as e:
            logger.error(f"Failed to send personal message: {e}")

    async def broadcast(self, message: Dict[str, Any]):
        """
        Broadcast a JSON payload to all active WebSocket connections.
        Automatically purges broken connections.
        """
        if not self.active_connections:
            return

        payload = json.dumps(message, default=str)
        dead_connections = []
        for connection in self.active_connections:
            try:
                await connection.send_text(payload)
            except Exception as e:
                logger.warning(f"Error broadcasting to client, queuing removal: {e}")
                dead_connections.append(connection)

        for dead in dead_connections:
            self.disconnect(dead)

    async def broadcast_machine_change(
        self,
        machine_dict: Dict[str, Any],
        previous_status: str,
        current_status: str,
        event_description: str,
        summary_dict: Optional[Dict[str, Any]] = None,
        active_alarms: Optional[List[Dict[str, Any]]] = None
    ):
        """
        Broadcast typed status event and updated summary immediately.
        """
        timestamp = datetime.utcnow().isoformat()
        
        # 1. Main machine status changed event
        await self.broadcast({
            "event": "machine_status_changed",
            "timestamp": timestamp,
            "data": {
                "machine_id": machine_dict.get("machine_id"),
                "machine_name": machine_dict.get("machine_name"),
                "previous_status": previous_status,
                "current_status": current_status,
                "location": machine_dict.get("location"),
                "sr_number": machine_dict.get("sr_number"),
                "breakdown_description": machine_dict.get("breakdown_description"),
                "breakdown_start_time": machine_dict.get("breakdown_start_time"),
                "stop_reason": machine_dict.get("stop_reason"),
                "stopped_start_time": machine_dict.get("stopped_start_time"),
                "last_updated": machine_dict.get("last_updated"),
                "event_description": event_description
            }
        })

        # 2. Specific alarm creation / recovery events
        if current_status == "BREAKDOWN":
            await self.broadcast({
                "event": "alarm_created",
                "timestamp": timestamp,
                "data": {
                    "machine_id": machine_dict.get("machine_id"),
                    "machine_name": machine_dict.get("machine_name"),
                    "location": machine_dict.get("location"),
                    "sr_number": machine_dict.get("sr_number"),
                    "breakdown_description": machine_dict.get("breakdown_description"),
                    "breakdown_start_time": machine_dict.get("breakdown_start_time"),
                }
            })
        elif previous_status == "BREAKDOWN" and current_status == "NORMAL":
            await self.broadcast({
                "event": "machine_recovered",
                "timestamp": timestamp,
                "data": {
                    "machine_id": machine_dict.get("machine_id"),
                    "machine_name": machine_dict.get("machine_name"),
                    "location": machine_dict.get("location"),
                    "recovery_time": timestamp
                }
            })

        # 3. Broadcast updated dashboard summary if provided
        if summary_dict:
            await self.broadcast({
                "event": "dashboard_summary_updated",
                "timestamp": timestamp,
                "data": summary_dict
            })

        # 4. Broadcast full machine data update event
        await self.broadcast({
            "event": "machine_data_updated",
            "timestamp": timestamp,
            "data": {
                "machine": machine_dict,
                "active_alarms": active_alarms
            }
        })


manager = ConnectionManager()

