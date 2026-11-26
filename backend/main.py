"""
FastAPI application for Dashboard Alarm BD – Phase 1 (Real-Time WebSocket Edition).
"""
import asyncio
import os
from contextlib import asynccontextmanager
from datetime import datetime
from typing import Optional, List, Dict, Any
from fastapi import FastAPI, Depends, HTTPException, Query, WebSocket, WebSocketDisconnect
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse
from sqlalchemy.orm import Session

from .database import engine, Base, get_db, SessionLocal
from .models import Machine, AlarmHistory
from .schemas import (
    MachineResponse,
    MachineStatusUpdate,
    DashboardSummary,
    DashboardStatistics,
    ActiveAlarm,
    AlarmHistoryResponse,
    SimulationStatus
)
from .crud import (
    seed_database,
    get_all_machines,
    get_machine_by_id,
    update_machine_status,
    get_dashboard_summary,
    get_dashboard_statistics,
    get_active_alarms,
    get_alarm_history
)
from .websocket_manager import manager
from .simulation import simulation_engine, background_simulation_loop


@asynccontextmanager
async def lifespan(app: FastAPI):
    # 1. Ensure tables exist
    Base.metadata.create_all(bind=engine)
    
    # 2. Seed initial 10 machines if empty
    db = SessionLocal()
    try:
        seed_database(db)
    finally:
        db.close()
    
    # 3. Start continuous simulation background worker (default 5s interval)
    sim_task = asyncio.create_task(background_simulation_loop())
    
    yield
    
    # Clean up
    sim_task.cancel()
    try:
        await sim_task
    except asyncio.CancelledError:
        pass


app = FastAPI(
    title="Dashboard Alarm BD - Real-Time Machine Breakdown Monitoring System",
    description="Factory maintenance machine condition, breakdown and real-time downtime monitoring with WebSockets",
    version="2.0.0",
    lifespan=lifespan
)

# Enable CORS for frontend Vite dev and production
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/api/status")
def root():
    return {
        "system": "Dashboard Alarm BD – Phase 1 (Real-Time Monitoring Edition)",
        "department": "PM Shop Maintenance Department (แผนกซ่อมบำรุง PM Shop)",
        "mode": "DEMO / SIMULATED MACHINE DATA (ข้อมูลจำลองเพื่อการสาธิต)",
        "status": "Online",
        "websocket_url": "/ws",
        "connected_clients": len(manager.active_connections),
        "docs": "/docs",
        "timestamp": datetime.utcnow()
    }

# ----------------------------------------------------
# WebSocket Real-Time Endpoint
# ----------------------------------------------------

async def websocket_handler(websocket: WebSocket):
    await manager.connect(websocket)
    try:
        while True:
            # Receive client ping or heartbeat messages
            data = await websocket.receive_text()
            if data == "ping" or '"type":"ping"' in data or '"event":"ping"' in data:
                await websocket.send_text('{"event":"pong","timestamp":"' + datetime.utcnow().isoformat() + '"}')
    except WebSocketDisconnect:
        manager.disconnect(websocket)
    except Exception as e:
        manager.disconnect(websocket)


@app.websocket("/ws")
async def websocket_endpoint(websocket: WebSocket):
    """Primary persistent WebSocket endpoint for real-time dashboard events."""
    await websocket_handler(websocket)


@app.websocket("/api/ws")
async def websocket_endpoint_api(websocket: WebSocket):
    """Alternative WebSocket endpoint prefixed with /api."""
    await websocket_handler(websocket)


# ----------------------------------------------------
# 1. Machine Endpoints
# ----------------------------------------------------

@app.get("/api/machines", response_model=List[MachineResponse])
def read_machines(db: Session = Depends(get_db)):
    """Retrieve all 10 machines with calculated downtime & durations."""
    return get_all_machines(db)


@app.get("/api/machines/{machine_id}", response_model=MachineResponse)
def read_machine(machine_id: str, db: Session = Depends(get_db)):
    """Retrieve details for a specific machine by machine_id (e.g., MC-001)."""
    machine = get_machine_by_id(db, machine_id)
    if not machine:
        raise HTTPException(status_code=404, detail=f"Machine {machine_id} not found")
    return machine


@app.post("/api/machines/{machine_id}/status", response_model=MachineResponse)
async def change_machine_status(
    machine_id: str,
    update: MachineStatusUpdate,
    db: Session = Depends(get_db)
):
    """
    Manually update a machine's status (NORMAL, BREAKDOWN, STOPPED).
    Updates SQLite database FIRST, then immediately broadcasts through WebSocket.
    """
    try:
        target_machine = get_machine_by_id(db, machine_id)
        if not target_machine:
            raise HTTPException(status_code=404, detail=f"Machine {machine_id} not found")
        
        prev_status = target_machine.status
        updated = update_machine_status(db, machine_id, update)
        if not updated:
            raise HTTPException(status_code=404, detail=f"Machine {machine_id} not found")

        # Broadcast via WebSocket immediately
        summary = get_dashboard_summary(db)
        active_alarms = get_active_alarms(db)

        machine_dict = updated.model_dump()
        summary_dict = summary.model_dump()
        active_alarms_list = [a.model_dump() for a in active_alarms]

        event_desc = (
            f"Breakdown reported [{updated.sr_number}]: {update.description or 'Manual fault injection'}"
            if update.status == "BREAKDOWN"
            else f"Machine stopped: {update.reason or 'Manual maintenance stop'}"
            if update.status == "STOPPED"
            else "Machine restored to normal operation (คืนสถานะปกติ)"
        )

        await manager.broadcast_machine_change(
            machine_dict=machine_dict,
            previous_status=prev_status,
            current_status=update.status,
            event_description=event_desc,
            summary_dict=summary_dict,
            active_alarms=active_alarms_list
        )

        return updated
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))


