import Link from "next/link";
import { ArrowRight, BarChart3, Gauge, Network, ShieldCheck, Sparkles, UploadCloud } from "lucide-react";

const capabilities = [
  { label: "Upload pipeline", Icon: UploadCloud, value: "PDF + DOCX" },
  { label: "ATS analytics", Icon: BarChart3, value: "Fit scoring" },
  { label: "Secure accounts", Icon: ShieldCheck, value: "Protected" }
];

export default function Home() {
  return (
    <main className="app-shell">
      <nav className="mx-auto flex max-w-7xl items-center justify-between px-6 py-5">
        <div className="flex items-center gap-3 text-lg font-bold">
          <span className="grid h-9 w-9 place-items-center rounded-md border border-signal/40 bg-signal/15 text-signal shadow-[0_0_30px_rgba(124,227,255,0.2)]">
            <Sparkles className="h-5 w-5" />
          </span>
          Am i a good match?
        </div>
        <div className="flex gap-2">
          <Link className="rounded-md border border-line bg-white/5 px-4 py-2 text-sm font-semibold text-ink transition hover:border-signal/50" href="/login">
            Login
          </Link>
          <Link className="rounded-md bg-signal px-4 py-2 text-sm font-semibold text-void shadow-[0_0_28px_rgba(124,227,255,0.22)] transition hover:bg-mint" href="/dashboard">
            Dashboard
          </Link>
        </div>
      </nav>
      <div className="data-ribbon" />
      <section className="mx-auto grid min-h-[calc(100vh-90px)] max-w-7xl items-center gap-8 px-6 py-8 lg:grid-cols-[1fr_1.05fr]">
        <div className="float-in">
          <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-line bg-white/5 px-3 py-2 text-sm text-signal">
            <Network className="h-4 w-4" />
            Resume-to-job match scoring
          </div>
          <h1 className="max-w-3xl text-5xl font-black leading-tight text-ink md:text-7xl">
            Am i a good match?
          </h1>
          <p className="mt-5 max-w-2xl text-lg leading-8 text-ink/70">
            Upload your resume, paste a job description, and see your ATS score, skill match, experience match, gaps, and next steps.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Link className="inline-flex h-11 items-center gap-2 rounded-md bg-signal px-5 text-sm font-bold text-void shadow-[0_0_34px_rgba(124,227,255,0.28)] transition hover:-translate-y-0.5 hover:bg-mint" href="/dashboard">
              Start matching <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
          <div className="mt-10 grid gap-3 sm:grid-cols-2">
            {capabilities.map(({ label, Icon, value }, index) => (
              <div key={label} className="holo-card rounded-md border border-line bg-white/[0.07] p-4 backdrop-blur-xl" style={{ animationDelay: `${index * 90}ms` }}>
                <div className="flex items-center justify-between gap-3">
                  <Icon className="h-5 w-5 text-signal" />
                  <span className="text-xs font-semibold text-mint">{value}</span>
                </div>
                <div className="mt-4 font-semibold">{label}</div>
              </div>
            ))}
          </div>
        </div>
        <div className="float-in rounded-md border border-line bg-white/[0.075] p-5 shadow-[0_24px_90px_rgba(0,0,0,0.38)] backdrop-blur-xl">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-sm font-semibold text-signal">Live fit analysis</div>
              <div className="mt-1 text-2xl font-black">Your resume vs. the job</div>
            </div>
            <div className="relative grid h-24 w-24 place-items-center rounded-full border border-signal/30 bg-signal/10">
              <Gauge className="h-8 w-8 text-signal" />
            </div>
          </div>
          <div className="mt-6 grid gap-3 text-sm sm:grid-cols-3">
            <div className="rounded-md border border-line bg-void/40 p-4 font-semibold text-signal">ATS score</div>
            <div className="rounded-md border border-line bg-void/40 p-4 font-semibold text-mint">Skill match</div>
            <div className="rounded-md border border-line bg-void/40 p-4 font-semibold text-gold">Experience fit</div>
          </div>
          <div className="mt-6 space-y-3">
            {["Upload a PDF or DOCX resume", "Paste the exact job description", "Get scoring and targeted recommendations"].map((item, index) => (
              <div key={item} className="flex items-center gap-3 rounded-md border border-line bg-white/5 p-3 text-sm">
                <span className="pulse-node h-2.5 w-2.5 rounded-full bg-signal" style={{ animationDelay: `${index * 140}ms` }} />
                {item}
              </div>
            ))}
          </div>
          <div className="mt-6 overflow-hidden rounded-md border border-line bg-void/45 p-4">
            <div className="mb-3 flex items-center justify-between text-xs text-ink/55">
              <span>Result generated after analysis</span>
            </div>
            <div className="h-2 rounded-full bg-white/10">
              <div className="h-full w-0 rounded-full bg-gradient-to-r from-signal via-mint to-gold" />
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
