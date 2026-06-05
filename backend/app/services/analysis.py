import re

from app.models.domain import Resume
from app.schemas.analysis import ChatResponse
from app.services.etl import ResumeParser
from app.services.rag import RetrievedChunk

STOPWORDS = {
    "about",
    "after",
    "also",
    "and",
    "are",
    "but",
    "for",
    "from",
    "have",
    "into",
    "our",
    "that",
    "the",
    "their",
    "this",
    "with",
    "will",
    "work",
    "you",
    "your",
}


class AnalysisEngine:
    def __init__(self) -> None:
        self.parser = ResumeParser()

    def analyze(self, resume: Resume, job_description: str | None) -> dict:
        job_text = job_description or ""
        resume_text = resume.raw_text or ""
        job_skills_by_key = {
            self._skill_key(skill.name): skill.name
            for skill in self.parser.extract_skills(job_text)
        }
        resume_skills_by_key = {self._skill_key(skill): skill for skill in resume.skills or []}
        job_skills = set(job_skills_by_key)
        resume_skills = set(resume_skills_by_key)
        matched = resume_skills & job_skills
        missing = [job_skills_by_key[key] for key in sorted(job_skills - resume_skills)]
        skill_score = self._skill_score(job_text, resume_text, matched, job_skills)
        experience_score = self._experience_score(resume, job_text, resume_text, skill_score)
        ats_format_score = self._ats_format_score(resume)
        ats_score = round(skill_score * 0.45 + experience_score * 0.35 + ats_format_score * 0.20, 2)
        roadmap = self._roadmap(missing)
        return {
            "ats_score": ats_score,
            "skill_match_score": skill_score,
            "experience_match_score": round(experience_score, 2),
            "missing_skills": missing,
            "strengths": self._strengths(resume, {resume_skills_by_key[key] for key in matched}),
            "weaknesses": self._weaknesses(resume, missing),
            "recommendations": self._recommendations(
                resume,
                missing,
                skill_score,
                experience_score,
                ats_format_score,
            ),
            "roadmap": roadmap,
            "certifications": self._certifications(missing),
            "portfolio_projects": self._portfolio_projects(missing),
        }

    def answer(self, question: str, chunks: list[RetrievedChunk]) -> ChatResponse:
        context = " ".join(chunk.text for chunk in chunks)
        if "missing" in question.lower() or "poor fit" in question.lower():
            answer = (
                "The biggest gaps are the skills and experience signals absent from the "
                "retrieved resume context. Prioritize adding concrete projects, measurable "
                "outcomes, and keywords that match the role."
            )
        elif "ats" in question.lower():
            answer = (
                "Improve ATS compatibility by using standard headings, role-matched skills, "
                "measurable impact bullets, and consistent dates/titles."
            )
        else:
            answer = (
                "Based on the retrieved resume context, strengthen the resume with clearer "
                "evidence, quantified outcomes, and job-specific terminology."
            )
        if context:
            answer += f" Retrieved evidence focused on: {context[:280]}"
        return ChatResponse(
            answer=answer,
            sources=[
                {
                    "resume_id": str(chunk.resume_id),
                    "chunk_id": str(chunk.chunk_id),
                    "score": chunk.score,
                }
                for chunk in chunks
            ],
        )

    def _skill_key(self, skill: str) -> str:
        return skill.lower().replace(".", "").replace(" ", "")

    def _keyword_set(self, text: str) -> set[str]:
        return {
            token
            for token in re.findall(r"[a-zA-Z][a-zA-Z.+#-]{2,}", text.lower())
            if token not in STOPWORDS and len(token) > 3
        }

    def _skill_score(
        self,
        job_text: str,
        resume_text: str,
        matched_skills: set[str],
        job_skills: set[str],
    ) -> float:
        if job_skills:
            return round(len(matched_skills) / len(job_skills) * 100, 2)
        job_keywords = self._keyword_set(job_text)
        if not job_keywords:
            return 0.0
        resume_keywords = self._keyword_set(resume_text)
        return round(len(job_keywords & resume_keywords) / len(job_keywords) * 100, 2)

    def _experience_score(
        self,
        resume: Resume,
        job_text: str,
        resume_text: str,
        skill_score: float,
    ) -> float:
        required_years = self._max_years(job_text)
        resume_years = self._max_years(resume_text)
        if required_years:
            years_component = min(1.0, resume_years / required_years) if resume_years else 0.0
        else:
            years_component = 0.55 if resume.experience else 0.25

        evidence_terms = {
            "built",
            "deployed",
            "led",
            "managed",
            "owned",
            "launched",
            "improved",
            "scaled",
            "production",
            "users",
        }
        evidence_hits = sum(1 for term in evidence_terms if term in resume_text.lower())
        evidence_component = min(
            1.0,
            len(resume.experience or []) * 0.18
            + len(resume.projects or []) * 0.14
            + evidence_hits * 0.055
            + min(len(resume_text), 3500) / 3500 * 0.25,
        )

        seniority_component = self._seniority_readiness(job_text, resume_text)
        relevance_component = skill_score / 100
        score = (
            years_component * 0.35
            + evidence_component * 0.30
            + seniority_component * 0.15
            + relevance_component * 0.20
        )
        return round(min(100.0, score * 100), 2)

    def _max_years(self, text: str) -> int:
        matches = re.findall(r"(\d{1,2})\+?\s*(?:years|yrs)", text.lower())
        return max((int(match) for match in matches), default=0)

    def _seniority_readiness(self, job_text: str, resume_text: str) -> float:
        job_lower = job_text.lower()
        resume_lower = resume_text.lower()
        senior_terms = {"senior", "lead", "staff", "principal", "architect", "manager"}
        if not any(term in job_lower for term in senior_terms):
            return 0.75
        resume_hits = sum(1 for term in senior_terms if term in resume_lower)
        leadership_hits = sum(
            1
            for term in {"led", "owned", "mentored", "managed", "architected"}
            if term in resume_lower
        )
        return min(1.0, resume_hits * 0.35 + leadership_hits * 0.2)

    def _ats_format_score(self, resume: Resume) -> float:
        score = 0.0
        text = resume.raw_text or ""
        lower = text.lower()
        if resume.email:
            score += 15
        if resume.candidate_name:
            score += 10
        if len(resume.skills or []) >= 4:
            score += 20
        elif resume.skills:
            score += 10
        if any(section in lower for section in ("experience", "work", "employment")):
            score += 15
        if any(section in lower for section in ("education", "degree", "university")):
            score += 10
        if resume.projects:
            score += 10
        if 900 <= len(text) <= 4500:
            score += 20
        elif len(text) > 450:
            score += 10
        return min(100.0, score)

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

    def _recommendations(
        self,
        resume: Resume,
        missing: list[str],
        skill_score: float,
        experience_score: float,
        ats_format_score: float,
    ) -> list[str]:
        recommendations = [
            "Tailor the resume to the exact job description before applying.",
            (
                "Rewrite bullets to include action, technical scope, measurable result, "
                "and business impact."
            ),
        ]
        if missing:
            recommendations.append(
                "Add a visible skills section with the highest-priority missing terms: "
                + ", ".join(missing[:5])
                + "."
            )
        if skill_score < 70:
            recommendations.append(
                "Mirror important job keywords in real experience bullets, "
                "not only in a skills list."
            )
        if experience_score < 70:
            recommendations.append(
                "Add 2-3 bullets that prove ownership, production usage, scale, users, "
                "revenue, latency, cost, or reliability impact."
            )
        if ats_format_score < 75:
            recommendations.append(
                "Use standard headings such as Skills, Experience, Projects, Education, "
                "and Certifications so ATS parsers can read the resume."
            )
        if len(resume.raw_text or "") < 1200:
            recommendations.append(
                "Expand thin sections with concise project context, tools used, and outcomes."
            )
        return recommendations

    def _roadmap(self, missing: list[str]) -> list[dict]:
        if not missing:
            return [
                {
                    "step": 1,
                    "focus": "Proof",
                    "action": "Add stronger metrics to your best matching experience bullets.",
                },
                {
                    "step": 2,
                    "focus": "Targeting",
                    "action": "Align your summary and skills section with the role requirements.",
                },
                {
                    "step": 3,
                    "focus": "Polish",
                    "action": (
                        "Check formatting, dates, headings, and repeated keywords before applying."
                    ),
                },
            ]
        return [
            {
                "step": index + 1,
                "focus": skill,
                "action": f"Build or document one concrete resume bullet that proves {skill}.",
            }
            for index, skill in enumerate(missing[:5])
        ]

    def _certifications(self, missing: list[str]) -> list[str]:
        certification_map = {
            "AWS": "AWS Certified Cloud Practitioner or Solutions Architect Associate",
            "Azure": "Microsoft Azure Fundamentals or Azure Administrator Associate",
            "GCP": "Google Cloud Digital Leader or Associate Cloud Engineer",
            "Kubernetes": "Certified Kubernetes Application Developer",
            "Terraform": "HashiCorp Terraform Associate",
            "Postgresql": (
                "PostgreSQL training focused on indexing, query planning, and performance"
            ),
            "Redis": "Redis University RU101 or caching architecture coursework",
        }
        return [
            certification_map.get(skill, f"{skill} course, lab, or specialization")
            for skill in missing[:3]
        ]

    def _portfolio_projects(self, missing: list[str]) -> list[str]:
        if not missing:
            return [
                (
                    "Write a short case study for your strongest role-matching project "
                    "with metrics and architecture notes."
                )
            ]
        return [
            (
                f"Create a production-style {skill} project and add deployment notes, "
                "screenshots, and measurable outcomes."
            )
            for skill in missing[:3]
        ]
