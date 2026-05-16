"use client";
import * as Accordion from "@radix-ui/react-accordion";
import { Plus } from "lucide-react";

const ITEMS = [
  { q: "À qui s'adresse ArtiVision ?", a: "Aux artisans de la rénovation (plombiers, peintres, carreleurs, cuisinistes, tout corps d'état) qui veulent gagner du temps en visite et en prospection à distance." },
  { q: "Faut-il être expert en informatique ?", a: "Non. L'inscription prend 5 minutes. Vous choisissez vos spécialités, ajustez vos prix sur un modèle pré-rempli, et c'est prêt." },
  { q: "L'estimation est-elle un devis officiel ?", a: "Non. C'est une fourchette indicative basée sur vos tarifs au m². Elle sert à amorcer la discussion et déclencher une visite chantier." },
  { q: "Que voit le client à l'ouverture du lien ?", a: "Une page à vos couleurs et avec votre logo. Il prend ses photos, obtient la projection IA et la fourchette, puis peut valider pour vous transmettre l'info." },
  { q: "Mes données et celles de mes clients sont-elles protégées ?", a: "Oui. Hébergement européen, conformité RGPD, chiffrement en transit et au repos." },
  { q: "Puis-je arrêter mon abonnement à tout moment ?", a: "Oui, sans engagement. Vous gardez l'accès jusqu'à la fin du mois en cours." },
];

export function FAQ() {
  return (
    <section className="py-24 sm:py-32 bg-bg-soft">
      <div className="container max-w-3xl">
        <div className="text-center mb-14">
          <div className="inline-block text-xs font-semibold tracking-wider text-brand-600 uppercase mb-3">FAQ</div>
          <h2 className="font-display text-display-lg">Vos questions, nos réponses</h2>
        </div>

        <Accordion.Root type="single" collapsible className="space-y-3">
          {ITEMS.map((item, i) => (
            <Accordion.Item
              key={i}
              value={`item-${i}`}
              className="bg-bg-elev border border-border rounded-lg overflow-hidden data-[state=open]:shadow-soft"
            >
              <Accordion.Header>
                <Accordion.Trigger className="group w-full flex items-center justify-between gap-4 p-6 text-left hover:bg-surface transition-colors">
                  <span className="font-display font-semibold text-base sm:text-lg">{item.q}</span>
                  <Plus className="w-5 h-5 text-text-dim shrink-0 transition-transform group-data-[state=open]:rotate-45" />
                </Accordion.Trigger>
              </Accordion.Header>
              <Accordion.Content className="overflow-hidden data-[state=open]:animate-accordion-down data-[state=closed]:animate-accordion-up">
                <div className="px-6 pb-6 text-text-soft leading-relaxed">{item.a}</div>
              </Accordion.Content>
            </Accordion.Item>
          ))}
        </Accordion.Root>
      </div>
    </section>
  );
}
