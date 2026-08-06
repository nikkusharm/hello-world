from functools import lru_cache
from pydantic import Field
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    app_name: str = "Creo AI Engineering Copilot"
    environment: str = Field(default="local", alias="ENVIRONMENT")
    database_url: str = Field(default="sqlite+pysqlite:///:memory:", alias="DATABASE_URL")
    redis_url: str = Field(default="redis://localhost:6379/0", alias="REDIS_URL")
    jwt_secret: str = Field(default="change-me-in-production", alias="JWT_SECRET")
    jwt_algorithm: str = "HS256"
    access_token_minutes: int = 30
    enable_ai_agents: bool = Field(default=False, alias="ENABLE_AI_AGENTS")

    model_config = SettingsConfigDict(env_file=".env", populate_by_name=True)


@lru_cache
def get_settings() -> Settings:
    return Settings()
