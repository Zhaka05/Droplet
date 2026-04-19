from fastapi import FastAPI, WebSocket, WebSocketDisconnect
from fastapi.middleware.cors import CORSMiddleware
from typing import Optional
import asyncio

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)


class ConnectionManager:
    def __init__(self):
        self.active: list[WebSocket] = []

    async def connect(self, ws: WebSocket):
        await ws.accept()
        self.active.append(ws)

    def disconnect(self, ws: WebSocket):
        if ws in self.active:
            self.active.remove(ws)

    async def broadcast(self, data: dict):
        dead = []
        for ws in self.active:
            try:
                await ws.send_json(data)
            except Exception:
                dead.append(ws)
        for ws in dead:
            self.active.remove(ws)


manager = ConnectionManager()

# Last known sensor state — sent immediately to any newly connected client
current_state: dict = {
    "event_type": "IDLE",
    "probes_active": 0,
    "flow_level": "none",
    "flow_rate_gpm": 0.0,
    "gallons": 0.0,
    "duration_seconds": 0,
}


@app.post("/api/sensor/event")
async def sensor_event(event: dict):
    global current_state
    current_state = event
    await manager.broadcast(event)
    return {"ok": True}


@app.get("/api/sensor/state")
async def get_state():
    return current_state


@app.websocket("/ws")
async def websocket_endpoint(ws: WebSocket):
    await manager.connect(ws)
    # Immediately send current state so the UI isn't blank on reconnect
    await ws.send_json(current_state)
    try:
        while True:
            # Keep the connection alive; client may send pings
            await asyncio.wait_for(ws.receive_text(), timeout=30)
    except (WebSocketDisconnect, asyncio.TimeoutError, Exception):
        manager.disconnect(ws)
