"""Auth routes (API design B.1): register, login, refresh (rotating), logout."""
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel, EmailStr, Field

from core import db as database
from core import security
from core.seed import seed_starter_tasks
from models import Preference, Profile, User

router = APIRouter(prefix="/auth", tags=["auth"])


class Credentials(BaseModel):
    email: EmailStr
    password: str = Field(min_length=8, max_length=128)


class RefreshRequest(BaseModel):
    refresh_token: str


class AuthResponse(BaseModel):
    access_token: str
    refresh_token: str
    token_type: str = "bearer"
    user: dict


def _public_user(user: User) -> dict:
    return {
        "id": user.id, "email": user.email, "plan": user.plan,
        "auth_provider": user.auth_provider, "email_verified": user.email_verified,
    }


@router.post("/register", response_model=AuthResponse, status_code=201)
async def register(body: Credentials):
    email = body.email.lower()
    if await database.users.find_one({"email": email}, {"_id": 1}):
        raise HTTPException(status_code=409, detail="EMAIL_TAKEN")

    user = User(email=email, auth_provider="password",
                password_hash=security.hash_password(body.password))
    profile = Profile(id=user.id, user_id=user.id,
                      display_name=email.split("@")[0].capitalize())
    preference = Preference(id=user.id, user_id=user.id)

    # password_hash has exclude=True on the model — dump explicitly for storage.
    doc = user.model_dump()
    doc["password_hash"] = user.password_hash
    await database.users.insert_one(doc)
    await database.profiles.insert_one(profile.model_dump())
    await database.preferences.insert_one(preference.model_dump())
    await seed_starter_tasks(user.id)

    pair = await security.issue_pair(user.id)
    return {**pair, "user": _public_user(user)}


@router.post("/login", response_model=AuthResponse)
async def login(body: Credentials):
    doc = await database.users.find_one({"email": body.email.lower()}, {"_id": 0})
    valid = security.verify_password(body.password, (doc or {}).get("password_hash"))
    if not doc or not valid or doc.get("status") == "deleted":
        # Generic message — no account-existence leak.
        raise HTTPException(status_code=401, detail="AUTH_INVALID_CREDENTIALS")
    user = User(**doc)
    pair = await security.issue_pair(user.id)
    return {**pair, "user": _public_user(user)}


@router.post("/refresh")
async def refresh(body: RefreshRequest):
    try:
        user_id = await security.consume_refresh(body.refresh_token)
    except ValueError as exc:
        raise HTTPException(status_code=401, detail=str(exc))
    return await security.issue_pair(user_id)


@router.post("/logout", status_code=204)
async def logout(body: RefreshRequest):
    await security.revoke_refresh(body.refresh_token)
