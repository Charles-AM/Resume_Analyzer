from celery import Celery

from app.core.config import get_settings

settings = get_settings()
celery_app = Celery("resume_analyzer", broker=settings.redis_url, backend=settings.redis_url)
celery_app.conf.task_routes = {
    "app.tasks.resume_tasks.parse_resume": {"queue": "etl"},
    "app.tasks.resume_tasks.generate_embeddings": {"queue": "ai"},
    "app.tasks.resume_tasks.aggregate_analytics": {"queue": "analytics"},
}
