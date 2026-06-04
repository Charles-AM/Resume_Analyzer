import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Am i a good match?",
  description: "AI-powered resume and job match intelligence platform"
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
