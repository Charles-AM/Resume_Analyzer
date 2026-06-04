"use client";

import { useMemo, useState } from "react";
import { BarChart, Bar, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { MessageSquare, Search, UploadCloud } from "lucide-react";
import { Button, Input, Panel, Stat } from "@/components/ui";

const scores = [
  { name: "Jan", ats: 58 },
  { name: "Feb", ats: 66 },
  { name: "Mar", ats: 74 },
  { name: "Apr", ats: 81 }
];

export default function Dashboard() {
  const [fileName, setFileName] = useState("senior-data-engineer.pdf");
  const [query, setQuery] = useState("Find resumes with Python, AWS, and RAG projects");
  const gaps = useMemo(() => ["Kubernetes", "Terraform", "OpenTelemetry", "Qdrant"], []);

  return (
    <main className="min-h-screen bg-panel">
      <header className="border-b border-line bg-white">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
          <div>
            <h1 className="text-2xl font-bold">Resume Intelligence</h1>
            <p className="text-sm text-ink/65">ETL, embeddings, RAG analysis, and search in one workflow.</p>
          </div>
          <Button>New Analysis</Button>
        </div>
      </header>
      <div className="mx-auto grid max-w-7xl gap-5 px-6 py-6 lg:grid-cols-[280px_1fr]">
        <aside className="space-y-4">
          <Panel>
            <div className="mb-3 flex items-center gap-2 font-semibold"><UploadCloud className="h-4 w-4" />Upload</div>
            <label className="flex h-36 cursor-pointer flex-col items-center justify-center rounded-md border border-dashed border-line bg-panel text-center text-sm">
              <UploadCloud className="mb-2 h-6 w-6 text-signal" />
              Drop PDF or DOCX
              <input className="hidden" type="file" onChange={(event) => setFileName(event.target.files?.[0]?.name || fileName)} />
            </label>
            <p className="mt-3 truncate text-sm font-medium">{fileName}</p>
          </Panel>
          <Panel>
            <div className="mb-3 flex items-center gap-2 font-semibold"><Search className="h-4 w-4" />Search</div>
            <Input value={query} onChange={(event) => setQuery(event.target.value)} />
            <Button className="mt-3 w-full">Run Search</Button>
          </Panel>
        </aside>
        <section className="space-y-5">
          <div className="grid gap-4 sm:grid-cols-4">
            <Stat label="ATS Score" value="81" />
            <Stat label="Skill Match" value="74%" />
            <Stat label="Analyses" value="24" />
            <Stat label="Latency P95" value="820ms" />
          </div>
          <div className="grid gap-5 lg:grid-cols-[1fr_360px]">
            <Panel>
              <h2 className="mb-4 text-lg font-bold">ATS Score Trend</h2>
              <div className="h-72">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={scores}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="ats" fill="#2f7d79" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </Panel>
            <Panel>
              <h2 className="text-lg font-bold">Skill Gaps</h2>
              <div className="mt-4 flex flex-wrap gap-2">
                {gaps.map((gap) => <span className="rounded-md bg-panel px-3 py-2 text-sm font-medium" key={gap}>{gap}</span>)}
              </div>
              <h3 className="mt-6 font-semibold">Recommendations</h3>
              <ul className="mt-3 space-y-2 text-sm text-ink/75">
                <li>Add a Kubernetes deployment project with measurable reliability outcomes.</li>
                <li>Include Terraform modules for cloud infrastructure provisioning.</li>
                <li>Document tracing, metrics, and alerting work in recent roles.</li>
              </ul>
            </Panel>
          </div>
          <Panel>
            <div className="mb-3 flex items-center gap-2 font-semibold"><MessageSquare className="h-4 w-4" />RAG Chat</div>
            <div className="rounded-md bg-panel p-4 text-sm">Why am I a poor fit?</div>
            <div className="mt-3 rounded-md border border-line p-4 text-sm">
              The resume under-represents platform operations. Add projects that prove Kubernetes, Terraform, and observability experience.
            </div>
          </Panel>
        </section>
      </div>
    </main>
  );
}
