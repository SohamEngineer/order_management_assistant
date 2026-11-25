"""Cross-cutting behaviour: health, errors, headers, configuration and migrations."""

from pathlib import Path

import pytest
from alembic import command
from alembic.config import Config
from fastapi import FastAPI
from fastapi.testclient import TestClient
from pydantic import ValidationError

from app.core.config import Settings
from app.main import create_app


def test_liveness_and_readiness(client: TestClient) -> None:
    assert client.get("/health/live").json() == {"status": "ok"}
    assert client.get("/health/ready").json() == {"status": "ok"}


def test_readiness_reports_unreachable_database(tmp_path: Path) -> None:
    url = f"sqlite+aiosqlite:///{(tmp_path / 'missing' / 'app.db').as_posix()}"
    with TestClient(create_app(Settings(environment="test", database_url=url))) as client:
        response = client.get("/health/ready")

    assert response.status_code == 503
    assert response.json()["error"]["code"] == "service_unavailable"


def test_safe_request_id_is_echoed(client: TestClient) -> None:
    response = client.get("/health/live", headers={"X-Request-ID": "trace-123"})
    assert response.headers["x-request-id"] == "trace-123"


def test_unsafe_request_id_is_replaced(client: TestClient) -> None:
    response = client.get("/health/live", headers={"X-Request-ID": "bad id <script>"})
    assert response.headers["x-request-id"] != "bad id <script>"
    assert len(response.headers["x-request-id"]) == 32


def test_unknown_route_uses_error_envelope(client: TestClient) -> None:
    response = client.get("/nope")
    assert response.status_code == 404
    assert response.json()["error"]["request_id"] == response.headers["x-request-id"]


def test_unexpected_error_is_hidden_and_keeps_cors_headers(
    app: FastAPI, client: TestClient
) -> None:
    @app.get("/boom")
    async def boom() -> None:
        raise RuntimeError("secret internal detail")

    response = client.get("/boom", headers={"Origin": "http://localhost:3000"})

    assert response.status_code == 500
    assert response.json()["error"]["code"] == "internal_error"
    assert "secret" not in response.text
    assert response.headers["access-control-allow-origin"] == "http://localhost:3000"


def test_cors_rejects_unknown_origin(client: TestClient) -> None:
    response = client.get("/health/live", headers={"Origin": "http://evil.example"})
    assert "access-control-allow-origin" not in response.headers


def test_postgres_urls_use_the_async_driver() -> None:
    settings = Settings(database_url="postgres://u:p@db:5432/app")
    assert settings.database_url == "postgresql+asyncpg://u:p@db:5432/app"


def test_cors_origins_accept_a_comma_separated_string(monkeypatch: pytest.MonkeyPatch) -> None:
    monkeypatch.setenv("CORS_ORIGINS", "http://a.test/, http://b.test")
    assert Settings().cors_origins == ["http://a.test", "http://b.test"]


def test_production_refuses_sqlite() -> None:
    with pytest.raises(ValidationError, match="SQLite"):
        Settings(environment="production", database_url="sqlite+aiosqlite:///x.db")


def test_docs_are_off_in_production() -> None:
    settings = Settings(environment="production", database_url="postgresql://u:p@db/app")
    with TestClient(create_app(settings)) as client:
        assert client.get("/docs").status_code == 404
        assert client.get("/openapi.json").status_code == 404


def test_models_match_migrations(alembic_config: Config) -> None:
    command.upgrade(alembic_config, "head")
    # Raises if autogenerate would produce a new migration.
    command.check(alembic_config)


def test_migrations_can_be_reverted(alembic_config: Config) -> None:
    command.upgrade(alembic_config, "head")
    command.downgrade(alembic_config, "base")
    command.upgrade(alembic_config, "head")
