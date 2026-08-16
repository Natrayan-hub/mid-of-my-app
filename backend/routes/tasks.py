"""Tasks routes (API design B.3) — the slice needed by the Today screen:
list, create, complete/reopen. Full CRUD arrives with the Tasks screen."""
from datetime import datetime
from typing import List, Optional

from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel

from core import db as database
from models import Task, utcnow
from routes.deps import get_current_user_id

router = APIRouter(prefix="/tasks", tags=["tasks"])


class TaskCreate(BaseModel):
    id: Optional[str] = None  # client-generated uuid (idempotent create)
    title: str
    notes: Optional[str] = None
    due_at: Optional[datetime] = None
    priority: int = 0
    bucket: str = "today"


class TaskListResponse(BaseModel):
    items: List[Task]


@router.get("", response_model=TaskListResponse)
async def list_tasks(
    bucket: Optional[str] = None,
    completed: Optional[bool] = None,
    limit: int = 50,
    user_id: str = Depends(get_current_user_id),
):
    query: dict = {"user_id": user_id, "deleted_at": None}
    if bucket:
        query["bucket"] = bucket
    if completed is not None:
        query["completed_at"] = {"$ne": None} if completed else None
    docs = (
        await database.tasks.find(query, {"_id": 0})
        .sort([("completed_at", 1), ("priority", -1), ("sort_order", 1)])
        .to_list(min(limit, 200))
    )
    return {"items": [Task(**doc) for doc in docs]}


@router.post("", response_model=Task, status_code=201)
async def create_task(body: TaskCreate, user_id: str = Depends(get_current_user_id)):
    fields = body.model_dump(exclude_none=True)
    task = Task(user_id=user_id, **fields)
    if await database.tasks.find_one({"id": task.id}, {"_id": 1}):
        raise HTTPException(status_code=409, detail="DUPLICATE")
    await database.tasks.insert_one(task.model_dump())
    return task


async def _set_completion(task_id: str, user_id: str, completed_at):
    doc = await database.tasks.find_one_and_update(
        {"id": task_id, "user_id": user_id, "deleted_at": None},
        {
            "$set": {"completed_at": completed_at, "updated_at": utcnow()},
            "$inc": {"version": 1},
        },
        projection={"_id": 0},
        return_document=True,
    )
    if not doc:
        raise HTTPException(status_code=404, detail="TASK_NOT_FOUND")
    return Task(**doc)


@router.post("/{task_id}/complete", response_model=Task)
async def complete_task(task_id: str, user_id: str = Depends(get_current_user_id)):
    return await _set_completion(task_id, user_id, utcnow())


@router.post("/{task_id}/reopen", response_model=Task)
async def reopen_task(task_id: str, user_id: str = Depends(get_current_user_id)):
    return await _set_completion(task_id, user_id, None)
