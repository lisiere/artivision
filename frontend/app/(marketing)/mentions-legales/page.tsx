import Link from "next/link";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";

export const metadata = {
  title: "Mentions légales",
  description: "Informations légales relatives au site ArtiVision.",
};

export default function MentionsLegalesPage() {
  return (
    <>
      <Header />
      <main className="overflow-hidden pt-24">
        <div className="container mx-auto max-w-2xl py-12 lg:py-16">
          <Link href="/" className="text-sm font-semibold text-brand-600 no-underline hover:underline">
            ← Retour à l&apos;accueil
          </Link>
          <h1 className="mt-8 font-display text-3xl font-bold tracking-tight">Mentions légales</h1>
          <p className="mt-4 text-sm leading-relaxed text-text-soft">
            Ce site présente une démonstration produit (ArtiVision). Les contenus, fourchettes de prix et images générées
            sont strictement indicatifs et ne constituent pas une offre contractuelle. L&apos;éditeur du site peut être
            contacté à l&apos;adresse indiquée sur la page d&apos;accueil.
          </p>
          <p className="mt-4 text-sm leading-relaxed text-text-soft">
            Pour toute demande relative aux données personnelles ou au droit d&apos;accès, utilisez le lien Contact de la
            vitrine.
          </p>
        </div>
      </main>
      <Footer />
    </>
  );
}
