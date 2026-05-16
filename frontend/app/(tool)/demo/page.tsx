import { Header } from "@/components/layout/Header";
import { ArtiVisionHome } from "@/components/artivision/ArtiVisionHome";

export const metadata = { title: "Démo — ArtiVision" };

export default function DemoPage() {
  return (
    <>
      <Header />
      <main className="min-h-screen overflow-hidden pb-16 pt-24 grad-mesh">
        <div className="container">
          <div className="mx-auto mb-10 max-w-3xl text-center">
            <p className="mb-3 inline-block text-xs font-semibold uppercase tracking-wider text-brand-600">
              Démo gratuite
            </p>
            <h1 className="font-display text-display-lg mb-4">Testez la magie en direct</h1>
            <p className="text-lg text-text-soft">
              Uploadez une photo, choisissez le type de pièce, voyez le résultat. Créez un compte pour sauvegarder vos
              projets.
            </p>
          </div>
          <ArtiVisionHome />
        </div>
      </main>
    </>
  );
}