# ----------------------------------------------------
# 2. Dashboard Endpoints
# ----------------------------------------------------

@app.get("/api/dashboard/summary", response_model=DashboardSummary)
def read_dashboard_summary(db: Session = Depends(get_db)):
    """Calculated dynamic summary metrics (total, normal, breakdown, stopped, downtime)."""
    return get_dashboard_summary(db)


@app.get("/api/dashboard/statistics", response_model=DashboardStatistics)
def read_dashboard_statistics(db: Session = Depends(get_db)):
    """Aggregated chart data for status distribution, locations, and downtime rankings."""
    return get_dashboard_statistics(db)


# ----------------------------------------------------
# 3. Alarm Endpoints
# ----------------------------------------------------

@app.get("/api/alarms/active", response_model=List[ActiveAlarm])
def read_active_alarms(db: Session = Depends(get_db)):
    """Dedicated breakdown alarms panel list, sorted by longest downtime."""
    return get_active_alarms(db)


@app.get("/api/alarms/history", response_model=List[AlarmHistoryResponse])
def read_alarm_history(
    machine_id: Optional[str] = Query(None, description="Filter by machine ID"),
    status: Optional[str] = Query(None, description="Filter by status (BREAKDOWN, STOPPED, NORMAL)"),
    location: Optional[str] = Query(None, description="Filter by location"),
    start_date: Optional[datetime] = Query(None, description="Filter start date ISO"),
    end_date: Optional[datetime] = Query(None, description="Filter end date ISO"),
    limit: int = Query(100, ge=1, le=500),
    db: Session = Depends(get_db)
):
    """Retrieve historical status events and breakdown alarms with filtering."""
    mid = machine_id if isinstance(machine_id, str) else None
    st = status if isinstance(status, str) else None
    loc = location if isinstance(location, str) else None
    s_dt = start_date if isinstance(start_date, datetime) else None
    e_dt = end_date if isinstance(end_date, datetime) else None
    lim = limit if isinstance(limit, int) else 100

    return get_alarm_history(
        db,
        machine_id=mid,
        status=st,
        location=loc,
        start_date=s_dt,
        end_date=e_dt,
        limit=lim
    )


# ----------------------------------------------------
# 4. Simulation Control Endpoints
# ----------------------------------------------------

@app.get("/api/simulation/status", response_model=SimulationStatus)
def get_simulation_status():
    """Get current simulation engine state."""
    return simulation_engine.get_status()


@app.post("/api/simulation/toggle")
def toggle_simulation(enabled: bool = Query(...)):
    """Turn continuous background auto simulation on or off."""
    return simulation_engine.set_enabled(enabled)


@app.post("/api/simulation/interval")
def set_simulation_interval(seconds: int = Query(..., ge=1, le=120)):
    """Set simulation tick interval in seconds (default: 5s)."""
    return simulation_engine.set_interval(seconds)


@app.post("/api/simulation/trigger")
async def trigger_manual_simulation(
    action: str = Query(..., description="BREAKDOWN, STOPPED, or NORMAL"),
    machine_id: Optional[str] = Query(None, description="Target specific machine or random"),
    description: Optional[str] = Query(None, description="Custom breakdown description or stop reason"),
    db: Session = Depends(get_db)
):
    """Instantly simulate a breakdown, stop, or restoration on a machine."""
    try:
        act = action if isinstance(action, str) else "NORMAL"
        mid = machine_id if isinstance(machine_id, str) else None
        desc = description if isinstance(description, str) else None

        updated = await simulation_engine.simulate_manual_action(
            db=db,
            action=act.upper(),
            machine_id=mid,
            custom_description=desc
        )
        return {
            "status": "success",
            "action": act.upper(),
            "machine": updated
        }
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))


# -------------------------------------------------------
# Serve React Frontend static files (for Render production)
# Build the frontend first: cd frontend && npm run build
# -------------------------------------------------------
_FRONTEND_DIST = os.path.join(os.path.dirname(os.path.dirname(__file__)), "frontend", "dist")

if os.path.isdir(_FRONTEND_DIST):
    # Serve static assets (JS, CSS, images)
    app.mount("/assets", StaticFiles(directory=os.path.join(_FRONTEND_DIST, "assets")), name="assets")

    # Serve any other static files in /dist (favicon, logos, etc.)
    @app.get("/favicon.webp")
    def favicon():
        return FileResponse(os.path.join(_FRONTEND_DIST, "favicon.webp"))

    @app.get("/isuzu-logo.webp")
    def isuzu_logo():
        return FileResponse(os.path.join(_FRONTEND_DIST, "isuzu-logo.webp"))

    @app.get("/isuzu-featured.webp")
    def isuzu_featured():
        return FileResponse(os.path.join(_FRONTEND_DIST, "isuzu-featured.webp"))

    @app.get("/isuzu-icon.webp")
    def isuzu_icon():
        return FileResponse(os.path.join(_FRONTEND_DIST, "isuzu-icon.webp"))

    @app.get("/dashboard-logo.png")
    def dashboard_logo():
        return FileResponse(os.path.join(_FRONTEND_DIST, "dashboard-logo.png"))

    # Catch-all: serve React index.html for all non-API, non-WS routes (SPA routing)
    @app.get("/{full_path:path}")
    def serve_react_app(full_path: str):
        index_file = os.path.join(_FRONTEND_DIST, "index.html")
        if os.path.isfile(index_file):
            return FileResponse(index_file)
        return {"error": "Frontend not built. Run: cd frontend && npm run build"}
