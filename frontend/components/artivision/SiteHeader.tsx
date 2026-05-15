import Link from "next/link";
import { Sparkles } from "lucide-react";

export function SiteHeader() {
  return (
    <header className="sticky top-0 z-50 border-b border-white/40 bg-[#f4f7fe]/80 px-3 py-3 shadow-sm backdrop-blur-xl sm:px-5 lg:px-8">
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 rounded-2xl border border-white/70 bg-white/90 px-4 py-3 shadow-card sm:rounded-3xl sm:px-5 sm:py-3.5 lg:px-6">
        <Link
          href="/"
          className="group flex min-w-0 items-center gap-2 rounded-xl no-underline outline-none ring-indigo-400/0 transition focus-visible:ring-2 focus-visible:ring-offset-2"
        >
          <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-blue-500 via-indigo-500 to-violet-600 text-lg shadow-glow sm:h-10 sm:w-10">
            <Sparkles className="h-4 w-4 text-white sm:h-[18px] sm:w-[18px]" strokeWidth={2.2} aria-hidden />
          </span>
          <span className="min-w-0 text-left">
            <span className="block truncate text-base font-extrabold tracking-tight sm:text-lg">
              <span className="bg-gradient-to-r from-blue-600 via-indigo-600 to-violet-600 bg-clip-text text-transparent">
                ArtiVision
              </span>
              <span className="ml-0.5 inline-block origin-center text-indigo-500 transition duration-300 group-hover:scale-110 group-hover:text-violet-500">
                ✨
              </span>
            </span>
            <span className="block text-[11px] font-medium text-slate-500 sm:text-xs">
              Votre chantier en image
            </span>
          </span>
        </Link>
        <span className="shrink-0 rounded-full bg-gradient-to-r from-indigo-600 to-violet-600 px-2.5 py-1.5 text-[10px] font-bold uppercase tracking-widest text-white shadow-md sm:px-3 sm:text-[11px]">
          IA v1
        </span>
      </div>
    </header>
  );
}
