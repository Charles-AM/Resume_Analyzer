from app.tasks.celery_app import celery_app


@celery_app.task
def parse_resume(resume_id: str) -> dict:
    return {"resume_id": resume_id, "status": "queued_for_parsing"}


@celery_app.task
def generate_embeddings(resume_id: str) -> dict:
    return {"resume_id": resume_id, "status": "queued_for_embedding"}


@celery_app.task
def analyze_resume(resume_id: str, job_id: str | None = None) -> dict:
    return {"resume_id": resume_id, "job_id": job_id, "status": "queued_for_analysis"}


@celery_app.task
def aggregate_analytics() -> dict:
    return {"status": "analytics_aggregation_queued"}
