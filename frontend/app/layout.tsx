import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: { default: "RoleSignal — Know your fit. Close the gap.", template: "%s · RoleSignal" },
  description: "Evidence-driven resume intelligence that shows how you match a role, what is missing, and exactly what to do next.",
  openGraph: { title: "RoleSignal — Know your fit. Close the gap.", description: "Turn your resume and any job description into a clear, actionable match report.", type: "website" },
  twitter: { card: "summary", title: "RoleSignal — Know your fit. Close the gap.", description: "Evidence-driven resume intelligence for your next application." }
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
