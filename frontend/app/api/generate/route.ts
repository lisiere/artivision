import Replicate from "replicate";
import { NextRequest, NextResponse } from "next/server";

const replicate = new Replicate({
  auth: process.env.REPLICATE_API_TOKEN,
  /** Sinon les URLs https sont wrappées en FileOutput (`url()` → objet URL, pas string). */
  useFileOutput: false,
});

type Tier = "eco" | "standard" | "premium";
type RoomType =
  | "cuisine"
  | "salle_de_bain"
  | "salon"
  | "chambre"
  | "bureau"
  | "buanderie"
  | "couloir"
  | "wc";

const PROMPT_TEMPLATES: Record<Tier, Record<RoomType, string>> = {
  eco: {
    cuisine:
      "modern minimalist kitchen, white laminate cabinets, basic ceramic tile floor, simple LED ceiling lights, clean budget renovation, same room layout, same wall positions, same window positions, photorealistic, professional real estate photography, natural lighting",
    salle_de_bain:
      "clean modern bathroom, white ceramic tile walls, basic vanity, standard chrome fixtures, budget renovation, same room layout, same wall positions, photorealistic, real estate photography",
    salon:
      "simple modern living room, neutral beige walls, laminate flooring, basic furniture, budget renovation, same room layout, same wall positions, photorealistic, real estate photography",
    chambre:
      "simple modern bedroom, neutral walls, laminate floor, basic furniture, budget renovation, same room layout, same wall positions, photorealistic, real estate photography",
    bureau:
      "simple modern home office, neutral walls, laminate floor, basic desk setup, budget renovation, same room layout, same wall positions, photorealistic, real estate photography",
    buanderie:
      "clean modern laundry room, white tile walls, basic vinyl floor, simple shelving, budget renovation, same room layout, same wall positions, photorealistic, real estate photography",
    couloir:
      "clean modern hallway, neutral walls, laminate floor, simple lighting, budget renovation, same room layout, same wall positions, photorealistic, real estate photography",
    wc: "clean modern toilet room, white tile walls, basic vinyl floor, budget renovation, same room layout, same wall positions, photorealistic, real estate photography",
  },
  standard: {
    cuisine:
      "contemporary kitchen renovation, matte finish cabinets, quartz countertops, ceramic backsplash, recessed lighting, mid-range materials, same room layout, same wall positions, same window positions, photorealistic, professional interior photography, warm natural lighting",
    salle_de_bain:
      "modern bathroom renovation, large format porcelain tiles, floating vanity with stone top, glass shower, brushed nickel fixtures, same room layout, same wall positions, photorealistic interior photography",
    salon:
      "modern living room, hardwood floors, designer paint, recessed lighting, contemporary furniture, same room layout, same wall positions, photorealistic interior photography",
    chambre:
      "modern bedroom, hardwood floor, designer paint, contemporary furniture, recessed lighting, same room layout, same wall positions, photorealistic interior photography",
    bureau:
      "modern home office, hardwood floor, designer paint, ergonomic furniture, recessed lighting, same room layout, same wall positions, photorealistic interior photography",
    buanderie:
      "modern laundry room, porcelain tile, custom cabinetry, quality fixtures, same room layout, same wall positions, photorealistic interior photography",
    couloir:
      "modern hallway, hardwood floor, designer paint, recessed lighting, same room layout, same wall positions, photorealistic interior photography",
    wc: "modern toilet room, porcelain tile, designer fixtures, same room layout, same wall positions, photorealistic interior photography",
  },
  premium: {
    cuisine:
      "luxury kitchen renovation, custom handleless cabinetry, marble waterfall island, integrated premium appliances, designer pendant lighting, herringbone wood floor, same room layout, same wall positions, same window positions, photorealistic, architectural digest photography, cinematic lighting",
    salle_de_bain:
      "luxury spa bathroom, book-matched marble walls, freestanding bathtub, rainfall shower, matte black designer fixtures, heated floor, same room layout, same wall positions, photorealistic architectural photography",
    salon:
      "luxury living room, designer hardwood floors, custom millwork, statement lighting, high-end furniture, large windows, same room layout, same wall positions, photorealistic architectural digest photography",
    chambre:
      "luxury bedroom, designer hardwood floor, custom millwork, statement lighting, premium furniture, same room layout, same wall positions, photorealistic architectural digest photography",
    bureau:
      "luxury home office, designer hardwood floor, custom built-ins, statement lighting, premium furniture, same room layout, same wall positions, photorealistic architectural digest photography",
    buanderie:
      "luxury laundry room, marble tile, custom cabinetry, premium appliances, designer fixtures, same room layout, same wall positions, photorealistic architectural digest photography",
    couloir:
      "luxury hallway, marble or herringbone wood floor, custom millwork, designer lighting, same room layout, same wall positions, photorealistic architectural digest photography",
    wc: "luxury toilet room, book-matched marble, designer fixtures, statement lighting, same room layout, same wall positions, photorealistic architectural digest photography",
  },
};

