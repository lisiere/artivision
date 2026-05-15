"""
Gammes qualité / prix (v1) : même pièce et surface, trois niveaux pour aider le client à se projeter
et l’artisan à structurer son devis (Arthur : rendus + tranches + catalogue).
"""

from __future__ import annotations

from typing import Any, Final

# Ordre d’affichage : du plus accessible au plus haut de gamme
TIER_ORDER: Final[tuple[str, ...]] = ("economique", "standard", "premium")

TIER_DEFS: dict[str, dict[str, Any]] = {
    "economique": {
        "label_fr": "Économique",
        "hint_fr": "Finitions correctes, matériaux entrée de gamme, optimisation budget.",
        "price_mult": 0.78,
        "dalle_style_suffix": (
            "Budget-conscious renovation: clean functional layout, standard contractor-grade materials, "
            "simple durable finishes, realistic site-ready look without luxury details."
        ),
    },
    "standard": {
        "label_fr": "Standard",
        "hint_fr": "Bon rapport qualité / prix, finitions contemporaines durables.",
        "price_mult": 1.0,
        "dalle_style_suffix": (
            "Mid-market balanced renovation: contemporary finishes, durable materials, "
            "professional workmanship, appealing to typical residential clients."
        ),
    },
    "premium": {
        "label_fr": "Haut de gamme",
        "hint_fr": "Finitions haut de gamme, détails soignés, image premium pour convaincre.",
        "price_mult": 1.32,
        "dalle_style_suffix": (
            "High-end renovation: premium surfaces and fixtures, refined detailing, "
            "architectural interior photography quality, luxurious yet believable."
        ),
    },
}


def normalize_tier(raw: str | None) -> str:
    if not raw:
        return "standard"
    k = str(raw).strip().lower()
    return k if k in TIER_DEFS else "standard"


def tier_defs_for_api() -> list[dict[str, str]]:
    return [
        {
            "id": tid,
            "label": str(TIER_DEFS[tid]["label_fr"]),
            "hint": str(TIER_DEFS[tid]["hint_fr"]),
        }
        for tid in TIER_ORDER
    ]
