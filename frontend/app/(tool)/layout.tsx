import { SiteHeader } from "@/components/artivision/SiteHeader";
import type { ReactNode } from "react";

export default function ToolLayout({ children }: { children: ReactNode }) {
  return (
    <>
      <SiteHeader />
      {children}
    </>
  );
}
