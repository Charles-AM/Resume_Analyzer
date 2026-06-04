from uuid import UUID

from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession

from app.api.deps import current_user
from app.db.session import get_session
from app.models.domain import User
from app.schemas.analysis import ChatRequest, ChatResponse
from app.services.analysis import AnalysisEngine
from app.services.rag import RagService

router = APIRouter(prefix="/chat", tags=["chat"])


@router.post("", response_model=ChatResponse)
async def chat(
    payload: ChatRequest,
    _: User = Depends(current_user),
    session: AsyncSession = Depends(get_session),
) -> ChatResponse:
    chunks = await RagService(session).retrieve(
        payload.question, top_k=payload.top_k, resume_id=UUID(payload.resume_id)
    )
    return AnalysisEngine().answer(payload.question, chunks)
