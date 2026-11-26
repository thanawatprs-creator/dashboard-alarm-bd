"""
Simulation engine for real-time machine status updates and manual triggers.
Runs continuous simulation every 5 seconds (configurable) and broadcasts via WebSocket.
"""
from datetime import datetime, timedelta
import random
import asyncio
from typing import Optional, List, Dict, Any
from sqlalchemy.orm import Session
from .database import SessionLocal
from .models import Machine, AlarmHistory
from .crud import update_machine_status, get_dashboard_summary, get_active_alarms, get_machine_by_id
from .schemas import MachineStatusUpdate
from .websocket_manager import manager

# Realistic industrial breakdown descriptions for factory maintenance (PM Shop)
BREAKDOWN_SCENARIOS = [
    "Hydraulic pressure drop below operating limit (35 bar)",
    "Main spindle motor thermal overload tripped (88°C)",
    "Pneumatic cylinder air leak in clamping mechanism",
    "Conveyor drive gearbox abnormal vibration detected",
    "Ball screw servo axis position error limit exceeded",
    "Coolant circulation pump motor phase loss detected",
    "Emergency stop tripped by optical safety light curtain",
    "Lubrication line oil pressure low (< 2.5 bar)",
    "Feed rate encoder communication sync timeout",
    "Tool magazine indexing sensor failure on arm 3"
]

STOP_SCENARIOS = [
    "Scheduled PM inspection: filter replacement and grease lubrication",
    "Awaiting raw material supply feed from logistics AGV",
    "Shift handover mechanical inspection & safety checklist",
    "Die tooling replacement and precision alignment check",
    "Thermal stabilization waiting cycle after high-load run",
    "Operator pause for dimensional quality sampling inspection"
]


