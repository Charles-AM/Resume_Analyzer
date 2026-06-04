from dataclasses import dataclass
from uuid import UUID

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from app.models.domain import Embedding, ResumeChunk
from app.services.embeddings import EmbeddingProvider, cosine_similarity


@dataclass
class RetrievedChunk:
    resume_id: UUID
    chunk_id: UUID
    text: str
    score: float


class RagService:
    def __init__(self, session: AsyncSession, embedding_provider: EmbeddingProvider | None = None):
        self.session = session
        self.embedding_provider = embedding_provider or EmbeddingProvider()

    async def retrieve(self, query: str, top_k: int = 5, resume_id: UUID | None = None) -> list[RetrievedChunk]:
        query_vector = (await self.embedding_provider.embed([query]))[0]
        stmt = select(Embedding).options(selectinload(Embedding.chunk).selectinload(ResumeChunk.resume))
        if resume_id:
            stmt = stmt.join(ResumeChunk).where(ResumeChunk.resume_id == resume_id)
        rows = (await self.session.execute(stmt)).scalars().all()
        ranked = [
            RetrievedChunk(
                resume_id=row.chunk.resume_id,
                chunk_id=row.chunk_id,
                text=row.chunk.text,
                score=cosine_similarity(query_vector, row.vector),
            )
            for row in rows
        ]
        return sorted(ranked, key=lambda item: item.score, reverse=True)[:top_k]

    def assemble_context(self, chunks: list[RetrievedChunk]) -> str:
        return "\n\n".join(f"[score={chunk.score:.3f}] {chunk.text}" for chunk in chunks)
