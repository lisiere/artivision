import type { ReactNode } from "react";
import { Suspense } from "react";

export default function AuthLayout({ children }: { children: ReactNode }) {
  return (
    <div className="flex min-h-dvh flex-col bg-[#f4f7fe] px-4 py-10">
      <Suspense
        fallback={
          <div className="mx-auto w-full max-w-lg flex-1 animate-pulse rounded-3xl border border-white/80 bg-white/60 p-12" />
        }
      >
        <div className="mx-auto w-full max-w-lg flex-1">{children}</div>
      </Suspense>
    </div>
  );
}
