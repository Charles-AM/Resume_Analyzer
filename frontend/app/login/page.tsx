"use client";

import { useState } from "react";
import { Button, Input, Panel } from "@/components/ui";

export default function LoginPage() {
  const [email, setEmail] = useState("demo@example.com");
  return (
    <main className="app-shell flex min-h-screen items-center justify-center p-6">
      <Panel className="w-full max-w-md">
        <div className="text-sm font-bold uppercase text-signal">Secure access</div>
        <h1 className="mt-2 text-3xl font-black">Login</h1>
        <div className="mt-5 space-y-3">
          <Input value={email} onChange={(event) => setEmail(event.target.value)} placeholder="Email" />
          <Input type="password" placeholder="Password" />
          <Button className="w-full">Sign in</Button>
        </div>
      </Panel>
    </main>
  );
}
