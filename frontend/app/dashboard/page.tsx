"use client";

import { useEffect, useMemo, useState } from "react";
import { BarChart, Bar, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { BriefcaseBusiness, BrainCircuit, CheckCircle2, FileText, Loader2, LogIn, MessageSquare, Radar, Search, SlidersHorizontal, Target, UploadCloud, WandSparkles, Zap } from "lucide-react";
import { Button, Input, Panel, Stat, Textarea } from "@/components/ui";
import { Analysis, analyzeResume, createJob, login, register, Resume, uploadResume } from "@/lib/api";

const scores = [
  { name: "Jan", ats: 58 },
  { name: "Feb", ats: 66 },
  { name: "Mar", ats: 74 },
  { name: "Apr", ats: 81 }
];

export default function Dashboard() {
  const [fileName, setFileName] = useState("senior-data-engineer.pdf");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [query, setQuery] = useState("Find resumes with Python, AWS, and RAG projects");
  const [mode, setMode] = useState("Fit");
  const [token, setToken] = useState("");
  const [authMode, setAuthMode] = useState<"login" | "register">("register");
  const [email, setEmail] = useState("demo@example.com");
  const [password, setPassword] = useState("DemoPassword123!");
  const [fullName, setFullName] = useState("Demo User");
  const [resume, setResume] = useState<Resume | null>(null);
  const [analysis, setAnalysis] = useState<Analysis | null>(null);
  const [status, setStatus] = useState("Create an account or sign in to run a real match analysis.");
  const [isBusy, setIsBusy] = useState(false);
  const [jobTitle, setJobTitle] = useState("Senior AI Platform Engineer");
  const [company, setCompany] = useState("Nova Systems");
  const [jobDescription, setJobDescription] = useState(
    "We need a senior engineer with Python, FastAPI, AWS, Kubernetes, Terraform, PostgreSQL, Redis, observability, and production RAG experience. The role owns resume intelligence pipelines, vector search, API reliability, and cloud deployment."
  );
  const gaps = analysis?.missing_skills?.length ? analysis.missing_skills : ["Kubernetes", "Terraform", "OpenTelemetry", "Qdrant"];
  const pipeline = ["Extract", "Normalize", "Chunk", "Embed", "Retrieve", "Analyze"];
  const jobKeywords = useMemo(
    () =>
      ["Python", "FastAPI", "AWS", "Kubernetes", "Terraform", "PostgreSQL", "Redis", "RAG", "Observability", "Vector search"].filter((keyword) =>
        jobDescription.toLowerCase().includes(keyword.toLowerCase())
      ),
    [jobDescription]
  );
  const matchScore = analysis?.ats_score ? Math.round(analysis.ats_score) : Math.min(96, 58 + jobKeywords.length * 4);
  const skillScore = analysis?.skill_match_score ? `${Math.round(analysis.skill_match_score)}%` : "74%";
  const experienceScore = analysis?.experience_match_score ? `${Math.round(analysis.experience_match_score)}%` : "820ms";
  const recommendations = analysis?.recommendations?.length
    ? analysis.recommendations
    : [
        "Add a Kubernetes deployment project with measurable reliability outcomes.",
        "Include Terraform modules for cloud infrastructure provisioning.",
        "Document tracing, metrics, and alerting work in recent roles."
      ];

  useEffect(() => {
    const savedToken = window.localStorage.getItem("resume_analyzer_token");
    if (savedToken) {
      setToken(savedToken);
      setStatus("Signed in. Upload a resume and paste a job description to analyze fit.");
    }
  }, []);

  async function handleAuth() {
    setIsBusy(true);
    setStatus(authMode === "register" ? "Creating account..." : "Signing in...");
    try {
      if (authMode === "register") {
        await register(email, password, fullName);
      }
      const session = await login(email, password);
      window.localStorage.setItem("resume_analyzer_token", session.access_token);
      setToken(session.access_token);
      setStatus("Signed in. Upload a resume and paste a job description to analyze fit.");
    } catch (error) {
      setStatus(error instanceof Error ? error.message : "Authentication failed.");
    } finally {
      setIsBusy(false);
    }
  }

  async function handleUpload(file: File) {
    setSelectedFile(file);
    setFileName(file.name);
    if (!token) {
      setStatus("Resume selected. Sign in before uploading it.");
      return;
    }
    setIsBusy(true);
    setStatus("Uploading and parsing resume...");
    try {
      const uploaded = await uploadResume(file, token);
      setResume(uploaded);
      setStatus(`Resume uploaded: ${uploaded.filename}. Paste a job description and analyze.`);
    } catch (error) {
      setStatus(error instanceof Error ? error.message : "Resume upload failed.");
    } finally {
      setIsBusy(false);
    }
  }

  async function handleAnalyze() {
    if (!token) {
      setStatus("Sign in before running analysis.");
      return;
    }
    if (!resume) {
      setStatus("Upload a resume before running analysis.");
      return;
    }
    setIsBusy(true);
    setStatus("Creating job and analyzing match...");
    try {
      const job = await createJob({ title: jobTitle, company, description: jobDescription }, token);
      const result = await analyzeResume({ resume_id: resume.id, job_id: job.id }, token);
      setAnalysis(result);
      setStatus("Analysis complete. Review your scores, gaps, and recommendations.");
    } catch (error) {
      setStatus(error instanceof Error ? error.message : "Analysis failed.");
    } finally {
      setIsBusy(false);
    }
  }

  return (
    <main className="app-shell">
      <header className="border-b border-line bg-void/55 backdrop-blur-xl">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
          <div>
            <div className="flex items-center gap-3">
              <span className="grid h-10 w-10 place-items-center rounded-md border border-signal/35 bg-signal/10 text-signal">
                <BrainCircuit className="h-5 w-5" />
              </span>
              <div>
                <h1 className="text-2xl font-black">Am i a good match?</h1>
                <p className="text-sm text-ink/60">ETL, embeddings, RAG analysis, and search in one workflow.</p>
              </div>
            </div>
          </div>
          <div className="hidden rounded-md border border-line bg-white/5 p-1 sm:flex">
            {["Fit", "Search", "Trends"].map((item) => (
              <button
                className={`h-9 rounded px-4 text-sm font-bold transition ${mode === item ? "bg-signal text-void" : "text-ink/65 hover:text-ink"}`}
                key={item}
                onClick={() => setMode(item)}
              >
                {item}
              </button>
            ))}
          </div>
          <Button><Zap className="h-4 w-4" />New Analysis</Button>
        </div>
      </header>
      <div className="data-ribbon" />
      <div className="mx-auto grid max-w-7xl gap-5 px-6 py-6 lg:grid-cols-[310px_1fr]">
        <aside className="space-y-4">
          <Panel>
            <div className="mb-4 flex items-center justify-between">
              <div className="flex items-center gap-2 font-semibold"><LogIn className="h-4 w-4 text-signal" />Account</div>
              <span className={`rounded-full px-2 py-1 text-xs font-bold ${token ? "bg-mint/15 text-mint" : "bg-gold/15 text-gold"}`}>
                {token ? "Signed in" : "Required"}
              </span>
            </div>
            {!token ? (
              <div className="space-y-3">
                <div className="grid grid-cols-2 gap-2 rounded-md border border-line bg-white/5 p-1">
                  {(["register", "login"] as const).map((item) => (
                    <button
                      className={`h-9 rounded text-sm font-bold ${authMode === item ? "bg-signal text-void" : "text-ink/60"}`}
                      key={item}
                      onClick={() => setAuthMode(item)}
                    >
                      {item === "register" ? "Register" : "Login"}
                    </button>
                  ))}
                </div>
                {authMode === "register" && <Input aria-label="Full name" value={fullName} onChange={(event) => setFullName(event.target.value)} />}
                <Input aria-label="Email" value={email} onChange={(event) => setEmail(event.target.value)} />
                <Input aria-label="Password" type="password" value={password} onChange={(event) => setPassword(event.target.value)} />
                <Button className="w-full" disabled={isBusy} onClick={handleAuth}>
                  {isBusy && <Loader2 className="h-4 w-4 animate-spin" />}
                  Continue
                </Button>
              </div>
            ) : (
              <div className="space-y-3 text-sm text-ink/70">
                <div className="rounded-md border border-line bg-white/5 p-3">{email}</div>
                <button
                  className="text-sm font-bold text-signal"
                  onClick={() => {
                    window.localStorage.removeItem("resume_analyzer_token");
                    setToken("");
                    setResume(null);
                    setAnalysis(null);
                    setStatus("Signed out.");
                  }}
                >
                  Sign out
                </button>
              </div>
            )}
          </Panel>
          <Panel>
            <div className="mb-3 flex items-center justify-between">
              <div className="flex items-center gap-2 font-semibold"><UploadCloud className="h-4 w-4 text-signal" />Upload</div>
              <span className="rounded-full bg-mint/15 px-2 py-1 text-xs font-bold text-mint">{resume ? "Uploaded" : "Ready"}</span>
            </div>
            <label className="group flex h-44 cursor-pointer flex-col items-center justify-center rounded-md border border-dashed border-signal/35 bg-signal/[0.06] text-center text-sm transition hover:bg-signal/[0.11]">
              <UploadCloud className="mb-3 h-8 w-8 text-signal transition group-hover:-translate-y-1" />
              <span className="font-bold">Drop PDF or DOCX</span>
              <span className="mt-1 text-xs text-ink/45">Encrypted ingest lane</span>
              <input
                className="hidden"
                type="file"
                accept=".pdf,.docx,.txt,.md"
                onChange={(event) => {
                  const file = event.target.files?.[0];
                  if (file) {
                    void handleUpload(file);
                  }
                }}
              />
            </label>
            <p className="mt-3 flex items-center gap-2 truncate text-sm font-medium"><FileText className="h-4 w-4 text-gold" />{fileName}</p>
            {selectedFile && !resume && <p className="mt-2 text-xs text-ink/45">{selectedFile.name} is selected but not uploaded yet.</p>}
          </Panel>
          <Panel>
            <div className="mb-3 flex items-center gap-2 font-semibold"><Search className="h-4 w-4 text-signal" />Search</div>
            <Input value={query} onChange={(event) => setQuery(event.target.value)} />
            <Button className="mt-3 w-full"><Radar className="h-4 w-4" />Run Search</Button>
          </Panel>
          <Panel>
            <div className="mb-4 flex items-center gap-2 font-semibold"><SlidersHorizontal className="h-4 w-4 text-signal" />Pipeline</div>
            <div className="space-y-3">
              {pipeline.map((step, index) => (
                <div className="flex items-center gap-3" key={step}>
                  <span className="pulse-node grid h-7 w-7 place-items-center rounded-full border border-signal/35 bg-signal/10 text-xs font-bold text-signal" style={{ animationDelay: `${index * 120}ms` }}>
                    {index + 1}
                  </span>
                  <div className="flex-1">
                    <div className="text-sm font-semibold">{step}</div>
                    <div className="mt-1 h-1 rounded-full bg-white/10">
                      <div className="h-full rounded-full bg-gradient-to-r from-signal to-mint" style={{ width: `${92 - index * 9}%` }} />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </Panel>
        </aside>
        <section className="space-y-5">
          <div className="grid gap-4 sm:grid-cols-4">
            <Stat label="ATS Score" value={matchScore} />
            <Stat label="Skill Match" value={skillScore} />
            <Stat label="Analyses" value="24" />
            <Stat label="Experience" value={experienceScore} />
          </div>
          <div className="rounded-md border border-line bg-white/[0.075] p-4 text-sm text-ink/75 backdrop-blur-xl">{status}</div>
          <Panel>
            <div className="grid gap-5 xl:grid-cols-[1fr_360px]">
              <div>
                <div className="mb-4 flex items-center justify-between gap-3">
                  <div>
                    <div className="flex items-center gap-2 text-sm font-bold uppercase text-signal">
                      <BriefcaseBusiness className="h-4 w-4" />
                      Job Match Lab
                    </div>
                    <h2 className="mt-2 text-2xl font-black">Paste a job description and analyze fit</h2>
                  </div>
                  <span className="hidden rounded-full border border-gold/30 bg-gold/10 px-3 py-1 text-xs font-bold text-gold sm:inline-flex">
                    Resume linked
                  </span>
                </div>
                <div className="grid gap-3 sm:grid-cols-2">
                  <Input aria-label="Job title" value={jobTitle} onChange={(event) => setJobTitle(event.target.value)} />
                  <Input aria-label="Company" value={company} onChange={(event) => setCompany(event.target.value)} />
                </div>
                <div className="mt-3">
                  <Textarea
                    aria-label="Job description"
                    value={jobDescription}
                    onChange={(event) => setJobDescription(event.target.value)}
                    placeholder="Paste the job description here..."
                  />
                </div>
                <div className="mt-4 flex flex-wrap items-center gap-3">
                  <Button disabled={isBusy} onClick={handleAnalyze}>
                    {isBusy ? <Loader2 className="h-4 w-4 animate-spin" /> : <WandSparkles className="h-4 w-4" />}
                    Analyze Match
                  </Button>
                  <span className="text-sm text-ink/55">Compares resume chunks against role requirements.</span>
                </div>
              </div>
              <div className="rounded-md border border-line bg-void/45 p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-sm font-bold text-signal">Match preview</div>
                    <div className="mt-1 text-sm text-ink/55">{company} · {jobTitle}</div>
                  </div>
                  <div className="grid h-20 w-20 place-items-center rounded-full border border-signal/35 bg-signal/10 text-2xl font-black text-signal">
                    {matchScore}
                  </div>
                </div>
                <div className="mt-5 h-2 rounded-full bg-white/10">
                  <div className="h-full rounded-full bg-gradient-to-r from-accent via-gold to-mint" style={{ width: `${matchScore}%` }} />
                </div>
                <div className="mt-5">
                  <div className="mb-2 flex items-center gap-2 text-sm font-bold"><Target className="h-4 w-4 text-mint" />Detected role signals</div>
                  <div className="flex flex-wrap gap-2">
                    {jobKeywords.map((keyword) => (
                      <span className="rounded-md border border-line bg-white/8 px-2.5 py-1.5 text-xs font-bold text-mint" key={keyword}>
                        {keyword}
                      </span>
                    ))}
                  </div>
                </div>
                <div className="mt-5 space-y-2 text-sm text-ink/70">
                  {(analysis?.strengths?.length ? analysis.strengths : ["Strong overlap in backend, data, and RAG systems."]).slice(0, 2).map((item) => (
                    <div className="rounded-md border border-line bg-white/5 p-3" key={item}>{item}</div>
                  ))}
                  {(analysis?.weaknesses?.length ? analysis.weaknesses : ["Improve proof around Kubernetes, Terraform, and observability."]).slice(0, 2).map((item) => (
                    <div className="rounded-md border border-line bg-white/5 p-3" key={item}>{item}</div>
                  ))}
                </div>
              </div>
            </div>
          </Panel>
          <div className="grid gap-5 lg:grid-cols-[1fr_360px]">
            <Panel>
              <div className="mb-4 flex items-center justify-between">
                <h2 className="text-lg font-bold">ATS Score Trend</h2>
                <span className="rounded-full border border-mint/30 bg-mint/10 px-3 py-1 text-xs font-bold text-mint">+23 pts</span>
              </div>
              <div className="h-72">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={scores}>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.12)" />
                    <XAxis dataKey="name" stroke="rgba(239,247,246,0.55)" />
                    <YAxis stroke="rgba(239,247,246,0.55)" />
                    <Tooltip />
                    <Bar dataKey="ats" fill="#7ce3ff" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </Panel>
            <Panel>
              <h2 className="text-lg font-bold">Skill Gaps</h2>
              <div className="mt-4 flex flex-wrap gap-2">
                {gaps.map((gap) => <span className="rounded-md border border-line bg-white/8 px-3 py-2 text-sm font-medium text-signal" key={gap}>{gap}</span>)}
              </div>
              <h3 className="mt-6 font-semibold">Recommendations</h3>
              <div className="mt-3 space-y-2 text-sm text-ink/72">
                {recommendations.map((item) => (
                  <div className="flex gap-2 rounded-md border border-line bg-white/5 p-3" key={item}>
                    <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-mint" />
                    <span>{item}</span>
                  </div>
                ))}
              </div>
            </Panel>
          </div>
          <Panel>
            <div className="mb-3 flex items-center gap-2 font-semibold"><MessageSquare className="h-4 w-4 text-signal" />RAG Chat</div>
            <div className="rounded-md border border-line bg-white/5 p-4 text-sm text-ink/75">Why am I a poor fit?</div>
            <div className="mt-3 rounded-md border border-signal/25 bg-signal/10 p-4 text-sm leading-6 text-ink/80">
              The resume under-represents platform operations. Add projects that prove Kubernetes, Terraform, and observability experience.
            </div>
          </Panel>
        </section>
      </div>
    </main>
  );
}
