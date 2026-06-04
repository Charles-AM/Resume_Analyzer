import { clsx } from "clsx";
import type { ButtonHTMLAttributes, InputHTMLAttributes, PropsWithChildren, TextareaHTMLAttributes } from "react";

export function Button({ className, ...props }: ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button
      className={clsx(
        "inline-flex h-10 items-center justify-center gap-2 rounded-md border border-signal/30 bg-signal px-4 text-sm font-semibold text-void shadow-[0_0_28px_rgba(124,227,255,0.22)] transition hover:-translate-y-0.5 hover:bg-mint disabled:opacity-50",
        className
      )}
      {...props}
    />
  );
}

export function Input(props: InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      className="h-10 w-full rounded-md border border-line bg-white/8 px-3 text-sm text-ink outline-none transition placeholder:text-ink/35 focus:border-signal focus:bg-white/12"
      {...props}
    />
  );
}

export function Textarea(props: TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return (
    <textarea
      className="min-h-40 w-full resize-none rounded-md border border-line bg-white/8 px-3 py-3 text-sm leading-6 text-ink outline-none transition placeholder:text-ink/35 focus:border-signal focus:bg-white/12"
      {...props}
    />
  );
}

export function Panel({ children, className }: PropsWithChildren<{ className?: string }>) {
  return (
    <section
      className={clsx(
        "holo-card rounded-md border border-line bg-white/[0.075] p-5 shadow-[0_18px_60px_rgba(0,0,0,0.28)] backdrop-blur-xl",
        className
      )}
    >
      {children}
    </section>
  );
}

export function Stat({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="holo-card rounded-md border border-line bg-white/[0.075] p-4 backdrop-blur-xl">
      <div className="text-xs font-semibold uppercase text-signal">{label}</div>
      <div className="mt-2 text-3xl font-bold text-ink">{value}</div>
      <div className="mt-3 h-1 overflow-hidden rounded-full bg-white/10">
        <div className="h-full w-3/4 rounded-full bg-gradient-to-r from-signal via-mint to-gold" />
      </div>
    </div>
  );
}
