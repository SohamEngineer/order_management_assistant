"""Each test gets its own database, built by the real Alembic migrations."""

from collections.abc import Iterator
from pathlib import Path

import pytest
from alembic import command
from alembic.config import Config
from fastapi import FastAPI
from fastapi.testclient import TestClient

from app.core.config import BACKEND_DIR, Settings
from app.main import create_app


@pytest.fixture
def database_url(tmp_path: Path) -> str:
    return f"sqlite+aiosqlite:///{(tmp_path / 'test.db').as_posix()}"


@pytest.fixture
def alembic_config(database_url: str) -> Config:
    config = Config(str(BACKEND_DIR / "alembic.ini"))
    config.set_main_option("sqlalchemy.url", database_url)
    config.attributes["configure_logger"] = False
    return config


@pytest.fixture
def settings(database_url: str) -> Settings:
    return Settings(
        environment="test",
        database_url=database_url,
        cors_origins=["http://localhost:3000"],
    )


@pytest.fixture
def app(settings: Settings, alembic_config: Config) -> FastAPI:
    command.upgrade(alembic_config, "head")
    return create_app(settings)


@pytest.fixture
def client(app: FastAPI) -> Iterator[TestClient]:
    with TestClient(app) as test_client:
        yield test_client
