from fastapi import APIRouter

from app.api import analyze, auth, chat, dashboard, search, upload

api_router = APIRouter()
api_router.include_router(auth.router)
api_router.include_router(upload.router)
api_router.include_router(analyze.router)
api_router.include_router(chat.router)
api_router.include_router(search.router)
api_router.include_router(dashboard.router)
