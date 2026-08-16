from datetime import datetime
from typing import List, Literal, Optional

from pydantic import BaseModel, Field

from models.base import new_id, utcnow

Provider = Literal[
    "apple_health", "health_connect", "google_calendar", "apple_calendar",
    "garmin", "instagram", "notion", "alexa",
]


class Integration(BaseModel):
    id: str = Field(default_factory=new_id)
    user_id: str
    provider: Provider
    status: Literal["connected", "error", "expired", "disconnected"] = "connected"
    scopes: List[str] = []
    direction: Literal["read", "write", "two_way"] = "read"
    last_sync_at: Optional[datetime] = None
    last_error: Optional[str] = None
    external_account: Optional[str] = None
    created_at: datetime = Field(default_factory=utcnow)


class IntegrationToken(BaseModel):
    """🔴 Server-only. Envelope-encrypted at rest. NEVER returned by any API —
    there is deliberately no response schema that includes this model."""
    id: str = Field(default_factory=new_id)
    integration_id: str
    access_token: str
    refresh_token: Optional[str] = None
    expires_at: Optional[datetime] = None
    token_key_id: str = "v1"
