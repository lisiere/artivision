import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/Button";

export function PricingTeaser() {
  return (
    <section className="py-24 sm:py-32">
      <div className="container">
        <div className="relative overflow-hidden rounded-xl bg-bg-elev border border-border p-10 sm:p-16">
          <div className="absolute inset-0 grad-mesh opacity-50 pointer-events-none" />
          <div className="relative grid lg:grid-cols-2 gap-8 items-center">
            <div>
              <div className="text-xs font-semibold tracking-wider text-brand-600 uppercase mb-3">Tarifs</div>
              <h2 className="font-display text-display-lg mb-5">
                Démarrez gratuitement.<br />
                <span className="grad-brand-text">Évoluez à votre rythme.</span>
              </h2>
              <p className="text-lg text-text-soft mb-8">
                Trois liens clients gratuits chaque mois. Sans carte bancaire. Passez Pro quand vous voulez.
              </p>
              <Link href="/pricing">
                <Button variant="gradient" size="lg">
                  Voir les offres
                  <ArrowRight className="w-4 h-4" />
                </Button>
              </Link>
            </div>
            <div className="grid grid-cols-3 gap-3">
              <PlanMini name="Free"     price="0 €"   sub="3 liens / mois" />
              <PlanMini name="Pro"      price="29 €"  sub="50 liens / mois" featured />
              <PlanMini name="Business" price="79 €"  sub="Illimité" />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function PlanMini({ name, price, sub, featured = false }: { name: string; price: string; sub: string; featured?: boolean }) {
  return (
    <div className={`p-5 rounded-lg ${featured ? "grad-brand text-white shadow-glow" : "bg-bg border border-border"}`}>
      <div className={`text-xs font-medium ${featured ? "text-white/80" : "text-text-soft"}`}>{name}</div>
      <div className={`font-display font-bold text-2xl mt-1 ${featured ? "text-white" : ""}`}>{price}</div>
      <div className={`text-xs mt-1 ${featured ? "text-white/70" : "text-text-dim"}`}>{sub}</div>
    </div>
  );
}
