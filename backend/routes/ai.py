"""AI memory routes (API design B.10 #4–6, minimal slice): onboarding
personalization seeds memory entries; the S35 screen builds on these later."""
from typing import Dict, List, Optional

from fastapi import APIRouter, Depends
from pydantic import BaseModel

from core import db as database
from models import AIMemoryEntry
from routes.deps import get_current_user_id

router = APIRouter(prefix="/ai", tags=["ai"])


class MemoryCreate(BaseModel):
    domain: str  # routine | preference | dismissal
    statement: str
    structured: Dict = {}
    provenance: Dict = {}
    author: str = "user"


class MemoryListResponse(BaseModel):
    items: List[AIMemoryEntry]


@router.get("/memory", response_model=MemoryListResponse)
async def list_memory(
    domain: Optional[str] = None,
    user_id: str = Depends(get_current_user_id),
):
    query: dict = {"user_id": user_id, "deleted_at": None}
    if domain:
        query["domain"] = domain
    docs = (
        await database.ai_memory.find(query, {"_id": 0})
        .sort("created_at", -1)
        .to_list(200)
    )
    return {"items": [AIMemoryEntry(**doc) for doc in docs]}


@router.post("/memory", response_model=AIMemoryEntry, status_code=201)
async def create_memory(body: MemoryCreate, user_id: str = Depends(get_current_user_id)):
    entry = AIMemoryEntry(user_id=user_id, **body.model_dump())
    # Idempotent per structured key when provided (onboarding re-saves overwrite).
    key = body.structured.get("key")
    if key:
        await database.ai_memory.delete_many(
            {"user_id": user_id, "structured.key": key},
        )
    await database.ai_memory.insert_one(entry.model_dump())
    return entry
