FROM python:3.12-slim AS runtime

ENV PYTHONDONTWRITEBYTECODE=1 \
    PYTHONUNBUFFERED=1

WORKDIR /app
COPY pyproject.toml ./
RUN pip install --no-cache-dir ".[dev]"
COPY alembic.ini ./alembic.ini
COPY alembic ./alembic
COPY app ./app
COPY start.sh ./start.sh
RUN chmod +x ./start.sh

EXPOSE 8000
CMD ["./start.sh"]
