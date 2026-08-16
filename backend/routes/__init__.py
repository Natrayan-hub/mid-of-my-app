"""API router aggregation. Feature routers (auth, tasks, health, documents,
sync, ai, integrations, notifications) slot in here as they are built —
one module per group from the API design Part B."""
from fastapi import APIRouter

from routes.health import router as health_router
from routes.meta import router as meta_router
from routes.tasks import router as tasks_router

api_router = APIRouter(prefix="/api")
api_router.include_router(meta_router)
api_router.include_router(tasks_router)
api_router.include_router(health_router)
