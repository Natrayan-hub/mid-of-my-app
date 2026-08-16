"""LifeOS API entrypoint.

Structure:
  core/    — config + Mongo connection (+ index bootstrap)
  models/  — Pydantic entities (Technical Foundation Part A)
  routes/  — API routers grouped per API design Part B (all under /api)

Run by supervisor as `uvicorn server:app --host 0.0.0.0 --port 8001`.
"""
import logging

from fastapi import FastAPI
from starlette.middleware.cors import CORSMiddleware

from core import db as database
from core.config import settings
from routes import api_router

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s - %(name)s - %(levelname)s - %(message)s",
)
logger = logging.getLogger("lifeos")

app = FastAPI(title=settings.APP_NAME, version=settings.API_VERSION)
app.include_router(api_router)

app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.on_event("startup")
async def on_startup():
    await database.ensure_indexes()
    logger.info("LifeOS API started (env=%s)", settings.ENV)


@app.on_event("shutdown")
async def on_shutdown():
    await database.close()
