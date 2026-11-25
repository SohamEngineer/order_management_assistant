"""Alembic environment for the async SQLAlchemy engine."""

import asyncio
from logging.config import fileConfig
from typing import Any, Literal

from alembic import context
from sqlalchemy.engine import Connection
from sqlalchemy.ext.asyncio import create_async_engine
from sqlalchemy.pool import NullPool

from app.core.config import get_settings
from app.db.base import Base, UTCDateTime
from app.models import order  # noqa: F401 - registers the tables on Base.metadata

config = context.config
if config.config_file_name is not None and config.attributes.get("configure_logger", True):
    fileConfig(config.config_file_name, disable_existing_loggers=False)

target_metadata = Base.metadata


def database_url() -> str:
    # Tests set "sqlalchemy.url" explicitly; everything else uses app settings.
    return config.get_main_option("sqlalchemy.url") or get_settings().database_url


def render_item(type_: str, obj: Any, autogen_context: Any) -> str | Literal[False]:
    """Keep generated migrations independent of application code."""
    if type_ == "type" and isinstance(obj, UTCDateTime):
        return "sa.DateTime(timezone=True)"
    return False


def run_migrations_offline() -> None:
    context.configure(
        url=database_url(),
        target_metadata=target_metadata,
        literal_binds=True,
        render_item=render_item,
        render_as_batch=True,
    )
    with context.begin_transaction():
        context.run_migrations()


def run_with_connection(connection: Connection) -> None:
    context.configure(
        connection=connection,
        target_metadata=target_metadata,
        render_item=render_item,
        # Lets SQLite apply ALTER TABLE migrations.
        render_as_batch=True,
    )
    with context.begin_transaction():
        context.run_migrations()


async def run_migrations_online() -> None:
    engine = create_async_engine(database_url(), poolclass=NullPool)
    async with engine.connect() as connection:
        await connection.run_sync(run_with_connection)
    await engine.dispose()


if context.is_offline_mode():
    run_migrations_offline()
else:
    asyncio.run(run_migrations_online())
