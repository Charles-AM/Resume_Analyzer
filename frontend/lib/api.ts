const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api/v1";

export type Analysis = {
  id: string;
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

export type Resume = {
  id: string;
  filename: string;
  candidate_name: string | null;
  email: string | null;
  skills: string[];
  raw_text: string;
};

export type Job = {
  id: string;
  title: string;
  company: string | null;
  description: string;
  required_skills: string[];
};

export type TokenResponse = {
  access_token: string;
  token_type: string;
};

export type UserRead = {
  id: string;
  email: string;
  full_name: string;
  role: string;
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
    const message = await response.text();
    let errorMessage = message || "Request failed.";
    try {
      const parsed = JSON.parse(message) as { detail?: unknown };
      if (typeof parsed.detail === "string") {
        errorMessage = parsed.detail;
      }
      if (Array.isArray(parsed.detail)) {
        errorMessage = parsed.detail
          .map((item) => {
            if (typeof item === "object" && item && "msg" in item) {
              return String(item.msg);
            }
            return "Invalid input";
          })
          .join(", ");
      }
    } catch {
      errorMessage = message || "Request failed.";
    }
    throw new Error(errorMessage);
  }
  return response.json() as Promise<T>;
}

export async function login(email: string, password: string) {
  return api<TokenResponse>("/auth/login", {
    method: "POST",
    body: JSON.stringify({ email, password })
  });
}

export async function demoLogin() {
  return api<TokenResponse>("/auth/demo-login", {
    method: "POST"
  });
}

export async function register(email: string, password: string, fullName: string) {
  return api<UserRead>("/auth/register", {
    method: "POST",
    body: JSON.stringify({ email, password, full_name: fullName })
  });
}

export async function getCurrentUser(token: string) {
  return api<UserRead>("/auth/me", {}, token);
}

export async function uploadResume(file: File, token: string): Promise<Resume> {
  const form = new FormData();
  form.append("file", file);
  const response = await fetch(`${API_URL}/upload/resume`, {
    method: "POST",
    headers: { Authorization: `Bearer ${token}` },
    body: form
  });
  if (!response.ok) {
    const message = await response.text();
    let errorMessage = message || "Resume upload failed.";
    try {
      const parsed = JSON.parse(message) as { detail?: unknown };
      if (typeof parsed.detail === "string") {
        errorMessage = parsed.detail;
      }
    } catch {
      errorMessage = message || "Resume upload failed.";
    }
    throw new Error(errorMessage);
  }
  return response.json();
}

export async function createJob(
  payload: { title: string; company?: string; description: string },
  token: string
) {
  return api<Job>("/upload/job", {
    method: "POST",
    body: JSON.stringify(payload)
  }, token);
}

export async function analyzeResume(
  payload: { resume_id: string; job_id?: string; job_description?: string },
  token: string
) {
  return api<Analysis>("/analyze", {
    method: "POST",
    body: JSON.stringify(payload)
  }, token);
}
