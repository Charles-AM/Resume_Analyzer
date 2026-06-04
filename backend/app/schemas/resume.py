from pydantic import BaseModel


class ParsedResume(BaseModel):
    candidate_name: str | None = None
    email: str | None = None
    skills: list[str] = []
    education: list[dict] = []
    experience: list[dict] = []
    certifications: list[str] = []
    projects: list[dict] = []


class ResumeRead(ParsedResume):
    id: str
    filename: str
    raw_text: str

    model_config = {"from_attributes": True}


class JobCreate(BaseModel):
    title: str
    company: str | None = None
    description: str


class JobRead(JobCreate):
    id: str
    required_skills: list[str]

    model_config = {"from_attributes": True}
