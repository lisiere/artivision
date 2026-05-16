import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { HowItWorks } from "@/components/marketing/HowItWorks";
import { Features } from "@/components/marketing/Features";
import { CTA } from "@/components/marketing/CTA";

export const metadata = { title: "Méthode — ArtiVision" };

export default function MethodePage() {
  return (
    <>
      <Header />
      <main className="overflow-hidden pt-24">
        <section className="py-16 sm:py-24">
          <div className="container max-w-3xl text-center">
            <div className="mb-3 inline-block text-xs font-semibold uppercase tracking-wider text-brand-600">
              La méthode
            </div>
            <h1 className="font-display text-display-xl mb-6">
              Du chantier au lead, <span className="grad-brand-text">en quelques minutes</span>.
            </h1>
            <p className="text-lg text-text-soft">
              ArtiVision suit une logique simple : capturer, lire, projeter, transmettre. Chaque étape réduit les
              allers-retours et fluidifie la décision client.
            </p>
          </div>
        </section>
        <HowItWorks />
        <Features />
        <CTA />
      </main>
      <Footer />
    </>
  );
}
