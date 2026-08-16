from datetime import datetime
from typing import Literal, Optional

from pydantic import BaseModel, Field

from models.base import new_id, utcnow


class NotificationItem(BaseModel):
    id: str = Field(default_factory=new_id)
    user_id: str
    category: Literal["suggestion", "reminder", "sync", "system"]
    title: str
    body: str
    deeplink: str = ""  # e.g. lifeos://tasks/{id}
    read_at: Optional[datetime] = None
    created_at: datetime = Field(default_factory=utcnow)
