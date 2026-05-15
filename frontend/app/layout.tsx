import type { Metadata } from "next";
import { Plus_Jakarta_Sans } from "next/font/google";
import "./globals.css";

const artiFont = Plus_Jakarta_Sans({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-arti",
  weight: ["400", "500", "600", "700", "800"],
});

export const metadata: Metadata = {
  title: {
    default: "ArtiVision — Photo, projection, devis",
    template: "%s — ArtiVision",
  },
  description:
    "Projection et chiffrage pour les pros de la rénovation — ce que le client voit, ce que vous chiffrez.",
};
export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="fr" className={artiFont.variable}>
      <body className={`${artiFont.className} font-sans min-h-dvh text-slate-900 antialiased`}>
        {children}
      </body>
    </html>
  );
}
