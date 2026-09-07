import Link from "next/link";
import { ArrowRight, BrainCircuit, Check, FileSearch, Fingerprint, Gauge, Layers3, MoveUpRight, ScanSearch, Target } from "lucide-react";

const signals = [
  { label: "Role alignment", value: "92%", tone: "cyan" },
  { label: "Skills evidence", value: "86%", tone: "violet" },
  { label: "ATS readiness", value: "94%", tone: "lime" },
];
const features = [
  { number: "01", icon: FileSearch, title: "Parse the whole story", copy: "Am I a Good Match? reads PDF and DOCX resumes into structured experience, skills, projects, and measurable outcomes." },
  { number: "02", icon: ScanSearch, title: "Map evidence to the role", copy: "Every requirement is compared against the evidence in your resume—not just repeated keywords." },
  { number: "03", icon: Target, title: "Know what to change", copy: "Get a prioritized action plan, portfolio ideas, and an AI coach grounded in your actual resume." },
];
const stack = ["Next.js", "TypeScript", "FastAPI", "PostgreSQL", "Redis", "RAG", "Vector search", "Docker"];

function Brand() {
  return <a className="brand" href="/" aria-label="Am I a Good Match? home"><span className="brand-mark"><Fingerprint aria-hidden="true" /></span><span>Am I a Good Match?</span></a>;
}

export default function Home() {
  return <main className="site-shell">
    <nav className="site-nav">
      <Brand />
      <div className="nav-links"><a href="#how-it-works">How it works</a><a href="#intelligence">Intelligence</a><a href="#technology">Technology</a></div>
      <Link className="button button-small button-dark" href="/dashboard">Open workspace <ArrowRight /></Link>
    </nav>

    <section className="hero">
      <div className="hero-copy reveal">
        <div className="eyebrow"><FileSearch /> Resume-to-role analysis</div>
        <h1>Know your fit.<br /><span>Close the gap.</span></h1>
        <p>See exactly how your resume reads against any role—and turn every missing signal into a practical next move.</p>
        <div className="hero-actions">
          <Link className="button button-primary" href="/dashboard">Analyze your resume <ArrowRight /></Link>
          <a className="text-link" href="#how-it-works">See how it works <MoveUpRight /></a>
        </div>
        <div className="trust-row"><Check aria-hidden="true" /><span>Built for candidates who want an honest assessment, not generic advice.</span></div>
      </div>

      <div className="product-stage reveal reveal-delay" aria-label="Am I a Good Match? product preview">
        <div className="app-window">
          <div className="window-bar"><span>Application report</span><span>Evidence-based scoring</span></div>
          <div className="window-body">
            <aside className="window-sidebar"><div className="mini-brand"><Fingerprint /> RS</div>{[Layers3, Gauge, BrainCircuit].map((Icon, index) => <span className={index === 1 ? "active" : ""} key={index}><Icon /></span>)}</aside>
            <div className="window-content">
              <div className="preview-heading"><div><small>ROLE REPORT</small><h3>Senior Product Engineer</h3><p>Northstar Labs · New York, NY</p></div><div className="score-ring"><span>89</span><small>STRONG</small></div></div>
              <div className="signal-grid">{signals.map(signal => <div className="signal-card" key={signal.label}><div><span>{signal.label}</span><strong>{signal.value}</strong></div><div className="signal-track"><i className={signal.tone} style={{ width: signal.value }} /></div></div>)}</div>
              <div className="evidence-card"><div className="evidence-head"><span>Evidence map</span><small>8 of 10 signals found</small></div><div className="skill-cloud">{["React", "System design", "TypeScript", "AWS", "Product thinking", "Analytics"].map((skill, index) => <span className={index > 3 ? "skill-gap" : "skill-hit"} key={skill}>{index < 4 && <Check />} {skill}</span>)}</div></div>
            </div>
          </div>
        </div>
      </div>
    </section>

    <section className="ticker"><div>{[...stack, ...stack].map((item, index) => <span key={`${item}-${index}`}>{item}<i /></span>)}</div></section>

    <section className="section-block" id="how-it-works">
      <div className="section-intro"><div><span className="section-kicker">A clearer path forward</span><h2>From application anxiety<br />to an action plan.</h2></div><p>Three focused steps turn a static document and a job listing into a living map of your candidacy.</p></div>
      <div className="feature-grid">{features.map(({ number, icon: Icon, title, copy }) => <article className="feature-card" key={number}><div className="feature-top"><span>{number}</span><Icon /></div><h3>{title}</h3><p>{copy}</p><div className="card-line" /></article>)}</div>
    </section>

    <section className="intelligence-section" id="intelligence"><div className="intelligence-card">
      <div className="intelligence-copy"><span className="section-kicker light">Built differently</span><h2>Your resume is more than a bag of keywords.</h2><p>Am I a Good Match? combines structured parsing, semantic retrieval, deterministic scoring, and evidence-aware coaching for feedback you can inspect and act on.</p><ul><li><Check /> Transparent scoring across skills, experience, and ATS structure</li><li><Check /> Retrieval-grounded coaching from your own resume</li><li><Check /> Concrete project ideas for hard-to-prove skills</li></ul><Link className="button button-light" href="/dashboard">Explore the workspace <ArrowRight /></Link></div>
      <div className="method-panel"><div className="method-head"><span>How your score is calculated</span><strong>Transparent by design</strong></div><div className="method-row"><span>Skills & keywords</span><strong>40%</strong><i><b style={{width:"40%"}} /></i></div><div className="method-row"><span>Experience evidence</span><strong>35%</strong><i><b style={{width:"35%"}} /></i></div><div className="method-row"><span>ATS readability</span><strong>25%</strong><i><b style={{width:"25%"}} /></i></div><p>Every score maps back to visible evidence and a practical next step.</p></div>
    </div></section>

    <section className="technology-section" id="technology"><div><span className="section-kicker">Under the hood</span><h2>A real product stack.<br />Not a polished mockup.</h2></div><div className="tech-list">{[["01","Intelligence","Semantic search · embeddings · RAG"],["02","Application","Next.js · TypeScript · accessible UI"],["03","Platform","FastAPI · PostgreSQL · Redis · Celery"],["04","Delivery","Docker · CI checks · cloud-ready services"]].map(([n,title,copy]) => <div key={n}><span>{n}</span><strong>{title}</strong><p>{copy}</p><MoveUpRight /></div>)}</div></section>
    <section className="final-cta"><div><span className="section-kicker light">Your next application starts here</span><h2>Stop guessing.<br />Start with a signal.</h2></div><Link className="button button-light button-large" href="/dashboard">Run a free analysis <ArrowRight /></Link></section>
    <footer className="site-footer"><Brand /><p>Career intelligence, designed and engineered by Charles Appiah Manu.</p><span>© 2026 Am I a Good Match?</span></footer>
  </main>;
}
