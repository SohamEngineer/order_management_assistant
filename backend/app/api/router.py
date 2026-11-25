"""Versioned API router. Register new feature routers here."""

from fastapi import APIRouter

from app.api.routes import orders
from app.core.errors import ErrorResponse

api_router = APIRouter(prefix="/api/v1", responses={422: {"model": ErrorResponse}})
api_router.include_router(orders.router)
