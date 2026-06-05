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
        experience_gaps = self._experience_gaps(resume, job_text, resume_text)
        ats_format_score = self._ats_format_score(resume)
        ats_score = round(skill_score * 0.40 + experience_score * 0.35 + ats_format_score * 0.25, 2)
        roadmap = self._roadmap(missing, experience_gaps)
        return {
            "ats_score": ats_score,
            "skill_match_score": skill_score,
            "experience_match_score": round(experience_score, 2),
            "missing_skills": missing,
            "strengths": self._strengths(resume, {resume_skills_by_key[key] for key in matched}),
            "weaknesses": self._weaknesses(resume, missing, experience_gaps),
            "recommendations": self._recommendations(
                resume,
                missing,
                experience_gaps,
                skill_score,
                experience_score,
                ats_format_score,
            ),
            "roadmap": roadmap,
            "certifications": self._certifications(missing, experience_gaps),
            "portfolio_projects": self._portfolio_projects(missing, experience_gaps),
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
        keyword_coverage = self._keyword_coverage(job_text, resume_text)
        if job_skills:
            skill_coverage = len(matched_skills) / len(job_skills) * 100
            return round(skill_coverage * 0.75 + keyword_coverage * 0.25, 2)
        return round(keyword_coverage, 2)

    def _keyword_coverage(self, job_text: str, resume_text: str) -> float:
        job_keywords = self._keyword_set(job_text)
        if not job_keywords:
            return 0.0
        resume_keywords = self._keyword_set(resume_text)
        return len(job_keywords & resume_keywords) / len(job_keywords) * 100

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
            years_component = 0.65 if resume.experience else 0.25

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
        quantified_hits = self._quantified_bullets(resume_text)
        evidence_component = min(
            1.0,
            len(resume.experience or []) * 0.14
            + len(resume.projects or []) * 0.12
            + evidence_hits * 0.045
            + quantified_hits * 0.08
            + min(len(resume_text), 3500) / 3500 * 0.18,
        )

        section_component = self._section_presence(
            resume_text,
            ["experience", "projects", "education"],
        )
        seniority_component = self._seniority_readiness(job_text, resume_text)
        relevance_component = skill_score / 100
        score = (
            years_component * 0.25
            + evidence_component * 0.30
            + section_component * 0.15
            + seniority_component * 0.10
            + relevance_component * 0.20
        )
        return round(min(100.0, score * 100), 2)

    def _experience_gaps(self, resume: Resume, job_text: str, resume_text: str) -> list[str]:
        gaps = []
        job_lower = job_text.lower()
        resume_lower = resume_text.lower()
        required_years = self._max_years(job_text)
        resume_years = self._max_years(resume_text)

        if required_years and resume_years < required_years:
            gaps.append(
                f"Job asks for {required_years}+ years, but the resume shows "
                f"{resume_years or 'no clear'} years."
            )

        internship_terms = {"intern", "internship", "co-op", "placement"}
        job_wants_internship = any(term in job_lower for term in internship_terms)
        resume_has_internship = any(term in resume_lower for term in internship_terms)
        if job_wants_internship and not resume_has_internship:
            gaps.append(
                "Missing visible internship, co-op, placement, or workplace experience "
                "aligned with this role."
            )

        if ("entry level" in job_lower or "junior" in job_lower) and not resume.projects:
            gaps.append(
                "Entry-level role needs stronger project or practical experience evidence."
            )

        if not resume.experience and not resume.projects:
            gaps.append("Resume lacks clear Experience or Projects evidence for the role.")

        return gaps

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
        text = resume.raw_text or ""
        lower = text.lower()
        contact_score = 0.0
        if resume.email:
            contact_score += 0.6
        if resume.candidate_name:
            contact_score += 0.4

        sections = ["skills", "experience", "projects", "education"]
        section_score = self._section_presence(text, sections)

        skill_score = min(1.0, len(resume.skills or []) / 8)
        project_score = 1.0 if resume.projects else 0.0
        quantified_score = min(1.0, self._quantified_bullets(text) / 3)

        word_count = len(text.split())
        if 300 <= word_count <= 850:
            length_score = 1.0
        elif 180 <= word_count < 300 or 850 < word_count <= 1100:
            length_score = 0.7
        elif word_count:
            length_score = 0.35
        else:
            length_score = 0.0

        parse_score = 1.0 if len(text) > 900 else min(1.0, len(text) / 900)
        score = (
            contact_score * 10
            + section_score * 25
            + skill_score * 15
            + project_score * 10
            + quantified_score * 15
            + length_score * 15
            + parse_score * 10
        )
        if any(section in lower for section in ("objective", "summary", "profile")):
            score += 5
        return min(100.0, round(score, 2))

    def _section_presence(self, text: str, sections: list[str]) -> float:
        if not sections:
            return 0.0
        lower = text.lower()
        hits = sum(1 for section in sections if re.search(rf"\b{section}\b", lower))
        return hits / len(sections)

    def _quantified_bullets(self, text: str) -> int:
        measurement_terms = (
            r"%|\$|\b\d+[kx]?\b|\busers?\b|\brevenue\b|\blatency\b|\bcost\b|"
            r"\bperformance\b|\bretention\b|\buptime\b|\bthroughput\b"
        )
        lines = [line.strip() for line in text.splitlines() if line.strip()]
        return sum(1 for line in lines if re.search(measurement_terms, line.lower()))

    def _strengths(self, resume: Resume, matched: set[str]) -> list[str]:
        strengths = [f"Strong match for {skill}" for skill in sorted(matched)[:5]]
        if resume.projects:
            strengths.append("Project work is present and can support portfolio storytelling")
        if self._quantified_bullets(resume.raw_text or ""):
            strengths.append("Resume includes measurable outcomes that strengthen credibility")
        return strengths or ["Resume contains parseable structured content"]

    def _weaknesses(
        self,
        resume: Resume,
        missing: list[str],
        experience_gaps: list[str],
    ) -> list[str]:
        weaknesses = [f"Missing visible evidence for {skill}" for skill in missing[:5]]
        weaknesses.extend(experience_gaps[:3])
        if self._quantified_bullets(resume.raw_text or "") == 0:
            weaknesses.append(
                "Resume lacks quantified outcomes such as percentages, users, or impact"
            )
        if self._section_presence(resume.raw_text or "", ["skills", "experience", "education"]) < 1:
            weaknesses.append("Resume is missing one or more standard ATS sections")
        if len(resume.raw_text or "") < 1200:
            weaknesses.append("Resume may be too light on detail for senior screening")
        return weaknesses

    def _recommendations(
        self,
        resume: Resume,
        missing: list[str],
        experience_gaps: list[str],
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
        if experience_gaps:
            recommendations.append(
                "Add internship, co-op, freelance, volunteer, capstone, part-time, "
                "or project experience that directly proves the job requirements."
            )
            recommendations.append(
                "For each experience gap, add one bullet with the tool used, your action, "
                "and a measurable result or realistic outcome."
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
        if self._quantified_bullets(resume.raw_text or "") == 0:
            recommendations.append(
                "Add measurable evidence: percentages, number of users, time saved, cost reduced, "
                "latency improved, tickets resolved, or grades achieved."
            )
        if len(resume.raw_text or "") < 1200:
            recommendations.append(
                "Expand thin sections with concise project context, tools used, and outcomes."
            )
        return recommendations

    def _roadmap(self, missing: list[str], experience_gaps: list[str]) -> list[dict]:
        if not missing and not experience_gaps:
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
        roadmap = []
        for gap in experience_gaps[:2]:
            roadmap.append(
                {
                    "step": len(roadmap) + 1,
                    "focus": "Experience evidence",
                    "action": gap
                    + " Add a matching experience, internship, or job-like project bullet.",
                }
            )
        for skill in missing[:5]:
            roadmap.append(
                {
                    "step": len(roadmap) + 1,
                    "focus": skill,
                    "action": f"Build or document one concrete resume bullet that proves {skill}.",
                }
            )
        return roadmap

    def _certifications(self, missing: list[str], experience_gaps: list[str]) -> list[str]:
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
        ] or (
            ["Internship/job simulation course with a portfolio deliverable"]
            if experience_gaps
            else []
        )

    def _portfolio_projects(self, missing: list[str], experience_gaps: list[str]) -> list[str]:
        if not missing and not experience_gaps:
            return [
                (
                    "Write a short case study for your strongest role-matching project "
                    "with metrics and architecture notes."
                )
            ]
        projects = []
        if experience_gaps:
            projects.append(
                "Build a job-like project that mirrors the target role, then document "
                "requirements, tools, screenshots, and measurable outcomes."
            )
            projects.append(
                "Add a practical internship-style case study showing how you solved a "
                "business problem from start to finish."
            )
        projects.extend(
            (
                f"Create a production-style {skill} project and add deployment notes, "
                "screenshots, and measurable outcomes."
            )
            for skill in missing[:3]
        )
        return projects[:5]
