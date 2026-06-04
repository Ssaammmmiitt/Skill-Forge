"""User authentication persistence and username helpers."""
import os
import re
import random
import uuid
from datetime import datetime, timezone

import bcrypt

from data.models import Student, get_student_by_id, insert_student

GOOGLE_CLIENT_ID = os.environ.get("GOOGLE_CLIENT_ID", "")


def hash_password(password: str) -> str:
    salt = bcrypt.gensalt()
    return bcrypt.hashpw(password.encode("utf-8"), salt).decode("utf-8")


def verify_password(password: str, hashed: str) -> bool:
    return bcrypt.checkpw(password.encode("utf-8"), hashed.encode("utf-8"))


def _table_columns(conn, table: str) -> set[str]:
    rows = conn.execute(f"PRAGMA table_info({table})").fetchall()
    return {row[1] for row in rows}


def ensure_users_schema(conn) -> None:
    """Create users table and migrate legacy schemas missing username."""
    conn.execute(
        """
        CREATE TABLE IF NOT EXISTS users (
            user_id TEXT PRIMARY KEY,
            username TEXT UNIQUE NOT NULL,
            email TEXT UNIQUE NOT NULL,
            password_hash TEXT,
            name TEXT NOT NULL,
            provider TEXT DEFAULT 'email',
            google_id TEXT UNIQUE,
            created_at TEXT NOT NULL,
            last_login TEXT
        )
    """
    )

    columns = _table_columns(conn, "users")
    if "username" not in columns:
        conn.execute("ALTER TABLE users ADD COLUMN username TEXT")
        rows = conn.execute(
            "SELECT user_id, email FROM users WHERE username IS NULL OR username = ''"
        ).fetchall()
        for row in rows:
            email = row["email"] or ""
            base = re.sub(r"[^a-z0-9_]", "", email.split("@")[0].lower())[:15]
            if not base:
                base = "user"
            username = base
            suffix = 1
            while get_user_by_username(conn, username):
                username = f"{base}{suffix}"
                suffix += 1
            conn.execute(
                "UPDATE users SET username = ? WHERE user_id = ?",
                (username, row["user_id"]),
            )

    conn.execute("CREATE INDEX IF NOT EXISTS idx_users_email ON users(email)")
    conn.execute(
        "CREATE UNIQUE INDEX IF NOT EXISTS idx_users_username ON users(username)"
    )
    conn.execute(
        "CREATE INDEX IF NOT EXISTS idx_users_google_id ON users(google_id)"
    )


def get_user_by_email(conn, email: str) -> dict | None:
    row = conn.execute("SELECT * FROM users WHERE email = ?", (email,)).fetchone()
    return dict(row) if row else None


def get_user_by_username(conn, username: str) -> dict | None:
    row = conn.execute(
        "SELECT * FROM users WHERE username = ?", (username.lower(),)
    ).fetchone()
    return dict(row) if row else None


def get_user_by_username_or_email(conn, identifier: str) -> dict | None:
    identifier = identifier.strip().lower()
    row = conn.execute(
        "SELECT * FROM users WHERE username = ? OR email = ?",
        (identifier, identifier),
    ).fetchone()
    return dict(row) if row else None


def get_user_by_id(conn, user_id: str) -> dict | None:
    row = conn.execute("SELECT * FROM users WHERE user_id = ?", (user_id,)).fetchone()
    return dict(row) if row else None


def get_user_by_google_id(conn, google_id: str) -> dict | None:
    row = conn.execute(
        "SELECT * FROM users WHERE google_id = ?", (google_id,)
    ).fetchone()
    return dict(row) if row else None


def generate_username_suggestions(conn, first_name: str, count: int = 5) -> list[str]:
    base = re.sub(r"[^a-zA-Z0-9]", "", first_name.lower())
    if not base:
        base = "user"

    suggestions: list[str] = []

    if not get_user_by_username(conn, base):
        suggestions.append(base)

    for _ in range(count * 2):
        if len(suggestions) >= count:
            break
        username = f"{base}{random.randint(10, 9999)}"
        if not get_user_by_username(conn, username):
            suggestions.append(username)

    for adj in ["cool", "pro", "ace", "star", "ninja", "master", "guru", "wizard", "legend"]:
        if len(suggestions) >= count:
            break
        username = f"{base}_{adj}"
        if not get_user_by_username(conn, username):
            suggestions.append(username)

    for adj in ["the", "real", "mr", "ms"]:
        if len(suggestions) >= count:
            break
        username = f"{adj}_{base}"
        if not get_user_by_username(conn, username):
            suggestions.append(username)

    return suggestions[:count]


def insert_user(conn, user_data: dict) -> None:
    conn.execute(
        """
        INSERT INTO users (user_id, username, email, password_hash, name, provider, google_id, created_at)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    """,
        (
            user_data["user_id"],
            user_data["username"].lower(),
            user_data["email"],
            user_data.get("password_hash"),
            user_data["name"],
            user_data.get("provider", "email"),
            user_data.get("google_id"),
            user_data["created_at"],
        ),
    )


def update_last_login(conn, user_id: str) -> None:
    now = datetime.now(timezone.utc).isoformat()
    conn.execute(
        "UPDATE users SET last_login = ? WHERE user_id = ?", (now, user_id)
    )


def create_student_profile(conn, user_id: str, name: str) -> None:
    student = Student(
        student_id=user_id,
        name=name,
        INT=0,
        WIS=0,
        energy=0,
        xp=0,
        level=1,
        learning_style="unknown",
        streak=0,
    )
    insert_student(conn, student)


def ensure_student_profile(conn, user_id: str, name: str) -> None:
    """Create game student row if missing (e.g. legacy accounts without profile)."""
    if get_student_by_id(conn, user_id) is not None:
        return
    create_student_profile(conn, user_id, name or "Student")


def user_payload(user: dict) -> dict:
    return {
        "user_id": user["user_id"],
        "username": user.get("username", ""),
        "email": user["email"],
        "name": user["name"],
        "provider": user["provider"],
    }
