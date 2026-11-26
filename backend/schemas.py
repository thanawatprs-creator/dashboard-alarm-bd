"""
Pydantic schemas for request/response serialization.
"""
from datetime import datetime
from typing import Optional, List, Dict, Any
from pydantic import BaseModel, Field


class MachineBase(BaseModel):
    machine_id: str
    machine_name: str
    location: str
    status: str
    breakdown_description: Optional[str] = None
    stop_reason: Optional[str] = None
    sr_number: Optional[str] = None
    breakdown_start_time: Optional[datetime] = None
    stopped_start_time: Optional[datetime] = None
    last_updated: datetime


class MachineResponse(MachineBase):
    id: int
    downtime_minutes: int = 0
    downtime_formatted: str = "0m"
    duration_minutes: int = 0
    duration_formatted: str = "0m"

    class Config:
        from_attributes = True


class MachineStatusUpdate(BaseModel):
    status: str = Field(..., description="NORMAL, BREAKDOWN, or STOPPED")
    description: Optional[str] = Field(None, description="Breakdown description (if BREAKDOWN)")
    reason: Optional[str] = Field(None, description="Stop reason (if STOPPED)")
    start_time: Optional[datetime] = Field(None, description="Optional custom start time for breakdown or stopped status")


class DashboardSummary(BaseModel):
    total_machines: int = 10
    normal_count: int = 0
    breakdown_count: int = 0
    stopped_count: int = 0
    total_breakdown_minutes: int = 0
    total_stopped_minutes: int = 0
    last_updated: datetime
    demo_mode: bool = True


class StatusDistributionItem(BaseModel):
    status: str
    label: str
    count: int
    color: str


class LocationDistributionItem(BaseModel):
    location: str
    normal: int
    breakdown: int
    stopped: int
    total: int


class DowntimeOverviewItem(BaseModel):
    machine_id: str
    machine_name: str
    location: str
    status: str
    duration_minutes: int
    duration_formatted: str
    reason: str


class DashboardStatistics(BaseModel):
    status_distribution: List[StatusDistributionItem]
    location_distribution: List[LocationDistributionItem]
    downtime_overview: List[DowntimeOverviewItem]


class ActiveAlarm(BaseModel):
    machine_id: str
    machine_name: str
    location: str
    sr_number: str
    breakdown_description: str
    breakdown_start_time: datetime
    downtime_minutes: int
    downtime_formatted: str


class AlarmHistoryResponse(BaseModel):
    id: int
    machine_id: str
    machine_name: str
    location: str
    previous_status: str
    new_status: str
    event_description: str
    event_timestamp: datetime
    sr_number: Optional[str] = None

    class Config:
        from_attributes = True


class SimulationStatus(BaseModel):
    enabled: bool
    interval_seconds: int = 30
    last_run: Optional[datetime] = None
    total_events_generated: int = 0

