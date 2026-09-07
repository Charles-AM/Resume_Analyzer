# Deployment Guide

## Primary Cloud Path

- Public app URL: Netlify, project root `frontend`.
- Backend API: Render, Dockerfile `backend/Dockerfile`.
- Database: Neon PostgreSQL with pgvector enabled.
- Redis: Upstash Redis.
- Vector store: Qdrant Cloud, or pgvector using the included schema.

Netlify is the single user-facing link. The frontend calls `/api/v1/*`, and the explicit
proxy in `frontend/netlify.toml` forwards those requests to the Render backend. The
published `frontend/public/_redirects` file provides the same rule for monorepo
configurations that do not discover the package TOML. The `BACKEND_URL` rewrite in
`frontend/next.config.ts` remains available for other hosts.

## Backend Environment

- `DATABASE_URL`
- `REDIS_URL`
- `QDRANT_URL`
- `JWT_SECRET`
- `CORS_ORIGINS`, for example `https://your-netlify-site.netlify.app`
- `OPENAI_API_KEY` if using OpenAI embeddings or LLMs

## Netlify Environment

- `BACKEND_URL`, optional when using the included Netlify proxy
- `NEXT_PUBLIC_API_URL=/api/v1`

Netlify build settings:

- Base directory or package directory: `frontend`
- Build command: `npm run build`
- The included `frontend/netlify.toml` adds the Next.js plugin and defaults API calls to `/api/v1`.

## Release Steps

1. Merge a passing PR into `main`.
2. Run Alembic migrations against Neon.
3. Deploy the backend Docker service to Render.
4. Deploy the frontend; the included Netlify proxy targets the Render service.
5. Verify the single Netlify link, `/backend-health`, `/api/v1/openapi.json`, login, upload, analyze, chat, and search.

## Continuous Deployment

- Netlify should deploy the `frontend` package automatically on every push to `main`.
- Render should enable Auto-Deploy on the backend web service. The included `render.yaml`
  sets `autoDeploy: true` for blueprint-based setup.
- The backend Docker image starts with `backend/start.sh`, which runs `alembic upgrade head`
  before starting Uvicorn on Render's `$PORT`. This keeps database migrations in sync after
  future GitHub changes.
