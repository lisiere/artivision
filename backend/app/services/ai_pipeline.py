"""
Vision (Google Gemini) — analyse photo chantier (type de pièce + matériaux).
La génération d’images rénovées est déléguée au front (Replicate /api/generate).
"""

from __future__ import annotations

import json
import re
from io import BytesIO
from typing import Any

import google.generativeai as genai
from PIL import Image

from app.config import get_settings


def _pil_image(image_bytes: bytes) -> Image.Image:
    """Charge l’image pour Gemini (RGB si besoin)."""
    im = Image.open(BytesIO(image_bytes))
    if im.mode in ("RGBA", "P"):
        return im.convert("RGB")
    if im.mode != "RGB":
        return im.convert("RGB")
    return im


def _response_text_safe(response: Any) -> str:
    """Extrait le texte même si `response.text` lève (safety / candidats vides)."""
    try:
        return (response.text or "").strip()
    except ValueError:
        for cand in getattr(response, "candidates", None) or []:
            content = getattr(cand, "content", None)
            parts = getattr(content, "parts", None) or []
            for p in parts:
                t = getattr(p, "text", None)
                if t:
                    return str(t).strip()
        return ""


def _safe_parse_json_object(text: str) -> dict[str, Any] | None:
    text = text.strip()
    fence = re.search(r"```(?:json)?\s*([\s\S]*?)\s*```", text, re.IGNORECASE)
    if fence:
        text = fence.group(1).strip()
    try:
        obj = json.loads(text)
        return obj if isinstance(obj, dict) else None
    except json.JSONDecodeError:
        return None


def _require_gemini() -> None:
    if not get_settings().gemini_api_key.strip():
        raise RuntimeError(
            "GEMINI_API_KEY manquante dans backend/.env — requise pour l'analyse photo (Gemini)."
        )


def analyze_room_images(image_parts: list[tuple[bytes, str]]) -> dict[str, Any]:
    """
    Une ou plusieurs photos de la même pièce : synthèse type + matériaux (Gemini multimodal).
    `image_parts` : liste (bytes, mime) non vide, idéalement ≤ 8 images.
    """
    if not image_parts:
        raise ValueError("Au moins une image est requise pour l'analyse.")
    _require_gemini()
    settings = get_settings()
    genai.configure(api_key=settings.gemini_api_key)
    model = genai.GenerativeModel(settings.gemini_vision_model)

    schema_hint = (
        'Réponds uniquement avec un JSON compact, sans markdown : '
        '{"suggested_room_type": "cuisine|salle_de_bain|salon|chambre|autre", '
        '"confidence": 0.0-1.0, "materials": ["..."], "short_notes_fr": "...", '
        '"prompt_anchor_en": "One English sentence: what must stay aligned with the photos '
        '(visible layout, openings, fixtures, avoid inventing unseen areas).", '
        '"negative_extra_en": "Comma-separated English tokens to forbid hallucinations '
        '(e.g. extra toilet, new door, if not visible on photos)."}'
    )
    n = len(image_parts)
    if n == 1:
        intro = (
            "Tu es un expert en rénovation et reconnaissance d'intérieurs. "
            "À partir de la photo, identifie le type de pièce principal et propose 3 à 6 matériaux "
            "pertinents pour une rénovation (français). "
        )
    else:
        intro = (
            f"Tu es un expert en rénovation. L'utilisateur envoie {n} photos de la MÊME pièce "
            "(angles différents). Croise les vues pour affiner la lecture technique (volumes, "
            "matériaux visibles, état apparent). Identifie le type de pièce principal et propose "
            "3 à 8 matériaux ou postes de travaux pertinents pour une rénovation (français). "
        )
    prompt = intro + schema_hint

    try:
        content: list[Any] = [prompt]
        for image_bytes, _mime in image_parts:
            content.append(_pil_image(image_bytes))
        response = model.generate_content(
            content,
            generation_config=genai.types.GenerationConfig(
                max_output_tokens=1100 if n > 1 else 900,
                temperature=0.35,
            ),
        )
        raw = _response_text_safe(response)
    except Exception as e:  # noqa: BLE001
        detail = str(e)
        model_id = settings.gemini_vision_model
        hint = ""
        if "404" in detail or "not found" in detail.lower() or "not supported for generatecontent" in detail.lower():
            hint = (
                f"Le modèle configuré (« {model_id} ») n’est plus servi par l’API : mettez GEMINI_VISION_MODEL "
                "sur un modèle actuel (ex. gemini-2.5-flash ou gemini-2.5-flash-lite) dans backend/.env, puis "
                "redémarrez l’API. "
            )
        raise RuntimeError(
            "Gemini n'a pas pu analyser l'image. Vérifiez GEMINI_API_KEY, GEMINI_VISION_MODEL, les quotas "
            f"Google AI Studio, et réessayez. {hint}Détail : {detail}"
        ) from e

    parsed = _safe_parse_json_object(raw)
    if not parsed:
        return {
            "suggested_room_type": "autre",
            "confidence": 0.0,
            "materials": [],
            "short_notes_fr": raw[:500],
            "prompt_anchor_en": "",
            "negative_extra_en": "",
            "raw_model_output": raw,
        }
    parsed.setdefault("prompt_anchor_en", "")
    parsed.setdefault("negative_extra_en", "")
    if isinstance(parsed.get("prompt_anchor_en"), str):
        parsed["prompt_anchor_en"] = parsed["prompt_anchor_en"].strip()
    else:
        parsed["prompt_anchor_en"] = ""
    if isinstance(parsed.get("negative_extra_en"), str):
        parsed["negative_extra_en"] = parsed["negative_extra_en"].strip()
    else:
        parsed["negative_extra_en"] = ""
    return parsed


def analyze_room_image(image_bytes: bytes, mime_type: str) -> dict[str, Any]:
    """Compatibilité : une seule image."""
    return analyze_room_images([(image_bytes, mime_type)])
