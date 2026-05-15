"""

API FastAPI : chantier → vision (Gemini) → chiffrage. La projection image est générée côté Next (Replicate).

"""



from __future__ import annotations



from typing import Annotated



from fastapi import FastAPI, File, Form, HTTPException, UploadFile

from fastapi.middleware.cors import CORSMiddleware

from pydantic import BaseModel, Field



from app.config import get_settings

from app.services import ai_pipeline

from app.services.pricing import QuoteResult, compute_quote, compute_tier_comparison

from app.services.quality_tiers import tier_defs_for_api



app = FastAPI(title="ArtiVision API", version="0.2.0")



_settings = get_settings()

app.add_middleware(

    CORSMiddleware,

    allow_origins=_settings.cors_origins_list,

    allow_origin_regex=_settings.cors_allow_origin_regex,

    allow_credentials=True,

    allow_methods=["*"],

    allow_headers=["*"],

)





class QuotePayload(BaseModel):

    room_type: str

    room_label: str

    area_m2: float

    base_rate_per_m2: float

    low_ht: float

    high_ht: float

    midpoint_ht: float

    quality_tier: str = "standard"

    quality_label: str = "Standard"





class TierComparisonRow(BaseModel):

    tier: str

    label: str

    low_ht: float

    high_ht: float





class AnalyzeResponse(BaseModel):

    suggested_room_type: str = "autre"

    confidence: float = 0.0

    materials: list[str] = Field(default_factory=list)

    short_notes_fr: str = ""

    prompt_anchor_en: str = ""

    negative_extra_en: str = ""





class ProjectResponse(BaseModel):

    quote: QuotePayload

    projection_url: str

    prompt_used_en: str

    vision_used: bool = True

    quality_tier: str

    quality_label: str

    comparison_tiers: list[TierComparisonRow]





class ProductContext(BaseModel):

    name: str

    tagline: str

    workflow_fr: list[str]





class ContextResponse(BaseModel):

    product: ProductContext

    tiers: list[dict[str, str]]

    pricing_note_fr: str

    compliance_note_fr: str





def _quote_to_payload(q: QuoteResult) -> QuotePayload:

    return QuotePayload(

        room_type=q.room_type,

        room_label=q.room_label,

        area_m2=q.area_m2,

        base_rate_per_m2=q.base_rate_per_m2,

        low_ht=q.low_ht,

        high_ht=q.high_ht,

        midpoint_ht=q.midpoint_ht,

        quality_tier=q.quality_tier,

        quality_label=q.quality_label,

    )





def _comparison_rows(room_type: str, area_m2: float) -> list[TierComparisonRow]:

    return [

        TierComparisonRow(tier=q.quality_tier, label=q.quality_label, low_ht=q.low_ht, high_ht=q.high_ht)

        for q in compute_tier_comparison(room_type, area_m2)

    ]





@app.get("/health")

def health() -> dict[str, str]:

    return {"status": "ok"}





@app.get("/api/context", response_model=ContextResponse)

def app_context() -> ContextResponse:

    """Textes produit + gammes + notes conformité (pour le front et l’artisan)."""

    return ContextResponse(

        product=ProductContext(

            name="ArtiVision",

            tagline=(

                "Sur chantier : photo, projection rénovée, gammes de prix — pour que le client se projette "

                "et que vous posiez un chiffrage cohérent avec votre catalogue."

            ),

            workflow_fr=[

                "Plusieurs photos par pièce pour une lecture plus fiable.",

                "Ajouter plusieurs pièces : les montants s’additionnent (détail par pièce).",

                "Analyser : type de pièce et matériaux. Générer : image rénovée + fourchette HT.",

                "Exporter un brouillon texte depuis le résultat.",

            ],

        ),

        tiers=tier_defs_for_api(),

        pricing_note_fr=(
            "Fourchettes €/m² : fichier racine `prix_renovation.json` (TTC catalogue → HT ÷ 1,10) pour "
            "cuisine, salle de bain et salon ; sinon grille `ROOM_RATES_JSON` / défaut serveur."
        ),

        compliance_note_fr="",


    )





@app.post("/api/analyze", response_model=AnalyzeResponse)

