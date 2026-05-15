import type { Metadata } from "next";
import type { ReactNode } from "react";

export const metadata: Metadata = {
  title: "ArtiVision — Photo, projection, devis sur le chantier",
  description:
    "Outil B2B pour artisans : une photo, une projection rénovée et une fourchette de devis en secondes. Conçu pour signer sur place.",
};

export default function MarketingLayout({ children }: { children: ReactNode }) {
  return children;
}