class SimulationEngine:
    def __init__(self):
        self.enabled = True
        self.interval_seconds = 5  # Configurable simulation interval (initially every 5 seconds)
        self.last_run: Optional[datetime] = None
        self.total_events = 0
        self._task: Optional[asyncio.Task] = None
        self._sr_counter = 100

    def get_status(self) -> Dict[str, Any]:
        return {
            "enabled": self.enabled,
            "interval_seconds": self.interval_seconds,
            "last_run": self.last_run,
            "total_events_generated": self.total_events,
            "connected_clients": len(manager.active_connections)
        }

    def set_enabled(self, enabled: bool):
        self.enabled = enabled
        return self.get_status()

    def set_interval(self, seconds: int):
        self.interval_seconds = max(1, min(120, seconds))
        return self.get_status()

    def generate_sr_number(self) -> str:
        self._sr_counter += 1
        year = datetime.utcnow().year
        return f"SR-{year}-{self._sr_counter:04d}"

    async def trigger_step(self, db: Session) -> Optional[Dict[str, Any]]:
        """
        Executes one step of continuous simulation:
        Pick 1 machine and apply a realistic state transition.
        Updates SQLite FIRST, then broadcasts through WebSocket immediately.
        """
        machines = db.query(Machine).all()
        if not machines:
            return None

        # Pick one machine
        target = random.choice(machines)
        current_status = target.status

        # Transition probabilities based on current state (ensures dynamic but realistic activity)
        if current_status == "NORMAL":
            # 55% stays normal, 25% stopped, 20% breakdown
            choice = random.choices(["KEEP", "STOPPED", "BREAKDOWN"], weights=[55, 25, 20])[0]
        elif current_status == "BREAKDOWN":
            # 45% stays breakdown (fixing in progress), 50% restored to NORMAL, 5% to STOPPED
            choice = random.choices(["KEEP", "NORMAL", "STOPPED"], weights=[45, 50, 5])[0]
        elif current_status == "STOPPED":
            # 35% stays stopped, 55% returns to NORMAL, 10% detects a breakdown during check
            choice = random.choices(["KEEP", "NORMAL", "BREAKDOWN"], weights=[35, 55, 10])[0]
        else:
            choice = "NORMAL"

        if choice == "KEEP":
            self.last_run = datetime.utcnow()
            return {"action": "no_change", "machine_id": target.machine_id}

        new_status = choice
        desc = None
        reason = None

        if new_status == "BREAKDOWN":
            desc = random.choice(BREAKDOWN_SCENARIOS)
        elif new_status == "STOPPED":
            reason = random.choice(STOP_SCENARIOS)

        update_dto = MachineStatusUpdate(
            status=new_status,
            description=desc,
            reason=reason
        )

        # 1. Update SQLite database FIRST
        updated = update_machine_status(db, target.machine_id, update_dto)
        self.total_events += 1
        self.last_run = datetime.utcnow()

        if updated:
            # 2. Gather latest summary and active alarms to broadcast
            summary = get_dashboard_summary(db)
            active_alarms = get_active_alarms(db)

            machine_dict = updated.model_dump()
            summary_dict = summary.model_dump()
            active_alarms_list = [a.model_dump() for a in active_alarms]

            event_desc = (
                f"Breakdown reported [{updated.sr_number}]: {desc}" if new_status == "BREAKDOWN"
                else f"Machine stopped: {reason}" if new_status == "STOPPED"
                else "Machine restored to normal operation"
            )

            # 3. Broadcast immediately through WebSocket to all connected clients
            await manager.broadcast_machine_change(
                machine_dict=machine_dict,
                previous_status=current_status,
                current_status=new_status,
                event_description=event_desc,
                summary_dict=summary_dict,
                active_alarms=active_alarms_list
            )

        return {
            "action": "status_changed",
            "machine_id": target.machine_id,
            "previous_status": current_status,
            "new_status": new_status,
            "sr_number": updated.sr_number if updated else None
        }

    async def simulate_manual_action(
        self,
        db: Session,
        action: str,  # "BREAKDOWN", "STOPPED", "NORMAL"
        machine_id: Optional[str] = None,
        custom_description: Optional[str] = None
    ):
        """
        Manually trigger a breakdown, stop, or restoration on a specific or random machine.
        Updates SQLite FIRST, then broadcasts through WebSocket immediately.
        """
        if machine_id:
            target = db.query(Machine).filter(Machine.machine_id == machine_id.upper()).first()
            if not target:
                raise ValueError(f"Machine {machine_id} not found")
        else:
            # Pick a suitable machine based on action
            machines = db.query(Machine).all()
            if action == "NORMAL":
                non_normals = [m for m in machines if m.status != "NORMAL"]
                target = random.choice(non_normals) if non_normals else random.choice(machines)
            elif action == "BREAKDOWN":
                normals = [m for m in machines if m.status != "BREAKDOWN"]
                target = random.choice(normals) if normals else random.choice(machines)
            else:  # STOPPED
                normals = [m for m in machines if m.status != "STOPPED"]
                target = random.choice(normals) if normals else random.choice(machines)

        prev_status = target.status
        desc = None
        reason = None
        if action == "BREAKDOWN":
            desc = custom_description or random.choice(BREAKDOWN_SCENARIOS)
        elif action == "STOPPED":
            reason = custom_description or random.choice(STOP_SCENARIOS)

        update_dto = MachineStatusUpdate(
            status=action,
            description=desc,
            reason=reason
        )

        # 1. Update SQLite FIRST
        updated = update_machine_status(db, target.machine_id, update_dto)
        self.total_events += 1
        self.last_run = datetime.utcnow()

        if updated:
            # 2. Gather latest summary and active alarms
            summary = get_dashboard_summary(db)
            active_alarms = get_active_alarms(db)

            machine_dict = updated.model_dump()
            summary_dict = summary.model_dump()
            active_alarms_list = [a.model_dump() for a in active_alarms]

            event_desc = (
                f"Breakdown reported [{updated.sr_number}]: {desc}" if action == "BREAKDOWN"
                else f"Machine stopped: {reason}" if action == "STOPPED"
                else "Machine restored to normal operation"
            )

            # 3. Broadcast immediately through WebSocket
            await manager.broadcast_machine_change(
                machine_dict=machine_dict,
                previous_status=prev_status,
                current_status=action,
                event_description=event_desc,
                summary_dict=summary_dict,
                active_alarms=active_alarms_list
            )

        return updated


simulation_engine = SimulationEngine()


async def background_simulation_loop():
    """
    Background simulation worker running continuously every interval_seconds (default 5s).
    """
    while True:
        try:
            await asyncio.sleep(simulation_engine.interval_seconds)
            if simulation_engine.enabled:
                db = SessionLocal()
                try:
                    await simulation_engine.trigger_step(db)
                finally:
                    db.close()
        except asyncio.CancelledError:
            break
        except Exception as e:
            print(f"[Simulation Loop Error]: {e}")
