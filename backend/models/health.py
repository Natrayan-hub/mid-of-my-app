from datetime import datetime
from typing import Literal, Optional

from pydantic import BaseModel, Field

from models.base import SyncableModel, new_id


class HealthEntry(SyncableModel):
    """Manual logs (water / mood / weight). 🔴 value/note are sensitive."""
    type: Literal["water", "mood", "weight"]
    value: float
    note: Optional[str] = None
    logged_at: datetime


class HealthCacheSample(BaseModel):
    """Integration-derived samples. LOCAL-ONLY by default — this cloud model is
    used exclusively after explicit user opt-in (POST /health/cache/opt-in)."""
    id: str = Field(default_factory=new_id)
    user_id: str
    metric: Literal[
        "steps", "sleep", "heart_rate", "active_energy",
        "workout", "weight", "recovery", "stress",
    ]
    value: float
    unit: str
    start_at: datetime
    end_at: datetime
    source: Literal["apple_health", "health_connect", "garmin"]
    readiness_input: bool = True
