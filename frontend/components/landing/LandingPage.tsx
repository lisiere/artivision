"use client";

import type { CSSProperties } from "react";
import Link from "next/link";
import {
  ArrowRight,
  Brain,
  Camera,
  CheckCircle2,
  FileX2,
  Mail,
  Sparkles,
  Zap,
} from "lucide-react";

const motionSafe =
  "motion-reduce:animate-none motion-reduce:transform-none motion-reduce:opacity-100";

const process = [
  { n: "01", Icon: Camera, title: "Saisie", line: "Photos chantier" },
  { n: "02", Icon: Brain, title: "Analyse", line: "Espace & matériaux" },
  { n: "03", Icon: Sparkles, title: "Sortie", line: "Rendu + fourchette" },
] as const;

export function LandingPage() {
  return (
    <div className="relative min-h-dvh overflow-x-hidden">
      <main className="relative mx-auto max-w-6xl px-4 pb-10 pt-4 sm:px-6 sm:pb-14 sm:pt-6 lg:px-8">
        <div
          className={`pointer-events-none absolute -left-20 top-16 h-72 w-72 rounded-full bg-indigo-400/20 blur-3xl motion-safe:animate-blob-drift ${motionSafe}`}
          aria-hidden
        />
        <div
          className={`pointer-events-none absolute -right-24 top-32 h-64 w-64 rounded-full bg-violet-400/15 blur-3xl motion-safe:animate-blob-drift motion-safe:[animation-delay:-5s] ${motionSafe}`}
          aria-hidden
        />

        <section className="relative mx-auto max-w-4xl">
          <div
            className={`relative overflow-hidden rounded-3xl border border-slate-200/90 bg-white/95 p-5 shadow-card backdrop-blur-sm sm:p-8 motion-safe:animate-fade-up ${motionSafe}`}
          >
            <div
              className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-blue-500 via-indigo-500 to-violet-600"
              aria-hidden
            />
            <div
              className="pointer-events-none absolute -right-16 top-24 h-40 w-40 rounded-full bg-indigo-400/10 blur-2xl"
              aria-hidden
            />

            <p className="text-center text-[11px] font-bold uppercase tracking-[0.28em] text-indigo-600">
              Rénovation · second œuvre
            </p>

            <h1 className="mx-auto mt-4 max-w-[20rem] text-balance text-center text-[1.55rem] font-extrabold leading-snug tracking-tight text-slate-900 sm:max-w-2xl sm:text-3xl sm:leading-tight">
              Ce que le client voit,{" "}
              <span className="bg-gradient-to-r from-blue-600 via-indigo-600 to-violet-600 bg-clip-text text-transparent">
                ce que vous chiffrez.
              </span>
            </h1>

            <p className="mx-auto mt-3 max-w-lg text-balance text-center text-[13px] font-medium leading-relaxed text-slate-600 sm:text-sm">
              Projection et fourchette à partir du terrain — pour vendre sans alourdir le discours.
            </p>

            <div className="mt-6 rounded-2xl border border-indigo-100/90 bg-gradient-to-br from-slate-50/90 via-white to-indigo-50/50 p-4 sm:p-6">
              <div className="grid grid-cols-3 divide-x divide-indigo-100/90">
                {process.map(({ n, Icon, title, line }, i) => (
                  <div
                    key={n}
                    className={`flex min-h-[7.5rem] flex-col items-center justify-between px-2 py-1 text-center sm:min-h-[8.25rem] sm:px-4 motion-safe:animate-reveal ${motionSafe}`}
                    style={{ animationDelay: `${i * 50}ms` } as CSSProperties}
                  >
                    <div className="flex w-full flex-col items-center">
                      <span className="font-mono text-[9px] font-bold tracking-wider text-indigo-400 sm:text-[10px]">
                        {n}
                      </span>
                      <div className="mt-2 rounded-full bg-gradient-to-br from-blue-500 via-indigo-500 to-violet-600 p-px shadow-sm sm:mt-2.5">
                        <div className="flex h-9 w-9 items-center justify-center rounded-full bg-white sm:h-10 sm:w-10">
                          <Icon className="h-4 w-4 text-indigo-600 sm:h-[18px] sm:w-[18px]" strokeWidth={1.85} aria-hidden />
                        </div>
                      </div>
                    </div>
                    <div className="mt-5 flex w-full flex-col items-center gap-1 sm:mt-6">
                      <p className="text-[11px] font-bold leading-snug text-slate-900 sm:text-xs">{title}</p>
                      <p className="max-w-[6.5rem] text-[10px] font-medium leading-snug text-slate-500 sm:max-w-none sm:text-[11px]">
                        {line}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:justify-center sm:gap-4">
              <Link
                href="/signup"
                className="inline-flex h-12 flex-1 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-600 via-indigo-600 to-violet-700 text-sm font-extrabold text-white no-underline shadow-glow-lg transition hover:brightness-110 sm:flex-none sm:min-w-[200px]"
              >
                Accès professionnel
              </Link>
              <Link
                href="/artivision"
                className="inline-flex h-12 flex-1 items-center justify-center rounded-2xl border-2 border-indigo-200 bg-white text-sm font-extrabold text-indigo-800 no-underline shadow-sm transition hover:bg-indigo-50/80 sm:flex-none sm:min-w-[180px]"
              >
                ArtiVision
              </Link>
            </div>

            <Link
              href="#methode"
              className="group mx-auto mt-5 flex w-fit items-center gap-1.5 text-xs font-bold text-indigo-600 no-underline transition hover:text-violet-700"
            >
              Détail du flux
              <ArrowRight className="h-3.5 w-3.5 transition group-hover:translate-x-0.5" strokeWidth={2.4} aria-hidden />
            </Link>
          </div>
        </section>

        <section id="methode" className="scroll-mt-24 pt-10 sm:pt-12">
          <div className="flex flex-wrap items-end justify-between gap-3 border-b border-slate-200/80 pb-3">
            <h2 className="text-xs font-bold uppercase tracking-[0.2em] text-indigo-600">Méthode</h2>
            <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">3 temps</p>
          </div>
          <div className="mt-5 grid gap-3 sm:grid-cols-3 sm:gap-4">
            {[
              {
                icon: Camera,
                title: "Contexte figé",
                desc: "Plusieurs angles d’une même pièce pour une lecture fiable.",
              },
              {
                icon: Brain,
                title: "Lecture structurée",
                desc: "Typologie et matériaux pour cadrer la projection.",
              },
              {
                icon: Sparkles,
                title: "Livrable client",
                desc: "Rendu et ordre de grandeur alignés sur votre grille.",
              },
            ].map(({ icon: Icon, title, desc }, i) => (
              <article
                key={title}
                className={`rounded-3xl border border-slate-200/90 bg-white/95 p-4 shadow-card transition hover:border-indigo-200/80 hover:shadow-card-hover motion-safe:animate-reveal ${motionSafe}`}
                style={{ animationDelay: `${i * 60}ms` } as CSSProperties}
              >
                <Icon className="h-5 w-5 text-indigo-600" strokeWidth={1.85} aria-hidden />
                <h3 className="mt-3 text-sm font-extrabold text-slate-900">{title}</h3>
                <p className="mt-1.5 text-xs font-medium leading-relaxed text-slate-600">{desc}</p>
              </article>
            ))}
          </div>
        </section>

        <section className="pt-9 sm:pt-11">
          <div className="relative overflow-hidden rounded-3xl border border-indigo-500/25 bg-gradient-to-br from-slate-950 via-indigo-950 to-violet-950 px-5 py-6 shadow-glow-lg sm:px-7 sm:py-7">
            <div
              className="pointer-events-none absolute -right-20 -top-20 h-56 w-56 rounded-full bg-indigo-500/25 blur-3xl"
              aria-hidden
            />
            <div
              className="pointer-events-none absolute -bottom-16 -left-12 h-48 w-48 rounded-full bg-violet-600/20 blur-3xl"
              aria-hidden
            />
            <div className="relative grid gap-6 sm:grid-cols-3 sm:gap-5">
              {[
                { icon: FileX2, title: "Temps", text: "Moins d’allers-retours avant l’offre." },
                { icon: CheckCircle2, title: "Clarté", text: "Ambition et ordre de grandeur visibles." },
                { icon: Zap, title: "Image", text: "Présentation à la hauteur de votre marque." },
              ].map(({ icon: Icon, title, text }) => (
                <div key={title} className="text-left">
                  <Icon className="h-5 w-5 text-indigo-300" strokeWidth={1.85} aria-hidden />
                  <h3 className="mt-3 text-sm font-extrabold text-white">{title}</h3>
                  <p className="mt-1 text-xs font-medium leading-relaxed text-slate-400">{text}</p>
                </div>
              ))}
            </div>
          </div>
        </section>
      </main>

      <footer className="mx-auto mt-4 max-w-6xl border-t border-white/50 px-4 py-6 sm:px-6 lg:px-8">
        <div className="flex flex-col items-center justify-between gap-4 text-center sm:flex-row sm:text-left">
          <p className="text-xs font-medium text-slate-500">© {new Date().getFullYear()} ArtiVision</p>
          <a
            href="mailto:contact@artivision.app"
            className="inline-flex items-center gap-1.5 text-xs font-bold text-indigo-700 no-underline hover:text-violet-700"
          >
            <Mail className="h-3.5 w-3.5 text-indigo-400" strokeWidth={2} aria-hidden />
            contact@artivision.app
          </a>
          <Link
            href="/mentions-legales"
            className="text-xs font-bold text-slate-600 no-underline hover:text-indigo-700"
          >
            Mentions légales
          </Link>
        </div>
      </footer>
    </div>
  );
}
