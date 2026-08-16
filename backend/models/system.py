from datetime import datetime
from typing import Dict, Literal, Optional

from pydantic import BaseModel, Field

from models.base import new_id, utcnow


class SyncOp(BaseModel):
    """Per-user oplog entry. `server_seq` is the per-user monotonic pull cursor."""
    id: str = Field(default_factory=new_id)
    user_id: str
    device_id: str
    entity_type: str  # task | project | health_entry | document | ai_memory | ...
    entity_id: str
    op: Literal["create", "update", "delete"]
    version: int
    server_seq: int = 0
    payload_hash: str = ""
    created_at: datetime = Field(default_factory=utcnow)


class AuditLogEntry(BaseModel):
    """Append-only. Never contains payload content — event metadata only."""
    id: str = Field(default_factory=new_id)
    user_id: str
    event: str  # auth.login, integration.connect, data.export, scope.change, ...
    actor: Literal["user", "system", "automation"] = "user"
    ip: Optional[str] = None
    device_id: Optional[str] = None
    meta: Dict = {}
    created_at: datetime = Field(default_factory=utcnow)


class Job(BaseModel):
    """ExportJob / DeletionJob (GDPR flows)."""
    id: str = Field(default_factory=new_id)
    user_id: str
    type: Literal["export", "delete"]
    status: Literal["queued", "running", "ready", "done", "failed"] = "queued"
    artifact_key: Optional[str] = None  # 🔴 signed export ZIP key
    scheduled_purge_at: Optional[datetime] = None
