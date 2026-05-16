"use client";

import { useRouter } from "next/navigation";
import { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";
import {
  Bath,
  Bed,
  Camera,
  ChefHat,
  Download,
  Focus,
  Home,
  ImagePlus,
  Layers,
  Loader2,
  Plus,
  RefreshCw,
  Sofa,
  Sparkles,
  Trash2,
  Wand2,
  X,
} from "lucide-react";
import { analyzeImages, fetchAppContext, fetchQuote } from "@/lib/api";
import { downloadDevisDraft, type DevisStored } from "@/lib/devisExport";
import { formatEur } from "@/lib/format";
import { resizeImageToJpegDataUrl } from "@/lib/resizeImage";

const STORAGE_KEY = "renov_chantier_result_v1";
const MAX_PHOTOS_PER_ROOM = 8;
const MAX_ROOMS = 6;

const FALLBACK_TIERS: { id: string; label: string; hint: string }[] = [
  {
    id: "economique",
    label: "Économique",
    hint: "Finitions correctes, matériaux entrée de gamme, budget maîtrisé.",
  },
  {
    id: "standard",
    label: "Standard",
    hint: "Bon rapport qualité / prix, finitions contemporaines durables.",
  },
  {
    id: "premium",
    label: "Haut de gamme",
    hint: "Finitions premium, détails soignés, image forte pour convaincre le client.",
  },
];

const ROOM_OPTIONS = [
  { value: "cuisine", label: "Cuisine", emoji: "🍳", Icon: ChefHat, tint: "from-amber-400/20 to-orange-500/10" },
  {
    value: "salle_de_bain",
    label: "Salle de bain",
    emoji: "🛁",
    Icon: Bath,
    tint: "from-sky-400/20 to-cyan-500/10",
  },
  { value: "salon", label: "Salon", emoji: "🛋️", Icon: Sofa, tint: "from-violet-400/20 to-purple-500/10" },
  { value: "chambre", label: "Chambre", emoji: "🛏️", Icon: Bed, tint: "from-pink-400/20 to-rose-500/10" },
  { value: "autre", label: "Autre", emoji: "🏠", Icon: Home, tint: "from-emerald-400/20 to-teal-500/10" },
] as const;

type RoomValue = (typeof ROOM_OPTIONS)[number]["value"];
type QualityTierId = "economique" | "standard" | "premium";

type ReplicateTierKey = "eco" | "standard" | "premium";

function replicateRoomTypeFromRoomValue(r: RoomValue): string {
  if (r === "autre") return "salon";
  return r;
}

function quoteTierFromReplicateKey(k: ReplicateTierKey): QualityTierId {
  if (k === "eco") return "economique";
  if (k === "premium") return "premium";
  return "standard";
}

function replicateKeyFromQuoteTier(q: QualityTierId): ReplicateTierKey {
  if (q === "economique") return "eco";
  if (q === "premium") return "premium";
  return "standard";
}

type GenerateAnalysisPayload = {
  suggested_room_type: string;
  materials: string[];
  short_notes_fr: string;
  prompt_anchor_en: string;
  negative_extra_en: string;
};

type PhotoEntry = { id: string; file: File; previewUrl: string };
type ResultModalData = {
  materials: string[];
  areaM2: number;
  roomLabel: string;
  originalPreviewJpeg: string;
  tier: ReplicateTierKey;
  qualityTier: QualityTierId;
  qualityLabel: string;
  quoteLow: number;
  quoteHigh: number;
  comparisonTiers: { tier: string; label: string; lowHt: number; highHt: number }[];
  imageUrl: string | null;
  genError: string | null;
  imageDataUrl: string;
  replicateRoomType: string;
  roomTypeResolved: RoomValue;
  generateContext: { analysis: GenerateAnalysisPayload };
};
type RoomSlot = {
  id: string;
  roomType: RoomValue;
  areaM2: number;
  qualityTier: QualityTierId;
  /** Gamme choisie pour chiffrer + générer (obligatoire avant le bouton). */
  projectionTier: ReplicateTierKey | null;
  photos: PhotoEntry[];
  materials: string[];
  /** True après une analyse réussie pour le jeu de photos actuel (les matériaux peuvent être vides). */
  analysisCompleted: boolean;
};

const AREA_MIN = 4;
const AREA_MAX = 120;

function newId(): string {
  return typeof crypto !== "undefined" && crypto.randomUUID ? crypto.randomUUID() : `r-${Date.now()}-${Math.random()}`;
}

function makeRoom(): RoomSlot {
  return {
    id: newId(),
    roomType: "cuisine",
    areaM2: 25,
    qualityTier: "standard",
    projectionTier: null,
    photos: [],
    materials: [],
    analysisCompleted: false,
  };
}

function storedFromResultModal(d: ResultModalData): DevisStored {
  return {
    version: 2,
    roomLabel: d.roomLabel,
    areaM2: d.areaM2,
    quoteLow: d.quoteLow,
    quoteHigh: d.quoteHigh,
    materials: d.materials,
    qualityTier: d.qualityTier,
    qualityLabel: d.qualityLabel,
    comparisonTiers: d.comparisonTiers.map((r) => ({
      tier: r.tier,
      label: r.label,
      lowHt: r.lowHt,
      highHt: r.highHt,
    })),
  };
}

function tierHeadingLabel(tiersList: { id: string; label: string }[], rk: ReplicateTierKey): string {
  const id = quoteTierFromReplicateKey(rk);
  return tiersList.find((t) => t.id === id)?.label ?? id;
}

/** Image résultat : état isolé par URL (`key`) pour éviter skeleton bloqué (cache / onLoad avant effets parent). */
function ResultProjectionImage({ imageUrl }: { imageUrl: string }) {
  const [loaded, setLoaded] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);
  const imgRef = useRef<HTMLImageElement>(null);

  useLayoutEffect(() => {
    setLoaded(false);
    setLoadError(null);
    const el = imgRef.current;
    if (el?.complete && el.naturalWidth > 0) {
      setLoaded(true);
    }
  }, [imageUrl]);

  if (loadError) {
    return (
      <div className="flex min-h-[min(40vw,220px)] flex-col items-center justify-center gap-3 px-4 py-8 text-center sm:min-h-[280px]">
        <p className="text-sm font-semibold text-red-700">{loadError}</p>
        <p className="max-w-full break-all text-[10px] text-slate-500">{imageUrl}</p>
      </div>
    );
  }

  return (
    <div className="relative flex min-h-[min(40vw,220px)] items-center justify-center sm:min-h-[280px]">
      {!loaded ? (
        <div
          className="absolute inset-0 z-10 flex flex-col items-center justify-center gap-3 rounded-2xl bg-slate-100/95"
          aria-busy="true"
          aria-label="Chargement de l'image"
        >
          <Loader2 className="h-10 w-10 animate-spin text-indigo-600" strokeWidth={2.2} aria-hidden />
          <span className="text-xs font-medium text-slate-500">Chargement de l&apos;image…</span>
        </div>
      ) : null}
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        ref={imgRef}
        src={imageUrl}
        alt="Projection rénovée"
        className={[
          "max-h-[min(52vh,420px)] w-full object-contain transition-opacity duration-200 sm:max-h-[min(56vh,480px)]",
          loaded ? "opacity-100" : "opacity-0",
        ].join(" ")}
        onLoad={() => setLoaded(true)}
        onError={(e) => {
          console.error("Image load error:", e);
          setLoadError("L'image n'a pas pu s'afficher (réseau ou URL expirée).");
          setLoaded(false);
        }}
      />
    </div>
  );
}

