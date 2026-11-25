"""Order use cases: business rules and transaction boundaries live here."""

import secrets
import uuid
from collections.abc import Sequence

from sqlalchemy.ext.asyncio import AsyncSession

from app.core.errors import ConflictError, NotFoundError
from app.models.order import Order, OrderStatus
from app.repositories.order import OrderRepository
from app.schemas.order import OrderCreate, OrderSummary


def generate_reference() -> str:
    return f"ORD-{secrets.token_hex(5).upper()}"


class OrderService:
    def __init__(self, session: AsyncSession) -> None:
        self.session = session
        self.orders = OrderRepository(session)

    async def create(self, data: OrderCreate) -> Order:
        order = Order(reference=generate_reference(), **data.model_dump())
        self.orders.add(order)
        await self.session.commit()
        return order

    async def get(self, order_id: uuid.UUID) -> Order:
        order = await self.orders.get(order_id)
        if order is None:
            raise NotFoundError("Order not found.")
        return order

    async def list_page(
        self, *, status: OrderStatus | None, limit: int, offset: int
    ) -> tuple[Sequence[Order], int]:
        return await self.orders.list_page(status=status, limit=limit, offset=offset)

    async def summary(self) -> OrderSummary:
        counts = await self.orders.count_by_status()
        return OrderSummary(
            total=sum(counts.values()),
            by_status={status: counts.get(status, 0) for status in OrderStatus},
        )

    async def change_status(self, order_id: uuid.UUID, new_status: OrderStatus) -> Order:
        order = await self.get(order_id)
        if new_status not in order.allowed_transitions:
            raise ConflictError(
                f"An order cannot move from '{order.status}' to '{new_status}'.",
            )
        changed = await self.orders.compare_and_set_status(
            order_id, expected=order.status, new=new_status
        )
        if not changed:
            raise ConflictError("The order was changed by another request. Reload and try again.")
        await self.session.commit()
        await self.session.refresh(order)
        return order
