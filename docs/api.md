# API Specification

The FastAPI backend publishes OpenAPI at `/api/v1/openapi.json` and interactive docs at `/docs`.

## Endpoint Groups

- `POST /api/v1/auth/register`: create a user account.
- `POST /api/v1/auth/login`: issue a JWT access token.
- `GET /api/v1/auth/me`: return the authenticated user.
- `POST /api/v1/upload/resume`: upload PDF, DOCX, TXT, or Markdown resumes.
- `GET /api/v1/upload/resumes`: list resumes for the current user.
- `POST /api/v1/upload/job`: create a job description record.
- `POST /api/v1/analyze`: score candidate-job fit and generate recommendations.
- `POST /api/v1/chat`: answer resume improvement questions using retrieved chunks.
- `POST /api/v1/search`: semantic candidate search.
- `GET /api/v1/dashboard/user`: user analytics.
- `GET /api/v1/dashboard/admin`: admin analytics.
- `GET /health`: service health.
- `GET /metrics`: Prometheus metrics.
