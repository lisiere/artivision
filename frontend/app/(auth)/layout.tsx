import { Header } from "@/components/layout/Header";
import type { ReactNode } from "react";

export default function AuthLayout({ children }: { children: ReactNode }) {
  return (
    <>
      <Header />
      <main className="min-h-screen pb-16 pt-24 grad-mesh">{children}</main>
    </>
  );
}
