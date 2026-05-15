import Link from "next/link";

export const metadata = {
  title: "Mentions légales",
  description: "Informations légales relatives au site ArtiVision.",
};

export default function MentionsLegalesPage() {
  return (
    <main className="mx-auto max-w-2xl px-4 py-12 sm:px-6 lg:px-8 lg:py-16">
      <Link
        href="/"
        className="text-sm font-bold text-indigo-700 no-underline hover:underline"
      >
        ← Retour à l&apos;accueil
      </Link>
      <h1 className="mt-8 text-3xl font-black tracking-tight text-slate-900">Mentions légales</h1>
      <p className="mt-4 text-sm leading-relaxed text-slate-600">
        Ce site présente une démonstration produit (ArtiVision). Les contenus, fourchettes de prix et images générées sont
        strictement indicatifs et ne constituent pas une offre contractuelle. L&apos;éditeur du site peut être contacté
        à l&apos;adresse indiquée sur la page d&apos;accueil.
      </p>
      <p className="mt-4 text-sm leading-relaxed text-slate-600">
        Pour toute demande relative aux données personnelles ou au droit d&apos;accès, utilisez le lien Contact de la
        vitrine.
      </p>
    </main>
  );
}
