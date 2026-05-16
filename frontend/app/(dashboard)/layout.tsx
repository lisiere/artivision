import Link from "next/link";
import type { ReactNode } from "react";
import { DashboardSignOut } from "@/components/dashboard/DashboardSignOut";

const NAV = [
  { href: "/dashboard", label: "Vue d’ensemble" },
  { href: "/clients", label: "Clients" },
  { href: "/catalog", label: "Catalogue" },
  { href: "/propositions", label: "Propositions" },
  { href: "/settings", label: "Paramètres" },
];

export default function DashboardRootLayout({ children }: { children: ReactNode }) {
  return (
    <div className="flex min-h-dvh bg-[#f4f7fe]">
      <aside className="hidden w-60 shrink-0 flex-col border-r border-slate-200/80 bg-white/95 p-4 lg:flex">
        <Link href="/dashboard" className="mb-8 block px-2 text-lg font-black text-slate-900 no-underline">
          ArtiVision <span className="text-indigo-600">Pro</span>
        </Link>
        <nav className="flex flex-1 flex-col gap-1">
          {NAV.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="rounded-xl px-3 py-2.5 text-sm font-bold text-slate-700 no-underline transition hover:bg-indigo-50 hover:text-indigo-900"
            >
              {item.label}
            </Link>
          ))}
        </nav>
        <div className="mt-4 border-t border-slate-100 pt-4">
          <Link
            href="/artivision"
            className="mb-3 block rounded-xl px-3 py-2 text-xs font-semibold text-slate-500 no-underline hover:bg-slate-50 hover:text-slate-800"
          >
            ArtiVision
          </Link>
          <DashboardSignOut />
        </div>
      </aside>

      <div className="flex min-w-0 flex-1 flex-col">
        <header className="flex items-center justify-between border-b border-slate-200/80 bg-white/90 px-4 py-3 lg:hidden">
          <Link href="/dashboard" className="font-black text-slate-900 no-underline">
            ArtiVision
          </Link>
          <DashboardSignOut />
        </header>
        <main className="flex-1 p-4 sm:p-8">{children}</main>
      </div>
    </div>
  );
}
