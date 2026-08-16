"""Users & preferences routes (API design B.2): /me, profile, preferences."""
from typing import List, Optional

from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel

from core import db as database
from models import Preference, Profile
from routes.deps import get_current_user_id

router = APIRouter(prefix="/me", tags=["users"])


class ProfilePatch(BaseModel):
    display_name: Optional[str] = None
    wake_time: Optional[str] = None
    focus_areas: Optional[List[str]] = None
    units: Optional[str] = None
    theme: Optional[str] = None
    ai_enabled: Optional[bool] = None
    timezone: Optional[str] = None


@router.get("")
async def me(user_id: str = Depends(get_current_user_id)):
    user = await database.users.find_one(
        {"id": user_id}, {"_id": 0, "password_hash": 0},
    )
    if not user:
        raise HTTPException(status_code=404, detail="USER_NOT_FOUND")
    profile = await database.profiles.find_one({"id": user_id}, {"_id": 0})
    return {"user": user, "profile": profile}


@router.patch("/profile", response_model=Profile)
async def patch_profile(body: ProfilePatch, user_id: str = Depends(get_current_user_id)):
    updates = body.model_dump(exclude_none=True)
    doc = await database.profiles.find_one_and_update(
        {"id": user_id},
        {"$set": updates},
        projection={"_id": 0},
        return_document=True,
    )
    if not doc:
        raise HTTPException(status_code=404, detail="PROFILE_NOT_FOUND")
    return Profile(**doc)


@router.get("/preferences", response_model=Preference)
async def get_preferences(user_id: str = Depends(get_current_user_id)):
    doc = await database.preferences.find_one({"id": user_id}, {"_id": 0})
    if not doc:
        raise HTTPException(status_code=404, detail="PREFERENCES_NOT_FOUND")
    return Preference(**doc)


@router.put("/preferences", response_model=Preference)
async def put_preferences(body: Preference, user_id: str = Depends(get_current_user_id)):
    pref = body.model_copy(update={"id": user_id, "user_id": user_id})
    await database.preferences.replace_one(
        {"id": user_id}, pref.model_dump(), upsert=True,
    )
    return pref
