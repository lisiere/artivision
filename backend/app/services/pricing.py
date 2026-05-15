"""
Chiffrage HT : si `prix_renovation.json` couvre la pièce, surface × fourchette catalogue (gamme) ;
sinon surface × tarif au m² (profil pièce) × coefficient de gamme × coefficients bas/haut.
"""

from __future__ import annotations

from dataclasses import dataclass
from typing import Any

from app.config import get_settings
from app.services.quality_tiers import TIER_DEFS, TIER_ORDER, normalize_tier
from app.services.renov_catalog import catalog_rates_per_m2_ht


@dataclass(frozen=True)
class QuoteResult:
    """Résultat chiffrage en euros HT."""

    area_m2: float
    room_type: str
    room_label: str
    base_rate_per_m2: float
    midpoint_ht: float
    low_ht: float
    high_ht: float
    quality_tier: str
    quality_label: str


def compute_quote(room_type: str, area_m2: float, quality_tier: str | None = None) -> QuoteResult:
    if area_m2 <= 0:
        raise ValueError("La surface doit être strictement positive.")

    tier = normalize_tier(quality_tier)
    tdef = TIER_DEFS[tier]

    rates = get_settings().room_rates
    key = room_type if room_type in rates else "autre"
    profile: dict[str, Any] = rates[key]
    label = str(profile.get("label", key))

    cat = catalog_rates_per_m2_ht(key, tier)
    if cat is not None:
        low_pm2, mid_pm2, high_pm2 = cat
        effective_rate = mid_pm2
        midpoint = round(area_m2 * mid_pm2, 2)
        low = round(area_m2 * low_pm2, 2)
        high = round(area_m2 * high_pm2, 2)
        return QuoteResult(
            area_m2=area_m2,
            room_type=key,
            room_label=label,
            base_rate_per_m2=effective_rate,
            midpoint_ht=midpoint,
            low_ht=low,
            high_ht=high,
            quality_tier=tier,
            quality_label=str(tdef["label_fr"]),
        )

    tier_mult = float(tdef["price_mult"])
    base = float(profile["base_eur_per_m2"])
    low_f = float(profile["low_factor"])
    high_f = float(profile["high_factor"])

    effective_rate = round(base * tier_mult, 2)
    midpoint = round(area_m2 * base * tier_mult, 2)
    low = round(midpoint * low_f, 2)
    high = round(midpoint * high_f, 2)

    return QuoteResult(
        area_m2=area_m2,
        room_type=key,
        room_label=label,
        base_rate_per_m2=effective_rate,
        midpoint_ht=midpoint,
        low_ht=low,
        high_ht=high,
        quality_tier=tier,
        quality_label=str(tdef["label_fr"]),
    )


def compute_tier_comparison(room_type: str, area_m2: float) -> list[QuoteResult]:
    """Les trois gammes pour la même pièce / surface (comparatif client sans coût OpenAI)."""
    return [compute_quote(room_type, area_m2, tid) for tid in TIER_ORDER]
