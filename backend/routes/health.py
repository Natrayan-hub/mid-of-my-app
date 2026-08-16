"""Health routes (API design B.4) — manual logs only. Integration-derived
metrics stay ON-DEVICE (HealthCache is local-only by default per S34);
there is deliberately no ingestion endpoint here."""
from datetime import datetime
from typing import List, Optional

from fastapi import APIRouter, Depends
from pydantic import BaseModel

from core import db as database
from models import HealthEntry
from routes.deps import get_current_user_id

router = APIRouter(prefix="/health", tags=["health"])


class HealthEntryCreate(BaseModel):
    id: Optional[str] = None
    type: str  # water | mood | weight
    value: float
    note: Optional[str] = None
    logged_at: Optional[datetime] = None


class HealthEntryListResponse(BaseModel):
    items: List[HealthEntry]


@router.get("/entries", response_model=HealthEntryListResponse)
async def list_entries(
    type: Optional[str] = None,
    from_: Optional[datetime] = None,
    to: Optional[datetime] = None,
    limit: int = 200,
    user_id: str = Depends(get_current_user_id),
):
    query: dict = {"user_id": user_id, "deleted_at": None}
    if type:
        query["type"] = type
    logged_range = {}
    if from_:
        logged_range["$gte"] = from_
    if to:
        logged_range["$lt"] = to
    if logged_range:
        query["logged_at"] = logged_range
    docs = (
        await database.health_entries.find(query, {"_id": 0})
        .sort("logged_at", -1)
        .to_list(min(limit, 500))
    )
    return {"items": [HealthEntry(**doc) for doc in docs]}


@router.post("/entries", response_model=HealthEntry, status_code=201)
async def create_entry(body: HealthEntryCreate, user_id: str = Depends(get_current_user_id)):
    fields = body.model_dump(exclude_none=True)
    fields.setdefault("logged_at", datetime.utcnow())
    entry = HealthEntry(user_id=user_id, **fields)
    await database.health_entries.insert_one(entry.model_dump())
    return entry
