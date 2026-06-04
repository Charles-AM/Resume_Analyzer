from enum import StrEnum
from uuid import UUID

from pgvector.sqlalchemy import Vector
from sqlalchemy import Boolean, Enum, Float, ForeignKey, Index, Integer, String, Text, UniqueConstraint
from sqlalchemy.dialects.postgresql import JSONB, TSVECTOR, UUID as PGUUID
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.models.base import Base, TimestampMixin


class UserRole(StrEnum):
    admin = "admin"
    user = "user"


class User(Base, TimestampMixin):
    __tablename__ = "users"

    email: Mapped[str] = mapped_column(String(320), unique=True, index=True)
    password_hash: Mapped[str] = mapped_column(String(255))
    full_name: Mapped[str] = mapped_column(String(255))
    role: Mapped[UserRole] = mapped_column(Enum(UserRole), default=UserRole.user)
    is_active: Mapped[bool] = mapped_column(Boolean, default=True)

    resumes: Mapped[list["Resume"]] = relationship(back_populates="owner")


class Resume(Base, TimestampMixin):
    __tablename__ = "resumes"

    owner_id: Mapped[UUID] = mapped_column(PGUUID(as_uuid=True), ForeignKey("users.id"))
    filename: Mapped[str] = mapped_column(String(255))
    storage_path: Mapped[str] = mapped_column(String(500))
    raw_text: Mapped[str] = mapped_column(Text, default="")
    candidate_name: Mapped[str | None] = mapped_column(String(255))
    email: Mapped[str | None] = mapped_column(String(320))
    skills: Mapped[list[str]] = mapped_column(JSONB, default=list)
    education: Mapped[list[dict]] = mapped_column(JSONB, default=list)
    experience: Mapped[list[dict]] = mapped_column(JSONB, default=list)
    certifications: Mapped[list[str]] = mapped_column(JSONB, default=list)
    projects: Mapped[list[dict]] = mapped_column(JSONB, default=list)
    search_vector: Mapped[str | None] = mapped_column(TSVECTOR)

    owner: Mapped[User] = relationship(back_populates="resumes")
    chunks: Mapped[list["ResumeChunk"]] = relationship(back_populates="resume", cascade="all,delete")
    analyses: Mapped[list["AnalysisResult"]] = relationship(back_populates="resume")

    __table_args__ = (Index("ix_resumes_search_vector", "search_vector", postgresql_using="gin"),)


class Job(Base, TimestampMixin):
    __tablename__ = "jobs"

    owner_id: Mapped[UUID] = mapped_column(PGUUID(as_uuid=True), ForeignKey("users.id"))
    title: Mapped[str] = mapped_column(String(255))
    company: Mapped[str | None] = mapped_column(String(255))
    description: Mapped[str] = mapped_column(Text)
    required_skills: Mapped[list[str]] = mapped_column(JSONB, default=list)


class ResumeChunk(Base, TimestampMixin):
    __tablename__ = "resume_chunks"

    resume_id: Mapped[UUID] = mapped_column(PGUUID(as_uuid=True), ForeignKey("resumes.id"))
    chunk_index: Mapped[int] = mapped_column(Integer)
    text: Mapped[str] = mapped_column(Text)
    token_count: Mapped[int] = mapped_column(Integer)

    resume: Mapped[Resume] = relationship(back_populates="chunks")
    embedding: Mapped["Embedding"] = relationship(back_populates="chunk", cascade="all,delete")

    __table_args__ = (UniqueConstraint("resume_id", "chunk_index"),)


class Embedding(Base, TimestampMixin):
    __tablename__ = "embeddings"

    chunk_id: Mapped[UUID] = mapped_column(PGUUID(as_uuid=True), ForeignKey("resume_chunks.id"), unique=True)
    provider: Mapped[str] = mapped_column(String(50))
    model: Mapped[str] = mapped_column(String(100))
    vector: Mapped[list[float]] = mapped_column(Vector(384))

    chunk: Mapped[ResumeChunk] = relationship(back_populates="embedding")

    __table_args__ = (
        Index(
            "ix_embeddings_vector",
            "vector",
            postgresql_using="hnsw",
            postgresql_ops={"vector": "vector_cosine_ops"},
        ),
    )


class AnalysisResult(Base, TimestampMixin):
    __tablename__ = "analysis_results"

    resume_id: Mapped[UUID] = mapped_column(PGUUID(as_uuid=True), ForeignKey("resumes.id"))
    job_id: Mapped[UUID | None] = mapped_column(PGUUID(as_uuid=True), ForeignKey("jobs.id"), nullable=True)
    ats_score: Mapped[float] = mapped_column(Float)
    skill_match_score: Mapped[float] = mapped_column(Float)
    experience_match_score: Mapped[float] = mapped_column(Float)
    missing_skills: Mapped[list[str]] = mapped_column(JSONB, default=list)
    strengths: Mapped[list[str]] = mapped_column(JSONB, default=list)
    weaknesses: Mapped[list[str]] = mapped_column(JSONB, default=list)
    recommendations: Mapped[list[str]] = mapped_column(JSONB, default=list)
    roadmap: Mapped[list[dict]] = mapped_column(JSONB, default=list)
    certifications: Mapped[list[str]] = mapped_column(JSONB, default=list)
    portfolio_projects: Mapped[list[str]] = mapped_column(JSONB, default=list)

    resume: Mapped[Resume] = relationship(back_populates="analyses")
