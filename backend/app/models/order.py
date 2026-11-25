"""Order model.

This is a deliberately small example domain. Adjust the fields and the status
workflow to match the real business rules.
"""

import uuid
from decimal import Decimal
from enum import StrEnum

from sqlalchemy import CheckConstraint, Enum, Index, Numeric, String
from sqlalchemy.orm import Mapped, mapped_column

from app.db.base import Base, TimestampMixin


class OrderStatus(StrEnum):
    PENDING = "pending"
    CONFIRMED = "confirmed"
    SHIPPED = "shipped"
    DELIVERED = "delivered"
    CANCELLED = "cancelled"


ALLOWED_TRANSITIONS: dict[OrderStatus, tuple[OrderStatus, ...]] = {
    OrderStatus.PENDING: (OrderStatus.CONFIRMED, OrderStatus.CANCELLED),
    OrderStatus.CONFIRMED: (OrderStatus.SHIPPED, OrderStatus.CANCELLED),
    OrderStatus.SHIPPED: (OrderStatus.DELIVERED,),
    OrderStatus.DELIVERED: (),
    OrderStatus.CANCELLED: (),
}


class Order(TimestampMixin, Base):
    __tablename__ = "orders"
    __table_args__ = (
        CheckConstraint("total_amount >= 0", name="total_amount_non_negative"),
        Index("ix_orders_created_at", "created_at"),
    )

    id: Mapped[uuid.UUID] = mapped_column(primary_key=True, default=uuid.uuid4)
    reference: Mapped[str] = mapped_column(String(32), unique=True)
    customer_name: Mapped[str] = mapped_column(String(200))
    status: Mapped[OrderStatus] = mapped_column(
        Enum(
            OrderStatus,
            native_enum=False,
            length=20,
            values_callable=lambda enum: [member.value for member in enum],
        ),
        default=OrderStatus.PENDING,
        index=True,
    )
    total_amount: Mapped[Decimal] = mapped_column(Numeric(12, 2))
    currency: Mapped[str] = mapped_column(String(3))
    notes: Mapped[str | None] = mapped_column(String(2000))

    @property
    def allowed_transitions(self) -> list[OrderStatus]:
        return list(ALLOWED_TRANSITIONS[self.status])
