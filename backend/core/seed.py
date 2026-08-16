"""Starter tasks for new accounts — inserted once at registration so the
Today screen has friendly, actionable content on first open."""
from core import db as database
from models import Task

STARTER_TASKS = [
    {"title": "Explore your Today dashboard", "priority": 1},
    {"title": "Add your first real task with the + button", "priority": 0},
    {"title": "Check your privacy settings anytime in More", "priority": 0},
]


async def seed_starter_tasks(user_id: str) -> None:
    for order, spec in enumerate(STARTER_TASKS):
        task = Task(user_id=user_id, bucket="today", sort_order=order, **spec)
        await database.tasks.insert_one(task.model_dump())
