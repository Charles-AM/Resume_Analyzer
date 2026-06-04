from uuid import UUID

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from app.models.domain import Job, Resume


class ResumeRepository:
    def __init__(self, session: AsyncSession):
        self.session = session

    async def get_for_user(self, resume_id: UUID, user_id: UUID, include_chunks: bool = False) -> Resume | None:
        stmt = select(Resume).where(Resume.id == resume_id, Resume.owner_id == user_id)
        if include_chunks:
            stmt = stmt.options(selectinload(Resume.chunks))
        result = await self.session.execute(stmt)
        return result.scalar_one_or_none()

    async def list_for_user(self, user_id: UUID) -> list[Resume]:
        result = await self.session.execute(
            select(Resume).where(Resume.owner_id == user_id).order_by(Resume.created_at.desc())
        )
        return list(result.scalars().all())

    async def create(self, resume: Resume) -> Resume:
        self.session.add(resume)
        await self.session.commit()
        await self.session.refresh(resume)
        return resume


class JobRepository:
    def __init__(self, session: AsyncSession):
        self.session = session

    async def create(self, job: Job) -> Job:
        self.session.add(job)
        await self.session.commit()
        await self.session.refresh(job)
        return job

    async def get_for_user(self, job_id: UUID, user_id: UUID) -> Job | None:
        result = await self.session.execute(select(Job).where(Job.id == job_id, Job.owner_id == user_id))
        return result.scalar_one_or_none()
