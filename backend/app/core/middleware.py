"""Request id propagation, access logging and the catch-all for unexpected errors."""

import logging
import re
import time
import uuid

from starlette.datastructures import Headers, MutableHeaders
from starlette.types import ASGIApp, Message, Receive, Scope, Send

from app.core.errors import error_response
from app.core.logging import request_id_ctx

logger = logging.getLogger("app.request")

REQUEST_ID_HEADER = "x-request-id"
# Incoming ids end up in logs, so only accept a conservative character set.
_SAFE_REQUEST_ID = re.compile(r"[A-Za-z0-9._-]{1,128}")


class RequestContextMiddleware:
    def __init__(self, app: ASGIApp) -> None:
        self.app = app

    async def __call__(self, scope: Scope, receive: Receive, send: Send) -> None:
        if scope["type"] != "http":
            await self.app(scope, receive, send)
            return

        incoming = Headers(scope=scope).get(REQUEST_ID_HEADER, "")
        request_id = incoming if _SAFE_REQUEST_ID.fullmatch(incoming) else uuid.uuid4().hex
        token = request_id_ctx.set(request_id)
        started_at = time.perf_counter()
        status_code = 500
        response_started = False

        async def send_with_headers(message: Message) -> None:
            nonlocal status_code, response_started
            if message["type"] == "http.response.start":
                response_started = True
                status_code = message["status"]
                headers = MutableHeaders(scope=message)
                headers[REQUEST_ID_HEADER] = request_id
                headers["x-content-type-options"] = "nosniff"
            await send(message)

        try:
            await self.app(scope, receive, send_with_headers)
        except Exception:
            logger.exception("Unhandled error")
            if response_started:
                raise
            response = error_response(500, "internal_error", "An unexpected error occurred.")
            await response(scope, receive, send_with_headers)
        finally:
            logger.info(
                "%s %s -> %s",
                scope["method"],
                scope["path"],
                status_code,
                extra={
                    "method": scope["method"],
                    "path": scope["path"],
                    "status_code": status_code,
                    "duration_ms": round((time.perf_counter() - started_at) * 1000, 2),
                },
            )
            request_id_ctx.reset(token)
