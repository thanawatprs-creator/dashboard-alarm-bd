"""
Database operations for Machines and Alarm History.
"""
from datetime import datetime, timedelta
import random
from typing import List, Optional
from sqlalchemy.orm import Session
from sqlalchemy import desc
from .models import Machine, AlarmHistory
from .schemas import (
    MachineResponse,
    DashboardSummary,
    DashboardStatistics,
    StatusDistributionItem,
    LocationDistributionItem,
    DowntimeOverviewItem,
    ActiveAlarm,
    MachineStatusUpdate
)


def format_duration(minutes: int) -> str:
    if minutes <= 0:
        return "0m"
    if minutes < 60:
        return f"{minutes}m"
    hours = minutes // 60
    rem_min = minutes % 60
    if hours < 24:
        return f"{hours}h {rem_min}m" if rem_min > 0 else f"{hours}h"
    days = hours // 24
    rem_hours = hours % 24
    return f"{days}d {rem_hours}h"


def compute_durations(machine: Machine, now: Optional[datetime] = None):
    if now is None:
        now = datetime.utcnow()
    
    downtime_minutes = 0
    duration_minutes = 0

    if machine.status == "BREAKDOWN" and machine.breakdown_start_time:
        delta = now - machine.breakdown_start_time
        downtime_minutes = max(0, int(delta.total_seconds() / 60))
        duration_minutes = downtime_minutes
    elif machine.status == "STOPPED" and machine.stopped_start_time:
        delta = now - machine.stopped_start_time
        duration_minutes = max(0, int(delta.total_seconds() / 60))

    return {
        "downtime_minutes": downtime_minutes,
        "downtime_formatted": format_duration(downtime_minutes),
        "duration_minutes": duration_minutes,
        "duration_formatted": format_duration(duration_minutes)
    }


