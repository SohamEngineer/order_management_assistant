import logging
from typing import Literal

from fastapi import APIRouter
from pydantic import BaseModel

from app.api.deps import DatabaseDep
from app.core.errors import ErrorResponse, ServiceUnavailableError

logger = logging.getLogger(__name__)
router = APIRouter(prefix="/health", tags=["health"])


class HealthStatus(BaseModel):
    status: Literal["ok"] = "ok"


@router.get("/live")
async def live() -> HealthStatus:
    """The process is up."""
    return HealthStatus()


@router.get("/ready", responses={503: {"model": ErrorResponse}})
async def ready(database: DatabaseDep) -> HealthStatus:
    """The process can serve traffic: its dependencies are reachable."""
    try:
        await database.ping()
    except Exception as exc:
        logger.exception("Readiness check failed")
        raise ServiceUnavailableError("The database is not reachable.") from exc
    return HealthStatus()