async def analyze(

    files: Annotated[list[UploadFile], File(description="Une ou plusieurs photos de la même pièce (JPEG/PNG/WebP).")],

) -> AnalyzeResponse:

    """Suggestion type de pièce + matériaux à partir d'une ou plusieurs vues (nécessite GEMINI_API_KEY)."""

    try:

        if not files:

            raise HTTPException(status_code=400, detail="Ajoutez au moins une photo.")

        if len(files) > 8:

            raise HTTPException(status_code=400, detail="Maximum 8 photos par analyse.")

        parts: list[tuple[bytes, str]] = []

        for uf in files:

            raw = await uf.read()

            if not raw:

                continue

            mime = uf.content_type or "image/jpeg"

            parts.append((raw, mime))

        if not parts:

            raise HTTPException(status_code=400, detail="Aucune image valide (fichiers vides).")

        data = ai_pipeline.analyze_room_images(parts)

        materials = [str(x) for x in (data.get("materials") or []) if str(x).strip()]

        return AnalyzeResponse(

            suggested_room_type=str(data.get("suggested_room_type", "autre")),

            confidence=float(data.get("confidence", 0.0) or 0.0),

            materials=materials,

            short_notes_fr=str(data.get("short_notes_fr", "")),

            prompt_anchor_en=str(data.get("prompt_anchor_en", "") or ""),

            negative_extra_en=str(data.get("negative_extra_en", "") or ""),

        )

    except RuntimeError as e:

        raise HTTPException(status_code=503, detail=str(e)) from e

    except Exception as e:  # noqa: BLE001 — surface lisible au client

        raise HTTPException(status_code=500, detail=f"Analyse impossible: {e!s}") from e





@app.post("/api/project", response_model=ProjectResponse)

async def project(

    files: Annotated[list[UploadFile], File(description="Une ou plusieurs photos de la même pièce.")],

    room_type: Annotated[str, Form(description="cuisine | salle_de_bain | salon | chambre | autre")],

    area_m2: Annotated[float, Form(description="Surface à traiter en m²")],

    quality_tier: Annotated[str, Form(description="economique | standard | premium")] = "standard",

) -> ProjectResponse:

    """

    Chiffrage HT (gamme + catalogue) + structure de réponse compatible client.

    La projection photoréaliste est produite par le front (Replicate) ; `projection_url` est vide ici.

    """

    if area_m2 <= 0:

        raise HTTPException(status_code=400, detail="La surface (m²) doit être positive.")

    if not files:

        raise HTTPException(status_code=400, detail="Ajoutez au moins une photo.")

    if len(files) > 8:

        raise HTTPException(status_code=400, detail="Maximum 8 photos par projection.")

    parts: list[tuple[bytes, str]] = []

    for uf in files:

        raw = await uf.read()

        if not raw:

            continue

        mime = uf.content_type or "image/jpeg"

        parts.append((raw, mime))

    if not parts:

        raise HTTPException(status_code=400, detail="Aucune image valide (fichiers vides).")

    try:

        quote = compute_quote(room_type, area_m2, quality_tier)

        comparison = _comparison_rows(quote.room_type, quote.area_m2)

    except RuntimeError as e:

        raise HTTPException(status_code=503, detail=str(e)) from e

    except ValueError as e:

        raise HTTPException(status_code=400, detail=str(e)) from e

    except Exception as e:

        raise HTTPException(status_code=500, detail=f"Chiffrage impossible: {e!s}") from e



    return ProjectResponse(

        quote=_quote_to_payload(quote),

        projection_url="",

        prompt_used_en="Image générée côté client (Replicate /api/generate).",

        vision_used=True,

        quality_tier=quote.quality_tier,

        quality_label=quote.quality_label,

        comparison_tiers=comparison,

    )





class QuoteOnlyRequest(BaseModel):

    """Chiffrage sans appels IA externes (tests ou grille seule)."""



    room_type: str

    area_m2: float = Field(gt=0)

    quality_tier: str = "standard"





@app.post("/api/quote", response_model=QuotePayload)

def quote_only(body: QuoteOnlyRequest) -> QuotePayload:

    try:

        q = compute_quote(body.room_type, body.area_m2, body.quality_tier)

        return _quote_to_payload(q)

    except ValueError as e:

        raise HTTPException(status_code=400, detail=str(e)) from e


