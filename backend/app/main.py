from fastapi import FastAPI
from app.api.v1.phase1 import router as phase1_router
from app.core.config import get_settings
from app.infrastructure.database.session import Base, engine
import app.domain.models  # noqa: F401


def create_app() -> FastAPI:
    settings = get_settings()
    app = FastAPI(title=settings.app_name, version="0.1.0")
    app.include_router(phase1_router)

    @app.get("/health", tags=["operations"])
    def health() -> dict[str, str]:
        return {"status": "ok", "environment": settings.environment}

    return app


Base.metadata.create_all(bind=engine)
app = create_app()
