"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import { ArrowLeft, Download, ImageIcon, Sparkles, Wand2 } from "lucide-react";
import { formatEur } from "@/lib/format";
import { downloadDevisDraft, type DevisStored } from "@/lib/devisExport";

const STORAGE_KEY = "renov_chantier_result_v1";

type SessionV1 = {
  version: 1;
  originalPreviewJpeg: string;
  projectionUrl: string;
  quoteLow: number;
  quoteHigh: number;
  roomLabel: string;
  areaM2: number;
  materials?: string[];
};

type SessionV2 = Omit<SessionV1, "version"> & {
  version: 2;
  qualityTier: string;
  qualityLabel: string;
  comparisonTiers: { tier: string; label: string; lowHt: number; highHt: number }[];
};

type SessionData = SessionV1 | SessionV2;

function isSessionV2(d: SessionData): d is SessionV2 {
  return d.version === 2;
}

function toDevisStored(d: SessionData): DevisStored {
  if (isSessionV2(d)) {
    return {
      version: 2,
      roomLabel: d.roomLabel,
      areaM2: d.areaM2,
      quoteLow: d.quoteLow,
      quoteHigh: d.quoteHigh,
      materials: d.materials,
      qualityTier: d.qualityTier,
      qualityLabel: d.qualityLabel,
      comparisonTiers: d.comparisonTiers,
    };
  }
  return {
    version: 1,
    roomLabel: d.roomLabel,
    areaM2: d.areaM2,
    quoteLow: d.quoteLow,
    quoteHigh: d.quoteHigh,
    materials: d.materials,
  };
}

