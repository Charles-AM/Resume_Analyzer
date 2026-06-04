"use client";

import { Button, Input, Panel } from "@/components/ui";

export default function RegisterPage() {
  return (
    <main className="app-shell flex min-h-screen items-center justify-center p-6">
      <Panel className="w-full max-w-md">
        <div className="text-sm font-bold uppercase text-signal">New workspace</div>
        <h1 className="mt-2 text-3xl font-black">Create Account</h1>
        <div className="mt-5 space-y-3">
          <Input placeholder="Full name" />
          <Input placeholder="Email" />
          <Input type="password" placeholder="Password" />
          <Button className="w-full">Register</Button>
        </div>
      </Panel>
    </main>
  );
}
