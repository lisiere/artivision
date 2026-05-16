import { cn } from "@/lib/cn";
import * as React from "react";

export function Card({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div className={cn("rounded-lg border border-border bg-bg-elev shadow-soft", className)} {...props} />
  );
}
