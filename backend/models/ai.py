from datetime import datetime
from typing import Dict, List, Literal, Optional

from pydantic import BaseModel, Field

from models.base import SyncableModel, new_id


class AIMemoryEntry(SyncableModel):
    """User-viewable/editable AI memory (S35). 🔴 statement/structured sensitive."""
    domain: Literal["routine", "preference", "dismissal"]
    statement: str  # plain sentence: "Prefers morning workouts"
    structured: Dict = {}  # {key, value, confidence}
    provenance: Dict = {}  # {source: learned|onboarding|user_added, evidence}
    author: Literal["system", "user"] = "system"


class Suggestion(BaseModel):
    id: str = Field(default_factory=new_id)
    user_id: str
    kind: Literal["reschedule_task", "schedule_gap", "reminder", "recipe", "insight"]
    text: str
    reason: str  # "based on…" — explainability guardrail (§6.4)
    sources: List[Dict] = []  # [{type: "health.sleep", value: "5h20m"}]
    proposed_action: Optional[Dict] = None
    status: Literal["pending", "accepted", "dismissed", "expired"] = "pending"
    expires_at: Optional[datetime] = None
