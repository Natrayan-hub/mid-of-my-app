"""Meta endpoints: service identity + health check (DB ping)."""
from fastapi import APIRouter

from core import db as database
from core.config import settings

router = APIRouter(tags=["meta"])


@router.get("/")
async def root():
    return {"name": settings.APP_NAME, "version": settings.API_VERSION, "env": settings.ENV}


@router.get("/health")
async def health():
    try:
        await database.db.command("ping")
        db_status = "ok"
    except Exception:
        db_status = "unreachable"
    return {"status": "ok", "db": db_status}
