"""Database queries for orders. No business rules and no commits here."""

import uuid
from collections.abc import Sequence

from sqlalchemy import func, select, update
from sqlalchemy.ext.asyncio import AsyncSession

from app.db.base import utcnow
from app.models.order import Order, OrderStatus


class OrderRepository:
    def __init__(self, session: AsyncSession) -> None:
        self.session = session

    def add(self, order: Order) -> None:
        self.session.add(order)

    async def get(self, order_id: uuid.UUID) -> Order | None:
        return await self.session.get(Order, order_id)

    async def list_page(
        self, *, status: OrderStatus | None, limit: int, offset: int
    ) -> tuple[Sequence[Order], int]:
        filters = [] if status is None else [Order.status == status]
        total = await self.session.scalar(select(func.count()).select_from(Order).where(*filters))
        query = (
            select(Order)
            .where(*filters)
            # The id breaks ties so that pagination is stable.
            .order_by(Order.created_at.desc(), Order.id)
            .limit(limit)
            .offset(offset)
        )
        return (await self.session.scalars(query)).all(), total or 0

    async def count_by_status(self) -> dict[OrderStatus, int]:
        query = select(Order.status, func.count()).group_by(Order.status)
        rows = await self.session.execute(query)
        return {row[0]: row[1] for row in rows}

    async def compare_and_set_status(
        self, order_id: uuid.UUID, *, expected: OrderStatus, new: OrderStatus
    ) -> bool:
        """Update only if nobody else changed the status in the meantime."""
        statement = (
            update(Order)
            .where(Order.id == order_id, Order.status == expected)
            .values(status=new, updated_at=utcnow())
            .returning(Order.id)
            .execution_options(synchronize_session=False)
        )
        return await self.session.scalar(statement) is not None
