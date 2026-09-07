import { clsx } from "clsx";
import type { ButtonHTMLAttributes, InputHTMLAttributes, PropsWithChildren, TextareaHTMLAttributes } from "react";
export function Button({ className, ...props }: ButtonHTMLAttributes<HTMLButtonElement>) { return <button className={clsx("ui-button", className)} {...props} />; }
export function Input({ className, ...props }: InputHTMLAttributes<HTMLInputElement>) { return <input className={clsx("ui-input", className)} {...props} />; }
export function Textarea({ className, ...props }: TextareaHTMLAttributes<HTMLTextAreaElement>) { return <textarea className={clsx("ui-textarea", className)} {...props} />; }
export function Panel({ children, className }: PropsWithChildren<{ className?: string }>) { return <section className={clsx("surface", className)}>{children}</section>; }
export function Stat({ label, value, percent = 0 }: { label: string; value: string | number; percent?: number }) { return <div className="metric"><span>{label}</span><strong>{value}</strong><div className="metric-track"><i style={{ width: `${Math.max(0, Math.min(100, percent))}%` }} /></div></div>; }
