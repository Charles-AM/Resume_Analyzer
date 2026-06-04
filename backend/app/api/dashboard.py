from fastapi import APIRouter, Depends
from sqlalchemy import func, select
from sqlalchemy.ext.asyncio import AsyncSession

from app.api.deps import current_user, require_role
from app.db.session import get_session
from app.models.domain import AnalysisResult, Resume, User, UserRole

router = APIRouter(prefix="/dashboard", tags=["dashboard"])


@router.get("/user")
async def user_dashboard(
    user: User = Depends(current_user),
    session: AsyncSession = Depends(get_session),
) -> dict:
    resumes = (await session.execute(select(Resume).where(Resume.owner_id == user.id))).scalars().all()
    analyses = (
        await session.execute(
            select(AnalysisResult).join(Resume).where(Resume.owner_id == user.id).order_by(AnalysisResult.created_at)
        )
    ).scalars().all()
    return {
        "resume_count": len(resumes),
        "analysis_count": len(analyses),
        "ats_scores": [analysis.ats_score for analysis in analyses],
        "skill_gap_trends": [analysis.missing_skills for analysis in analyses],
    }


@router.get("/admin")
async def admin_dashboard(
    _: User = Depends(require_role(UserRole.admin)),
    session: AsyncSession = Depends(get_session),
) -> dict:
    user_count = await session.scalar(select(func.count(User.id)))
    resume_count = await session.scalar(select(func.count(Resume.id)))
    analysis_count = await session.scalar(select(func.count(AnalysisResult.id)))
    return {
        "user_count": user_count or 0,
        "resume_count": resume_count or 0,
        "analysis_count": analysis_count or 0,
        "api_usage": {"embedding_requests": resume_count or 0, "analysis_requests": analysis_count or 0},
    }
