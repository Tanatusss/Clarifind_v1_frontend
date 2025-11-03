"use client";
import type { PropsWithChildren, ReactNode } from "react";

export function DetailSection({
  icon,
  label,
  children,
  small = false,
}: PropsWithChildren<{ icon?: ReactNode; label: string; small?: boolean }>) {
  return (
    <div className={`${small ? "mb-2" : "mb-3"} text-slate-200`}>
      <div className="flex items-start gap-2">
        {icon ? <div className="mt-0.5">{icon}</div> : null}
        <div className="w-full">
          <div className="font-semibold">{label}</div>
          <div className="leading-relaxed">{children}</div>
        </div>
      </div>
    </div>
  );
}
