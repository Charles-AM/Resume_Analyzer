from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession

from app.api.deps import current_user
from app.db.session import get_session
from app.models.domain import User
from app.schemas.analysis import SearchHit, SearchRequest
from app.services.rag import RagService

router = APIRouter(prefix="/search", tags=["search"])


@router.post("", response_model=list[SearchHit])
async def semantic_search(
    payload: SearchRequest,
    _: User = Depends(current_user),
    session: AsyncSession = Depends(get_session),
) -> list[SearchHit]:
    chunks = await RagService(session).retrieve(payload.query, top_k=payload.top_k)
    return [
        SearchHit(
            resume_id=str(chunk.resume_id),
            candidate_name=None,
            filename="resume",
            score=round(chunk.score, 4),
            snippet=chunk.text[:320],
        )
        for chunk in chunks
    ]
