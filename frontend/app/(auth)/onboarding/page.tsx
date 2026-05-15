"use client";

import type { CSSProperties } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCallback, useMemo, useState } from "react";
import { ChevronLeft, ChevronRight, Sparkles } from "lucide-react";
import { ONBOARDING_SPECIALTIES } from "@/lib/onboardingSpecialties";

const STEPS = 4;

export default function OnboardingPage() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [companyName, setCompanyName] = useState("");
  const [siret, setSiret] = useState("");
  const [city, setCity] = useState("");
  const [region, setRegion] = useState("");
  const [phone, setPhone] = useState("");
  const [contactEmail, setContactEmail] = useState("");
  const [specialties, setSpecialties] = useState<string[]>([]);
  const [primaryColor, setPrimaryColor] = useState("#0F172A");
  const [logoUrl, setLogoUrl] = useState("");

  const toggleSpec = useCallback((id: string) => {
    setSpecialties((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]));
  }, []);

  const progressPct = useMemo(() => Math.round((step / STEPS) * 100), [step]);

  const submitFinal = useCallback(async () => {
    setError(null);
    setLoading(true);
    try {
      const res = await fetch("/api/artisan/onboarding", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          company_name: companyName,
          siret: siret || undefined,
          specialties,
          primary_color: primaryColor,
          logo_url: logoUrl.trim() || null,
          phone: phone || null,
          city: city || null,
          region: region || null,
          email: contactEmail.trim() || undefined,
        }),
      });
      const body = (await res.json()) as { error?: string };
      if (!res.ok) {
        setError(body.error || "Échec enregistrement.");
        return;
      }
      router.replace("/dashboard");
      router.refresh();
    } catch {
      setError("Réseau ou serveur indisponible.");
    } finally {
      setLoading(false);
    }
  }, [city, companyName, contactEmail, logoUrl, phone, primaryColor, region, router, siret, specialties]);

  const next = useCallback(() => {
    setError(null);
    if (step === 1 && !companyName.trim()) {
      setError("Indiquez le nom de l’entreprise.");
      return;
    }
    if (step === 2 && specialties.length === 0) {
      setError("Choisissez au moins une spécialité.");
      return;
    }
    if (step === STEPS) {
      void submitFinal();
      return;
    }
    setStep((s) => Math.min(STEPS, s + 1));
  }, [companyName, specialties.length, step, submitFinal]);

  const back = useCallback(() => {
    setError(null);
    setStep((s) => Math.max(1, s - 1));
  }, []);

  return (
    <div className="rounded-3xl border border-white/80 bg-white/95 p-6 shadow-xl shadow-indigo-200/40 sm:p-10">
      <div className="mb-8 flex flex-wrap items-center justify-between gap-4">
        <Link href="/" className="inline-flex items-center gap-2 font-black text-slate-900 no-underline">
          <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-blue-600 to-violet-600 text-white shadow-md">
            <Sparkles className="h-5 w-5" aria-hidden />
          </span>
          ArtiVision
        </Link>
        <div className="text-right">
          <p className="text-[11px] font-bold uppercase tracking-widest text-indigo-600">
            Onboarding — étape {step}/{STEPS}
          </p>
          <div className="mt-2 h-2 w-40 overflow-hidden rounded-full bg-slate-100 sm:w-56">
            <div
              className="h-full rounded-full bg-gradient-to-r from-blue-600 to-violet-600 transition-all duration-300"
              style={{ width: `${progressPct}%` }}
            />
          </div>
        </div>
      </div>

      {step === 1 ? (
        <div className="space-y-4">
          <h1 className="text-xl font-black text-slate-900 sm:text-2xl">Votre entreprise</h1>
          <div>
            <label className="mb-1 block text-xs font-bold uppercase tracking-wider text-slate-500">
              Raison sociale *
            </label>
            <input
              value={companyName}
              onChange={(e) => setCompanyName(e.target.value)}
              className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm font-medium outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-400/30"
              placeholder="Ex. Rénov’Dupont SARL"
            />
          </div>
          <div>
            <label className="mb-1 block text-xs font-bold uppercase tracking-wider text-slate-500">SIRET</label>
            <input
              value={siret}
              onChange={(e) => setSiret(e.target.value)}
              className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm font-medium outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-400/30"
              placeholder="Optionnel"
            />
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="mb-1 block text-xs font-bold uppercase tracking-wider text-slate-500">Ville</label>
              <input
                value={city}
                onChange={(e) => setCity(e.target.value)}
                className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm font-medium outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-400/30"
              />
            </div>
            <div>
              <label className="mb-1 block text-xs font-bold uppercase tracking-wider text-slate-500">Région</label>
              <input
                value={region}
                onChange={(e) => setRegion(e.target.value)}
                className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm font-medium outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-400/30"
              />
            </div>
          </div>
          <div>
            <label className="mb-1 block text-xs font-bold uppercase tracking-wider text-slate-500">Téléphone</label>
            <input
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm font-medium outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-400/30"
            />
          </div>
          <div>
            <label className="mb-1 block text-xs font-bold uppercase tracking-wider text-slate-500">
              Email de contact affiché aux clients
            </label>
            <input
              type="email"
              value={contactEmail}
              onChange={(e) => setContactEmail(e.target.value)}
              className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm font-medium outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-400/30"
              placeholder="Par défaut : email du compte si vide"
            />
          </div>
        </div>
      ) : null}

      {step === 2 ? (
        <div className="space-y-4">
          <h1 className="text-xl font-black text-slate-900 sm:text-2xl">Vos spécialités</h1>
          <p className="text-sm font-medium text-slate-600">
            Utilisées pour personnaliser les templates catalogue (Sprint 2 — pour l’instant grille « default » à
            l’enregistrement).
          </p>
          <div className="grid gap-2 sm:grid-cols-2">
            {ONBOARDING_SPECIALTIES.map((s) => {
              const active = specialties.includes(s.id);
              return (
                <button
                  key={s.id}
                  type="button"
                  onClick={() => toggleSpec(s.id)}
                  className={`rounded-2xl border-2 px-4 py-3 text-left text-sm font-bold transition ${
                    active
                      ? "border-indigo-500 bg-indigo-50 text-indigo-900"
                      : "border-slate-200 bg-white text-slate-700 hover:border-slate-300"
                  }`}
                >
                  {s.label}
                </button>
              );
            })}
          </div>
        </div>
      ) : null}

      {step === 3 ? (
        <div className="space-y-4">
          <h1 className="text-xl font-black text-slate-900 sm:text-2xl">Catalogue & prix</h1>
          <p className="text-sm leading-relaxed text-slate-600">
            Nous pré-remplissons votre grille à partir des références nationales (conversion TTC→HT) déjà présentes dans le
            dépôt. Vous pourrez affiner chaque ligne dans{" "}
            <strong className="text-slate-800">Catalogue</strong> au sprint suivant.
          </p>
          <ul className="list-disc space-y-2 pl-5 text-sm font-medium text-slate-600">
            <li>Pièces : cuisine, salle de bain, salon, chambre, autre + zones techniques.</li>
            <li>Gammes : économique, standard, premium.</li>
          </ul>
        </div>
      ) : null}

      {step === 4 ? (
        <div className="space-y-4">
          <h1 className="text-xl font-black text-slate-900 sm:text-2xl">Branding lien client</h1>
          <div>
            <label className="mb-1 block text-xs font-bold uppercase tracking-wider text-slate-500">
              Couleur principale
            </label>
            <div className="flex items-center gap-3">
              <input
                type="color"
                value={primaryColor}
                onChange={(e) => setPrimaryColor(e.target.value)}
                className="h-12 w-16 cursor-pointer overflow-hidden rounded-xl border border-slate-200 bg-white p-1"
              />
              <span className="font-mono text-sm text-slate-600">{primaryColor}</span>
            </div>
          </div>
          <div>
            <label className="mb-1 block text-xs font-bold uppercase tracking-wider text-slate-500">
              URL du logo (optionnel)
            </label>
            <input
              value={logoUrl}
              onChange={(e) => setLogoUrl(e.target.value)}
              className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm font-medium outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-400/30"
              placeholder="https://… (upload Storage au sprint suivant)"
            />
          </div>
          <div
            className="rounded-2xl border border-slate-200 p-4"
            style={
              {
                borderColor: `${primaryColor}33`,
                background: `linear-gradient(135deg, ${primaryColor}14, transparent)`,
              } satisfies CSSProperties
            }
          >
            <p className="text-xs font-bold uppercase tracking-wider text-slate-500">Aperçu rapide</p>
            <p className="mt-2 text-lg font-black" style={{ color: primaryColor }}>
              {companyName || "Votre entreprise"}
            </p>
            <p className="mt-1 text-sm font-medium text-slate-600">
              Lien prospect : <span className="font-mono text-xs text-slate-500">/c/&lt;token&gt; — sprint 3</span>
            </p>
          </div>
        </div>
      ) : null}

      {error ? (
        <p className="mt-6 rounded-xl bg-red-50 px-3 py-2 text-sm font-medium text-red-700" role="alert">
          {error}
        </p>
      ) : null}

      <div className="mt-10 flex flex-wrap items-center justify-between gap-3">
        <button
          type="button"
          onClick={back}
          disabled={step <= 1 || loading}
          className="inline-flex items-center gap-1 rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-bold text-slate-700 transition hover:bg-slate-50 disabled:opacity-40"
        >
          <ChevronLeft className="h-4 w-4" aria-hidden />
          Retour
        </button>
        <button
          type="button"
          onClick={next}
          disabled={loading}
          className="inline-flex items-center gap-1 rounded-xl bg-gradient-to-br from-blue-600 via-indigo-600 to-violet-700 px-6 py-2.5 text-sm font-extrabold text-white shadow-glow-lg transition hover:brightness-110 disabled:opacity-60"
        >
          {step === STEPS ? (loading ? "Enregistrement…" : "Terminer") : "Suivant"}
          {step < STEPS ? <ChevronRight className="h-4 w-4" aria-hidden /> : null}
        </button>
      </div>
    </div>
  );
}
