from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from opentelemetry.instrumentation.fastapi import FastAPIInstrumentor
from prometheus_client import CONTENT_TYPE_LATEST, Counter, Histogram, generate_latest
from starlette.responses import Response
import structlog
import time

from app.api.router import api_router
from app.core.config import get_settings
from app.core.logging import configure_logging

configure_logging()
settings = get_settings()
logger = structlog.get_logger()

REQUEST_COUNT = Counter("api_requests_total", "Total API requests", ["method", "path", "status"])
REQUEST_LATENCY = Histogram("api_request_latency_seconds", "API request latency", ["method", "path"])

app = FastAPI(title=settings.app_name, version="0.1.0", openapi_url=f"{settings.api_prefix}/openapi.json")

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.middleware("http")
async def metrics_and_logging(request: Request, call_next):
    start = time.perf_counter()
    response = await call_next(request)
    latency = time.perf_counter() - start
    REQUEST_COUNT.labels(request.method, request.url.path, response.status_code).inc()
    REQUEST_LATENCY.labels(request.method, request.url.path).observe(latency)
    logger.info(
        "request_completed",
        method=request.method,
        path=request.url.path,
        status_code=response.status_code,
        latency_ms=round(latency * 1000, 2),
    )
    return response


@app.get("/health")
async def health() -> dict:
    return {"status": "ok", "service": settings.app_name}


@app.get("/metrics")
async def metrics() -> Response:
    return Response(generate_latest(), media_type=CONTENT_TYPE_LATEST)


app.include_router(api_router, prefix=settings.api_prefix)
FastAPIInstrumentor.instrument_app(app)
