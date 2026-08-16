"""Shared base for all syncable entities (Technical Foundation §A.0).

- Client-generated UUIDv4 string ids (never Mongo ObjectID in APIs).
- ISO UTC timestamps, soft delete via deleted_at.
- Per-record monotonic `version` + last-writer `device_id` for conflict detection.
"""
import uuid
from datetime import datetime, timezone
from typing import Optional

from pydantic import BaseModel, Field


def utcnow() -> datetime:
    return datetime.now(timezone.utc)


def new_id() -> str:
    return str(uuid.uuid4())


class SyncableModel(BaseModel):
    id: str = Field(default_factory=new_id)
    user_id: str
    version: int = 1
    device_id: Optional[str] = None
    created_at: datetime = Field(default_factory=utcnow)
    updated_at: datetime = Field(default_factory=utcnow)
    deleted_at: Optional[datetime] = None