export default function ResultPage() {
  const router = useRouter();
  const [data, setData] = useState<SessionData | null>(null);

  useEffect(() => {
    const raw = sessionStorage.getItem(STORAGE_KEY);
    if (!raw) {
      router.replace("/artivision");
      return;
    }
    try {
      const parsed = JSON.parse(raw) as SessionData;
      if (!parsed.projectionUrl || (parsed.version !== 1 && parsed.version !== 2)) {
        router.replace("/artivision");
        return;
      }
      setData(parsed);
    } catch {
      router.replace("/artivision");
    }
  }, [router]);

  const onExport = useCallback(() => {
    if (!data) return;
    downloadDevisDraft(toDevisStored(data));
  }, [data]);

  if (!data) {
    return (
      <main className="flex min-h-[45vh] items-center justify-center px-4">
        <div className="flex items-center gap-2 rounded-full border border-indigo-100 bg-white/90 px-4 py-2 text-sm font-semibold text-indigo-700 shadow-card">
          <Wand2 className="h-4 w-4 animate-pulse" strokeWidth={2.2} aria-hidden />
          Chargement de votre vision…
        </div>
      </main>
    );
  }

  const band = `Entre ${formatEur(data.quoteLow)} et ${formatEur(data.quoteHigh)} HT`;

  return (
    <main className="relative pb-20 pt-2 sm:pt-4 lg:pb-28 lg:pt-8">
      <div
        className="pointer-events-none absolute -left-16 top-40 h-48 w-48 rounded-full bg-violet-300/20 blur-3xl lg:left-[10%] lg:top-32 lg:h-72 lg:w-72 lg:bg-violet-400/15"
        aria-hidden
      />
      <div
        className="pointer-events-none absolute right-0 top-[55%] h-56 w-56 translate-x-1/4 rounded-full bg-indigo-300/15 blur-3xl lg:right-[6%] lg:top-1/3 lg:h-80 lg:w-80"
        aria-hidden
      />

      <div className="relative mx-auto w-full max-w-7xl px-4 sm:px-5 lg:px-10">
        <Link
          href="/artivision"
          className="mb-6 inline-flex items-center gap-2 rounded-xl border border-white/80 bg-white/90 px-3 py-2 text-sm font-bold text-indigo-700 shadow-sm no-underline transition hover:border-indigo-200 hover:bg-indigo-50/80 focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-400 focus-visible:ring-offset-2"
        >
          <ArrowLeft className="h-4 w-4" strokeWidth={2.2} aria-hidden />
          L&apos;outil
        </Link>

        <div className="grid gap-8 lg:grid-cols-12 lg:gap-10 lg:items-start">
          <div className="space-y-6 lg:col-span-7">
            <div className="mb-3 flex flex-wrap items-center gap-2">
              {isSessionV2(data) ? (
                <span className="rounded-full bg-gradient-to-r from-indigo-600 to-violet-600 px-3 py-1 text-xs font-bold uppercase tracking-wide text-white shadow-md">
                  Gamme : {data.qualityLabel}
                </span>
              ) : null}
            </div>

            <h1 className="text-balance text-center text-2xl font-extrabold tracking-tight text-slate-900 sm:text-3xl lg:text-left lg:text-4xl">
              <span className="bg-gradient-to-r from-blue-600 via-indigo-600 to-violet-600 bg-clip-text text-transparent">
                Projection & chiffrage
              </span>
            </h1>
            <p className="text-center text-sm font-medium leading-relaxed text-slate-600 lg:text-left lg:text-base">
              {data.roomLabel} — {data.areaM2} m². Fourchette indicative, TVA non incluse.
            </p>

            <section className="relative grid gap-5 sm:grid-cols-2 lg:gap-6">
              <figure className="overflow-hidden rounded-[1.5rem] border border-white/90 bg-white shadow-card sm:rounded-[1.75rem]">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  className="aspect-[4/3] w-full object-cover lg:aspect-[16/10]"
                  src={data.originalPreviewJpeg}
                  alt="Photo chantier d'origine"
                />
                <figcaption className="flex items-center gap-2 border-t border-slate-100 bg-slate-50/80 px-4 py-3 text-[11px] font-bold uppercase tracking-widest text-slate-500">
                  <ImageIcon className="h-4 w-4 text-indigo-500" strokeWidth={2} aria-hidden />
                  Photo chantier
                </figcaption>
              </figure>
              <figure className="overflow-hidden rounded-[1.5rem] border border-indigo-100/80 bg-gradient-to-b from-white to-violet-50/50 shadow-card sm:rounded-[1.75rem]">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  className="aspect-[4/3] w-full object-cover lg:aspect-[16/10]"
                  src={data.projectionUrl}
                  alt="Projection rénovée générée"
                />
                <figcaption className="flex items-center gap-2 border-t border-indigo-100 bg-white/90 px-4 py-3 text-[11px] font-bold uppercase tracking-widest text-indigo-600">
                  <Sparkles className="h-4 w-4" strokeWidth={2} aria-hidden />
                  Projection ({isSessionV2(data) ? data.qualityLabel : "visuelle"})
                </figcaption>
              </figure>
            </section>

            {data.materials && data.materials.length > 0 ? (
              <section className="relative overflow-hidden rounded-[1.75rem] border border-violet-100 bg-gradient-to-br from-white to-violet-50/40 p-5 shadow-card sm:rounded-[2rem] lg:p-6">
                <h2 className="mb-2 flex items-center gap-2 text-xs font-bold uppercase tracking-[0.18em] text-violet-700">
                  <Sparkles className="h-4 w-4" strokeWidth={2} aria-hidden />
                  Éléments repérés
                </h2>
                <p className="text-sm font-medium text-slate-700 lg:text-base">{data.materials.join(" · ")}</p>
              </section>
            ) : null}
          </div>

          <aside className="space-y-5 lg:col-span-5 lg:rounded-3xl lg:border lg:border-slate-200/70 lg:bg-white/90 lg:p-6 lg:shadow-card lg:backdrop-blur-md xl:sticky xl:top-24 xl:max-h-[calc(100dvh-7rem)] xl:overflow-y-auto">
            <section className="relative overflow-hidden rounded-[1.75rem] border border-white/80 bg-white/95 p-6 shadow-card sm:rounded-[2rem] sm:p-8 lg:rounded-2xl lg:border-0 lg:bg-transparent lg:p-0 lg:shadow-none">
              <div className="pointer-events-none absolute -right-8 top-0 h-28 w-28 rounded-full bg-indigo-200/40 blur-2xl lg:hidden" />
              <p className="relative text-center text-2xl font-black tracking-tight text-slate-900 sm:text-3xl lg:text-left">
                {band}
              </p>
              <p className="relative mt-3 text-center text-sm font-medium text-slate-500 lg:text-left">
                Image générée à partir de votre cliché.
              </p>
            </section>

            {isSessionV2(data) ? (
              <section className="relative overflow-hidden rounded-[1.75rem] border border-indigo-100 bg-white/95 p-5 shadow-card sm:rounded-[2rem] lg:rounded-2xl lg:border-slate-200/80 lg:bg-white/80 lg:p-5">
                <h2 className="text-xs font-bold uppercase tracking-[0.18em] text-indigo-600">Comparatif gammes</h2>
                <p className="mt-1 text-xs text-slate-500">
                  Même pièce et surface — aide le client à comparer avant de figer le devis.
                </p>
                <div className="mt-4 overflow-x-auto rounded-xl border border-slate-100">
                  <table className="w-full min-w-[280px] text-left text-sm">
                    <thead>
                      <tr className="border-b border-slate-100 bg-slate-50/80 text-xs font-bold uppercase tracking-wider text-slate-500">
                        <th className="px-3 py-2">Gamme</th>
                        <th className="px-3 py-2">Fourchette HT</th>
                      </tr>
                    </thead>
                    <tbody>
                      {data.comparisonTiers.map((row) => {
                        const sel = row.tier === data.qualityTier;
                        return (
                          <tr
                            key={row.tier}
                            className={[
                              "border-b border-slate-50 last:border-0",
                              sel ? "bg-indigo-50/90 font-semibold text-indigo-900" : "text-slate-700",
                            ].join(" ")}
                          >
                            <td className="px-3 py-2.5">{row.label}</td>
                            <td className="px-3 py-2.5 tabular-nums">
                              {formatEur(row.lowHt)} — {formatEur(row.highHt)}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </section>
            ) : null}

            <div className="space-y-4">
              <button
                type="button"
                onClick={onExport}
                className="flex min-h-[52px] w-full items-center justify-center gap-2 rounded-2xl bg-gradient-to-br from-blue-600 via-indigo-600 to-violet-700 px-4 text-sm font-extrabold text-white shadow-glow-lg transition hover:brightness-110 focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-400 focus-visible:ring-offset-2 sm:rounded-3xl"
              >
                <Download className="h-4 w-4 shrink-0" strokeWidth={2.2} aria-hidden />
                Exporter brouillon devis (.txt)
              </button>

              <div className="relative">
                <div className="pointer-events-none absolute -inset-0.5 rounded-3xl bg-gradient-to-r from-indigo-500 to-violet-600 opacity-25 blur-md" />
                <Link
                  href="/artivision"
                  className="relative flex min-h-[48px] w-full items-center justify-center rounded-2xl border-2 border-indigo-100 bg-white py-3 text-center text-sm font-extrabold text-indigo-700 shadow-sm no-underline transition hover:border-indigo-200 hover:bg-indigo-50/90 sm:rounded-3xl"
                >
                  Nouvelle estimation
                </Link>
              </div>
            </div>
          </aside>
        </div>
      </div>
    </main>
  );
}
