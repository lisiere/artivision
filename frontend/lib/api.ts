const rawBase = process.env.NEXT_PUBLIC_API_URL?.trim() ?? "";
/** Vide = même origine que le front : Next.js proxifie vers l’API (voir next.config.mjs). */
const API_BASE = rawBase.replace(/\/$/, "");

function apiUrl(path: string): string {
  const p = path.startsWith("/") ? path : `/${path}`;
  if (!API_BASE) return p;
  return `${API_BASE}${p}`;
}

async function ensureOk(res: Response): Promise<void> {
  if (res.ok) return;
  const text = await res.text();
  let message = text;
  try {
    const data = JSON.parse(text) as { detail?: unknown };
    if (typeof data.detail === "string") {
      message = data.detail;
    } else if (data.detail !== undefined) {
      message = JSON.stringify(data.detail);
    }
  } catch {
    /* corps non-JSON : on garde le texte brut */
  }
  throw new Error(message || `Erreur HTTP ${res.status}`);
}

export type AnalyzeResult = {
  suggested_room_type: string;
  confidence: number;
  materials: string[];
  short_notes_fr: string;
  /** Indices anglais pour le prompt de génération (optionnel). */
  prompt_anchor_en?: string;
  negative_extra_en?: string;
};

export type QuotePayload = {
  room_type: string;
  room_label: string;
  area_m2: number;
  base_rate_per_m2: number;
  low_ht: number;
  high_ht: number;
  midpoint_ht: number;
  quality_tier: string;
  quality_label: string;
};

export type TierComparisonRow = {
  tier: string;
  label: string;
  low_ht: number;
  high_ht: number;
};

export type ProductContext = {
  name: string;
  tagline: string;
  workflow_fr: string[];
};

export type ContextResponse = {
  product: ProductContext;
  tiers: { id: string; label: string; hint: string }[];
  pricing_note_fr: string;
  compliance_note_fr: string;
};

async function postForm(path: string, form: FormData, init?: RequestInit): Promise<Response> {
  const url = apiUrl(path);
  try {
    return await fetch(url, { method: "POST", body: form, ...init });
  } catch (e) {
    const isNetwork =
      e instanceof TypeError ||
      (e instanceof Error && /fetch|network|failed/i.test(e.message));
    if (isNetwork) {
      const hint = API_BASE
        ? `URL API : ${API_BASE}. Vérifiez que l’API tourne et que CORS autorise cette page.`
        : `Le front appelle ${url} (Next.js proxifie vers l’API sur le port 8000). Lancez uvicorn sur 127.0.0.1:8000 ; si vous avez modifié next.config.mjs, redémarrez next dev.`;
      throw new Error(`Connexion impossible. ${hint}`);
    }
    throw e;
  }
}

export async function fetchAppContext(): Promise<ContextResponse> {
  const url = apiUrl("/api/context");
  try {
    const res = await fetch(url);
    await ensureOk(res);
    return res.json() as Promise<ContextResponse>;
  } catch (e) {
    const isNetwork =
      e instanceof TypeError ||
      (e instanceof Error && /fetch|network|failed/i.test(e.message));
    if (isNetwork) {
      const hint = API_BASE
        ? `URL API : ${API_BASE}.`
        : `Le front appelle ${url} (proxy Next). Lancez l’API sur le port 8000.`;
      throw new Error(`Connexion impossible. ${hint}`);
    }
    throw e;
  }
}

export async function analyzeImages(files: File[]): Promise<AnalyzeResult> {
  if (!files.length) {
    throw new Error("Ajoutez au moins une photo.");
  }
  const fd = new FormData();
  for (const f of files) {
    fd.append("files", f);
  }
  const res = await postForm("/api/analyze", fd);
  await ensureOk(res);
  return res.json() as Promise<AnalyzeResult>;
}

/** @deprecated Utilisez analyzeImages — une seule photo. */
export async function analyzeImage(file: File): Promise<AnalyzeResult> {
  return analyzeImages([file]);
}

export async function fetchQuote(
  roomType: string,
  areaM2: number,
  qualityTier: string,
): Promise<QuotePayload> {
  const res = await fetch(apiUrl("/api/quote"), {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      room_type: roomType,
      area_m2: areaM2,
      quality_tier: qualityTier,
    }),
  });
  await ensureOk(res);
  return res.json() as Promise<QuotePayload>;
}
