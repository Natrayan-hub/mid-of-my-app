"""Idempotent demo-user seed — DEV ONLY scaffolding until auth lands.

Creates the demo user + profile + three starter tasks exactly once (existence
of the demo user doc is the marker), so the Today screen has real API-backed
data on first run. Removed when real accounts/onboarding are implemented."""
import logging

from core import db as database
from models import Profile, Task, User
from routes.deps import DEMO_USER_ID

logger = logging.getLogger("lifeos.seed")

SEED_TASKS = [
    {"title": "Review this week's plan", "priority": 2},
    {"title": "Call the dentist about Thursday", "priority": 1},
    {"title": "Pick up groceries for dinner", "priority": 0},
]


async def seed_demo_data() -> None:
    existing = await database.users.find_one({"id": DEMO_USER_ID}, {"_id": 1})
    if existing:
        return
    user = User(id=DEMO_USER_ID, email="demo@lifeos.app", email_verified=True)
    profile = Profile(id=DEMO_USER_ID, user_id=DEMO_USER_ID, display_name="Priya")
    await database.users.insert_one(user.model_dump())
    await database.profiles.insert_one(profile.model_dump())
    for order, spec in enumerate(SEED_TASKS):
        task = Task(user_id=DEMO_USER_ID, bucket="today", sort_order=order, **spec)
        await database.tasks.insert_one(task.model_dump())
    logger.info("Seeded demo user + %d starter tasks", len(SEED_TASKS))
