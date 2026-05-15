"""
Grille `prix_renovation.json` (racine du dépôt) : fourchettes €/m² TTC par pièce et par gamme.
Conversion HT pour rester aligné avec l’API (TVA 10 % — logement > 2 ans, travaux courants).
"""

from __future__ import annotations

import json
from functools import lru_cache
from pathlib import Path
from typing import Any, Final

from app.services.quality_tiers import normalize_tier

# JSON keys ↔ gammes UI / API
_TIER_BAND: Final[dict[str, str]] = {
    "economique": "entree_de_gamme",
    "standard": "milieu_de_gamme",
    "premium": "haut_de_gamme",
}

# Grille fournie en TTC ; affichage API en HT (cf. facteurs_variation.tva dans le JSON).
_TTC_TO_HT: Final[float] = 1.10


def _repo_root() -> Path:
    # backend/app/services/renov_catalog.py → parents[3] = racine du repo
    return Path(__file__).resolve().parents[3]


def default_catalog_path() -> Path:
    return _repo_root() / "prix_renovation.json"


@lru_cache
def _load_catalog_raw() -> dict[str, Any] | None:
    path = default_catalog_path()
    if not path.is_file():
        return None
    try:
        data = json.loads(path.read_text(encoding="utf-8"))
    except (OSError, json.JSONDecodeError):
        return None
    return data if isinstance(data, dict) else None


def catalog_loaded() -> bool:
    return _load_catalog_raw() is not None


def catalog_rates_per_m2_ht(room_type: str, quality_tier: str | None) -> tuple[float, float, float] | None:
    """
    Retourne (prix_min_ht/m², prix_moyen_ht/m², prix_max_ht/m²) si la pièce et la gamme
    existent dans le catalogue, sinon None.
    """
    raw = _load_catalog_raw()
    if not raw:
        return None
    pieces = raw.get("pieces")
    if not isinstance(pieces, dict):
        return None
    piece = pieces.get(room_type)
    if not isinstance(piece, dict):
        return None
    band_key = _TIER_BAND.get(normalize_tier(quality_tier))
    if not band_key:
        return None
    band = piece.get(band_key)
    if not isinstance(band, dict):
        return None
    try:
        pmin = float(band["prix_min"])
        pmid = float(band["prix_moyen"])
        pmax = float(band["prix_max"])
    except (KeyError, TypeError, ValueError):
        return None
    inv = 1.0 / _TTC_TO_HT
    return (round(pmin * inv, 2), round(pmid * inv, 2), round(pmax * inv, 2))
