from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.api.deps import current_user
from app.core.security import create_access_token, verify_password
from app.db.session import get_session
from app.models.domain import User
from app.repositories.users import UserRepository
from app.schemas.auth import LoginRequest, RegisterRequest, TokenResponse, UserRead

router = APIRouter(prefix="/auth", tags=["auth"])

DEMO_EMAIL = "demo@am-i-a-good-match.app"
DEMO_PASSWORD = "DemoMatch2026!"
DEMO_FULL_NAME = "Demo Candidate"


@router.post("/register", response_model=UserRead, status_code=status.HTTP_201_CREATED)
async def register(payload: RegisterRequest, session: AsyncSession = Depends(get_session)) -> User:
    repo = UserRepository(session)
    existing = await repo.get_by_email(payload.email)
    if existing:
        raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail="Email already registered")
    return await repo.create(payload.email, payload.password, payload.full_name)


@router.post("/login", response_model=TokenResponse)
async def login(payload: LoginRequest, session: AsyncSession = Depends(get_session)) -> TokenResponse:
    user = await UserRepository(session).get_by_email(payload.email)
    if not user or not verify_password(payload.password, user.password_hash):
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid credentials")
    return TokenResponse(access_token=create_access_token(str(user.id), {"role": user.role.value}))


@router.post("/demo-login", response_model=TokenResponse)
async def demo_login(session: AsyncSession = Depends(get_session)) -> TokenResponse:
    repo = UserRepository(session)
    user = await repo.get_by_email(DEMO_EMAIL)
    if not user:
        user = await repo.create(DEMO_EMAIL, DEMO_PASSWORD, DEMO_FULL_NAME)
    return TokenResponse(access_token=create_access_token(str(user.id), {"role": user.role.value}))


@router.get("/me", response_model=UserRead)
async def me(user: User = Depends(current_user)) -> User:
    return user
