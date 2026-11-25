"""HTTP layer for orders: parse input, call the service, shape output."""

import uuid
from typing import Annotated

from fastapi import APIRouter, Query, status

from app.api.deps import OrderServiceDep
from app.core.errors import ErrorResponse
from app.models.order import OrderStatus
from app.schemas.common import Page
from app.schemas.order import OrderCreate, OrderRead, OrderStatusUpdate, OrderSummary

router = APIRouter(prefix="/orders", tags=["orders"])


@router.get("")
async def list_orders(
    service: OrderServiceDep,
    status_filter: Annotated[OrderStatus | None, Query(alias="status")] = None,
    limit: Annotated[int, Query(ge=1, le=100)] = 20,
    offset: Annotated[int, Query(ge=0, le=1_000_000)] = 0,
) -> Page[OrderRead]:
    orders, total = await service.list_page(status=status_filter, limit=limit, offset=offset)
    return Page[OrderRead](
        items=[OrderRead.model_validate(order) for order in orders],
        total=total,
        limit=limit,
        offset=offset,
    )


@router.post("", status_code=status.HTTP_201_CREATED)
async def create_order(data: OrderCreate, service: OrderServiceDep) -> OrderRead:
    return OrderRead.model_validate(await service.create(data))


# Declared before "/{order_id}" so that "summary" is not parsed as an id.
@router.get("/summary")
async def order_summary(service: OrderServiceDep) -> OrderSummary:
    return await service.summary()


@router.get("/{order_id}", responses={404: {"model": ErrorResponse}})
async def get_order(order_id: uuid.UUID, service: OrderServiceDep) -> OrderRead:
    return OrderRead.model_validate(await service.get(order_id))


@router.patch(
    "/{order_id}/status",
    responses={404: {"model": ErrorResponse}, 409: {"model": ErrorResponse}},
)
async def change_order_status(
    order_id: uuid.UUID, data: OrderStatusUpdate, service: OrderServiceDep
) -> OrderRead:
    return OrderRead.model_validate(await service.change_status(order_id, data.status))
