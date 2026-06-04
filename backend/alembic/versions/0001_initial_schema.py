"""initial schema

Revision ID: 0001_initial_schema
Revises:
Create Date: 2026-06-04
"""

from alembic import op
import sqlalchemy as sa
from pgvector.sqlalchemy import Vector
from sqlalchemy.dialects import postgresql

revision = "0001_initial_schema"
down_revision = None
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.execute("CREATE EXTENSION IF NOT EXISTS vector")
    op.create_table(
        "users",
        sa.Column("email", sa.String(length=320), nullable=False),
        sa.Column("password_hash", sa.String(length=255), nullable=False),
        sa.Column("full_name", sa.String(length=255), nullable=False),
        sa.Column("role", sa.Enum("admin", "user", name="userrole"), nullable=False),
        sa.Column("is_active", sa.Boolean(), nullable=False),
        sa.Column("id", postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.text("now()")),
        sa.Column("updated_at", sa.DateTime(timezone=True), server_default=sa.text("now()")),
        sa.PrimaryKeyConstraint("id"),
    )
    op.create_index("ix_users_email", "users", ["email"], unique=True)
    op.create_table(
        "resumes",
        sa.Column("owner_id", postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column("filename", sa.String(length=255), nullable=False),
        sa.Column("storage_path", sa.String(length=500), nullable=False),
        sa.Column("raw_text", sa.Text(), nullable=False),
        sa.Column("candidate_name", sa.String(length=255)),
        sa.Column("email", sa.String(length=320)),
        sa.Column("skills", postgresql.JSONB(astext_type=sa.Text()), nullable=False),
        sa.Column("education", postgresql.JSONB(astext_type=sa.Text()), nullable=False),
        sa.Column("experience", postgresql.JSONB(astext_type=sa.Text()), nullable=False),
        sa.Column("certifications", postgresql.JSONB(astext_type=sa.Text()), nullable=False),
        sa.Column("projects", postgresql.JSONB(astext_type=sa.Text()), nullable=False),
        sa.Column("search_vector", postgresql.TSVECTOR()),
        sa.Column("id", postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.text("now()")),
        sa.Column("updated_at", sa.DateTime(timezone=True), server_default=sa.text("now()")),
        sa.ForeignKeyConstraint(["owner_id"], ["users.id"]),
        sa.PrimaryKeyConstraint("id"),
    )
    op.create_index("ix_resumes_search_vector", "resumes", ["search_vector"], postgresql_using="gin")
    op.create_table(
        "jobs",
        sa.Column("owner_id", postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column("title", sa.String(length=255), nullable=False),
        sa.Column("company", sa.String(length=255)),
        sa.Column("description", sa.Text(), nullable=False),
        sa.Column("required_skills", postgresql.JSONB(astext_type=sa.Text()), nullable=False),
        sa.Column("id", postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.text("now()")),
        sa.Column("updated_at", sa.DateTime(timezone=True), server_default=sa.text("now()")),
        sa.ForeignKeyConstraint(["owner_id"], ["users.id"]),
        sa.PrimaryKeyConstraint("id"),
    )
    op.create_table(
        "resume_chunks",
        sa.Column("resume_id", postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column("chunk_index", sa.Integer(), nullable=False),
        sa.Column("text", sa.Text(), nullable=False),
        sa.Column("token_count", sa.Integer(), nullable=False),
        sa.Column("id", postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.text("now()")),
        sa.Column("updated_at", sa.DateTime(timezone=True), server_default=sa.text("now()")),
        sa.ForeignKeyConstraint(["resume_id"], ["resumes.id"]),
        sa.PrimaryKeyConstraint("id"),
        sa.UniqueConstraint("resume_id", "chunk_index"),
    )
    op.create_table(
        "embeddings",
        sa.Column("chunk_id", postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column("provider", sa.String(length=50), nullable=False),
        sa.Column("model", sa.String(length=100), nullable=False),
        sa.Column("vector", Vector(dim=384), nullable=False),
        sa.Column("id", postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.text("now()")),
        sa.Column("updated_at", sa.DateTime(timezone=True), server_default=sa.text("now()")),
        sa.ForeignKeyConstraint(["chunk_id"], ["resume_chunks.id"]),
        sa.PrimaryKeyConstraint("id"),
        sa.UniqueConstraint("chunk_id"),
    )
    op.create_index(
        "ix_embeddings_vector",
        "embeddings",
        ["vector"],
        postgresql_using="hnsw",
        postgresql_ops={"vector": "vector_cosine_ops"},
    )
    op.create_table(
        "analysis_results",
        sa.Column("resume_id", postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column("job_id", postgresql.UUID(as_uuid=True)),
        sa.Column("ats_score", sa.Float(), nullable=False),
        sa.Column("skill_match_score", sa.Float(), nullable=False),
        sa.Column("experience_match_score", sa.Float(), nullable=False),
        sa.Column("missing_skills", postgresql.JSONB(astext_type=sa.Text()), nullable=False),
        sa.Column("strengths", postgresql.JSONB(astext_type=sa.Text()), nullable=False),
        sa.Column("weaknesses", postgresql.JSONB(astext_type=sa.Text()), nullable=False),
        sa.Column("recommendations", postgresql.JSONB(astext_type=sa.Text()), nullable=False),
        sa.Column("roadmap", postgresql.JSONB(astext_type=sa.Text()), nullable=False),
        sa.Column("certifications", postgresql.JSONB(astext_type=sa.Text()), nullable=False),
        sa.Column("portfolio_projects", postgresql.JSONB(astext_type=sa.Text()), nullable=False),
        sa.Column("id", postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.text("now()")),
        sa.Column("updated_at", sa.DateTime(timezone=True), server_default=sa.text("now()")),
        sa.ForeignKeyConstraint(["job_id"], ["jobs.id"]),
        sa.ForeignKeyConstraint(["resume_id"], ["resumes.id"]),
        sa.PrimaryKeyConstraint("id"),
    )


def downgrade() -> None:
    op.drop_table("analysis_results")
    op.drop_index("ix_embeddings_vector", table_name="embeddings")
    op.drop_table("embeddings")
    op.drop_table("resume_chunks")
    op.drop_table("jobs")
    op.drop_index("ix_resumes_search_vector", table_name="resumes")
    op.drop_table("resumes")
    op.drop_index("ix_users_email", table_name="users")
    op.drop_table("users")
    op.execute("DROP TYPE IF EXISTS userrole")