export function ArtiVisionHome() {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [rooms, setRooms] = useState<RoomSlot[]>(() => [makeRoom()]);
  const [activeId, setActiveId] = useState<string>(() => rooms[0].id);
  const [tiers, setTiers] = useState(FALLBACK_TIERS);
  const [error, setError] = useState<string | null>(null);
  const [dragActive, setDragActive] = useState(false);
  const [totals, setTotals] = useState<{ low: number; high: number } | null>(null);
  /** Flux unique : 0 = idle, 1 = analyse, 2 = génération image */
  const [pipelinePhase, setPipelinePhase] = useState<0 | 1 | 2>(0);
  const [pipelineBusy, setPipelineBusy] = useState(false);
  const [resultModal, setResultModal] = useState<ResultModalData | null>(null);
  const [modalGenBusy, setModalGenBusy] = useState(false);

  const activeRoom = useMemo(() => rooms.find((r) => r.id === activeId) ?? rooms[0], [rooms, activeId]);

  useEffect(() => {
    if (!rooms.some((r) => r.id === activeId)) {
      setActiveId(rooms[0].id);
    }
  }, [rooms, activeId]);

  const quoteDepsKey = useMemo(
    () =>
      JSON.stringify(
        rooms.map((r) => ({ id: r.id, t: r.roomType, a: r.areaM2, q: r.qualityTier, p: r.projectionTier })),
      ),
    [rooms],
  );

  useEffect(() => {
    let cancelled = false;
    fetchAppContext()
      .then((ctx) => {
        if (cancelled) return;
        if (ctx.tiers?.length) setTiers(ctx.tiers);
      })
      .catch(() => {
        if (!cancelled) setTiers(FALLBACK_TIERS);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      let low = 0;
      let high = 0;
      for (const r of rooms) {
        try {
          const q = await fetchQuote(r.roomType, r.areaM2, r.qualityTier);
          low += q.low_ht;
          high += q.high_ht;
        } catch {
          /* ignore */
        }
      }
      if (!cancelled) setTotals({ low, high });
    })();
    return () => {
      cancelled = true;
    };
  }, [quoteDepsKey, rooms]);

  useEffect(() => {
    if (pipelineBusy || resultModal) {
      const prev = document.body.style.overflow;
      document.body.style.overflow = "hidden";
      return () => {
        document.body.style.overflow = prev;
      };
    }
    return undefined;
  }, [pipelineBusy, resultModal]);

  useEffect(() => {
    if (resultModal?.imageUrl) {
      console.log("Image URL from API:", resultModal.imageUrl);
    }
  }, [resultModal?.imageUrl]);

  useEffect(() => {
    if (!resultModal) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setResultModal(null);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [resultModal]);

  const rangeFillPct = useMemo(
    () => ((activeRoom.areaM2 - AREA_MIN) / (AREA_MAX - AREA_MIN)) * 100,
    [activeRoom.areaM2],
  );

  const patchActiveRoom = useCallback(
    (
      patch: Partial<
        Pick<
          RoomSlot,
          | "roomType"
          | "areaM2"
          | "qualityTier"
          | "projectionTier"
          | "materials"
          | "analysisCompleted"
        >
      >,
    ) => {
      setRooms((prev) => prev.map((r) => (r.id === activeId ? { ...r, ...patch } : r)));
    },
    [activeId],
  );

  const addRoom = useCallback(() => {
    if (rooms.length >= MAX_ROOMS) return;
    const r = makeRoom();
    setRooms((prev) => [...prev, r]);
    setActiveId(r.id);
    setError(null);
  }, [rooms.length]);

  const removeRoom = useCallback((id: string) => {
    setRooms((prev) => {
      const victim = prev.find((x) => x.id === id);
      victim?.photos.forEach((p) => URL.revokeObjectURL(p.previewUrl));
      const next = prev.filter((x) => x.id !== id);
      return next.length === 0 ? [makeRoom()] : next;
    });
  }, []);

  const appendPhotosToActive = useCallback(
    (fileList: FileList | File[] | null) => {
      if (!fileList || !fileList.length) return;
      setError(null);
      const incoming = Array.from(fileList as File[]);
      setRooms((prev) =>
        prev.map((r) => {
          if (r.id !== activeId) return r;
          const next = [...r.photos];
          for (const f of incoming) {
            if (!f.type.startsWith("image/")) continue;
            if (next.length >= MAX_PHOTOS_PER_ROOM) break;
            next.push({ id: newId(), file: f, previewUrl: URL.createObjectURL(f) });
          }
          return { ...r, photos: next, materials: [], analysisCompleted: false, projectionTier: null };
        }),
      );
    },
    [activeId],
  );

  const removePhoto = useCallback((photoId: string) => {
    setRooms((prev) =>
      prev.map((r) => {
        if (r.id !== activeId) return r;
        const p = r.photos.find((x) => x.id === photoId);
        if (p) URL.revokeObjectURL(p.previewUrl);
        return {
          ...r,
          photos: r.photos.filter((x) => x.id !== photoId),
          materials: [],
          analysisCompleted: false,
          projectionTier: null,
        };
      }),
    );
  }, [activeId]);

  const onFileInput = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      appendPhotosToActive(e.target.files);
      e.target.value = "";
    },
    [appendPhotosToActive],
  );

  const onDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setDragActive(false);
      appendPhotosToActive(e.dataTransfer.files);
    },
    [appendPhotosToActive],
  );

  const onChiffrerProjeter = useCallback(async () => {
    const files = activeRoom.photos.map((p) => p.file);
    if (!files.length) {
      setError("Ajoutez au moins une photo.");
      return;
    }
    if (!(activeRoom.areaM2 > 0)) {
      setError("Indiquez une surface (m²).");
      return;
    }
    const tierKey = activeRoom.projectionTier;
    if (!tierKey) {
      setError("Choisissez une gamme (Économique, Standard ou Haut de gamme).");
      return;
    }
    const areaM2 = activeRoom.areaM2;
    const qualityTier = quoteTierFromReplicateKey(tierKey);
    setError(null);
    setPipelineBusy(true);
    setPipelinePhase(1);
    const phase1Start = Date.now();
    try {
      const res = await analyzeImages(files);
      const mats = res.materials.map(String);
      let roomType: RoomValue = activeRoom.roomType;
      if (res.confidence >= 0.35 && ROOM_OPTIONS.some((r) => r.value === res.suggested_room_type)) {
        roomType = res.suggested_room_type as RoomValue;
      }
      patchActiveRoom({
        materials: mats,
        roomType,
        analysisCompleted: true,
      });
      const elapsed = Date.now() - phase1Start;
      await new Promise((r) => setTimeout(r, Math.max(0, 2600 - elapsed)));
      setPipelinePhase(2);

      const imageDataUrl = await resizeImageToJpegDataUrl(files[0]);
      const repRoom = replicateRoomTypeFromRoomValue(roomType);
      const analysisPayload: GenerateAnalysisPayload = {
        suggested_room_type: roomType,
        materials: mats,
        short_notes_fr: (res.short_notes_fr ?? "").trim(),
        prompt_anchor_en: (res.prompt_anchor_en ?? "").trim(),
        negative_extra_en: (res.negative_extra_en ?? "").trim(),
      };

      const quotePayload = await fetchQuote(roomType, areaM2, qualityTier);

      let imageUrl: string | null = null;
      let genError: string | null = null;
      try {
        const genRes = await fetch("/api/generate", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            imageUrl: imageDataUrl,
            roomType: repRoom,
            tier: tierKey,
            analysis: analysisPayload,
          }),
        });
        const raw = await genRes.text();
        if (!genRes.ok) {
          let msg = raw || `HTTP ${genRes.status}`;
          try {
            const j = JSON.parse(raw) as { error?: string };
            if (typeof j.error === "string") msg = j.error;
          } catch {
            /* ignore */
          }
          throw new Error(msg);
        }
        const data = JSON.parse(raw) as { imageUrl?: string };
        if (!data.imageUrl) throw new Error("Réponse sans image");
        imageUrl = String(data.imageUrl);
      } catch (e) {
        genError = e instanceof Error ? e.message : "Échec de la génération";
      }

      const comparisonTiers = [
        {
          tier: quotePayload.quality_tier,
          label: quotePayload.quality_label,
          lowHt: quotePayload.low_ht,
          highHt: quotePayload.high_ht,
        },
      ];

      const roomLabel = quotePayload.room_label || "Pièce";

      const projForSession = imageUrl ?? imageDataUrl;

      sessionStorage.setItem(
        STORAGE_KEY,
        JSON.stringify({
          version: 2 as const,
          originalPreviewJpeg: imageDataUrl,
          projectionUrl: projForSession,
          quoteLow: quotePayload.low_ht,
          quoteHigh: quotePayload.high_ht,
          roomLabel,
          areaM2,
          materials: mats,
          qualityTier: quotePayload.quality_tier,
          qualityLabel: quotePayload.quality_label,
          comparisonTiers,
        }),
      );

      setResultModal({
        materials: mats,
        areaM2,
        roomLabel,
        originalPreviewJpeg: imageDataUrl,
        tier: tierKey,
        qualityTier: quotePayload.quality_tier as QualityTierId,
        qualityLabel: quotePayload.quality_label,
        quoteLow: quotePayload.low_ht,
        quoteHigh: quotePayload.high_ht,
        comparisonTiers,
        imageUrl,
        genError,
        imageDataUrl,
        replicateRoomType: repRoom,
        roomTypeResolved: roomType,
        generateContext: { analysis: analysisPayload },
      });
    } catch (err) {
      if (err instanceof DOMException && err.name === "TimeoutError") {
        setError("C’est plus long que prévu. Réessayez dans un instant.");
      } else {
        setError(err instanceof Error ? err.message : "Une erreur est survenue. Réessayez.");
      }
    } finally {
      setPipelineBusy(false);
      setPipelinePhase(0);
    }
  }, [
    activeRoom.areaM2,
    activeRoom.photos,
    activeRoom.projectionTier,
    activeRoom.roomType,
    patchActiveRoom,
  ]);

  const roomIndex = rooms.findIndex((r) => r.id === activeId) + 1;

  const showChantierTotals = useMemo(() => {
    return totals !== null && rooms.some((r) => r.photos.length > 0);
  }, [rooms, totals]);

  const onExportFromModal = useCallback(() => {
    if (!resultModal) return;
    downloadDevisDraft(storedFromResultModal(resultModal));
  }, [resultModal]);

  const onOpenResultPage = useCallback(() => {
    setResultModal(null);
    router.push("/result");
  }, [router]);

  const onTryAnotherTier = useCallback(() => {
    setResultModal(null);
    patchActiveRoom({ projectionTier: null });
  }, [patchActiveRoom]);

  const retryGeneration = useCallback(async () => {
    const m = resultModal;
    if (!m?.imageDataUrl) return;
    setModalGenBusy(true);
    setResultModal((cur) => (cur ? { ...cur, genError: null } : null));
    try {
      const res = await fetch("/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          imageUrl: m.imageDataUrl,
          roomType: m.replicateRoomType,
          tier: m.tier,
          analysis: m.generateContext.analysis,
        }),
      });
      const raw = await res.text();
      if (!res.ok) {
        let msg = raw || `HTTP ${res.status}`;
        try {
          const j = JSON.parse(raw) as { error?: string };
          if (typeof j.error === "string") msg = j.error;
        } catch {
          /* ignore */
        }
        throw new Error(msg);
      }
      const data = JSON.parse(raw) as { imageUrl?: string };
      if (!data.imageUrl) throw new Error("Réponse sans image");
      const imageUrl = String(data.imageUrl);
      setResultModal((cur) => {
        if (!cur) return cur;
        const next = { ...cur, imageUrl, genError: null as string | null };
        sessionStorage.setItem(
          STORAGE_KEY,
          JSON.stringify({
            version: 2 as const,
            originalPreviewJpeg: next.originalPreviewJpeg,
            projectionUrl: imageUrl,
            quoteLow: next.quoteLow,
            quoteHigh: next.quoteHigh,
            roomLabel: next.roomLabel,
            areaM2: next.areaM2,
            materials: next.materials,
            qualityTier: next.qualityTier,
            qualityLabel: next.qualityLabel,
            comparisonTiers: next.comparisonTiers,
          }),
        );
        return next;
      });
    } catch (e) {
      setResultModal((cur) =>
        cur ? { ...cur, genError: e instanceof Error ? e.message : "Échec" } : null,
      );
    } finally {
      setModalGenBusy(false);
    }
  }, [resultModal]);

  return (
    <main className="relative pb-36 pt-2 sm:pb-40 sm:pt-4 lg:pb-44 lg:pt-6">
      <div
        className="pointer-events-none absolute left-0 top-24 h-72 w-72 -translate-x-1/4 rounded-full bg-indigo-400/15 blur-3xl lg:left-[12%] lg:h-96 lg:w-96"
        aria-hidden
      />
      <div
        className="pointer-events-none absolute right-0 top-[45%] h-64 w-64 translate-x-1/4 rounded-full bg-violet-400/12 blur-3xl lg:right-[8%] lg:top-1/3"
        aria-hidden
      />

      <div className="relative mx-auto w-full max-w-7xl px-4 sm:px-5 lg:px-10">
      <input
        ref={fileInputRef}
        className="sr-only"
        type="file"
        accept="image/*"
        multiple
        onChange={onFileInput}
        tabIndex={-1}
      />

      {/* Zone photo prioritaire : sans clichés, le reste de l’app est secondaire */}
      {!activeRoom.photos.length ? (
        <section className="relative mb-6 lg:mb-10" aria-label="Importer des photos">
          <div
            role="button"
            tabIndex={0}
            onKeyDown={(e) => {
              if (e.key === "Enter" || e.key === " ") {
                e.preventDefault();
                fileInputRef.current?.click();
              }
            }}
            onDragEnter={(e) => {
              e.preventDefault();
              setDragActive(true);
            }}
            onDragOver={(e) => {
              e.preventDefault();
              setDragActive(true);
            }}
            onDragLeave={() => setDragActive(false)}
            onDrop={onDrop}
            onClick={() => fileInputRef.current?.click()}
            className={[
              "cursor-pointer overflow-hidden rounded-[1.75rem] border-2 border-dashed bg-gradient-to-b from-white to-indigo-50/40 p-8 text-center shadow-card transition sm:rounded-[2rem] sm:p-12 lg:p-14",
              dragActive
                ? "border-indigo-500 bg-indigo-50/90 ring-2 ring-indigo-200"
                : "border-indigo-200/90 hover:border-indigo-400 hover:shadow-md",
            ].join(" ")}
          >
            <Camera className="mx-auto h-14 w-14 text-indigo-600 sm:h-16 sm:w-16" strokeWidth={1.35} aria-hidden />
            <p className="mt-5 text-balance text-2xl font-black tracking-tight text-slate-900 sm:text-3xl lg:text-4xl">
              Par ici, vos photos
            </p>
            <p className="mx-auto mt-2 max-w-md text-sm font-medium text-slate-600 sm:text-base">
              C’est la première étape : on s’occupe du reste après.
            </p>
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                fileInputRef.current?.click();
              }}
              className="mt-8 inline-flex min-h-[3.25rem] items-center justify-center gap-2 rounded-2xl bg-gradient-to-br from-blue-600 via-indigo-600 to-violet-700 px-10 text-base font-extrabold text-white shadow-glow-lg transition hover:brightness-110 sm:min-h-[3.5rem] sm:px-12 sm:text-lg"
            >
              <ImagePlus className="h-5 w-5 shrink-0" strokeWidth={2.2} aria-hidden />
              Choisir des photos
            </button>
            <p className="mt-4 text-xs font-semibold text-slate-500 sm:text-sm">
              Glisser-déposer ici · jusqu’à {MAX_PHOTOS_PER_ROOM} images · JPEG, PNG ou WebP
            </p>
          </div>
        </section>
      ) : null}

      {/* Pièces (dossiers) */}
      <section className="relative mb-5">
        <div className="mb-2 flex items-center justify-between gap-2 px-0.5">
          <h2 className="text-xs font-bold uppercase tracking-[0.2em] text-slate-500">Vos pièces</h2>
          <button
            type="button"
            onClick={addRoom}
            disabled={rooms.length >= MAX_ROOMS}
            className="inline-flex items-center gap-1 rounded-full border border-indigo-200 bg-white px-3 py-1.5 text-xs font-bold text-indigo-700 shadow-sm transition hover:bg-indigo-50 disabled:cursor-not-allowed disabled:opacity-40"
          >
            <Plus className="h-3.5 w-3.5" strokeWidth={2.5} aria-hidden />
            Pièce
          </button>
        </div>
        <div className="flex gap-2 overflow-x-auto pb-1 pt-0.5 [-ms-overflow-style:none] [scrollbar-width:none] lg:flex-wrap lg:overflow-x-visible [&::-webkit-scrollbar]:hidden">
          {rooms.map((r, idx) => {
            const active = r.id === activeId;
            return (
              <div key={r.id} className="flex shrink-0 items-center gap-1">
                <button
                  type="button"
                  onClick={() => {
                    setActiveId(r.id);
                    setError(null);
                  }}
                  className={[
                    "rounded-2xl border-2 px-4 py-2.5 text-left text-sm font-bold transition",
                    active
                      ? "border-indigo-500 bg-indigo-50 text-indigo-900 shadow-md"
                      : "border-slate-200 bg-white/90 text-slate-700 hover:border-indigo-200",
                  ].join(" ")}
                >
                  Pièce {idx + 1}
                  <span className="mt-0.5 block text-[11px] font-semibold text-slate-500">
                    {ROOM_OPTIONS.find((o) => o.value === r.roomType)?.label ?? r.roomType} · {r.photos.length} photo
                    {r.photos.length !== 1 ? "s" : ""}
                  </span>
                </button>
                {rooms.length > 1 ? (
                  <button
                    type="button"
                    aria-label={`Supprimer la pièce ${idx + 1}`}
                    onClick={() => removeRoom(r.id)}
                    className="rounded-xl p-2 text-slate-400 transition hover:bg-red-50 hover:text-red-600"
                  >
                    <Trash2 className="h-4 w-4" strokeWidth={2} />
                  </button>
                ) : null}
              </div>
            );
          })}
        </div>
      </section>

      <div className="grid gap-6 lg:grid-cols-12 lg:gap-8 lg:items-start">
        <div className="space-y-5 lg:col-span-7">
      {/* Photos de la pièce active (aperçus + ajout) */}
      {activeRoom.photos.length > 0 ? (
      <section className="relative mb-5 overflow-hidden rounded-3xl border border-slate-200/90 bg-white p-4 shadow-card sm:p-5">
        <div className="mb-3 flex items-start justify-between gap-3">
          <div>
            <h2 className="text-sm font-extrabold text-slate-900">Vos clichés — pièce {roomIndex}</h2>
            <p className="mt-0.5 text-xs text-slate-500">Plusieurs angles affinent le rendu ({MAX_PHOTOS_PER_ROOM} max).</p>
          </div>
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="inline-flex shrink-0 items-center gap-1.5 rounded-xl bg-slate-900 px-3 py-2 text-xs font-bold text-white shadow-md transition hover:bg-slate-800"
          >
            <ImagePlus className="h-4 w-4" strokeWidth={2.2} aria-hidden />
            Ajouter
          </button>
        </div>

        {activeRoom.photos.length === 1 ? (
          <div
            className="mb-3 rounded-2xl border border-amber-200/90 bg-amber-50/80 px-3 py-2.5 text-[11px] font-medium leading-snug text-amber-950 sm:text-xs"
            role="status"
          >
            Pour une meilleure cohérence avec la pièce réelle, ajoutez{" "}
            <span className="font-bold">2 à 3 photos</span> (angles différents) si vous le pouvez — la génération utilise
            surtout la première image.
          </div>
        ) : null}

        <div
          role="button"
          tabIndex={0}
          onKeyDown={(e) => {
            if (e.key === "Enter" || e.key === " ") {
              e.preventDefault();
              fileInputRef.current?.click();
            }
          }}
          onDragEnter={(e) => {
            e.preventDefault();
            setDragActive(true);
          }}
          onDragOver={(e) => {
            e.preventDefault();
            setDragActive(true);
          }}
          onDragLeave={() => setDragActive(false)}
          onDrop={onDrop}
          onClick={() => fileInputRef.current?.click()}
          className={[
            "cursor-pointer rounded-2xl border-2 border-dashed px-3 py-6 text-center transition sm:py-7",
            dragActive ? "border-indigo-400 bg-indigo-50/80" : "border-slate-200 bg-slate-50/50 hover:border-indigo-300",
          ].join(" ")}
        >
          <p className="text-sm font-semibold text-slate-700">Glisser-déposer pour en ajouter</p>
          <p className="mt-1 text-xs text-slate-500">ou toucher cette zone</p>
        </div>

          <ul className="mt-4 grid grid-cols-3 gap-2 sm:grid-cols-4 lg:grid-cols-4 xl:grid-cols-5">
            {activeRoom.photos.map((p) => (
              <li key={p.id} className="group relative aspect-square overflow-hidden rounded-xl border border-slate-200 bg-slate-100">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={p.previewUrl} alt="" className="h-full w-full object-cover" />
                <button
                  type="button"
                  aria-label="Retirer cette photo"
                  onClick={(e) => {
                    e.stopPropagation();
                    removePhoto(p.id);
                  }}
                  className="absolute right-1 top-1 rounded-lg bg-black/55 p-1 text-white opacity-0 transition group-hover:opacity-100 sm:opacity-100"
                >
                  <X className="h-3.5 w-3.5" strokeWidth={2.5} />
                </button>
              </li>
            ))}
          </ul>
      </section>
      ) : null}

      {/* Type de pièce */}
      <section className="relative mb-5 rounded-3xl border border-slate-200/90 bg-white p-5 shadow-card sm:p-6">
        <h2 className="text-xs font-bold uppercase tracking-[0.2em] text-indigo-600">Type de pièce</h2>
        <div className="mt-3 grid grid-cols-2 gap-2.5 sm:grid-cols-3 sm:gap-3 lg:grid-cols-5 lg:gap-2.5">
          {ROOM_OPTIONS.map(({ value, label, emoji, Icon, tint }) => {
            const active = activeRoom.roomType === value;
            return (
              <button
                key={value}
                type="button"
                onClick={() => patchActiveRoom({ roomType: value })}
                className={[
                  "group relative flex min-h-[5rem] flex-col items-center justify-center gap-1 rounded-2xl border-2 px-2 py-2.5 text-center transition sm:min-h-[5.5rem]",
                  "focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-400 focus-visible:ring-offset-2",
                  active
                    ? "border-indigo-500 bg-indigo-50/90 shadow-md"
                    : "border-slate-100 bg-slate-50/80 hover:border-indigo-200",
                ].join(" ")}
              >
                <div
                  className={[
                    "pointer-events-none absolute inset-0 rounded-2xl bg-gradient-to-br opacity-0 transition group-hover:opacity-50",
                    tint,
                    active ? "!opacity-100" : "",
                  ].join(" ")}
                />
                <span className="relative text-xl" aria-hidden>
                  {emoji}
                </span>
                <Icon
                  className={active ? "relative h-5 w-5 text-indigo-600" : "relative h-5 w-5 text-slate-400"}
                  strokeWidth={1.85}
                  aria-hidden
                />
                <span className={`relative text-[11px] font-bold sm:text-xs ${active ? "text-indigo-900" : "text-slate-600"}`}>
                  {label}
                </span>
              </button>
            );
          })}
        </div>
      </section>

        </div>

        <aside className="space-y-5 lg:col-span-5 lg:rounded-3xl lg:border lg:border-slate-200/70 lg:bg-white/85 lg:p-6 lg:shadow-card lg:backdrop-blur-md xl:sticky xl:top-24 xl:max-h-[calc(100dvh-7rem)] xl:overflow-y-auto">

      {/* Surface */}
      <section className="relative mb-5 overflow-hidden rounded-3xl border border-slate-200/90 bg-white p-5 shadow-card sm:p-6 lg:mb-0 lg:rounded-2xl lg:border-0 lg:bg-transparent lg:p-0 lg:shadow-none">
        <h2 className="text-xs font-bold uppercase tracking-[0.2em] text-indigo-600">Surface à traiter</h2>
        <div className="mt-3 flex flex-col items-center">
          <div className="flex items-baseline gap-1">
            <span className="bg-gradient-to-br from-blue-600 via-indigo-600 to-violet-600 bg-clip-text text-5xl font-black tabular-nums tracking-tighter text-transparent sm:text-6xl">
              {activeRoom.areaM2}
            </span>
            <span className="text-xl font-bold text-slate-500">m²</span>
          </div>
        </div>
        <div className="mt-4 px-1">
          <input
            type="range"
            min={AREA_MIN}
            max={AREA_MAX}
            step={1}
            value={activeRoom.areaM2}
            onChange={(e) => patchActiveRoom({ areaM2: Number(e.target.value) })}
            className="arti-range"
            style={{ "--slider-pct": `${rangeFillPct}%` } as React.CSSProperties}
            aria-label="Surface en mètres carrés"
          />
          <div className="mt-1 flex justify-between text-[11px] font-semibold text-slate-400">
            <span>{AREA_MIN} m²</span>
            <span>{AREA_MAX} m²</span>
          </div>
        </div>
      </section>

      {/* Gammes — choix obligatoire avant Chiffrer & Projeter */}
      <section className="relative mb-5 rounded-3xl border border-slate-200/90 bg-white p-5 shadow-card sm:p-6 lg:rounded-2xl lg:border-0 lg:bg-transparent lg:p-0 lg:shadow-none">
        <div className="mb-3 flex items-center gap-2">
          <Layers className="h-5 w-5 text-indigo-600" strokeWidth={2} aria-hidden />
          <h2 className="text-xs font-bold uppercase tracking-[0.2em] text-indigo-600">Gamme pour la vision</h2>
        </div>
        <p className="mb-3 text-[11px] font-medium leading-snug text-slate-500">
          Pilote le chiffrage et le rendu visuel — une projection par lancement.
        </p>
        <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-3 lg:grid-cols-1 lg:gap-3">
          {tiers.map((t) => {
            const id = t.id as QualityTierId;
            const rk = replicateKeyFromQuoteTier(id);
            const active = activeRoom.projectionTier === rk;
            return (
              <button
                key={t.id}
                type="button"
                onClick={() => patchActiveRoom({ qualityTier: id, projectionTier: rk })}
                className={[
                  "rounded-2xl border-2 px-3 py-3 text-left text-sm transition sm:py-3.5",
                  active
                    ? "border-indigo-500 bg-indigo-50/90 shadow-sm ring-2 ring-indigo-200/90"
                    : "border-slate-100 bg-slate-50/70 hover:border-indigo-200",
                ].join(" ")}
              >
                <p className="font-extrabold text-slate-900">{t.label}</p>
                <p className="mt-1 text-[11px] leading-snug text-slate-600">{t.hint}</p>
              </button>
            );
          })}
        </div>
      </section>
      <section className="relative mb-5 rounded-2xl border border-indigo-100/80 bg-indigo-50/40 px-4 py-3.5">
        <div className="flex gap-3">
          <Focus className="mt-0.5 h-4 w-4 shrink-0 text-indigo-600" strokeWidth={2} aria-hidden />
          <div>
            <p className="text-xs font-bold text-indigo-900">Projection chantier</p>
            <p className="mt-1 text-[11px] font-medium leading-relaxed text-slate-600">
              Le rendu respecte vos photos (cadrage, ouvertures visibles) et la{" "}
              <span className="font-semibold text-slate-800">gamme choisie</span> pour l’ambiance et les finitions — un
              avant/après crédible à montrer au client.
            </p>
          </div>
        </div>
      </section>

      {/* Estimation multi-pièces */}
      {totals && showChantierTotals ? (
        <section className="relative mb-5 rounded-3xl border border-indigo-100 bg-gradient-to-r from-indigo-50/90 to-violet-50/80 px-4 py-4 shadow-sm">
          <p className="text-[11px] font-bold uppercase tracking-wider text-indigo-600">Estimation instantanée</p>
          <p className="mt-1 text-lg font-black text-slate-900">
            {formatEur(totals.low)} — {formatEur(totals.high)}
          </p>
          <p className="mt-1 text-xs text-slate-600">Synthèse de vos pièces — se met à jour avec surface et ambiance.</p>
        </section>
      ) : null}
        </aside>

        <div className="space-y-5 lg:col-span-12">
      {activeRoom.materials.length > 0 ? (
        <section className="relative mb-5 overflow-hidden rounded-3xl border border-violet-100 bg-gradient-to-br from-white to-violet-50/40 p-4 shadow-card">
          <div className="mb-1 flex items-center gap-2 text-violet-700">
            <Sparkles className="h-4 w-4" strokeWidth={2.2} aria-hidden />
            <h2 className="text-xs font-bold uppercase tracking-[0.18em]">Repères (pièce {roomIndex})</h2>
          </div>
          <p className="text-sm font-medium leading-relaxed text-slate-700">{activeRoom.materials.join(" · ")}</p>
        </section>
      ) : null}

      {error ? (
        <div className="mb-5 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-800" role="alert">
          {error}
        </div>
      ) : null}
        </div>
      </div>
      </div>

      <div
        className="fixed inset-x-0 bottom-0 z-40 border-t border-slate-200/80 bg-white/95 pb-[max(0.75rem,env(safe-area-inset-bottom))] pt-3 shadow-[0_-12px_44px_-12px_rgba(79,70,229,0.22)] backdrop-blur-md"
        role="region"
        aria-label="Chiffrer et projeter"
      >
        <div className="mx-auto flex max-w-7xl flex-col gap-2 px-4 sm:px-5 lg:px-10">
          {activeRoom.photos.length > 0 ? (
            <p className="text-center text-[11px] font-bold uppercase tracking-[0.22em] text-slate-500">
              ① Photo · ② Pièce & surface · ③ Gamme puis lancez ✨
            </p>
          ) : (
            <p className="text-center text-[11px] font-semibold text-slate-400">Étape 1 : ajoutez une photo en haut</p>
          )}
          <button
            type="button"
            onClick={onChiffrerProjeter}
            disabled={pipelineBusy || !activeRoom.photos.length || !(activeRoom.areaM2 > 0) || !activeRoom.projectionTier}
            className={[
              "relative flex min-h-[3.35rem] w-full items-center justify-center gap-2 overflow-hidden rounded-2xl bg-gradient-to-br from-blue-600 via-indigo-600 to-violet-700 px-5 text-base font-extrabold text-white shadow-glow-lg transition sm:min-h-14 sm:text-lg",
              pipelineBusy ? "opacity-90" : "hover:brightness-110",
              "disabled:cursor-not-allowed disabled:opacity-40",
            ].join(" ")}
          >
            {pipelineBusy ? (
              <Loader2 className="h-6 w-6 shrink-0 animate-spin" strokeWidth={2.2} aria-hidden />
            ) : (
              <Wand2 className="h-5 w-5 shrink-0" strokeWidth={2.2} aria-hidden />
            )}
            <span>{pipelineBusy ? "En cours…" : "Chiffrer & Projeter ✨"}</span>
          </button>
        </div>
      </div>

      {pipelineBusy ? (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/55 p-5 backdrop-blur-sm"
          role="alertdialog"
          aria-busy="true"
          aria-live="polite"
        >
          <div className="max-w-sm rounded-3xl border border-white/15 bg-white px-6 py-8 text-center shadow-2xl sm:max-w-md sm:px-10">
            <Loader2 className="mx-auto h-11 w-11 animate-spin text-indigo-600" strokeWidth={2.2} aria-hidden />
            <p className="mt-6 text-lg font-extrabold leading-snug text-slate-900">
              {pipelinePhase === 1
                ? "Analyse du chantier par l’IA…"
                : "Génération de votre projection…"}
            </p>
            <p className="mt-3 text-sm text-slate-600">Quelques instants seulement.</p>
          </div>
        </div>
      ) : null}

      {resultModal ? (
        <div
          className="fixed inset-0 z-[60] flex items-end justify-center bg-black/55 backdrop-blur-md sm:items-center sm:p-6"
          role="presentation"
          onClick={() => setResultModal(null)}
        >
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="result-modal-title"
            className="max-h-[94dvh] w-full max-w-3xl overflow-y-auto rounded-t-3xl bg-white shadow-2xl sm:rounded-3xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="sticky top-0 z-10 flex justify-end border-b border-slate-100 bg-white/95 p-2 backdrop-blur-sm">
              <button
                type="button"
                onClick={() => setResultModal(null)}
                className="rounded-full p-2 text-slate-500 transition hover:bg-slate-100 hover:text-slate-800"
                aria-label="Fermer"
              >
                <X className="h-5 w-5" strokeWidth={2} />
              </button>
            </div>
            <div className="px-5 pb-8 pt-2 sm:px-8">
              <p className="text-center text-[11px] font-bold uppercase tracking-[0.22em] text-violet-600">Vision du projet</p>
              <h2 id="result-modal-title" className="mt-1 text-center text-2xl font-black tracking-tight text-slate-900 sm:text-3xl">
                Voici l’après-travaux — {tierHeadingLabel(tiers, resultModal.tier)}
              </h2>
              <p className="mt-2 text-center text-sm font-medium text-slate-600">
                {resultModal.qualityLabel} · {resultModal.areaM2} m² · projection indicative
              </p>
              <p className="mx-auto mt-2 max-w-lg text-center text-[11px] font-medium leading-relaxed text-slate-500">
                Image indicative : le rendu peut varier selon la photo et le modèle ; pas de valeur contractuelle.
              </p>
              <div className="relative mx-auto mt-5 max-w-xl overflow-hidden rounded-2xl border border-slate-200 bg-slate-100 shadow-inner">
                {modalGenBusy ? (
                  <div className="flex min-h-[min(40vw,220px)] items-center justify-center sm:min-h-[280px]">
                    <Loader2 className="h-11 w-11 animate-spin text-indigo-600" strokeWidth={2.2} aria-hidden />
                  </div>
                ) : resultModal.imageUrl ? (
                  <ResultProjectionImage key={resultModal.imageUrl} imageUrl={resultModal.imageUrl} />
                ) : resultModal.genError ? (
                  <div className="flex min-h-[min(40vw,220px)] flex-col items-center justify-center gap-4 px-4 py-10 text-center sm:min-h-[280px]">
                    <p className="text-sm font-semibold text-red-700">Génération échouée</p>
                    <p className="max-w-sm text-xs text-slate-600">{resultModal.genError}</p>
                    <button
                      type="button"
                      onClick={() => void retryGeneration()}
                      className="inline-flex items-center gap-2 rounded-xl border border-indigo-200 bg-white px-4 py-2.5 text-xs font-bold text-indigo-800 shadow-sm transition hover:bg-indigo-50"
                    >
                      <RefreshCw className="h-4 w-4 shrink-0" strokeWidth={2.2} aria-hidden />
                      Réessayer
                    </button>
                  </div>
                ) : null}
              </div>
              <p className="mt-6 text-center text-xs font-bold uppercase tracking-wider text-indigo-600">Estimation instantanée</p>
              <p className="mt-1 text-center text-2xl font-black tabular-nums text-slate-900 sm:text-3xl">
                {formatEur(resultModal.quoteLow)} — {formatEur(resultModal.quoteHigh)}
              </p>
              <p className="mt-1 text-center text-sm text-slate-500">{resultModal.roomLabel}</p>
              {resultModal.materials.length > 0 ? (
                <p className="mt-4 rounded-2xl border border-violet-100 bg-violet-50/50 px-4 py-3 text-center text-sm text-slate-700">
                  {resultModal.materials.join(" · ")}
                </p>
              ) : null}
              <div className="mt-6 grid gap-3 sm:grid-cols-2">
                <button
                  type="button"
                  onClick={onExportFromModal}
                  className="flex min-h-[48px] items-center justify-center gap-2 rounded-2xl border-2 border-indigo-200 bg-white text-sm font-extrabold text-indigo-800 shadow-sm transition hover:bg-indigo-50/80"
                >
                  <Download className="h-4 w-4 shrink-0" strokeWidth={2.2} aria-hidden />
                  Exporter le récap
                </button>
                <button
                  type="button"
                  onClick={onOpenResultPage}
                  className="flex min-h-[48px] items-center justify-center gap-2 rounded-2xl bg-gradient-to-br from-blue-600 via-indigo-600 to-violet-700 text-sm font-extrabold text-white shadow-glow-lg transition hover:brightness-110"
                >
                  Fiche complète
                </button>
              </div>
              <button
                type="button"
                onClick={onTryAnotherTier}
                className="mt-4 w-full rounded-2xl border border-slate-200 bg-slate-50/90 py-3 text-sm font-bold text-slate-700 transition hover:bg-slate-100"
              >
                Essayer une autre gamme
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </main>
  );
}
