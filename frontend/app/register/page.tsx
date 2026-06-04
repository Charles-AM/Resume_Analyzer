"use client";

import { Button, Input, Panel } from "@/components/ui";

export default function RegisterPage() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-panel p-6">
      <Panel className="w-full max-w-md">
        <h1 className="text-2xl font-bold">Create Account</h1>
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
