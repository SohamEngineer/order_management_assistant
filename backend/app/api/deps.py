"""FastAPI dependencies. Add authentication dependencies here."""

from collections.abc import AsyncIterator
from typing import Annotated

from fastapi import Depends, Request
from sqlalchemy.ext.asyncio import AsyncSession

from app.db.session import Database
from app.services.order import OrderService


def get_database(request: Request) -> Database:
    database: Database = request.app.state.database
    return database


DatabaseDep = Annotated[Database, Depends(get_database)]


async def get_session(database: DatabaseDep) -> AsyncIterator[AsyncSession]:
    async with database.session_factory() as session:
        yield session


SessionDep = Annotated[AsyncSession, Depends(get_session)]


def get_order_service(session: SessionDep) -> OrderService:
    return OrderService(session)


OrderServiceDep = Annotated[OrderService, Depends(get_order_service)]
