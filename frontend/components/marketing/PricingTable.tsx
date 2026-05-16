"use client";
import { useState } from "react";
import { Check, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/Button";
import Link from "next/link";

const PLANS = [
  {
    name: "Free",
    tagline: "Pour découvrir",
    monthly: 0,
    yearly: 0,
    features: ["3 liens clients / mois", "1 spécialité", "Catalogue de prix éditable", "Branding ArtiVision visible"],
    cta: "Commencer",
    href: "/signup",
    featured: false,
  },
  {
    name: "Pro",
    tagline: "Pour l'activité quotidienne",
    monthly: 29,
    yearly: 23,
    features: ["50 liens clients / mois", "Spécialités illimitées", "Branding 100% personnalisé", "PDF exportable", "Statistiques de conversion", "Support prioritaire"],
    cta: "Choisir Pro",
    href: "/signup?plan=pro",
    featured: true,
  },
  {
    name: "Business",
    tagline: "Pour les équipes",
    monthly: 79,
    yearly: 63,
    features: ["Liens illimités", "Multi-utilisateurs", "Sous-domaine personnalisé", "API & intégrations", "Onboarding dédié"],
    cta: "Choisir Business",
    href: "/signup?plan=business",
    featured: false,
  },
];

export function PricingTable() {
  const [yearly, setYearly] = useState(false);

  return (
    <section className="pb-24 sm:pb-32">
      <div className="container">
        <div className="flex justify-center mb-12">
          <div className="inline-flex p-1 bg-bg-soft border border-border rounded-md">
            <button
              onClick={() => setYearly(false)}
              className={`px-5 py-2 text-sm font-medium rounded-sm transition-all ${!yearly ? "bg-bg-elev shadow-soft" : "text-text-soft"}`}
            >
              Mensuel
            </button>
            <button
              onClick={() => setYearly(true)}
              className={`px-5 py-2 text-sm font-medium rounded-sm transition-all flex items-center gap-2 ${yearly ? "bg-bg-elev shadow-soft" : "text-text-soft"}`}
            >
              Annuel
              <span className="text-[10px] font-semibold px-1.5 py-0.5 rounded-sm bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300">−20%</span>
            </button>
          </div>
        </div>

        <div className="grid md:grid-cols-3 gap-5">
          {PLANS.map((p) => {
            const price = yearly ? p.yearly : p.monthly;
            return (
              <div
                key={p.name}
                className={`relative p-8 rounded-xl border ${p.featured ? "border-brand-500 bg-bg-elev shadow-glow" : "border-border bg-bg-elev"}`}
              >
                {p.featured && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2 inline-flex items-center gap-1.5 px-3 py-1 grad-brand text-white text-xs font-semibold rounded-sm shadow-soft">
                    <Sparkles className="w-3 h-3" /> Le plus populaire
                  </div>
                )}
                <div className="mb-6">
                  <div className="font-display font-bold text-2xl">{p.name}</div>
                  <div className="text-sm text-text-soft mt-1">{p.tagline}</div>
                </div>
                <div className="mb-6 flex items-baseline gap-1">
                  <span className="font-display font-bold text-5xl">{price}</span>
                  <span className="text-text-soft">€ / mois HT</span>
                </div>
                <Link href={p.href}>
                  <Button variant={p.featured ? "gradient" : "outline"} size="lg" className="w-full mb-6">
                    {p.cta}
                  </Button>
                </Link>
                <ul className="space-y-3">
                  {p.features.map((f) => (
                    <li key={f} className="flex items-start gap-2.5 text-sm">
                      <Check className="w-4 h-4 text-brand-600 mt-0.5 shrink-0" />
                      <span>{f}</span>
                    </li>
                  ))}
                </ul>
              </div>
            );
          })}
        </div>

        <p className="text-center text-sm text-text-dim mt-10">
          Tous les prix sont indiqués HT. TVA française applicable selon votre situation.
        </p>
      </div>
    </section>
  );
}
