from datetime import datetime
from typing import List, Literal, Optional

from models.base import SyncableModel


class Project(SyncableModel):
    name: str
    color: str = "#6C5CE7"
    sort_order: float = 0
    archived: bool = False


class Task(SyncableModel):
    project_id: Optional[str] = None
    parent_task_id: Optional[str] = None  # subtask self-reference
    title: str
    notes: Optional[str] = None
    due_at: Optional[datetime] = None
    all_day: bool = True
    reminder_at: Optional[datetime] = None
    recurrence: Optional[str] = None  # RRULE string
    priority: int = 0  # 0..3
    tags: List[str] = []
    bucket: Literal["today", "upcoming", "someday"] = "today"
    sort_order: float = 0
    completed_at: Optional[datetime] = None
    source: Literal["user", "automation", "suggestion"] = "user"
    source_ref_id: Optional[str] = None