def seed_database(db: Session):
    """
    Seed initial 10 machines if the table is empty.
    Never duplicates if data exists.
    """
    existing_count = db.query(Machine).count()
    if existing_count > 0:
        return

    now = datetime.utcnow()
    
    # 10 Machines distributed across PM1 Shop, PM1 Overhaul, PM2 Shop, PM2 Overhaul
    initial_machines = [
        {
            "machine_id": "MC-001",
            "machine_name": "Machine 01",
            "location": "PM1 Shop",
            "status": "NORMAL",
            "breakdown_description": None,
            "stop_reason": None,
            "sr_number": None,
            "breakdown_start_time": None,
            "stopped_start_time": None,
            "last_updated": now - timedelta(minutes=5)
        },
        {
            "machine_id": "MC-002",
            "machine_name": "Machine 02",
            "location": "PM1 Shop",
            "status": "BREAKDOWN",
            "breakdown_description": "Hydraulic pressure loss in main cylinder clamp valve",
            "stop_reason": None,
            "sr_number": "SR-2026-0042",
            "breakdown_start_time": now - timedelta(minutes=48),
            "stopped_start_time": None,
            "last_updated": now - timedelta(minutes=48)
        },
        {
            "machine_id": "MC-003",
            "machine_name": "Machine 03",
            "location": "PM1 Shop",
            "status": "NORMAL",
            "breakdown_description": None,
            "stop_reason": None,
            "sr_number": None,
            "breakdown_start_time": None,
            "stopped_start_time": None,
            "last_updated": now - timedelta(minutes=12)
        },
        {
            "machine_id": "MC-004",
            "machine_name": "Machine 04",
            "location": "PM1 Overhaul",
            "status": "STOPPED",
            "breakdown_description": None,
            "stop_reason": "Scheduled PM inspection: filter cartridge replacement & oil check",
            "sr_number": None,
            "breakdown_start_time": None,
            "stopped_start_time": now - timedelta(minutes=32),
            "last_updated": now - timedelta(minutes=32)
        },
        {
            "machine_id": "MC-005",
            "machine_name": "Machine 05",
            "location": "PM1 Overhaul",
            "status": "NORMAL",
            "breakdown_description": None,
            "stop_reason": None,
            "sr_number": None,
            "breakdown_start_time": None,
            "stopped_start_time": None,
            "last_updated": now - timedelta(minutes=18)
        },
        {
            "machine_id": "MC-006",
            "machine_name": "Machine 06",
            "location": "PM2 Shop",
            "status": "BREAKDOWN",
            "breakdown_description": "Main spindle drive motor over-temperature trip (>88°C)",
            "stop_reason": None,
            "sr_number": "SR-2026-0043",
            "breakdown_start_time": now - timedelta(minutes=19),
            "stopped_start_time": None,
            "last_updated": now - timedelta(minutes=19)
        },
        {
            "machine_id": "MC-007",
            "machine_name": "Machine 07",
            "location": "PM2 Shop",
            "status": "NORMAL",
            "breakdown_description": None,
            "stop_reason": None,
            "sr_number": None,
            "breakdown_start_time": None,
            "stopped_start_time": None,
            "last_updated": now - timedelta(minutes=4)
        },
        {
            "machine_id": "MC-008",
            "machine_name": "Machine 08",
            "location": "PM2 Shop",
            "status": "NORMAL",
            "breakdown_description": None,
            "stop_reason": None,
            "sr_number": None,
            "breakdown_start_time": None,
            "stopped_start_time": None,
            "last_updated": now - timedelta(minutes=8)
        },
        {
            "machine_id": "MC-009",
            "machine_name": "Machine 09",
            "location": "PM2 Overhaul",
            "status": "STOPPED",
            "breakdown_description": None,
            "stop_reason": "Tooling blade changeover and precision alignment calibration",
            "sr_number": None,
            "breakdown_start_time": None,
            "stopped_start_time": now - timedelta(minutes=75),
            "last_updated": now - timedelta(minutes=75)
        },
        {
            "machine_id": "MC-010",
            "machine_name": "Machine 10",
            "location": "PM2 Overhaul",
            "status": "NORMAL",
            "breakdown_description": None,
            "stop_reason": None,
            "sr_number": None,
            "breakdown_start_time": None,
            "stopped_start_time": None,
            "last_updated": now - timedelta(minutes=2)
        }
    ]

    for item in initial_machines:
        m = Machine(**item)
        db.add(m)
    db.commit()

    # Add initial alarm history entries
    history_events = [
        {
            "machine_id": "MC-002",
            "machine_name": "Machine 02",
            "location": "PM1 Shop",
            "previous_status": "NORMAL",
            "new_status": "BREAKDOWN",
            "event_description": "Breakdown detected: Hydraulic pressure loss in main cylinder clamp valve",
            "event_timestamp": now - timedelta(minutes=48),
            "sr_number": "SR-2026-0042"
        },
        {
            "machine_id": "MC-004",
            "machine_name": "Machine 04",
            "location": "PM1 Overhaul",
            "previous_status": "NORMAL",
            "new_status": "STOPPED",
            "event_description": "Machine stopped: Scheduled PM inspection: filter cartridge replacement & oil check",
            "event_timestamp": now - timedelta(minutes=32),
            "sr_number": None
        },
        {
            "machine_id": "MC-006",
            "machine_name": "Machine 06",
            "location": "PM2 Shop",
            "previous_status": "NORMAL",
            "new_status": "BREAKDOWN",
            "event_description": "Breakdown detected: Main spindle drive motor over-temperature trip (>88°C)",
            "event_timestamp": now - timedelta(minutes=19),
            "sr_number": "SR-2026-0043"
        },
        {
            "machine_id": "MC-009",
            "machine_name": "Machine 09",
            "location": "PM2 Overhaul",
            "previous_status": "NORMAL",
            "new_status": "STOPPED",
            "event_description": "Machine stopped: Tooling blade changeover and precision alignment calibration",
            "event_timestamp": now - timedelta(minutes=75),
            "sr_number": None
        }
    ]

    for h in history_events:
        record = AlarmHistory(**h)
        db.add(record)
    db.commit()


def get_all_machines(db: Session) -> List[MachineResponse]:
    machines = db.query(Machine).order_by(Machine.machine_id).all()
    now = datetime.utcnow()
    result = []
    for m in machines:
        durations = compute_durations(m, now)
        data = {
            "id": m.id,
            "machine_id": m.machine_id,
            "machine_name": m.machine_name,
            "location": m.location,
            "status": m.status,
            "breakdown_description": m.breakdown_description,
            "stop_reason": m.stop_reason,
            "sr_number": m.sr_number,
            "breakdown_start_time": m.breakdown_start_time,
            "stopped_start_time": m.stopped_start_time,
            "last_updated": m.last_updated,
            **durations
        }
        result.append(MachineResponse(**data))
    return result


def get_machine_by_id(db: Session, machine_id: str) -> Optional[MachineResponse]:
    m = db.query(Machine).filter(Machine.machine_id == machine_id.upper()).first()
    if not m:
        return None
    now = datetime.utcnow()
    durations = compute_durations(m, now)
    data = {
        "id": m.id,
        "machine_id": m.machine_id,
        "machine_name": m.machine_name,
        "location": m.location,
        "status": m.status,
        "breakdown_description": m.breakdown_description,
        "stop_reason": m.stop_reason,
        "sr_number": m.sr_number,
        "breakdown_start_time": m.breakdown_start_time,
        "stopped_start_time": m.stopped_start_time,
        "last_updated": m.last_updated,
        **durations
    }
    return MachineResponse(**data)


