import { Activity, Database, Users } from "lucide-react";
import { Panel, Stat } from "@/components/ui";

const adminPanels = [
  { title: "User metrics", Icon: Users, copy: "Registrations, active users, role distribution" },
  { title: "Upload statistics", Icon: Database, copy: "Resume volume, file types, parsing failures" },
  { title: "API usage", Icon: Activity, copy: "Latency, retrieval timing, embedding timing, LLM timing" }
];

export default function AdminPage() {
  return (
    <main className="min-h-screen bg-panel p-6">
      <section className="mx-auto max-w-7xl space-y-5">
        <div>
          <h1 className="text-2xl font-bold">Admin Analytics</h1>
          <p className="text-sm text-ink/65">Usage, uploads, API activity, and operational health.</p>
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
              <Icon className="mb-3 h-5 w-5 text-signal" />
              <h2 className="font-bold">{title}</h2>
              <p className="mt-2 text-sm text-ink/70">{copy}</p>
            </Panel>
          ))}
        </div>
      </section>
    </main>
  );
}
