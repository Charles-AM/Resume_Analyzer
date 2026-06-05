"use client";

import { useEffect, useMemo, useState } from "react";
import { Award, BriefcaseBusiness, BrainCircuit, CheckCircle2, FileText, ListChecks, Loader2, LogIn, Target, UploadCloud, WandSparkles, Zap } from "lucide-react";
import { Button, Input, Panel, Stat, Textarea } from "@/components/ui";
import { Analysis, analyzeResume, createJob, demoLogin, getCurrentUser, login, register, Resume, uploadResume, UserRead } from "@/lib/api";

export default function Dashboard() {
  const [fileName, setFileName] = useState("No resume uploaded");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [token, setToken] = useState("");
  const [authMode, setAuthMode] = useState<"login" | "register">("register");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [currentUser, setCurrentUser] = useState<UserRead | null>(null);
  const [resume, setResume] = useState<Resume | null>(null);
  const [analysis, setAnalysis] = useState<Analysis | null>(null);
  const [analysisCount, setAnalysisCount] = useState(0);
  const [status, setStatus] = useState("Create an account or sign in to run a real match analysis.");
  const [isBusy, setIsBusy] = useState(false);
  const [jobTitle, setJobTitle] = useState("");
  const [company, setCompany] = useState("");
  const [jobDescription, setJobDescription] = useState("");
  const gaps = analysis?.missing_skills ?? [];
  const jobKeywords = useMemo(
    () =>
      ["Python", "FastAPI", "AWS", "Kubernetes", "Terraform", "PostgreSQL", "Redis", "RAG", "Observability", "Vector search"].filter((keyword) =>
        jobDescription.toLowerCase().includes(keyword.toLowerCase())
      ),
    [jobDescription]
  );
  const matchScore = analysis ? Math.round(analysis.ats_score) : null;
  const skillScore = analysis ? `${Math.round(analysis.skill_match_score)}%` : "--";
  const experienceScore = analysis ? `${Math.round(analysis.experience_match_score)}%` : "--";
  const recommendations = analysis?.recommendations ?? [];
  const portfolioProjects = analysis?.portfolio_projects ?? [];
  const certifications = analysis?.certifications ?? [];
  const roadmap = analysis?.roadmap ?? [];

  useEffect(() => {
    const savedToken = window.localStorage.getItem("resume_analyzer_token");
    if (savedToken) {
      setToken(savedToken);
      setStatus("Signed in. Upload a resume and paste a job description to analyze fit.");
      void loadCurrentUser(savedToken);
    }
  }, []);

  async function loadCurrentUser(sessionToken: string) {
    try {
      const user = await getCurrentUser(sessionToken);
      setCurrentUser(user);
      setEmail(user.email);
      setFullName(user.full_name);
    } catch {
      window.localStorage.removeItem("resume_analyzer_token");
      setToken("");
      setCurrentUser(null);
      setStatus("Your session expired. Sign in again or use the demo account.");
    }
  }

  async function applySession(accessToken: string) {
    window.localStorage.setItem("resume_analyzer_token", accessToken);
    setToken(accessToken);
    await loadCurrentUser(accessToken);
    setStatus("Signed in. Upload a resume and paste a job description to analyze fit.");
  }

  async function handleAuth() {
    const trimmedEmail = email.trim().toLowerCase();
    const trimmedName = fullName.trim();
    if (!trimmedEmail || !password || (authMode === "register" && !trimmedName)) {
      setStatus("Enter your email, password, and name before continuing.");
      return;
    }
    setIsBusy(true);
    setStatus(authMode === "register" ? "Creating account..." : "Signing in...");
    try {
      if (authMode === "register") {
        try {
          await register(trimmedEmail, password, trimmedName);
        } catch (error) {
          if (error instanceof Error && error.message.toLowerCase().includes("already registered")) {
            setAuthMode("login");
            setStatus("That account already exists. Enter the correct password and sign in.");
            return;
          }
          throw error;
        }
      }
      const session = await login(trimmedEmail, password);
      await applySession(session.access_token);
    } catch (error) {
      setStatus(error instanceof Error ? error.message : "Authentication failed.");
    } finally {
      setIsBusy(false);
    }
  }

  async function handleDemoLogin() {
    setIsBusy(true);
    setStatus("Opening demo workspace...");
    try {
      const session = await demoLogin();
      await applySession(session.access_token);
      setStatus("Demo account ready. Upload a resume and paste a job description to test the full workflow.");
    } catch (error) {
      setStatus(error instanceof Error ? error.message : "Demo login failed.");
    } finally {
      setIsBusy(false);
    }
  }

  async function handleUpload(file: File) {
    setSelectedFile(file);
    setFileName(file.name);
    setAnalysis(null);
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
    if (!jobTitle || !jobDescription) {
      setStatus("Add a job title and paste the job description before analyzing.");
      return;
    }
    setIsBusy(true);
    setStatus("Creating job and analyzing match...");
    try {
      const job = await createJob({ title: jobTitle, company, description: jobDescription }, token);
      const result = await analyzeResume({ resume_id: resume.id, job_id: job.id }, token);
      setAnalysis(result);
      setAnalysisCount((count) => count + 1);
      setStatus("Analysis complete. Review your scores, gaps, and recommendations.");
    } catch (error) {
      setStatus(error instanceof Error ? error.message : "Analysis failed.");
    } finally {
      setIsBusy(false);
    }
  }

  function resetAnalysis() {
    setSelectedFile(null);
    setFileName("No resume uploaded");
    setResume(null);
    setAnalysis(null);
    setJobTitle("");
    setCompany("");
    setJobDescription("");
    setStatus(token ? "Ready for a new resume and job match." : "Create an account or sign in to run a real match analysis.");
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
                <p className="text-sm text-ink/60">Upload a resume, paste a job, and get a clear match score.</p>
              </div>
            </div>
          </div>
          <Button onClick={resetAnalysis}><Zap className="h-4 w-4" />New Analysis</Button>
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
                {authMode === "register" && <Input aria-label="Full name" placeholder="Full name" value={fullName} onChange={(event) => setFullName(event.target.value)} />}
                <Input aria-label="Email" placeholder="you@example.com" value={email} onChange={(event) => setEmail(event.target.value)} />
                <Input aria-label="Password" placeholder="At least 8 characters" type="password" value={password} onChange={(event) => setPassword(event.target.value)} />
                <Button className="w-full" disabled={isBusy} onClick={handleAuth}>
                  {isBusy && <Loader2 className="h-4 w-4 animate-spin" />}
                  Continue
                </Button>
                <button
                  className="w-full rounded-md border border-signal/35 bg-signal/10 px-3 py-2 text-sm font-bold text-signal transition hover:bg-signal/15 disabled:cursor-not-allowed disabled:opacity-60"
                  disabled={isBusy}
                  onClick={handleDemoLogin}
                >
                  Use demo account
                </button>
              </div>
            ) : (
              <div className="space-y-3 text-sm text-ink/70">
                <div className="rounded-md border border-line bg-white/5 p-3">
                  <div className="font-bold text-ink">{currentUser?.full_name || "Signed in user"}</div>
                  <div className="mt-1 text-xs text-ink/50">{currentUser?.email || email}</div>
                </div>
                <button
                  className="text-sm font-bold text-signal"
                  onClick={() => {
                    window.localStorage.removeItem("resume_analyzer_token");
                    setToken("");
                    setCurrentUser(null);
                    setPassword("");
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
        </aside>
        <section className="space-y-5">
          <div className="grid gap-4 sm:grid-cols-4">
            <Stat label="ATS Score" value={matchScore ?? "--"} />
            <Stat label="Skill Match" value={skillScore} />
            <Stat label="Analyses" value={analysisCount} />
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
                  <span className={`hidden rounded-full border px-3 py-1 text-xs font-bold sm:inline-flex ${resume ? "border-mint/30 bg-mint/10 text-mint" : "border-gold/30 bg-gold/10 text-gold"}`}>
                    {resume ? "Resume linked" : "Upload resume first"}
                  </span>
                </div>
                <div className="grid gap-3 sm:grid-cols-2">
                  <Input aria-label="Job title" placeholder="Job title" value={jobTitle} onChange={(event) => setJobTitle(event.target.value)} />
                  <Input aria-label="Company" placeholder="Company optional" value={company} onChange={(event) => setCompany(event.target.value)} />
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
                    <div className="mt-1 text-sm text-ink/55">{company || "Company"} · {jobTitle || "Job title"}</div>
                  </div>
                  <div className="grid h-20 w-20 place-items-center rounded-full border border-signal/35 bg-signal/10 text-2xl font-black text-signal">
                    {matchScore ?? "--"}
                  </div>
                </div>
                <div className="mt-5 h-2 rounded-full bg-white/10">
                  <div className="h-full rounded-full bg-gradient-to-r from-accent via-gold to-mint" style={{ width: `${matchScore ?? 0}%` }} />
                </div>
                <div className="mt-5">
                  <div className="mb-2 flex items-center gap-2 text-sm font-bold"><Target className="h-4 w-4 text-mint" />Detected role signals</div>
                  <div className="flex flex-wrap gap-2">
                    {jobKeywords.length ? jobKeywords.map((keyword) => (
                      <span className="rounded-md border border-line bg-white/8 px-2.5 py-1.5 text-xs font-bold text-mint" key={keyword}>
                        {keyword}
                      </span>
                    )) : <span className="text-xs text-ink/45">Paste a job description to detect role signals.</span>}
                  </div>
                </div>
                {analysis ? (
                  <div className="mt-5 space-y-2 text-sm text-ink/70">
                    {analysis.strengths.slice(0, 2).map((item) => (
                      <div className="rounded-md border border-mint/20 bg-mint/5 p-3" key={item}>{item}</div>
                    ))}
                    {analysis.weaknesses.slice(0, 2).map((item) => (
                      <div className="rounded-md border border-gold/25 bg-gold/5 p-3" key={item}>{item}</div>
                    ))}
                  </div>
                ) : (
                  <div className="mt-5 rounded-md border border-line bg-white/5 p-3 text-sm text-ink/55">
                    Results appear here after you upload a resume, paste a job description,
                    and run the match analysis.
                  </div>
                )}
              </div>
            </div>
          </Panel>
          {analysis ? (
            <>
              <div className="grid gap-5 lg:grid-cols-[1fr_1fr]">
                <Panel>
                  <h2 className="text-lg font-bold">Missing Skills</h2>
                  <div className="mt-4 flex flex-wrap gap-2">
                    {gaps.length ? gaps.map((gap) => <span className="rounded-md border border-line bg-white/8 px-3 py-2 text-sm font-medium text-signal" key={gap}>{gap}</span>) : (
                      <span className="text-sm text-ink/50">No missing skills detected for this job.</span>
                    )}
                  </div>
                  {gaps.length > 0 && (
                    <div className="mt-5 space-y-2 text-sm text-ink/70">
                      {gaps.slice(0, 4).map((gap) => (
                        <div className="rounded-md border border-line bg-white/5 p-3" key={gap}>
                          Add one resume bullet, project note, or certification that proves real {gap} experience.
                        </div>
                      ))}
                    </div>
                  )}
                </Panel>
                <Panel>
                  <h3 className="flex items-center gap-2 font-semibold"><ListChecks className="h-4 w-4 text-signal" />Recommendations</h3>
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
              <div className="grid gap-5 lg:grid-cols-3">
                <Panel>
                  <h3 className="flex items-center gap-2 font-semibold"><Target className="h-4 w-4 text-mint" />Next Steps</h3>
                  <div className="mt-3 space-y-2 text-sm text-ink/72">
                    {roadmap.map((item) => (
                      <div className="rounded-md border border-line bg-white/5 p-3" key={`${item.step}-${item.focus}`}>
                        <div className="text-xs font-bold uppercase text-signal">Step {item.step}: {item.focus}</div>
                        <div className="mt-1">{item.action}</div>
                      </div>
                    ))}
                  </div>
                </Panel>
                <Panel>
                  <h3 className="flex items-center gap-2 font-semibold"><BriefcaseBusiness className="h-4 w-4 text-gold" />Portfolio Ideas</h3>
                  <div className="mt-3 space-y-2 text-sm text-ink/72">
                    {portfolioProjects.map((item) => (
                      <div className="rounded-md border border-line bg-white/5 p-3" key={item}>{item}</div>
                    ))}
                  </div>
                </Panel>
                <Panel>
                  <h3 className="flex items-center gap-2 font-semibold"><Award className="h-4 w-4 text-signal" />Certifications</h3>
                  <div className="mt-3 space-y-2 text-sm text-ink/72">
                    {certifications.length ? certifications.map((item) => (
                      <div className="rounded-md border border-line bg-white/5 p-3" key={item}>{item}</div>
                    )) : (
                      <div className="rounded-md border border-line bg-white/5 p-3">
                        No specific certification gap was detected. Focus on measurable resume evidence first.
                      </div>
                    )}
                  </div>
                </Panel>
              </div>
            </>
          ) : (
            <Panel>
              <div className="flex items-start gap-3">
                <Target className="mt-1 h-5 w-5 text-signal" />
                <div>
                  <h2 className="text-lg font-bold">Your match report will appear after analysis</h2>
                  <p className="mt-2 text-sm text-ink/60">
                    Upload a resume, paste the job description, then run analysis to see the real
                    ATS score, missing skills, experience gaps, recommendations, project ideas,
                    and certification guidance.
                  </p>
                </div>
              </div>
            </Panel>
          )}
        </section>
      </div>
      <footer className="mx-auto max-w-7xl px-6 pb-6 text-right text-xs text-ink/35">
        Built by Charles Appiah Manu
      </footer>
    </main>
  );
}
