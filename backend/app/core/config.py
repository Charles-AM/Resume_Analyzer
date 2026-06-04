from functools import lru_cache
from typing import Literal

from pydantic import Field
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    app_name: str = "AI Resume Analyzer"
    environment: Literal["local", "test", "staging", "production"] = "local"
    api_prefix: str = "/api/v1"
    database_url: str = Field(
        default="postgresql+psycopg://resume:resume@postgres:5432/resume_analyzer"
    )
    redis_url: str = "redis://redis:6379/0"
    qdrant_url: str = "http://qdrant:6333"
    qdrant_collection: str = "resume_chunks"
    jwt_secret: str = "change-me-in-production"
    jwt_algorithm: str = "HS256"
    access_token_minutes: int = 60
    cors_origins: list[str] = ["http://localhost:3000"]
    embedding_provider: Literal["local", "openai"] = "local"
    openai_api_key: str | None = None
    llm_provider: Literal["local", "openai"] = "local"
    rate_limit_per_minute: int = 120
    upload_dir: str = "/var/lib/resume-analyzer/uploads"

    model_config = SettingsConfigDict(env_file=".env", env_file_encoding="utf-8")


@lru_cache
def get_settings() -> Settings:
    return Settings()
