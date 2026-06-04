import Link from "next/link";
import { BarChart3, FileSearch, ShieldCheck, UploadCloud } from "lucide-react";

const capabilities = [
  { label: "Upload pipeline", Icon: UploadCloud },
  { label: "Semantic retrieval", Icon: FileSearch },
  { label: "ATS analytics", Icon: BarChart3 },
  { label: "JWT and RBAC", Icon: ShieldCheck }
];

export default function Home() {
  return (
    <main className="min-h-screen bg-panel">
      <nav className="mx-auto flex max-w-7xl items-center justify-between px-6 py-5">
        <div className="text-lg font-bold">AI Resume Analyzer</div>
        <div className="flex gap-2">
          <Link className="rounded-md border border-line px-4 py-2 text-sm font-semibold" href="/login">
            Login
          </Link>
          <Link className="rounded-md bg-ink px-4 py-2 text-sm font-semibold text-white" href="/dashboard">
            Dashboard
          </Link>
        </div>
      </nav>
      <section className="mx-auto grid max-w-7xl gap-8 px-6 py-8 lg:grid-cols-[1.1fr_0.9fr]">
        <div>
          <h1 className="max-w-3xl text-5xl font-bold leading-tight">AI Resume Analyzer</h1>
          <p className="mt-4 max-w-2xl text-lg text-ink/75">
            Upload resumes, parse structured candidate data, run RAG-backed fit analysis, and search your talent pool semantically.
          </p>
          <div className="mt-8 grid gap-3 sm:grid-cols-2">
            {capabilities.map(({ label, Icon }) => (
              <div key={label} className="flex items-center gap-3 rounded-md border border-line bg-white p-4">
                <Icon className="h-5 w-5 text-signal" />
                <span className="font-semibold">{label}</span>
              </div>
            ))}
          </div>
        </div>
        <div className="rounded-md border border-line bg-white p-5">
          <div className="grid grid-cols-3 gap-2 text-center text-sm">
            <div className="rounded-md bg-panel p-4"><b className="block text-3xl">92</b>ATS</div>
            <div className="rounded-md bg-panel p-4"><b className="block text-3xl">18</b>Skills</div>
            <div className="rounded-md bg-panel p-4"><b className="block text-3xl">6</b>Gaps</div>
          </div>
          <div className="mt-5 space-y-3">
            {["Python + AWS evidence found", "Kubernetes missing from projects", "Add RAG deployment case study"].map((item) => (
              <div key={item} className="rounded-md border border-line p-3 text-sm">{item}</div>
            ))}
          </div>
        </div>
      </section>
    </main>
  );
}
