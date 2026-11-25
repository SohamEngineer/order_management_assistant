"""Application settings, loaded from environment variables and `backend/.env`."""

from functools import lru_cache
from pathlib import Path
from typing import Annotated, Literal, Self

from pydantic import field_validator, model_validator
from pydantic_settings import BaseSettings, NoDecode, SettingsConfigDict

BACKEND_DIR = Path(__file__).resolve().parents[2]


class Settings(BaseSettings):
    model_config = SettingsConfigDict(
        env_file=BACKEND_DIR / ".env",
        env_file_encoding="utf-8",
        extra="ignore",
    )

    app_name: str = "Order Management Assistant API"
    environment: Literal["local", "test", "staging", "production"] = "local"
    log_level: Literal["DEBUG", "INFO", "WARNING", "ERROR"] = "INFO"
    database_url: str = f"sqlite+aiosqlite:///{(BACKEND_DIR / 'app.db').as_posix()}"
    # NoDecode: accept a comma separated string instead of requiring JSON.
    cors_origins: Annotated[list[str], NoDecode] = ["http://localhost:3000"]
    # Unset means "enabled everywhere except production".
    docs_enabled: bool | None = None

    @field_validator("database_url")
    @classmethod
    def use_async_postgres_driver(cls, value: str) -> str:
        """Hosting providers hand out `postgres://` URLs; SQLAlchemy needs the async driver."""
        for prefix in ("postgres://", "postgresql://"):
            if value.startswith(prefix):
                return "postgresql+asyncpg://" + value.removeprefix(prefix)
        return value

    @field_validator("cors_origins", mode="before")
    @classmethod
    def split_cors_origins(cls, value: object) -> object:
        if isinstance(value, str):
            return [origin.strip().rstrip("/") for origin in value.split(",") if origin.strip()]
        return value

    @model_validator(mode="after")
    def reject_unsafe_production_config(self) -> Self:
        if self.environment == "production":
            if self.database_url.startswith("sqlite"):
                raise ValueError("DATABASE_URL must not point to SQLite in production")
            if "*" in self.cors_origins:
                raise ValueError("CORS_ORIGINS must not contain '*' in production")
        return self

    @property
    def show_docs(self) -> bool:
        if self.docs_enabled is None:
            return self.environment != "production"
        return self.docs_enabled

    @property
    def json_logs(self) -> bool:
        return self.environment in ("staging", "production")


@lru_cache
def get_settings() -> Settings:
    return Settings()
