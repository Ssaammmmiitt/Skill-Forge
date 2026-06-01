from typing import Annotated, Generator

from fastapi import Depends, Header

from api.exceptions import ApiError
from api.services.jwt_auth import decode_jwt_token
from data.models import get_db as _get_db


def get_db() -> Generator:
    conn = _get_db()
    try:
        yield conn
    finally:
        conn.close()


DbConn = Annotated[object, Depends(get_db)]


def get_current_user_id(
    authorization: Annotated[str | None, Header()] = None,
) -> str:
    if not authorization:
        raise ApiError("Authentication token is missing", 401)

    parts = authorization.split(" ", 1)
    if len(parts) != 2 or parts[0].lower() != "bearer":
        raise ApiError("Invalid authorization header format", 401)

    payload = decode_jwt_token(parts[1])
    if not payload:
        raise ApiError("Invalid or expired token", 401)

    return payload["user_id"]
