import os
import sys
import traceback

from dotenv import load_dotenv
from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
load_dotenv()

sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from api.exceptions import ApiError
from api.responses import error
from api.routers import auth, game, ml, reader, todos
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
        conn = get_db()
        try:
            create_tables(conn)
            conn.commit()
        finally:
            conn.close()

    app.include_router(auth.router)
    app.include_router(game.router)
    app.include_router(ml.router)
    app.include_router(todos.router)
    app.include_router(reader.router)

    return app


app = create_app()


if __name__ == "__main__":
    import uvicorn

    port = int(os.environ.get("PORT", 5000))
    debug = os.environ.get("DEBUG", "True").lower() == "true"
    uvicorn.run(
        "api.app:app",
        host="0.0.0.0",
        port=port,
        reload=debug,
    )
