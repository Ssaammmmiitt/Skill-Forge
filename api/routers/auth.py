import re
import uuid
from datetime import datetime, timezone
from typing import Annotated

from fastapi import APIRouter, Depends
from google.auth.transport import requests as google_requests
from google.oauth2 import id_token
from pydantic import BaseModel, Field

from api.deps import DbConn, get_current_user_id
from api.responses import error, success
from api.services import auth_store
from api.services.jwt_auth import generate_jwt_token

router = APIRouter(prefix="/api/auth", tags=["auth"])


class FirstNameBody(BaseModel):
    first_name: str = Field(default="")


class UsernameBody(BaseModel):
    username: str = Field(default="")


class RegisterBody(BaseModel):
    email: str = ""
    username: str = ""
    password: str = ""
    name: str = ""


class LoginBody(BaseModel):
    identifier: str = ""
    password: str = ""


class GoogleBody(BaseModel):
    token: str = ""


@router.post("/username/suggestions")
def get_username_suggestions(body: FirstNameBody, conn: DbConn):
    first_name = body.first_name.strip()
    if not first_name:
        return error("First name is required", 400)

    auth_store.ensure_users_schema(conn)
    suggestions = auth_store.generate_username_suggestions(conn, first_name, count=5)
    return success({"suggestions": suggestions})


@router.post("/username/check")
def check_username(body: UsernameBody, conn: DbConn):
    username = body.username.strip().lower()
    if not username:
        return error("Username is required", 400)

    if not re.match(r"^[a-z0-9_]{3,20}$", username):
        return error(
            "Username must be 3-20 characters (letters, numbers, underscores)", 400
        )

    auth_store.ensure_users_schema(conn)
    existing = auth_store.get_user_by_username(conn, username)
    return success({"available": existing is None, "username": username})


@router.post("/register")
def register(body: RegisterBody, conn: DbConn):
    email = body.email.strip().lower()
    username = body.username.strip().lower()
    password = body.password
    name = body.name.strip()

    if not email or not username or not password or not name:
        return error("Email, username, password, and name are required", 400)

    if len(password) < 6:
        return error("Password must be at least 6 characters", 400)

    if "@" not in email:
        return error("Invalid email format", 400)

    if not re.match(r"^[a-z0-9_]{3,20}$", username):
        return error(
            "Username must be 3-20 characters (letters, numbers, underscores)", 400
        )

    auth_store.ensure_users_schema(conn)

    if auth_store.get_user_by_email(conn, email):
        return error("User with this email already exists", 409)

    if auth_store.get_user_by_username(conn, username):
        return error("Username is already taken", 409)

    user_id = str(uuid.uuid4())
    user_data = {
        "user_id": user_id,
        "username": username,
        "email": email,
        "password_hash": auth_store.hash_password(password),
        "name": name,
        "provider": "email",
        "google_id": None,
        "created_at": datetime.now(timezone.utc).isoformat(),
    }
    auth_store.insert_user(conn, user_data)
    auth_store.ensure_student_profile(conn, user_id, name)
    conn.commit()

    token = generate_jwt_token(user_id, email)
    return success(
        {
            "token": token,
            "user": {
                "user_id": user_id,
                "username": username,
                "email": email,
                "name": name,
                "provider": "email",
            },
            "message": "Registration successful",
        },
        201,
    )


@router.post("/login")
def login(body: LoginBody, conn: DbConn):
    identifier = body.identifier.strip().lower()
    password = body.password

    if not identifier or not password:
        return error("Username/email and password are required", 400)

    auth_store.ensure_users_schema(conn)
    user = auth_store.get_user_by_username_or_email(conn, identifier)
    if not user:
        return error("Invalid username/email or password", 401)

    if not user.get("password_hash"):
        return error(
            "This account uses social login. Please sign in with Google.", 400
        )

    if not auth_store.verify_password(password, user["password_hash"]):
        return error("Invalid email or password", 401)

    auth_store.ensure_student_profile(conn, user["user_id"], user.get("name") or "")
    auth_store.update_last_login(conn, user["user_id"])
    conn.commit()

    token = generate_jwt_token(user["user_id"], user["email"])
    return success(
        {
            "token": token,
            "user": auth_store.user_payload(user),
            "message": "Login successful",
        }
    )


@router.post("/google")
def google_login(body: GoogleBody, conn: DbConn):
    if not body.token:
        return error("Google token is required", 400)

    try:
        idinfo = id_token.verify_oauth2_token(
            body.token,
            google_requests.Request(),
            auth_store.GOOGLE_CLIENT_ID,
        )
    except ValueError as exc:
        return error(f"Invalid Google token: {exc}", 401)

    google_id = idinfo["sub"]
    email = idinfo.get("email", "").lower()
    name = idinfo.get("name", "Google User")

    if not email:
        return error("Email not provided by Google", 400)

    auth_store.ensure_users_schema(conn)
    user = auth_store.get_user_by_google_id(conn, google_id)

    if not user:
        user = auth_store.get_user_by_email(conn, email)
        if user:
            conn.execute(
                "UPDATE users SET google_id = ?, provider = 'google' WHERE user_id = ?",
                (google_id, user["user_id"]),
            )
            conn.commit()
        else:
            user_id = str(uuid.uuid4())
            first_name = name.split()[0] if name else "user"
            suggestions = auth_store.generate_username_suggestions(
                conn, first_name, count=1
            )
            username = (
                suggestions[0] if suggestions else f"user{uuid.uuid4().hex[:8]}"
            )

            user_data = {
                "user_id": user_id,
                "username": username,
                "email": email,
                "password_hash": None,
                "name": name,
                "provider": "google",
                "google_id": google_id,
                "created_at": datetime.now(timezone.utc).isoformat(),
            }
            auth_store.insert_user(conn, user_data)
            auth_store.ensure_student_profile(conn, user_id, name)
            conn.commit()
            user = auth_store.get_user_by_id(conn, user_id)

    auth_store.ensure_student_profile(conn, user["user_id"], user.get("name") or "")
    auth_store.update_last_login(conn, user["user_id"])
    conn.commit()

    jwt_token = generate_jwt_token(user["user_id"], user["email"])
    return success(
        {
            "token": jwt_token,
            "user": auth_store.user_payload(user),
            "message": "Google login successful",
        }
    )


@router.get("/verify")
def verify_token(
    conn: DbConn,
    user_id: Annotated[str, Depends(get_current_user_id)],
):
    auth_store.ensure_users_schema(conn)
    user = auth_store.get_user_by_id(conn, user_id)
    if not user:
        return error("User not found", 404)

    auth_store.ensure_student_profile(conn, user_id, user.get("name") or "")
    conn.commit()

    return success(
        {"user": auth_store.user_payload(user), "message": "Token is valid"}
    )


@router.post("/logout")
def logout(user_id: Annotated[str, Depends(get_current_user_id)]):
    return success(
        {"message": "Logout successful. Please delete your token."}
    )
