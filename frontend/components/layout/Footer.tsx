import Link from "next/link";
import { Sparkles, Mail } from "lucide-react";

export function Footer() {
  return (
    <footer className="border-t border-border bg-bg-soft mt-32">
      <div className="container py-16">
        <div className="grid md:grid-cols-4 gap-10">
          <div className="md:col-span-2">
            <div className="flex items-center gap-2.5 mb-4">
              <div className="w-9 h-9 rounded-md grad-brand grid place-items-center">
                <Sparkles className="w-5 h-5 text-white" />
              </div>
              <div>
                <div className="font-display font-bold">ArtiVision</div>
                <div className="text-xs text-text-dim">VOTRE CHANTIER EN IMAGE</div>
              </div>
            </div>
            <p className="text-sm text-text-soft max-w-sm leading-relaxed">
              L&apos;outil de projection visuelle et de chiffrage instantané, conçu pour les artisans qui veulent vendre vite et bien.
            </p>
          </div>

          <div>
            <div className="text-xs font-semibold tracking-wider text-text-dim mb-4">PRODUIT</div>
            <ul className="space-y-2.5 text-sm">
              <li><Link href="/methode"  className="text-text-soft hover:text-text">Méthode</Link></li>
              <li><Link href="/pricing"  className="text-text-soft hover:text-text">Tarifs</Link></li>
              <li><Link href="/demo"     className="text-text-soft hover:text-text">Démo</Link></li>
              <li><Link href="/signup"   className="text-text-soft hover:text-text">Créer un compte</Link></li>
            </ul>
          </div>

          <div>
            <div className="text-xs font-semibold tracking-wider text-text-dim mb-4">CONTACT</div>
            <a href="mailto:contact@artivision.app" className="inline-flex items-center gap-2 text-sm text-text-soft hover:text-text">
              <Mail className="w-4 h-4" />
              contact@artivision.app
            </a>
            <div className="mt-4">
              <Link href="/mentions-legales" className="text-sm text-text-soft hover:text-text">Mentions légales</Link>
            </div>
          </div>
        </div>

        <div className="mt-12 pt-8 border-t border-border flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-text-dim">
          <div>© 2026 ArtiVision. Tous droits réservés.</div>
          <div>Fabriqué avec ❤️ en France</div>
        </div>
      </div>
    </footer>
  );
}