def update_machine_status(
    db: Session,
    machine_id: str,
    update_data: MachineStatusUpdate
) -> Optional[MachineResponse]:
    machine = db.query(Machine).filter(Machine.machine_id == machine_id.upper()).first()
    if not machine:
        return None

    now = datetime.utcnow()
    prev_status = machine.status
    target_status = update_data.status.upper()

    # Normalize optional custom start_time to naive UTC
    custom_start: Optional[datetime] = None
    if update_data.start_time is not None:
        dt = update_data.start_time
        if dt.tzinfo is not None:
            from datetime import timezone
            dt = dt.astimezone(timezone.utc).replace(tzinfo=None)
        custom_start = dt

    if target_status not in ["NORMAL", "BREAKDOWN", "STOPPED"]:
        raise ValueError(f"Invalid status: {target_status}")

    event_desc = ""
    new_sr = machine.sr_number

    if target_status == "BREAKDOWN":
        machine.status = "BREAKDOWN"
        desc_text = update_data.description or "Unscheduled mechanical component failure"
        machine.breakdown_description = desc_text
        machine.stop_reason = None
        # Generate new SR if not already in breakdown or no SR
        if not new_sr or prev_status != "BREAKDOWN":
            random_seq = random.randint(1000, 9999)
            new_sr = f"SR-2026-{random_seq}"
        machine.sr_number = new_sr
        if custom_start is not None:
            machine.breakdown_start_time = custom_start
        elif prev_status != "BREAKDOWN":
            machine.breakdown_start_time = now
        machine.stopped_start_time = None
        event_desc = f"Breakdown reported [{new_sr}]: {desc_text}"

    elif target_status == "STOPPED":
        machine.status = "STOPPED"
        reason_text = update_data.reason or "Preventive maintenance inspection & adjustment"
        machine.stop_reason = reason_text
        machine.breakdown_description = None
        machine.sr_number = None
        machine.breakdown_start_time = None
        if custom_start is not None:
            machine.stopped_start_time = custom_start
        elif prev_status != "STOPPED":
            machine.stopped_start_time = now
        event_desc = f"Machine stopped: {reason_text}"

    else:  # NORMAL
        machine.status = "NORMAL"
        machine.breakdown_description = None
        machine.stop_reason = None
        machine.sr_number = None
        machine.breakdown_start_time = None
        machine.stopped_start_time = None
        if prev_status == "BREAKDOWN":
            event_desc = f"Breakdown resolved [{prev_status}]. Machine cleared for normal operation."
        elif prev_status == "STOPPED":
            event_desc = "Maintenance check complete. Machine resumed normal operation."
        else:
            event_desc = "Machine confirmed normal operational state."

    machine.last_updated = now

    # Record in history
    history = AlarmHistory(
        machine_id=machine.machine_id,
        machine_name=machine.machine_name,
        location=machine.location,
        previous_status=prev_status,
        new_status=target_status,
        event_description=event_desc,
        event_timestamp=now,
        sr_number=machine.sr_number if target_status == "BREAKDOWN" else None
    )
    db.add(history)
    db.commit()
    db.refresh(machine)

    return get_machine_by_id(db, machine.machine_id)


def get_dashboard_summary(db: Session) -> DashboardSummary:
    machines = db.query(Machine).all()
    now = datetime.utcnow()

    total = len(machines)
    normal = 0
    breakdown = 0
    stopped = 0
    total_breakdown_min = 0
    total_stopped_min = 0

    for m in machines:
        durations = compute_durations(m, now)
        if m.status == "NORMAL":
            normal += 1
        elif m.status == "BREAKDOWN":
            breakdown += 1
            total_breakdown_min += durations["downtime_minutes"]
        elif m.status == "STOPPED":
            stopped += 1
            total_stopped_min += durations["duration_minutes"]

    return DashboardSummary(
        total_machines=total,
        normal_count=normal,
        breakdown_count=breakdown,
        stopped_count=stopped,
        total_breakdown_minutes=total_breakdown_min,
        total_stopped_minutes=total_stopped_min,
        last_updated=now,
        demo_mode=True
    )


