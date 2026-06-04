from pydantic import BaseModel


class AnalysisRequest(BaseModel):
    resume_id: str
    job_id: str | None = None
    job_description: str | None = None


class AnalysisRead(BaseModel):
    id: str
    ats_score: float
    skill_match_score: float
    experience_match_score: float
    missing_skills: list[str]
    strengths: list[str]
    weaknesses: list[str]
    recommendations: list[str]
    roadmap: list[dict]
    certifications: list[str]
    portfolio_projects: list[str]

    model_config = {"from_attributes": True}


class ChatRequest(BaseModel):
    resume_id: str
    question: str
    top_k: int = 5


class ChatResponse(BaseModel):
    answer: str
    sources: list[dict]


class SearchRequest(BaseModel):
    query: str
    top_k: int = 10


class SearchHit(BaseModel):
    resume_id: str
    candidate_name: str | None
    filename: str
    score: float
    snippet: str
