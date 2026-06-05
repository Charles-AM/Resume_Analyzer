from uuid import uuid4

from app.models.domain import Resume
from app.services.analysis import AnalysisEngine


def _resume(
    text: str,
    skills: list[str],
    experience: list[dict] | None = None,
    projects: list[dict] | None = None,
) -> Resume:
    return Resume(
        owner_id=uuid4(),
        filename="resume.txt",
        storage_path="/tmp/resume.txt",
        raw_text=text,
        candidate_name="Test Candidate",
        email="test@example.com",
        skills=skills,
        education=[],
        experience=experience or [],
        certifications=[],
        projects=projects or [],
    )


def test_analysis_scores_change_with_resume_evidence() -> None:
    job = """
    Senior platform engineer with 5+ years of experience building Python, FastAPI,
    AWS, Kubernetes, Terraform, PostgreSQL, and Redis systems in production.
    """
    weak = _resume(
        "Customer support specialist. Helped users and wrote documentation.",
        ["Python"],
    )
    strong = _resume(
        """
        Senior platform engineer with 6 years of experience. Led and owned production
        Python FastAPI services on AWS with Kubernetes, Terraform, PostgreSQL, and Redis.
        Built deployment automation and improved reliability for users.
        Experience
        Project: production platform migration
        Education: BS Computer Science
        """,
        ["Python", "Fastapi", "AWS", "Kubernetes", "Terraform", "Postgresql", "Redis"],
        experience=[{"summary": "Senior platform engineer for 6 years"}],
        projects=[{"summary": "Production platform migration"}],
    )

    engine = AnalysisEngine()
    weak_result = engine.analyze(weak, job)
    strong_result = engine.analyze(strong, job)

    assert strong_result["ats_score"] > weak_result["ats_score"]
    assert strong_result["skill_match_score"] > weak_result["skill_match_score"]
    assert strong_result["experience_match_score"] > weak_result["experience_match_score"]
    assert strong_result["roadmap"]
    assert weak_result["portfolio_projects"]
    assert any("missing terms" in item for item in weak_result["recommendations"])


def test_analysis_flags_missing_internship_experience() -> None:
    job = """
    Software engineering internship for a student with Python, React, APIs,
    and practical internship or co-op experience.
    """
    resume = _resume(
        """
        Computer science student. Built a Python command line project and a React page.
        Education: BS Computer Science.
        """,
        ["Python", "React"],
        projects=[{"summary": "Python command line project"}],
    )

    result = AnalysisEngine().analyze(resume, job)

    assert any("internship" in item.lower() for item in result["weaknesses"])
    assert any("internship" in item.lower() for item in result["recommendations"])
    assert any("experience" in item["focus"].lower() for item in result["roadmap"])
