import re
from dataclasses import dataclass

from app.schemas.resume import ParsedResume

SKILL_TAXONOMY = {
    "ai": {"rag", "llm", "langchain", "openai", "transformers", "nlp", "machine learning"},
    "backend": {"python", "fastapi", "django", "sqlalchemy", "postgresql", "redis", "celery"},
    "cloud": {"aws", "gcp", "azure", "docker", "kubernetes", "terraform", "vercel", "railway"},
    "data": {"spark", "airflow", "dbt", "pandas", "etl", "qdrant", "pgvector"},
    "frontend": {"react", "next.js", "typescript", "tailwind", "shadcn"},
}


@dataclass(frozen=True)
class NormalizedSkill:
    name: str
    category: str


class ResumeParser:
    def parse(self, text: str) -> ParsedResume:
        lines = [line.strip() for line in text.splitlines() if line.strip()]
        email = self._first_email(text)
        skills = [skill.name for skill in self.extract_skills(text)]
        return ParsedResume(
            candidate_name=lines[0][:120] if lines else None,
            email=email,
            skills=skills,
            education=self._section_items(lines, {"education", "university", "degree"}),
            experience=self._section_items(lines, {"experience", "employment", "work"}),
            certifications=self._certifications(lines),
            projects=self._projects(lines),
        )

    def extract_skills(self, text: str) -> list[NormalizedSkill]:
        lower = text.lower()
        found: dict[str, NormalizedSkill] = {}
        for category, skills in SKILL_TAXONOMY.items():
            for skill in skills:
                if re.search(rf"\b{re.escape(skill)}\b", lower):
                    canonical = "Next.js" if skill == "next.js" else skill.upper() if len(skill) <= 3 else skill.title()
                    found[canonical.lower()] = NormalizedSkill(canonical, category)
        return sorted(found.values(), key=lambda item: (item.category, item.name))

    def _first_email(self, text: str) -> str | None:
        match = re.search(r"[\w.\-+]+@[\w.\-]+\.\w+", text)
        return match.group(0).lower() if match else None

    def _section_items(self, lines: list[str], keywords: set[str]) -> list[dict]:
        return [{"summary": line} for line in lines if any(keyword in line.lower() for keyword in keywords)]

    def _certifications(self, lines: list[str]) -> list[str]:
        return sorted({line for line in lines if "certif" in line.lower() or "aws " in line.lower()})

    def _projects(self, lines: list[str]) -> list[dict]:
        return [{"name": line[:120], "summary": line} for line in lines if "project" in line.lower()]
