import type { Metadata } from "next";
import type { ReactNode } from "react";

export const metadata: Metadata = {
  title: "ArtiVision — Votre chantier en image",
  description:
    "Projection visuelle et chiffrage pour artisans de la rénovation. Photographiez, projetez, chiffrez en quelques secondes.",
};

export default function MarketingLayout({ children }: { children: ReactNode }) {
  return children;
}
