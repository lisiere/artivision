import type { ReactNode } from "react";

export default function ToolLayout({ children }: { children: ReactNode }) {
  return <div className="min-h-dvh bg-base">{children}</div>;
}
