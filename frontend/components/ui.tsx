import { clsx } from "clsx";
import type { ButtonHTMLAttributes, InputHTMLAttributes, PropsWithChildren } from "react";

export function Button({ className, ...props }: ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button
      className={clsx(
        "inline-flex h-10 items-center justify-center gap-2 rounded-md bg-ink px-4 text-sm font-semibold text-white transition hover:bg-signal disabled:opacity-50",
        className
      )}
      {...props}
    />
  );
}

export function Input(props: InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      className="h-10 w-full rounded-md border border-line bg-white px-3 text-sm outline-none focus:border-signal"
      {...props}
    />
  );
}

export function Panel({ children, className }: PropsWithChildren<{ className?: string }>) {
  return <section className={clsx("rounded-md border border-line bg-white p-5", className)}>{children}</section>;
}

export function Stat({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="rounded-md border border-line bg-panel p-4">
      <div className="text-xs font-semibold uppercase tracking-wide text-signal">{label}</div>
      <div className="mt-2 text-3xl font-bold">{value}</div>
    </div>
  );
}
