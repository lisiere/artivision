"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCallback, useState } from "react";
import { Sparkles } from "lucide-react";
import { createBrowserSupabaseClient } from "@/lib/supabase/client";

export default function SignupPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [info, setInfo] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const onSubmit = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();
      setError(null);
      setInfo(null);
      setLoading(true);
      try {
        const supabase = createBrowserSupabaseClient();
        const origin = typeof window !== "undefined" ? window.location.origin : "";
        const { data, error: signErr } = await supabase.auth.signUp({
          email: email.trim(),
          password,
          options: {
            emailRedirectTo: origin ? `${origin}/login` : undefined,
          },
        });
        if (signErr) {
          setError(signErr.message);
          return;
        }
        if (data.session) {
          router.push("/onboarding");
          router.refresh();
          return;
        }
        setInfo("Consultez votre boîte mail pour confirmer le compte, puis connectez-vous.");
        router.push("/login");
      } catch {
        setError("Inscription impossible.");
      } finally {
        setLoading(false);
      }
    },
    [email, password, router],
  );

  return (
    <div className="rounded-3xl border border-white/80 bg-white/95 p-8 shadow-xl shadow-indigo-200/40">
      <div className="mb-8 text-center">
        <Link href="/" className="inline-flex items-center gap-2 font-black text-slate-900 no-underline">
          <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-blue-600 to-violet-600 text-white shadow-md">
            <Sparkles className="h-5 w-5" aria-hidden />
          </span>
          ArtiVision
        </Link>
        <h1 className="mt-6 text-2xl font-black text-slate-900">Créer mon espace</h1>
        <p className="mt-2 text-sm font-medium text-slate-600">SaaS artisans — sprint onboarding après inscription.</p>
      </div>

      <form onSubmit={onSubmit} className="space-y-4">
        <div>
          <label htmlFor="email" className="mb-1 block text-xs font-bold uppercase tracking-wider text-slate-500">
            Email pro
          </label>
          <input
            id="email"
            type="email"
            autoComplete="email"
            required
            value={email}
            onChange={(ev) => setEmail(ev.target.value)}
            className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm font-medium outline-none ring-indigo-400/0 transition focus:border-indigo-400 focus:ring-2 focus:ring-indigo-400/30"
          />
        </div>
        <div>
          <label htmlFor="password" className="mb-1 block text-xs font-bold uppercase tracking-wider text-slate-500">
            Mot de passe
          </label>
          <input
            id="password"
            type="password"
            autoComplete="new-password"
            required
            minLength={8}
            value={password}
            onChange={(ev) => setPassword(ev.target.value)}
            className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm font-medium outline-none ring-indigo-400/0 transition focus:border-indigo-400 focus:ring-2 focus:ring-indigo-400/30"
          />
          <p className="mt-1 text-xs text-slate-500">Au moins 8 caractères.</p>
        </div>
        {error ? (
          <p className="rounded-xl bg-red-50 px-3 py-2 text-sm font-medium text-red-700" role="alert">
            {error}
          </p>
        ) : null}
        {info ? (
          <p className="rounded-xl bg-indigo-50 px-3 py-2 text-sm font-medium text-indigo-800" role="status">
            {info}
          </p>
        ) : null}
        <button
          type="submit"
          disabled={loading}
          className="w-full rounded-xl bg-gradient-to-br from-blue-600 via-indigo-600 to-violet-700 py-3.5 text-sm font-extrabold text-white shadow-glow-lg transition hover:brightness-110 disabled:opacity-60"
        >
          {loading ? "Création…" : "Continuer"}
        </button>
      </form>

      <p className="mt-8 text-center text-sm font-medium text-slate-600">
        Déjà inscrit ?{" "}
        <Link href="/login" className="font-bold text-indigo-700 no-underline hover:underline">
          Se connecter
        </Link>
      </p>
    </div>
  );
}