def get_dashboard_statistics(db: Session) -> DashboardStatistics:
    machines = db.query(Machine).all()
    now = datetime.utcnow()

    # Status distribution
    counts = {"NORMAL": 0, "BREAKDOWN": 0, "STOPPED": 0}
    for m in machines:
        if m.status in counts:
            counts[m.status] += 1

    status_dist = [
        StatusDistributionItem(status="NORMAL", label="NORMAL (ปกติ)", count=counts["NORMAL"], color="#10B981"),
        StatusDistributionItem(status="BREAKDOWN", label="BREAKDOWN (ขัดข้อง)", count=counts["BREAKDOWN"], color="#EF4444"),
        StatusDistributionItem(status="STOPPED", label="STOPPED (หยุดทำงาน)", count=counts["STOPPED"], color="#F59E0B")
    ]

    # Location distribution
    locations = ["PM1 Shop", "PM1 Overhaul", "PM2 Shop", "PM2 Overhaul"]
    loc_map = {loc: {"normal": 0, "breakdown": 0, "stopped": 0, "total": 0} for loc in locations}

    for m in machines:
        loc = m.location if m.location in loc_map else "PM1 Shop"
        loc_map[loc]["total"] += 1
        if m.status == "NORMAL":
            loc_map[loc]["normal"] += 1
        elif m.status == "BREAKDOWN":
            loc_map[loc]["breakdown"] += 1
        elif m.status == "STOPPED":
            loc_map[loc]["stopped"] += 1

    loc_dist = [
        LocationDistributionItem(
            location=loc,
            normal=data["normal"],
            breakdown=data["breakdown"],
            stopped=data["stopped"],
            total=data["total"]
        )
        for loc, data in loc_map.items()
    ]

    # Downtime overview: include ALL machines experiencing breakdowns or stopped conditions
    downtime_list = []
    for m in machines:
        dur = compute_durations(m, now)
        if m.status in ["BREAKDOWN", "STOPPED"]:
            reason = m.breakdown_description if m.status == "BREAKDOWN" else m.stop_reason
            # Ensure at least 1 minute on graph for visible bar rendering if just started
            display_mins = max(1, dur["duration_minutes"])
            downtime_list.append(
                DowntimeOverviewItem(
                    machine_id=m.machine_id,
                    machine_name=m.machine_name,
                    location=m.location,
                    status=m.status,
                    duration_minutes=display_mins,
                    duration_formatted=dur["duration_formatted"],
                    reason=reason or "-"
                )
            )

    downtime_list.sort(key=lambda x: x.duration_minutes, reverse=True)

    return DashboardStatistics(
        status_distribution=status_dist,
        location_distribution=loc_dist,
        downtime_overview=downtime_list
    )


def get_active_alarms(db: Session) -> List[ActiveAlarm]:
    breakdown_machines = db.query(Machine).filter(Machine.status == "BREAKDOWN").all()
    now = datetime.utcnow()
    alarms = []
    for m in breakdown_machines:
        dur = compute_durations(m, now)
        alarms.append(
            ActiveAlarm(
                machine_id=m.machine_id,
                machine_name=m.machine_name,
                location=m.location,
                sr_number=m.sr_number or "SR-PENDING",
                breakdown_description=m.breakdown_description or "Unspecified breakdown",
                breakdown_start_time=m.breakdown_start_time or now,
                downtime_minutes=dur["downtime_minutes"],
                downtime_formatted=dur["downtime_formatted"]
            )
        )
    # Sort consistently by downtime descending (longest active downtime first)
    alarms.sort(key=lambda x: x.downtime_minutes, reverse=True)
    return alarms


def get_alarm_history(
    db: Session,
    machine_id: Optional[str] = None,
    status: Optional[str] = None,
    location: Optional[str] = None,
    start_date: Optional[datetime] = None,
    end_date: Optional[datetime] = None,
    limit: int = 200
) -> List[AlarmHistory]:
    from datetime import timezone
    query = db.query(AlarmHistory)
    if machine_id and isinstance(machine_id, str):
        query = query.filter(AlarmHistory.machine_id == machine_id.upper())
    if status and isinstance(status, str):
        query = query.filter(AlarmHistory.new_status == status.upper())
    if location and isinstance(location, str):
        query = query.filter(AlarmHistory.location == location)
    if start_date and isinstance(start_date, datetime):
        if start_date.tzinfo is not None:
            start_date = start_date.astimezone(timezone.utc).replace(tzinfo=None)
        query = query.filter(AlarmHistory.event_timestamp >= start_date)
    if end_date and isinstance(end_date, datetime):
        if end_date.tzinfo is not None:
            end_date = end_date.astimezone(timezone.utc).replace(tzinfo=None)
        query = query.filter(AlarmHistory.event_timestamp <= end_date)

    limit_int = limit if isinstance(limit, int) else 200
    return query.order_by(desc(AlarmHistory.event_timestamp)).limit(limit_int).all()
