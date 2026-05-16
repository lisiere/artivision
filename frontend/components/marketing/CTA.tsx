import Link from "next/link";
import { ArrowRight, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/Button";

export function CTA() {
  return (
    <section className="py-24 sm:py-32">
      <div className="container">
        <div className="relative overflow-hidden rounded-xl grad-brand p-10 sm:p-16 text-center text-white shadow-glow">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(255,255,255,0.18),transparent_60%)] pointer-events-none" />
          <div className="relative">
            <Sparkles className="w-8 h-8 mx-auto mb-6 opacity-80" />
            <h2 className="font-display text-display-lg mb-5">Prêt à projeter vos chantiers ?</h2>
            <p className="text-lg sm:text-xl text-white/80 max-w-xl mx-auto mb-8">
              Trois liens clients gratuits ce mois-ci. Sans carte bancaire.
            </p>
            <Link href="/signup">
              <Button size="xl" className="bg-white text-brand-700 hover:bg-white/90">
                Créer mon compte
                <ArrowRight className="w-4 h-4" />
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
