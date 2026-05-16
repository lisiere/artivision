import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { PricingTable } from "@/components/marketing/PricingTable";
import { FAQ } from "@/components/marketing/FAQ";

export const metadata = { title: "Tarifs — ArtiVision" };

export default function PricingPage() {
  return (
    <>
      <Header />
      <main className="overflow-hidden pt-24">
        <section className="py-16 sm:py-24">
          <div className="container max-w-3xl text-center">
            <div className="mb-3 inline-block text-xs font-semibold uppercase tracking-wider text-brand-600">
              Tarifs
            </div>
            <h1 className="font-display text-display-xl mb-6">
              Un prix simple, <span className="grad-brand-text">aligné sur votre activité</span>.
            </h1>
            <p className="text-lg text-text-soft">
              Démarrez gratuitement, passez Pro quand vos premiers leads tombent. Sans engagement.
            </p>
          </div>
        </section>
        <PricingTable />
        <FAQ />
      </main>
      <Footer />
    </>
  );
}
