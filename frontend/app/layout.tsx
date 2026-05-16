import type { Metadata } from "next";
import "./globals.css";
import { ThemeProvider } from "@/components/providers/ThemeProvider";

export const metadata: Metadata = {
  title: "ArtiVision — Votre chantier en image",
  description:
    "L'outil de projection visuelle et de chiffrage pour artisans de la rénovation. Photographiez, projetez, chiffrez — en quelques secondes.",
  metadataBase: new URL("https://artivision.app"),
  openGraph: {
    title: "ArtiVision — Votre chantier en image",
    description: "Projection IA et chiffrage instantané pour artisans.",
    type: "website",
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="fr" suppressHydrationWarning>
      <body>
        <ThemeProvider>{children}</ThemeProvider>
      </body>
    </html>
  );
}
