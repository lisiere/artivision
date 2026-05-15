"""
Configuration centralisée (variables d'environnement + tarifs par défaut).
Les tarifs peuvent être surchargés via JSON dans la variable ROOM_RATES_JSON.
"""

from __future__ import annotations

import json
from functools import lru_cache
from typing import Any

from pydantic import Field
from pydantic_settings import BaseSettings, SettingsConfigDict


# Profils de pièce : tarif moyen HT au m² et fourchette (coefficients min/max).
# Base documentée pour la bêta — ajustable sans toucher au code métier si ROOM_RATES_JSON est défini.
_DEFAULT_ROOM_RATES: dict[str, dict[str, Any]] = {
    "cuisine": {
        "label": "Cuisine",
        "base_eur_per_m2": 380.0,
        "low_factor": 0.88,
        "high_factor": 1.12,
        "dalle_style_hints": (
            "modern high-end kitchen renovation, matte dark wood cabinets, "
            "quartz worktop, integrated LED lighting, stainless steel appliances, "
            "clean minimalist lines, professional interior photography"
        ),
    },
    "salle_de_bain": {
        "label": "Salle de bain",
        "base_eur_per_m2": 420.0,
        "low_factor": 0.87,
        "high_factor": 1.15,
        "dalle_style_hints": (
            "luxury bathroom renovation, large format neutral tiles, walk-in shower with glass panel, "
            "wall-hung vanity, premium fixtures, soft daylight, spa-like atmosphere"
        ),
    },
    "salon": {
        "label": "Salon",
        "base_eur_per_m2": 95.0,
        "low_factor": 0.85,
        "high_factor": 1.18,
        "dalle_style_hints": (
            "elegant living room after renovation, fresh neutral paint, oak engineered flooring, "
            "refined lighting, curated furniture layout, bright and airy"
        ),
    },
    "chambre": {
        "label": "Chambre",
        "base_eur_per_m2": 85.0,
        "low_factor": 0.85,
        "high_factor": 1.15,
        "dalle_style_hints": (
            "serene bedroom renovation, soft tones, new flooring, built-in wardrobes, "
            "quality textiles, calm natural light"
        ),
    },
    "autre": {
        "label": "Autre pièce",
        "base_eur_per_m2": 110.0,
        "low_factor": 0.86,
        "high_factor": 1.14,
        "dalle_style_hints": (
            "professional interior renovation, clean finishes, neutral palette, "
            "well-lit, realistic architectural photography"
        ),
    },
}


def _parse_room_rates_json(raw: str | None) -> dict[str, dict[str, Any]] | None:
    if not raw or not raw.strip():
        return None
    try:
        data = json.loads(raw)
    except json.JSONDecodeError:
        return None
    if not isinstance(data, dict):
        return None
    return data  # type: ignore[return-value]


class Settings(BaseSettings):
    """Charge les variables depuis `.env` à la racine du dossier backend."""

    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        extra="ignore",
    )

    # Gemini (vision + description de scène pour le prompt image)
    gemini_api_key: str = ""
    # Modèle multimodal (Google AI Studio). Les anciens id ex. gemini-1.5-flash peuvent renvoyer 404.
    gemini_vision_model: str = "gemini-2.5-flash"

    # Hugging Face : retiré — génération d’images via Replicate (Next.js).

    cors_origins: str = (
        "http://localhost:3000,http://127.0.0.1:3000,"
        "http://localhost:3001,http://127.0.0.1:3001"
    )
    cors_allow_vercel: bool = Field(
        default=False,
        description="Si True, autorise en plus les origines *.vercel.app (préprod / previews Vercel).",
    )
    port: int = 8000

    # Tarifs optionnels (JSON) pour surcharger _DEFAULT_ROOM_RATES sans redéployer le code.
    room_rates_json: str | None = None

    @property
    def cors_origins_list(self) -> list[str]:
        return [o.strip() for o in self.cors_origins.split(",") if o.strip()]

    @property
    def cors_allow_origin_regex(self) -> str:
        localhost = r"^https?://(localhost|127\.0\.0\.1)(:\d+)?$"
        if self.cors_allow_vercel:
            vercel = r"^https://[\w.-]+\.vercel\.app$"
            return f"(?:{localhost})|(?:{vercel})"
        return localhost

    @property
    def room_rates(self) -> dict[str, dict[str, Any]]:
        override = _parse_room_rates_json(self.room_rates_json)
        if override:
            merged = {**_DEFAULT_ROOM_RATES}
            for key, val in override.items():
                if isinstance(val, dict) and key in merged:
                    merged[key] = {**merged[key], **val}
                elif isinstance(val, dict):
                    merged[key] = val
            return merged
        return dict(_DEFAULT_ROOM_RATES)


@lru_cache
def get_settings() -> Settings:
    # Pydantic lit automatiquement PORT depuis l'environnement (hébergement PaaS).
    return Settings()
