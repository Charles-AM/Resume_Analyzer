import { Activity, Database, Users } from "lucide-react";
import { Panel, Stat } from "@/components/ui";

const adminPanels = [
  { title: "User metrics", Icon: Users, copy: "Registrations, active users, role distribution" },
  { title: "Upload statistics", Icon: Database, copy: "Resume volume, file types, parsing failures" },
  { title: "API usage", Icon: Activity, copy: "Latency, retrieval timing, embedding timing, LLM timing" }
];

export default function AdminPage() {
  return (
    <main className="app-shell p-6">
      <section className="mx-auto max-w-7xl space-y-5">
        <div className="rounded-md border border-line bg-white/[0.075] p-6 backdrop-blur-xl">
          <div className="text-sm font-bold uppercase text-signal">Operations console</div>
          <h1 className="mt-2 text-3xl font-black">Admin Analytics</h1>
          <p className="mt-2 text-sm text-ink/60">Usage, uploads, API activity, and operational health.</p>
        </div>
        <div className="grid gap-4 sm:grid-cols-4">
          <Stat label="Users" value="128" />
          <Stat label="Uploads" value="842" />
          <Stat label="API Calls" value="19.4k" />
          <Stat label="Errors" value="0.18%" />
        </div>
        <div className="grid gap-5 lg:grid-cols-3">
          {adminPanels.map(({ title, Icon, copy }) => (
            <Panel key={title}>
              <Icon className="mb-3 h-6 w-6 text-signal" />
              <h2 className="font-bold">{title}</h2>
              <p className="mt-2 text-sm leading-6 text-ink/65">{copy}</p>
              <div className="mt-5 h-2 rounded-full bg-white/10">
                <div className="h-full w-2/3 rounded-full bg-gradient-to-r from-signal to-mint" />
              </div>
            </Panel>
          ))}
        </div>
      </section>
    </main>
  );
}
