"use client";

import { useRouter } from "next/navigation";
import { useCallback, useState } from "react";
import { LogOut } from "lucide-react";
import { createBrowserSupabaseClient } from "@/lib/supabase/client";

export function DashboardSignOut() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const signOut = useCallback(async () => {
    setLoading(true);
    try {
      const supabase = createBrowserSupabaseClient();
      await supabase.auth.signOut();
      router.replace("/login");
      router.refresh();
    } finally {
      setLoading(false);
    }
  }, [router]);

  return (
    <button
      type="button"
      onClick={() => void signOut()}
      disabled={loading}
      className="flex w-full items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm font-bold text-slate-700 transition hover:bg-slate-50 disabled:opacity-50"
    >
      <LogOut className="h-4 w-4" aria-hidden />
      Déconnexion
    </button>
  );
}
