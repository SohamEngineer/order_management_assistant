"""Request and response bodies for the orders API."""

import uuid
from datetime import datetime
from decimal import Decimal

from pydantic import BaseModel, ConfigDict, Field, field_serializer

from app.models.order import OrderStatus


class OrderCreate(BaseModel):
    model_config = ConfigDict(str_strip_whitespace=True, extra="forbid")

    customer_name: str = Field(min_length=1, max_length=200)
    total_amount: Decimal = Field(ge=0, max_digits=12, decimal_places=2)
    currency: str = Field(pattern=r"^[A-Z]{3}$", description="ISO 4217 code, e.g. USD")
    notes: str | None = Field(default=None, max_length=2000)


class OrderStatusUpdate(BaseModel):
    model_config = ConfigDict(extra="forbid")

    status: OrderStatus


class OrderRead(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: uuid.UUID
    reference: str
    customer_name: str
    status: OrderStatus
    total_amount: Decimal
    currency: str
    notes: str | None
    created_at: datetime
    updated_at: datetime
    allowed_transitions: list[OrderStatus]

    @field_serializer("total_amount")
    def serialize_amount(self, value: Decimal) -> str:
        return f"{value:.2f}"


class OrderSummary(BaseModel):
    total: int
    by_status: dict[OrderStatus, int]
