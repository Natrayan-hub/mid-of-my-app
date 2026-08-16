"""API router aggregation. Feature routers (auth, tasks, health, documents,
sync, ai, integrations, notifications) slot in here as they are built —
one module per group from the API design Part B."""
from fastapi import APIRouter

from routes.meta import router as meta_router

api_router = APIRouter(prefix="/api")
api_router.include_router(meta_router)
