"""Auth dependency: extracts the user id from a Bearer access JWT.
All data routes are scoped through this single seam (Security spec D.1)."""
from fastapi import Depends, HTTPException
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer
from jose import JWTError

from core.security import decode_jwt

_bearer = HTTPBearer(auto_error=False)


async def get_current_user_id(
    credentials: HTTPAuthorizationCredentials = Depends(_bearer),
) -> str:
    if not credentials:
        raise HTTPException(status_code=401, detail="TOKEN_INVALID")
    try:
        data = decode_jwt(credentials.credentials)
        if data.get("typ") != "access" or not data.get("sub"):
            raise JWTError()
    except JWTError:
        raise HTTPException(status_code=401, detail="TOKEN_EXPIRED")
    return data["sub"]
