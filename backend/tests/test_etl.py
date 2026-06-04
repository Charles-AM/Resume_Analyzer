from app.services.etl import ResumeParser


def test_parser_extracts_email_and_normalized_skills():
    text = """
    Ada Lovelace
    ada@example.com
    Built Python FastAPI ETL pipelines on AWS with Docker and Terraform.
    Project: RAG search using Qdrant and OpenAI.
    """
    parsed = ResumeParser().parse(text)
    assert parsed.email == "ada@example.com"
    assert "Python" in parsed.skills
    assert "Fastapi" in parsed.skills
    assert "QDRANT" in [skill.upper() for skill in parsed.skills]
    assert parsed.projects
