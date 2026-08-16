from typing import Dict, List, Literal, Optional

from pydantic import BaseModel, Field

from models.base import SyncableModel, new_id


class Document(SyncableModel):
    title: str
    category: Literal["id", "finance", "medical", "warranty", "travel", "other"] = "other"
    tags: List[str] = []
    detected_fields: Dict = {}  # 🔴 {date, amount, currency, vendor, expiry_date}
    ocr_text: Optional[str] = None  # 🔴 full-text search source
    expiry_reminder_task_id: Optional[str] = None
    storage_policy: Literal["cloud", "local_only"] = "cloud"
    size_bytes: int = 0


class DocumentPage(BaseModel):
    id: str = Field(default_factory=new_id)
    document_id: str
    page_number: int
    object_key: str  # 🔴 object-storage key of encrypted file
    thumb_object_key: str
    ocr_status: Literal["pending", "done", "failed"] = "pending"
