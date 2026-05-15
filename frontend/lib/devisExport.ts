import { formatEur } from "@/lib/format";

export type DevisStoredV1 = {
  version: 1;
  roomLabel: string;
  areaM2: number;
  quoteLow: number;
  quoteHigh: number;
  materials?: string[];
};

export type DevisStoredV2 = {
  version: 2;
  roomLabel: string;
  areaM2: number;
  quoteLow: number;
  quoteHigh: number;
  materials?: string[];
  qualityTier: string;
  qualityLabel: string;
  comparisonTiers: { tier: string; label: string; lowHt: number; highHt: number }[];
};

export type DevisStored = DevisStoredV1 | DevisStoredV2;

function lines(...parts: string[]): string {
  return parts.filter(Boolean).join("\n");
}

export function buildDevisDraftText(data: DevisStored): string {
  const header = lines(
    "ARTIVISION — BROUILLON POUR DEVIS",
    "================================",
    "",
    `Pièce / lot : ${data.roomLabel}`,
    `Surface indiquée : ${data.areaM2} m²`,
    "",
  );

  const gamme =
    data.version === 2
      ? lines(
          `Gamme retenue pour la projection : ${data.qualityLabel} (${data.qualityTier})`,
          `Fourchette HT (gamme retenue) : ${formatEur(data.quoteLow)} — ${formatEur(data.quoteHigh)}`,
          "",
          "Comparatif des trois gammes (même surface, grille serveur) :",
          ...data.comparisonTiers.map(
            (r) => `  • ${r.label} : ${formatEur(r.lowHt)} — ${formatEur(r.highHt)} HT`,
          ),
          "",
        )
      : lines(
          `Fourchette HT indicative : ${formatEur(data.quoteLow)} — ${formatEur(data.quoteHigh)}`,
          "",
        );

  const mats =
    data.materials && data.materials.length > 0
      ? lines("Éléments repérés sur photo (IA) :", `  ${data.materials.join(" · ")}`, "")
      : "";

  const footer = lines(
    "Mentions : montants HT, hors options et imprévus chantier, TVA non incluse.",
    "La projection est une visualisation indicative, non contractuelle.",
    "",
    "Facturation électronique (France) : à partir de septembre 2026, les factures B2B devront",
    "transiter par des plateformes agréées — utilisez votre logiciel de gestion / devis certifié",
    "pour l’émission légale. Ce fichier sert de base pour rédiger votre devis.",
    "",
    `Document généré le ${new Date().toLocaleString("fr-FR")}`,
  );

  return lines(header, gamme, mats, footer);
}

export function downloadDevisDraft(data: DevisStored): void {
  const blob = new Blob([buildDevisDraftText(data)], { type: "text/plain;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = "artivision-devis-brouillon.txt";
  a.rel = "noopener";
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}
