"""
SQLAlchemy models for Machines and Alarm History.
"""
from datetime import datetime
from sqlalchemy import Column, Integer, String, DateTime
from .database import Base


class Machine(Base):
    __tablename__ = "machines"

    id = Column(Integer, primary_key=True, index=True)
    machine_id = Column(String(20), unique=True, index=True, nullable=False)
    machine_name = Column(String(50), nullable=False)
    location = Column(String(50), nullable=False)  # PM1 Shop, PM1 Overhaul, PM2 Shop, PM2 Overhaul
    status = Column(String(20), nullable=False, default="NORMAL")  # NORMAL, BREAKDOWN, STOPPED
    breakdown_description = Column(String(255), nullable=True)
    stop_reason = Column(String(255), nullable=True)
    sr_number = Column(String(50), nullable=True)
    breakdown_start_time = Column(DateTime, nullable=True)
    stopped_start_time = Column(DateTime, nullable=True)
    last_updated = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)


class AlarmHistory(Base):
    __tablename__ = "alarm_history"

    id = Column(Integer, primary_key=True, index=True)
    machine_id = Column(String(20), index=True, nullable=False)
    machine_name = Column(String(50), nullable=False)
    location = Column(String(50), nullable=False)
    previous_status = Column(String(20), nullable=False)
    new_status = Column(String(20), nullable=False)
    event_description = Column(String(255), nullable=False)
    event_timestamp = Column(DateTime, default=datetime.utcnow, index=True)
    sr_number = Column(String(50), nullable=True)

