"""One error shape for every failure: `{"error": {code, message, details, request_id}}`."""

from collections.abc import Mapping, Sequence

from fastapi import FastAPI, Request
from fastapi.exceptions import RequestValidationError
from fastapi.responses import JSONResponse
from pydantic import BaseModel
from starlette.exceptions import HTTPException

from app.core.logging import request_id_ctx


class AppError(Exception):
    """Base class for expected, client-facing errors raised by services."""

    status_code = 500
    code = "internal_error"

    def __init__(self, message: str) -> None:
        super().__init__(message)
        self.message = message


class NotFoundError(AppError):
    status_code = 404
    code = "not_found"


class ConflictError(AppError):
    status_code = 409
    code = "conflict"


class ServiceUnavailableError(AppError):
    status_code = 503
    code = "service_unavailable"


class ErrorDetail(BaseModel):
    field: str
    message: str


class ErrorBody(BaseModel):
    code: str
    message: str
    details: list[ErrorDetail] = []
    request_id: str | None = None


class ErrorResponse(BaseModel):
    error: ErrorBody


def error_response(
    status_code: int,
    code: str,
    message: str,
    details: Sequence[ErrorDetail] = (),
    headers: Mapping[str, str] | None = None,
) -> JSONResponse:
    body = ErrorResponse(
        error=ErrorBody(
            code=code,
            message=message,
            details=list(details),
            request_id=request_id_ctx.get(),
        )
    )
    return JSONResponse(body.model_dump(), status_code=status_code, headers=headers)


async def _handle_app_error(_: Request, exc: Exception) -> JSONResponse:
    assert isinstance(exc, AppError)  # noqa: S101 - narrows the type for mypy
    return error_response(exc.status_code, exc.code, exc.message)


async def _handle_validation_error(_: Request, exc: Exception) -> JSONResponse:
    assert isinstance(exc, RequestValidationError)  # noqa: S101
    details = [
        ErrorDetail(
            # Drop the leading "body" / "query" / "path" segment when a field name follows it.
            field=".".join(str(part) for part in (error["loc"][1:] or error["loc"])),
            message=error["msg"],
        )
        for error in exc.errors()
    ]
    return error_response(422, "validation_error", "The request is invalid.", details)


async def _handle_http_error(_: Request, exc: Exception) -> JSONResponse:
    assert isinstance(exc, HTTPException)  # noqa: S101
    return error_response(exc.status_code, "http_error", str(exc.detail), headers=exc.headers)


def register_exception_handlers(app: FastAPI) -> None:
    # Unexpected exceptions are handled in RequestContextMiddleware.
    app.add_exception_handler(AppError, _handle_app_error)
    app.add_exception_handler(RequestValidationError, _handle_validation_error)
    app.add_exception_handler(HTTPException, _handle_http_error)
