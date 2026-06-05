import shutil
from pathlib import Path
from uuid import uuid4

from fastapi import APIRouter, Depends, File, HTTPException, UploadFile, status
from sqlalchemy import text
from sqlalchemy.ext.asyncio import AsyncSession

from app.api.deps import current_user
from app.core.config import get_settings
from app.db.session import get_session
from app.models.domain import Embedding, Resume, ResumeChunk, User
from app.repositories.resumes import ResumeRepository
from app.schemas.resume import JobCreate, JobRead, ResumeRead
from app.services.chunking import ResumeChunker
from app.services.embeddings import EmbeddingProvider
from app.services.etl import ResumeParser
from app.services.text_extractors import TextExtractionError, TextExtractor

router = APIRouter(prefix="/upload", tags=["upload"])
MAX_RESUME_BYTES = 8 * 1024 * 1024


@router.post("/resume", response_model=ResumeRead, status_code=status.HTTP_201_CREATED)
async def upload_resume(
    file: UploadFile = File(...),
    user: User = Depends(current_user),
    session: AsyncSession = Depends(get_session),
) -> Resume:
    suffix = Path(file.filename or "").suffix.lower()
    if suffix not in {".pdf", ".docx", ".txt", ".md"}:
        raise HTTPException(
            status_code=400,
            detail="Only PDF, DOCX, TXT, and MD resumes are supported",
        )
    if file.size and file.size > MAX_RESUME_BYTES:
        raise HTTPException(status_code=400, detail="Resume file must be smaller than 8 MB")

    upload_dir = Path(get_settings().upload_dir)
    upload_dir.mkdir(parents=True, exist_ok=True)
    storage_path = upload_dir / f"{uuid4()}{suffix}"
    with storage_path.open("wb") as buffer:
        shutil.copyfileobj(file.file, buffer)
    if storage_path.stat().st_size == 0:
        storage_path.unlink(missing_ok=True)
        raise HTTPException(status_code=400, detail="Uploaded file is empty")
    if storage_path.stat().st_size > MAX_RESUME_BYTES:
        storage_path.unlink(missing_ok=True)
        raise HTTPException(status_code=400, detail="Resume file must be smaller than 8 MB")

    try:
        raw_text = TextExtractor().extract(storage_path)
    except TextExtractionError as exc:
        storage_path.unlink(missing_ok=True)
        raise HTTPException(status_code=400, detail=str(exc)) from exc
    if len(raw_text.split()) < 40:
        storage_path.unlink(missing_ok=True)
        raise HTTPException(
            status_code=400,
            detail="We found very little resume text. Upload a fuller resume file.",
        )

    parsed = ResumeParser().parse(raw_text)
    resume = Resume(
        owner_id=user.id,
        filename=file.filename or storage_path.name,
        storage_path=str(storage_path),
        raw_text=raw_text,
        **parsed.model_dump(),
    )
    session.add(resume)
    await session.flush()

    chunker = ResumeChunker()
    provider = EmbeddingProvider()
    chunks = chunker.chunk(raw_text)
    vectors = await provider.embed(chunks)
    for index, chunk_text in enumerate(chunks):
        chunk = ResumeChunk(
            resume_id=resume.id,
            chunk_index=index,
            text=chunk_text,
            token_count=len(chunk_text.split()),
        )
        session.add(chunk)
        await session.flush()
        session.add(
            Embedding(
                chunk_id=chunk.id,
                provider="local",
                model=provider.model,
                vector=vectors[index],
            )
        )

    await session.execute(
        text("UPDATE resumes SET search_vector = to_tsvector('english', raw_text) WHERE id = :id"),
        {"id": resume.id},
    )
    await session.commit()
    await session.refresh(resume)
    return resume


@router.get("/resumes", response_model=list[ResumeRead])
async def list_resumes(
    user: User = Depends(current_user),
    session: AsyncSession = Depends(get_session),
) -> list[Resume]:
    return await ResumeRepository(session).list_for_user(user.id)


@router.post("/job", response_model=JobRead, status_code=status.HTTP_201_CREATED)
async def create_job(
    payload: JobCreate,
    user: User = Depends(current_user),
    session: AsyncSession = Depends(get_session),
):
    from app.models.domain import Job
    from app.repositories.resumes import JobRepository
    from app.services.etl import ResumeParser

    required_skills = [skill.name for skill in ResumeParser().extract_skills(payload.description)]
    job = Job(owner_id=user.id, required_skills=required_skills, **payload.model_dump())
    return await JobRepository(session).create(job)
