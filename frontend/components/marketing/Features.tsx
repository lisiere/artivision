import { Camera, Brain, FileCheck, Send, Palette, BarChart3 } from "lucide-react";

const FEATURES = [
  { icon: Camera,    title: "Photo & projection",     desc: "Une ou plusieurs photos, l\u2019IA reconstitue et propose la rénovation." },
  { icon: Brain,     title: "Analyse intelligente",   desc: "Type de pièce, matériaux, état — détectés automatiquement." },
  { icon: BarChart3, title: "Chiffrage personnalisé", desc: "Vos tarifs au m². Trois gammes. Une fourchette claire." },
  { icon: Send,      title: "Lien client unique",     desc: "Envoyez un lien personnalisé. Le client teste, vous recevez le lead." },
  { icon: Palette,   title: "Aux couleurs de votre marque", desc: "Logo, couleurs, ton — le client voit votre identité." },
  { icon: FileCheck, title: "Proposition exportable", desc: "PDF prêt à envoyer, base solide pour le devis détaillé." },
];

export function Features() {
  return (
    <section className="py-24 sm:py-32">
      <div className="container">
        <div className="max-w-2xl mx-auto text-center mb-16">
          <div className="inline-block text-xs font-semibold tracking-wider text-brand-600 uppercase mb-3">
            Ce que vous obtenez
          </div>
          <h2 className="font-display text-display-lg mb-5">
            Tout ce qu&apos;il faut pour <span className="grad-brand-text">vendre vite</span>, rien de plus.
          </h2>
          <p className="text-lg text-text-soft">
            Un outil pensé pour la visite chantier comme pour la prospection à distance.
          </p>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {FEATURES.map((f) => (
            <div
              key={f.title}
              className="group relative p-7 rounded-lg bg-bg-elev border border-border hover:border-brand-300 dark:hover:border-brand-700 transition-all hover:shadow-soft"
            >
              <div className="w-11 h-11 rounded-md bg-brand-50 dark:bg-brand-900/30 grid place-items-center mb-5 group-hover:scale-110 transition-transform">
                <f.icon className="w-5 h-5 text-brand-600 dark:text-brand-400" />
              </div>
              <h3 className="font-display font-semibold text-lg mb-2">{f.title}</h3>
              <p className="text-sm text-text-soft leading-relaxed">{f.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
