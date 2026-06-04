from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession

from app.api.deps import current_user
from app.db.session import get_session
from app.models.domain import AnalysisResult, User
from app.repositories.resumes import JobRepository, ResumeRepository
from app.schemas.analysis import AnalysisRead, AnalysisRequest
from app.services.analysis import AnalysisEngine

router = APIRouter(prefix="/analyze", tags=["analysis"])


@router.post("", response_model=AnalysisRead)
async def analyze(
    payload: AnalysisRequest,
    user: User = Depends(current_user),
    session: AsyncSession = Depends(get_session),
) -> AnalysisResult:
    resume = await ResumeRepository(session).get_for_user(UUID(payload.resume_id), user.id)
    if not resume:
        raise HTTPException(status_code=404, detail="Resume not found")
    job_description = payload.job_description
    job_id = None
    if payload.job_id:
        job = await JobRepository(session).get_for_user(UUID(payload.job_id), user.id)
        if not job:
            raise HTTPException(status_code=404, detail="Job not found")
        job_id = job.id
        job_description = job.description
    result = AnalysisResult(
        resume_id=resume.id,
        job_id=job_id,
        **AnalysisEngine().analyze(resume, job_description),
    )
    session.add(result)
    await session.commit()
    await session.refresh(result)
    return result
