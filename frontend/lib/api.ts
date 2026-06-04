const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api/v1";

export type Analysis = {
  ats_score: number;
  skill_match_score: number;
  experience_match_score: number;
  missing_skills: string[];
  strengths: string[];
  weaknesses: string[];
  recommendations: string[];
  roadmap: { step: number; focus: string; action: string }[];
  certifications: string[];
  portfolio_projects: string[];
};

export async function api<T>(path: string, options: RequestInit = {}, token?: string): Promise<T> {
  const response = await fetch(`${API_URL}${path}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...options.headers
    }
  });
  if (!response.ok) {
    throw new Error(await response.text());
  }
  return response.json() as Promise<T>;
}

export async function uploadResume(file: File, token: string) {
  const form = new FormData();
  form.append("file", file);
  const response = await fetch(`${API_URL}/upload/resume`, {
    method: "POST",
    headers: { Authorization: `Bearer ${token}` },
    body: form
  });
  if (!response.ok) {
    throw new Error(await response.text());
  }
  return response.json();
}
