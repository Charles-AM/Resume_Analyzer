# Incremental Delivery Checkpoints

| # | Branch | Commit message | PR title | Testing checklist |
|---|---|---|---|---|
| 1 | `codex/checkpoint-01-project-init` | `chore: initialize resume analyzer monorepo` | Project initialization | Backend boots, frontend boots, Docker compose validates |
| 2 | `codex/checkpoint-02-auth` | `feat: add jwt authentication and rbac` | Authentication | Registration, login, protected routes, admin denial |
| 3 | `codex/checkpoint-03-database` | `feat: add postgres models and migrations` | Database layer | Alembic upgrade, model constraints, repository tests |
| 4 | `codex/checkpoint-04-upload` | `feat: add resume upload ingestion` | Resume upload service | PDF, DOCX, invalid file, storage path |
| 5 | `codex/checkpoint-05-etl` | `feat: add resume etl parser` | ETL pipeline | Skill extraction, deduplication, normalization |
| 6 | `codex/checkpoint-06-embeddings` | `feat: add chunking and embedding pipeline` | Embedding pipeline | Chunk overlap, deterministic local embeddings, vector persistence |
| 7 | `codex/checkpoint-07-rag` | `feat: add rag retrieval service` | RAG retrieval service | Similarity ranking, top-k retrieval, context assembly |
| 8 | `codex/checkpoint-08-analysis` | `feat: add ai analysis engine` | AI analysis engine | ATS score, skill gap score, recommendations |
| 9 | `codex/checkpoint-09-dashboard` | `feat: add analytics dashboard` | Dashboard | Upload panel, charts, history, responsive layout |
| 10 | `codex/checkpoint-10-search` | `feat: add semantic candidate search` | Semantic search | Python AWS query, Kubernetes query, no-result handling |
| 11 | `codex/checkpoint-11-redis-cache` | `feat: add redis caching layer` | Redis caching | Embedding cache, retrieval cache, analysis cache |
| 12 | `codex/checkpoint-12-workers` | `feat: add celery background workers` | Background workers | Parse task, embedding task, analysis task |
| 13 | `codex/checkpoint-13-observability` | `feat: add tracing and prometheus metrics` | Observability | Metrics scrape, structured logs, trace headers |
| 14 | `codex/checkpoint-14-tests` | `test: expand backend and frontend suites` | Testing suite | Pytest, Jest, Playwright, coverage threshold |
| 15 | `codex/checkpoint-15-cicd` | `ci: add build test scan deploy workflows` | CI/CD pipeline | PR lint/test/scan, main build and image publish |
| 16 | `codex/checkpoint-16-prod-deploy` | `docs: add vercel neon upstash qdrant deployment` | Production deployment | Env vars, migrations, smoke tests |
| 17 | `codex/checkpoint-17-terraform` | `infra: add aws terraform baseline` | Terraform infrastructure | Terraform fmt, validate, plan |
| 18 | `codex/checkpoint-18-final-release` | `docs: finalize release documentation` | Documentation and final release | README, diagrams, API docs, local setup |

## Pull Request Description Template

Each checkpoint PR should include:

- Scope and architectural decisions
- Files changed
- Test evidence
- Security considerations
- Deployment or migration notes
- Rollback plan

## Merge Flow

1. Create the checkpoint branch.
2. Implement the feature behind tests.
3. Update `README.md` and relevant docs.
4. Open a PR using the title above.
5. Wait for CI to pass.
6. Squash merge into `main`.
7. Confirm the main-branch deploy workflow starts.
