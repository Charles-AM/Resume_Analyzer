from app.models.domain import Resume
from app.schemas.analysis import ChatResponse
from app.services.etl import ResumeParser
from app.services.rag import RetrievedChunk


class AnalysisEngine:
    def __init__(self) -> None:
        self.parser = ResumeParser()

    def analyze(self, resume: Resume, job_description: str | None) -> dict:
        job_skills = {skill.name for skill in self.parser.extract_skills(job_description or "")}
        resume_skills = set(resume.skills or [])
        matched = resume_skills & job_skills
        missing = sorted(job_skills - resume_skills)
        skill_score = 100.0 if not job_skills else round(len(matched) / len(job_skills) * 100, 2)
        experience_score = min(100.0, 55.0 + len(resume.experience or []) * 10 + len(resume.projects or []) * 5)
        ats_score = round(skill_score * 0.5 + experience_score * 0.3 + min(100, len(resume.raw_text) / 20) * 0.2, 2)
        return {
            "ats_score": ats_score,
            "skill_match_score": skill_score,
            "experience_match_score": round(experience_score, 2),
            "missing_skills": missing,
            "strengths": self._strengths(resume, matched),
            "weaknesses": self._weaknesses(resume, missing),
            "recommendations": self._recommendations(missing),
            "roadmap": [{"step": index + 1, "focus": skill, "action": f"Build and document a {skill} project"} for index, skill in enumerate(missing[:5])],
            "certifications": [f"{skill} certification or specialization" for skill in missing[:3]],
            "portfolio_projects": [f"Production-style {skill} case study" for skill in missing[:3]],
        }

    def answer(self, question: str, chunks: list[RetrievedChunk]) -> ChatResponse:
        context = " ".join(chunk.text for chunk in chunks)
        if "missing" in question.lower() or "poor fit" in question.lower():
            answer = "The biggest gaps are the skills and experience signals absent from the retrieved resume context. Prioritize adding concrete projects, measurable outcomes, and keywords that match the role."
        elif "ats" in question.lower():
            answer = "Improve ATS compatibility by using standard headings, role-matched skills, measurable impact bullets, and consistent dates/titles."
        else:
            answer = "Based on the retrieved resume context, strengthen the resume with clearer evidence, quantified outcomes, and job-specific terminology."
        if context:
            answer += f" Retrieved evidence focused on: {context[:280]}"
        return ChatResponse(
            answer=answer,
            sources=[{"resume_id": str(chunk.resume_id), "chunk_id": str(chunk.chunk_id), "score": chunk.score} for chunk in chunks],
        )

    def _strengths(self, resume: Resume, matched: set[str]) -> list[str]:
        strengths = [f"Strong match for {skill}" for skill in sorted(matched)[:5]]
        if resume.projects:
            strengths.append("Project work is present and can support portfolio storytelling")
        return strengths or ["Resume contains parseable structured content"]

    def _weaknesses(self, resume: Resume, missing: list[str]) -> list[str]:
        weaknesses = [f"Missing visible evidence for {skill}" for skill in missing[:5]]
        if len(resume.raw_text) < 1200:
            weaknesses.append("Resume may be too light on detail for senior screening")
        return weaknesses

    def _recommendations(self, missing: list[str]) -> list[str]:
        base = ["Quantify impact in bullets", "Mirror priority job-description terminology", "Add a concise technical skills section"]
        return base + [f"Add a project or accomplishment demonstrating {skill}" for skill in missing[:5]]
