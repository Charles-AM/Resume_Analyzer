# Deployment Guide

## Primary Cloud Path

- Frontend: Vercel, project root `frontend`, env `NEXT_PUBLIC_API_URL`.
- Backend: Railway or Render, Dockerfile `backend/Dockerfile`.
- Database: Neon PostgreSQL with pgvector enabled.
- Redis: Upstash Redis.
- Vector store: Qdrant Cloud, or pgvector using the included schema.

## Backend Environment

- `DATABASE_URL`
- `REDIS_URL`
- `QDRANT_URL`
- `JWT_SECRET`
- `CORS_ORIGINS`
- `OPENAI_API_KEY` if using OpenAI embeddings or LLMs

## Release Steps

1. Merge a passing PR into `main`.
2. Run Alembic migrations against Neon.
3. Deploy backend image to Railway or Render.
4. Deploy frontend to Vercel.
5. Verify `/health`, `/metrics`, login, upload, analyze, chat, and search.
