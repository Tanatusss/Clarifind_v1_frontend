"use client";
import type { PropsWithChildren, ReactNode } from "react";

export function BaseDetailCard({
  children,
  tone = "rose",
  title,
  className = "",
}: PropsWithChildren<{ title: string; tone?: "rose" | "cyan" | "purple" | "emerald" | "amber"; className?: string }>) {
  const toneMap = {
    rose: { border: "border-rose-500/30", bg: "bg-rose-900/15", title: "text-rose-300" },
    cyan: { border: "border-cyan-500/30", bg: "bg-cyan-900/15", title: "text-cyan-300" },
    purple: { border: "border-purple-500/30", bg: "bg-purple-900/15", title: "text-purple-300" },
    emerald: { border: "border-emerald-500/30", bg: "bg-emerald-900/15", title: "text-emerald-300" },
    amber: { border: "border-amber-500/30", bg: "bg-amber-900/15", title: "text-amber-300" },
  } as const;
  const t = toneMap[tone];

  return (
    <div className={`mt-3 rounded-xl border ${t.border} ${t.bg} p-4 md:p-5 ${className}`}>
      <h5 className={`${t.title} font-semibold mb-3`}>{title}</h5>
      {children}
    </div>
  );
}
