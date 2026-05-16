import { Camera, Brain, Send } from "lucide-react";

const STEPS = [
  { n: "01", icon: Camera, title: "Saisie",  desc: "L'artisan ou le client prend en photo la pièce à rénover.",  color: "from-brand-500 to-brand-700" },
  { n: "02", icon: Brain,  title: "Analyse", desc: "L'IA identifie le type de pièce, les matériaux et propose un rendu rénové.", color: "from-violet-500 to-fuchsia-600" },
  { n: "03", icon: Send,   title: "Envoi",   desc: "Le rendu et la fourchette sont envoyés au client, prêts à validation.",     color: "from-fuchsia-500 to-pink-600" },
];

export function HowItWorks() {
  return (
    <section className="py-24 sm:py-32 bg-bg-soft">
      <div className="container">
        <div className="max-w-2xl mx-auto text-center mb-16">
          <div className="inline-block text-xs font-semibold tracking-wider text-brand-600 uppercase mb-3">
            La méthode
          </div>
          <h2 className="font-display text-display-lg mb-5">
            Trois temps, <span className="grad-brand-text">zéro friction</span>.
          </h2>
        </div>

        <div className="grid md:grid-cols-3 gap-5">
          {STEPS.map((s, i) => (
            <div key={s.n} className="relative p-8 rounded-lg bg-bg-elev border border-border">
              <div className="absolute -top-3 left-8 text-xs font-mono font-semibold text-text-dim tracking-wider px-2 py-0.5 bg-bg-elev border border-border rounded-sm">
                ÉTAPE {s.n}
              </div>
              <div className={`w-14 h-14 rounded-lg bg-gradient-to-br ${s.color} grid place-items-center mb-6 shadow-glow`}>
                <s.icon className="w-6 h-6 text-white" />
              </div>
              <h3 className="font-display font-bold text-2xl mb-3">{s.title}</h3>
              <p className="text-text-soft leading-relaxed">{s.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
