"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { ArrowLeft, BarChart3, BrainCircuit, Check, CircleHelp, FileText, Fingerprint, Gauge, History, LayoutDashboard, Loader2, LogIn, MessageSquareText, RotateCcw, Sparkles, Target, UploadCloud, WandSparkles } from "lucide-react";
import { Button, Input, Panel, Stat, Textarea } from "@/components/ui";
import { Analysis, analyzeResume, askResumeCoach, createJob, demoLogin, getCurrentUser, login, register, Resume, uploadResume, UserRead } from "@/lib/api";

const sampleJob = {
  title: "Senior Backend Engineer",
  company: "Northstar Labs",
  description: "We are looking for a Senior Backend Engineer with 5+ years of experience building production APIs. You will work with Python, FastAPI, PostgreSQL, Redis, AWS, Docker, Kubernetes, Terraform, observability, vector search, and RAG systems. You have led technical projects, improved system performance, and partnered with product teams to deliver measurable outcomes for users."
};

export default function Dashboard() {
  const [fileName, setFileName] = useState("No file selected");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [token, setToken] = useState("");
  const [authMode, setAuthMode] = useState<"login" | "register">("register");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [currentUser, setCurrentUser] = useState<UserRead | null>(null);
  const [resume, setResume] = useState<Resume | null>(null);
  const [analysis, setAnalysis] = useState<Analysis | null>(null);
  const [status, setStatus] = useState("Sign in, add your resume, and choose a role to begin.");
  const [isBusy, setIsBusy] = useState(false);
  const [jobTitle, setJobTitle] = useState("");
  const [company, setCompany] = useState("");
  const [jobDescription, setJobDescription] = useState("");
  const [coachQuestion, setCoachQuestion] = useState("");
  const [coachAnswer, setCoachAnswer] = useState("");
  const [coachBusy, setCoachBusy] = useState(false);

  const matchScore = analysis ? Math.round(analysis.ats_score) : 0;
  const skillScore = analysis ? Math.round(analysis.skill_match_score) : 0;
  const experienceScore = analysis ? Math.round(analysis.experience_match_score) : 0;
  const currentStep = analysis ? 3 : resume ? 2 : 1;
  const roleSignals = useMemo(() => ["Python", "FastAPI", "AWS", "Kubernetes", "Terraform", "PostgreSQL", "Redis", "RAG", "Observability", "Vector search"].filter(keyword => jobDescription.toLowerCase().includes(keyword.toLowerCase())), [jobDescription]);

  useEffect(() => {
    const saved = window.localStorage.getItem("resume_analyzer_token");
    if (saved) { setToken(saved); setStatus("Session restored. Add a resume and target role when you are ready."); void loadCurrentUser(saved); }
  }, []);

  async function loadCurrentUser(sessionToken: string) {
    try { const user = await getCurrentUser(sessionToken); setCurrentUser(user); setEmail(user.email); setFullName(user.full_name); }
    catch { window.localStorage.removeItem("resume_analyzer_token"); setToken(""); setCurrentUser(null); setStatus("Your session expired. Sign in again or open the demo workspace."); }
  }
  async function applySession(accessToken: string) { window.localStorage.setItem("resume_analyzer_token", accessToken); setToken(accessToken); await loadCurrentUser(accessToken); setStatus("Workspace ready. Upload your resume to create a role report."); }
  async function handleAuth() {
    const cleanEmail = email.trim().toLowerCase();
    if (!cleanEmail || !password || (authMode === "register" && !fullName.trim())) { setStatus("Add your name, email, and password to continue."); return; }
    setIsBusy(true); setStatus(authMode === "register" ? "Creating your workspace…" : "Signing you in…");
    try { if (authMode === "register") await register(cleanEmail, password, fullName.trim()); const session = await login(cleanEmail, password); await applySession(session.access_token); }
    catch (error) { setStatus(error instanceof Error ? error.message : "Authentication failed."); }
    finally { setIsBusy(false); }
  }
  async function handleDemoLogin() {
    setIsBusy(true); setStatus("Opening the demo workspace…");
    try { const session = await demoLogin(); await applySession(session.access_token); setJobTitle(sampleJob.title); setCompany(sampleJob.company); setJobDescription(sampleJob.description); setStatus("Demo ready with a sample role. Upload any resume to run the full analysis."); }
    catch (error) { setStatus(error instanceof Error ? error.message : "Demo login failed."); }
    finally { setIsBusy(false); }
  }
  function selectFile(file: File) { setSelectedFile(file); setFileName(file.name); setResume(null); setAnalysis(null); setStatus("Resume selected. Upload it to extract your skills and experience."); }
  async function handleUpload() {
    if (!selectedFile) { setStatus("Choose a PDF, DOCX, TXT, or MD resume first."); return; }
    if (!token) { setStatus("Sign in before uploading your resume."); return; }
    setIsBusy(true); setStatus("Securely parsing your resume…");
    try { const uploaded = await uploadResume(selectedFile, token); setResume(uploaded); setStatus(`Resume ready: ${uploaded.filename}. Add a target role, then run the analysis.`); }
    catch (error) { setStatus(error instanceof Error ? error.message : "Resume upload failed."); }
    finally { setIsBusy(false); }
  }
  async function handleAnalyze() {
    if (!token || !resume || !jobTitle.trim() || !jobDescription.trim()) { setStatus("Complete sign-in, resume upload, job title, and job description first."); return; }
    setIsBusy(true); setStatus("Mapping your evidence to the role…");
    try { const job = await createJob({ title: jobTitle, company, description: jobDescription }, token); const result = await analyzeResume({ resume_id: resume.id, job_id: job.id }, token); setAnalysis(result); setStatus("Your role report is ready. Start with the highest-priority gaps below."); }
    catch (error) { setStatus(error instanceof Error ? error.message : "Analysis failed."); }
    finally { setIsBusy(false); }
  }
  async function handleCoach() {
    if (!resume || !token || !coachQuestion.trim()) return;
    setCoachBusy(true); setCoachAnswer("");
    try { const response = await askResumeCoach(resume.id, coachQuestion.trim(), token); setCoachAnswer(response.answer); }
    catch (error) { setCoachAnswer(error instanceof Error ? error.message : "The coach could not answer that question."); }
    finally { setCoachBusy(false); }
  }
  function resetAnalysis() { setSelectedFile(null); setFileName("No file selected"); setResume(null); setAnalysis(null); setJobTitle(""); setCompany(""); setJobDescription(""); setCoachQuestion(""); setCoachAnswer(""); setStatus(token ? "Ready for a new role analysis." : "Sign in, add your resume, and choose a role to begin."); }
  function signOut() { window.localStorage.removeItem("resume_analyzer_token"); setToken(""); setCurrentUser(null); setResume(null); setAnalysis(null); setPassword(""); setStatus("Signed out safely."); }

  return <main className="workspace">
    <header className="workspace-header">
      <div className="workspace-header-left"><Link className="brand" href="/"><span className="brand-mark"><Fingerprint /></span><span>RoleSignal</span></Link><div className="workspace-context"><strong>Match workspace</strong><span>Evidence-based career intelligence</span></div></div>
      <div className="workspace-header-right"><span className="workspace-badge"><i /> Systems operational</span><Button className="secondary" onClick={resetAnalysis}><RotateCcw /> New analysis</Button></div>
    </header>
    <div className="workspace-layout">
      <aside className="workspace-sidebar"><p className="side-label">Workspace</p><button className="side-link active"><LayoutDashboard /><span>Role analysis</span></button><button className="side-link"><History /><span>History</span><i className="side-count">Soon</i></button><button className="side-link"><MessageSquareText /><span>Resume coach</span></button><div className="sidebar-spacer" /><Link className="side-link" href="/"><ArrowLeft /><span>Back to site</span></Link>{token && <div className="account-chip"><strong>{currentUser?.full_name || "Signed in"}</strong><span>{currentUser?.email || email}</span><button className="signout" onClick={signOut}>Sign out</button></div>}</aside>
      <section className="workspace-main">
        <div className="workspace-title-row"><div><span className="kicker">Match intelligence</span><h1>Build your role report</h1><p>A guided, evidence-first view of how your resume performs.</p></div>{jobTitle && <div className="workspace-context"><strong>{jobTitle}</strong><span>{company || "Target role"}</span></div>}</div>
        <div className="stepper">{["Add your resume", "Define the role", "Explore your report"].map((label, index) => { const n=index+1; return <div className={`step ${n<currentStep?"complete":""} ${n===currentStep?"current":""}`} key={label}><i>{n<currentStep?<Check />:n}</i><span>{label}</span></div>; })}</div>
        <div className="status-bar" role="status"><Sparkles /> {status}</div>

        <div className="workspace-grid">
          <div>
            <Panel>
              <div className="surface-head"><div><span className="kicker">Input 01</span><h2>Your resume</h2><p>PDF, DOCX, TXT, or Markdown. Your document stays attached to your account.</p></div><span className="surface-number">{resume ? "READY" : "01"}</span></div>
              <label className="upload-zone"><UploadCloud /><strong>{resume ? "Resume parsed successfully" : "Drop your resume or click to browse"}</strong><span>{resume ? `${resume.skills.length} skills extracted` : "Maximum 10 MB · readable text works best"}</span><input type="file" accept=".pdf,.docx,.txt,.md" onChange={event => { const file=event.target.files?.[0]; if(file) selectFile(file); }} /></label>
              <div className="file-row"><FileText /> {fileName}</div>
              {selectedFile && !resume && <div className="action-row"><Button disabled={isBusy} onClick={handleUpload}>{isBusy?<Loader2 className="spin"/>:<UploadCloud/>} Upload & parse</Button><span className="action-hint">Text is indexed for evidence-aware coaching.</span></div>}
            </Panel>

            <Panel style={{ marginTop: 18 } as React.CSSProperties}>
              <div className="surface-head"><div><span className="kicker">Input 02</span><h2>Your target role</h2><p>Paste the full listing for a more accurate comparison.</p></div><button className="signout" onClick={() => { setJobTitle(sampleJob.title); setCompany(sampleJob.company); setJobDescription(sampleJob.description); }}>Load example role</button></div>
              <div className="form-grid"><div><label className="field-label">Job title</label><Input aria-label="Job title" placeholder="e.g. Senior Backend Engineer" value={jobTitle} onChange={e=>setJobTitle(e.target.value)} /></div><div><label className="field-label">Company</label><Input aria-label="Company" placeholder="Optional" value={company} onChange={e=>setCompany(e.target.value)} /></div></div>
              <label className="field-label">Job description</label><Textarea aria-label="Job description" placeholder="Paste the complete role description…" value={jobDescription} onChange={e=>setJobDescription(e.target.value)} />
              <div className="action-row"><Button disabled={isBusy} onClick={handleAnalyze}>{isBusy?<Loader2 className="spin"/>:<WandSparkles/>} Generate role report</Button><span className="action-hint">{roleSignals.length ? `${roleSignals.length} technical signals detected` : "Signals appear as you add the role"}</span></div>
            </Panel>
          </div>

          <aside>
            {!token ? <Panel className="auth-card"><div className="surface-head"><div><span className="kicker">Your workspace</span><h2>Save your progress</h2><p>Sign in to securely analyze and revisit your resume.</p></div><LogIn /></div><div className="auth-toggle">{(["register","login"] as const).map(mode=><button className={authMode===mode?"active":""} key={mode} onClick={()=>setAuthMode(mode)}>{mode==="register"?"Create account":"Sign in"}</button>)}</div>{authMode==="register"&&<Input aria-label="Full name" placeholder="Full name" value={fullName} onChange={e=>setFullName(e.target.value)}/>}<Input aria-label="Email" placeholder="you@example.com" value={email} onChange={e=>setEmail(e.target.value)}/><div style={{height:8}}/><Input aria-label="Password" type="password" placeholder="At least 8 characters" value={password} onChange={e=>setPassword(e.target.value)}/><Button style={{width:"100%",marginTop:10}} disabled={isBusy} onClick={handleAuth}>{isBusy&&<Loader2 className="spin"/>} Continue</Button><button className="demo-button" disabled={isBusy} onClick={handleDemoLogin}>Explore with demo account</button></Panel> : <Panel><div className="surface-head"><div><span className="kicker">Evidence map</span><h2>Detected signals</h2><p>{roleSignals.length ? "Live requirements found in the target role." : "Add a job description to surface its signals."}</p></div><Target /></div><div className="gap-chips">{roleSignals.map(item=><span className="gap-chip" style={{background:"#f2f8dd",color:"#526b12",borderColor:"#c5d985"}} key={item}>{item}</span>)}</div></Panel>}
            <Panel style={{marginTop:18} as React.CSSProperties}><div className="surface-head"><div><span className="kicker">Scoring model</span><h2>What we measure</h2></div><Gauge /></div><div className="result-list"><div className="result-item"><Check /> Role-specific skills and keyword coverage</div><div className="result-item"><Check /> Experience depth and evidence of impact</div><div className="result-item"><Check /> ATS structure and parsing confidence</div></div></Panel>
          </aside>
        </div>

        <div className="metrics"><Stat label="Overall signal" value={analysis?`${matchScore}%`:"—"} percent={matchScore}/><Stat label="Skill alignment" value={analysis?`${skillScore}%`:"—"} percent={skillScore}/><Stat label="Experience fit" value={analysis?`${experienceScore}%`:"—"} percent={experienceScore}/></div>

        {analysis ? <>
          <Panel className="report-hero"><div className="report-score" style={{"--score":`${matchScore}%`} as React.CSSProperties}><strong>{matchScore}</strong><span>{matchScore>=80?"STRONG MATCH":matchScore>=60?"PROMISING":"NEEDS WORK"}</span></div><div className="report-copy"><span className="kicker">Your role report</span><h2>{jobTitle}{company?` at ${company}`:""}</h2><p>{matchScore>=80?"Your resume shows strong alignment. Tighten the remaining gaps and lead with your best evidence.":"You have a foundation to build on. The recommendations below are ordered by likely impact."}</p><div className="report-chips">{analysis.strengths.slice(0,4).map(item=><span key={item}>{item}</span>)}</div></div></Panel>
          <div className="results-grid"><Panel><div className="surface-head"><div><span className="kicker">Priority gaps</span><h2>Signals to strengthen</h2></div><BarChart3 /></div><div className="gap-chips">{analysis.missing_skills.length?analysis.missing_skills.map(item=><span className="gap-chip" key={item}>{item}</span>):<span className="action-hint">No missing technical skills detected.</span>}</div><div className="result-list" style={{marginTop:16}}>{analysis.weaknesses.map(item=><div className="result-item" key={item}><CircleHelp/>{item}</div>)}</div></Panel><Panel><div className="surface-head"><div><span className="kicker">Recommended actions</span><h2>Highest-impact changes</h2></div><Target /></div><div className="result-list">{analysis.recommendations.map(item=><div className="result-item" key={item}><Check/>{item}</div>)}</div></Panel></div>
          <div className="results-grid"><Panel><div className="surface-head"><div><span className="kicker">Action plan</span><h2>Your improvement roadmap</h2></div></div><div className="roadmap">{analysis.roadmap.map(item=><div className="roadmap-item" key={`${item.step}-${item.focus}`}><div><strong>{item.focus}</strong><p>{item.action}</p></div></div>)}</div></Panel><Panel><div className="surface-head"><div><span className="kicker">Proof builders</span><h2>Portfolio & credentials</h2></div></div><div className="result-list">{analysis.portfolio_projects.map(item=><div className="result-item" key={item}><Sparkles/>{item}</div>)}{analysis.certifications.map(item=><div className="result-item" key={item}><Check/>{item}</div>)}</div></Panel></div>
          <Panel className="coach"><div className="surface-head"><div><span className="kicker">Grounded in your resume</span><h2>Ask the resume coach</h2><p>RoleSignal retrieves relevant evidence from your uploaded resume before answering.</p></div><BrainCircuit /></div><div className="coach-form"><Input aria-label="Question for resume coach" placeholder="What is the strongest evidence I have for this role?" value={coachQuestion} onChange={e=>setCoachQuestion(e.target.value)} onKeyDown={e=>{if(e.key==="Enter")void handleCoach();}}/><Button disabled={coachBusy||!coachQuestion.trim()} onClick={handleCoach}>{coachBusy?<Loader2 className="spin"/>:<MessageSquareText/>} Ask coach</Button></div>{coachAnswer&&<div className="coach-answer">{coachAnswer}</div>}</Panel>
        </> : <Panel className="empty-report"><BrainCircuit /><h2>Your role report will appear here</h2><p>Complete the three steps above to unlock match scoring, evidence gaps, a prioritized roadmap, portfolio ideas, and grounded resume coaching.</p></Panel>}
      </section>
    </div>
  </main>;
}
