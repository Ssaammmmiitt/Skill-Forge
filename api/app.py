import os
import sys
import traceback
from pathlib import Path

from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware

from api.env_config import PROJECT_ROOT, get_groq_api_keys, load_project_env

load_project_env()

_groq_keys = get_groq_api_keys()
if _groq_keys:
    print(f"[api] Groq AI reader: {len(_groq_keys)} key(s) configured", flush=True)
else:
    print("[api] WARN: GROQ_API_KEY missing — save .env in project root and restart", flush=True)

sys.path.append(str(PROJECT_ROOT))

from api.exceptions import ApiError
from api.responses import error
from api.routers import auth, custom_quiz, game, ml, reader, todos
from data.models import create_tables, get_db


def create_app() -> FastAPI:
    app = FastAPI(title="Skill Forge API", version="2.0.0")

    cors_origins_str = os.environ.get(
        "CORS_ORIGINS", "http://localhost:5173,http://localhost:5174"
    )
    allowed_origins = [origin.strip() for origin in cors_origins_str.split(",")]

    app.add_middleware(
        CORSMiddleware,
        allow_origins=allowed_origins,
        allow_origin_regex=r"https?://(localhost|127\.0\.0\.1)(:\d+)?",
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
    )

    @app.exception_handler(ApiError)
    async def handle_api_error(_request: Request, exc: ApiError):
        return error(exc.message, exc.status_code)

    @app.exception_handler(Exception)
    async def handle_unexpected_error(_request: Request, exc: Exception):
        traceback.print_exc()
        return error("Internal server error", 500)

    @app.on_event("startup")
    def init_database():
        keys = get_groq_api_keys()
        if keys:
            print(f"[api] Groq AI reader: {len(keys)} key(s) (startup check)", flush=True)
        else:
            print("[api] WARN: GROQ_API_KEY missing — save project root .env and restart", flush=True)

        conn = get_db()
        try:
            create_tables(conn)
            conn.commit()
        finally:
            conn.close()

    app.include_router(auth.router)
    app.include_router(game.router)
    app.include_router(custom_quiz.router)
    app.include_router(ml.router)
    app.include_router(todos.router)
    app.include_router(reader.router)

    return app


app = create_app()


if __name__ == "__main__":
    import uvicorn

    port = int(os.environ.get("PORT", 5000))
    # Reload spawns a child process that may not see .env on Windows; opt in via API_RELOAD=true
    reload = os.environ.get("API_RELOAD", "").lower() in ("1", "true", "yes")
    uvicorn.run(
        "api.app:app",
        host="0.0.0.0",
        port=port,
        reload=reload,
    )