const NEGATIVE_PROMPT =
  "different room layout, different room shape, distorted walls, warped perspective, additional rooms, removed walls, different window positions, blurry, low quality, deformed geometry, surreal, fantasy, cartoon, painting, drawing, oversaturated, watermark, text, logo";

type GenerationProfile = "faithful" | "inspired";

type AnalysisPayload = {
  suggested_room_type?: string;
  materials?: string[];
  short_notes_fr?: string;
  prompt_anchor_en?: string;
  negative_extra_en?: string;
};

const FAITHFUL_ANCHOR_EN =
  "Strictly preserve the visible source frame: same walls, same floor area shown, same openings only where already visible, same visible fixtures and plumbing positions. Do not add toilets, bathtubs, furniture, appliances, doors or windows that are not clearly visible in the source image. Photorealistic finishes on existing visible surfaces only.";

const INSPIRED_ANCHOR_EN =
  "Keep the same room type and a believable footprint; stay consistent with the photo; allow tasteful new elements only when they plausibly fit the visible layout without inventing a different room.";

function clampText(s: string, max: number): string {
  const t = s.trim();
  if (t.length <= max) return t;
  return t.slice(0, max);
}

function buildAugmentedPrompt(
  basePrompt: string,
  negativeBase: string,
  profile: GenerationProfile,
  analysis?: AnalysisPayload | null,
): { prompt: string; negative_prompt: string; prompt_strength: number; guidance_scale: number } {
  const prof: GenerationProfile = profile === "inspired" ? "inspired" : "faithful";
  const anchorGem = typeof analysis?.prompt_anchor_en === "string" ? analysis.prompt_anchor_en.trim() : "";
  const anchor =
    prof === "faithful"
      ? [FAITHFUL_ANCHOR_EN, anchorGem].filter(Boolean).join(" ")
      : [INSPIRED_ANCHOR_EN, anchorGem].filter(Boolean).join(" ");

  const notesFr = typeof analysis?.short_notes_fr === "string" ? analysis.short_notes_fr.trim() : "";
  const notesBlock = notesFr ? ` Site context (French): ${clampText(notesFr, 500)}` : "";

  const mats = Array.isArray(analysis?.materials) ? analysis!.materials!.map(String).filter(Boolean) : [];
  const matBlock =
    mats.length > 0
      ? ` Existing or visible materials to respect or refine: ${clampText(mats.slice(0, 20).join(", "), 450)}.`
      : "";

  const prompt = clampText(
    [basePrompt, anchor, notesBlock, matBlock].join(" ").replace(/\s+/g, " "),
    3500,
  );

  const extraNeg = typeof analysis?.negative_extra_en === "string" ? analysis.negative_extra_en.trim() : "";
  const profileNeg =
    prof === "faithful"
      ? "hallucinated toilet, hallucinated WC, extra bathroom door, new window opening, invented vanity, invented kitchen island, second room, duplicate room, impossible architecture"
      : "completely different room type, outdoor landscape instead of interior, blueprint overlay";

  const negative_prompt = clampText(
    [negativeBase, extraNeg, profileNeg].filter(Boolean).join(", ").replace(/\s*,\s*,+/g, ",").replace(/\s+/g, " "),
    2000,
  );

  const prompt_strength = prof === "faithful" ? 0.5 : 0.76;
  const guidance_scale = prof === "faithful" ? 12 : 15;
  return { prompt, negative_prompt, prompt_strength, guidance_scale };
}

