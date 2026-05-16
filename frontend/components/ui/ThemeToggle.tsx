"use client";

import { Moon, Sun } from "lucide-react";
import { useTheme } from "next-themes";
import { useEffect, useState } from "react";

export function ThemeToggle() {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  if (!mounted) return <div className="h-10 w-10" aria-hidden />;
  const isDark = theme === "dark";
  return (
    <button
      type="button"
      onClick={() => setTheme(isDark ? "light" : "dark")}
      aria-label="Changer de thème"
      className="relative grid h-10 w-10 place-items-center rounded-full text-text-soft transition-colors hover:bg-surface hover:text-text"
    >
      <Sun
        className={`absolute h-5 w-5 transition-all ${isDark ? "scale-0 rotate-90" : "scale-100 rotate-0"}`}
      />
      <Moon
        className={`absolute h-5 w-5 transition-all ${isDark ? "scale-100 rotate-0" : "scale-0 -rotate-90"}`}
      />
    </button>
  );
}
