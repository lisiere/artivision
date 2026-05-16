"use client";
import Link from "next/link";
import { Sparkles, Menu, X } from "lucide-react";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/Button";
import { ThemeToggle } from "@/components/ui/ThemeToggle";
import { cn } from "@/lib/cn";

const NAV = [
  { href: "/methode",  label: "Méthode" },
  { href: "/pricing",  label: "Tarifs" },
  { href: "/demo",     label: "Démo" },
];

export function Header() {
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header className={cn(
      "fixed top-0 inset-x-0 z-50 transition-all duration-300",
      scrolled ? "py-2" : "py-4"
    )}>
      <div className="container">
        <nav className={cn(
          "flex items-center justify-between px-4 sm:px-5 py-2.5 rounded-xl transition-all",
          scrolled ? "glass shadow-soft" : "bg-transparent"
        )}>
          <Link href="/" className="flex items-center gap-2.5 group">
            <div className="relative w-9 h-9 rounded-md grad-brand grid place-items-center shadow-glow">
              <Sparkles className="w-5 h-5 text-white" />
            </div>
            <div className="leading-none">
              <div className="font-display font-bold text-base">ArtiVision</div>
              <div className="text-[10px] text-text-dim tracking-wide">VOTRE CHANTIER EN IMAGE</div>
            </div>
          </Link>

          <div className="hidden md:flex items-center gap-1">
            {NAV.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="px-4 py-2 text-sm font-medium text-text-soft hover:text-text rounded-sm hover:bg-surface transition-colors"
              >
                {item.label}
              </Link>
            ))}
          </div>

          <div className="flex items-center gap-2">
            <ThemeToggle />
            <Link href="/login" className="hidden sm:inline-flex">
              <Button variant="ghost" size="sm">Connexion</Button>
            </Link>
            <Link href="/signup">
              <Button variant="gradient" size="sm" className="hidden sm:inline-flex">
                Accès pro
              </Button>
            </Link>
            <button
              className="md:hidden p-2 rounded-sm hover:bg-surface"
              onClick={() => setOpen(!open)}
              aria-label="Menu"
            >
              {open ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </nav>

        {/* Menu mobile */}
        {open && (
          <div className="md:hidden mt-2 glass rounded-lg p-3 shadow-lg animate-in slide-in-from-top-2 fade-in duration-200">
            {NAV.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="block px-4 py-3 text-sm font-medium hover:bg-surface rounded-sm"
                onClick={() => setOpen(false)}
              >
                {item.label}
              </Link>
            ))}
            <div className="grid grid-cols-2 gap-2 mt-2 pt-2 border-t border-border">
              <Link href="/login"><Button variant="outline" size="sm" className="w-full">Connexion</Button></Link>
              <Link href="/signup"><Button variant="gradient" size="sm" className="w-full">Accès pro</Button></Link>
            </div>
          </div>
        )}
      </div>
    </header>
  );
}
