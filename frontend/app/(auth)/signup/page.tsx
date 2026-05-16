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
    <div className="container max-w-md py-12">
      <div className="rounded-xl border border-border bg-bg-elev p-8 shadow-lg sm:p-10">
        <div className="mb-8 text-center">
          <Link href="/" className="inline-flex items-center gap-2 font-display font-bold text-text no-underline">
            <span className="flex h-10 w-10 items-center justify-center rounded-md grad-brand text-white shadow-glow">
              <Sparkles className="h-5 w-5" aria-hidden />
            </span>
            ArtiVision
          </Link>
          <h1 className="mt-6 font-display text-3xl font-bold">Créer votre compte</h1>
          <p className="mt-2 text-sm text-text-soft">Espace pro — onboarding après inscription</p>
        </div>

        <form onSubmit={onSubmit} className="space-y-4">
          <div>
            <label htmlFor="email" className="mb-2 block text-sm font-medium">
              Email pro
            </label>
            <input
              id="email"
              type="email"
              autoComplete="email"
              required
              value={email}
              onChange={(ev) => setEmail(ev.target.value)}
              placeholder="vous@entreprise.fr"
              className="h-11 w-full rounded border border-border bg-surface px-4 text-sm outline-none transition focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20"
            />
          </div>
          <div>
            <label htmlFor="password" className="mb-2 block text-sm font-medium">
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
              className="h-11 w-full rounded border border-border bg-surface px-4 text-sm outline-none transition focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20"
            />
            <p className="mt-1 text-xs text-text-dim">Au moins 8 caractères.</p>
          </div>
          {error ? (
            <p
              className="rounded-lg bg-red-500/10 px-3 py-2 text-sm font-medium text-red-600 dark:text-red-400"
              role="alert"
            >
              {error}
            </p>
          ) : null}
          {info ? (
            <p className="rounded-lg bg-brand-50 px-3 py-2 text-sm font-medium text-brand-700 dark:bg-brand-900/30 dark:text-brand-300" role="status">
              {info}
            </p>
          ) : null}
          <button
            type="submit"
            disabled={loading}
            className="grad-brand h-12 w-full rounded-lg text-sm font-semibold text-white shadow-glow transition hover:shadow-lg disabled:opacity-60"
          >
            {loading ? "Création…" : "Continuer"}
          </button>
        </form>

        <p className="mt-8 text-center text-sm text-text-soft">
          Déjà inscrit ?{" "}
          <Link href="/login" className="font-semibold text-brand-600 hover:underline">
            Se connecter
          </Link>
        </p>
      </div>
    </div>
  );
}
