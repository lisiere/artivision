import { cn } from "@/lib/cn";
import type { ReactNode } from "react";

export function Badge({ className, children }: { className?: string; children: ReactNode }) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-sm border border-brand-100 bg-brand-50 px-3 py-1 text-xs font-medium text-brand-700 dark:border-brand-800/40 dark:bg-brand-900/30 dark:text-brand-300",
        className,
      )}
    >
      {children}
    </span>
  );
}