function safeJsonStringify(value: unknown): string {
  try {
    return JSON.stringify(value, null, 2);
  } catch {
    try {
      return String(value);
    } catch {
      return "[unserializable]";
    }
  }
}

/** Extrait une URL d'image depuis la sortie Replicate (string, URL, FileOutput-like, tableaux, objets). */
function extractImageUrl(raw: unknown): string | null {
  if (raw == null) return null;

  if (typeof raw === "string" && (raw.startsWith("http") || raw.startsWith("data:"))) {
    return raw;
  }

  if (raw instanceof URL) {
    return raw.href;
  }

  if (Array.isArray(raw) && raw.length > 0) {
    return extractImageUrl(raw[0]);
  }

  if (typeof raw === "object") {
    const obj = raw as Record<string, unknown>;

    if (typeof obj.url === "function") {
      try {
        const u = (obj.url as () => unknown)();
        if (u instanceof URL) return u.href;
        if (typeof u === "string" && (u.startsWith("http") || u.startsWith("data:"))) return u;
      } catch {
        /* ignore */
      }
    }

    if (typeof obj.url === "string" && (obj.url.startsWith("http") || obj.url.startsWith("data:"))) {
      return obj.url;
    }

    if (typeof obj.image === "string" && obj.image.startsWith("http")) {
      return obj.image;
    }

    if (typeof obj.output === "string" && obj.output.startsWith("http")) {
      return obj.output;
    }

    if (Array.isArray(obj.output) && obj.output.length > 0) {
      const nested = extractImageUrl(obj.output[0]);
      if (nested) return nested;
    }

    if (obj.urls && typeof obj.urls === "object") {
      const get = (obj.urls as { get?: unknown }).get;
      if (typeof get === "string" && get.startsWith("http")) return get;
    }

    if (typeof (raw as { toString?: () => string }).toString === "function") {
      const s = String(raw);
      if (s.startsWith("http") || s.startsWith("data:")) return s;
    }
  }

  return null;
}

export async function POST(req: NextRequest) {
  try {
    const body = (await req.json()) as {
      imageUrl?: string;
      roomType?: string;
      tier?: string;
      profile?: string;
      analysis?: AnalysisPayload;
    };
    const { imageUrl, roomType, tier, profile: profileRaw, analysis } = body;

    if (!imageUrl || !roomType || !tier) {
      return NextResponse.json(
        { error: "Missing required fields: imageUrl, roomType, tier" },
        { status: 400 },
      );
    }

    const basePrompt = PROMPT_TEMPLATES[tier as Tier]?.[roomType as RoomType];
    if (!basePrompt) {
      return NextResponse.json(
        { error: `Invalid combination: roomType=${roomType}, tier=${tier}` },
        { status: 400 },
      );
    }

    const profile: GenerationProfile = profileRaw === "inspired" ? "inspired" : "faithful";
    const { prompt, negative_prompt, prompt_strength, guidance_scale } = buildAugmentedPrompt(
      basePrompt,
      NEGATIVE_PROMPT,
      profile,
      analysis ?? null,
    );

    const output = await replicate.run(
      "adirik/interior-design:76604baddc85b1b4616e1c6475eca080da339c8875bd4996705440484a6eac38",
      {
        input: {
          image: imageUrl,
          prompt,
          negative_prompt,
          num_inference_steps: 50,
          guidance_scale,
          prompt_strength,
          seed: Math.floor(Math.random() * 1000000),
        },
      },
    );

    const rawOutput: unknown = output;

    const resultUrl = extractImageUrl(rawOutput);

    if (!resultUrl) {
      console.error("Could not extract URL from output:", safeJsonStringify(rawOutput));
      return NextResponse.json(
        { error: "Unexpected model output format", debug: safeJsonStringify(rawOutput) },
        { status: 500 },
      );
    }

    console.log("Final image URL:", resultUrl);
    return NextResponse.json({ imageUrl: resultUrl });
  } catch (err: unknown) {
    console.error("Replicate generation error:", err);
    const message = err instanceof Error ? err.message : "Generation failed";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export const maxDuration = 60;
