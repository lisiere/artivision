"use client";
import { motion } from "framer-motion";
import Link from "next/link";
import { ArrowRight, Sparkles, Check, Bell, Camera } from "lucide-react";
import { Button } from "@/components/ui/Button";

export function Hero() {
  return (
    <section className="relative pt-32 pb-24 sm:pt-40 sm:pb-32">
      {/* Background mesh */}
      <div className="absolute inset-0 grad-mesh pointer-events-none">
      </div>
      <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-brand-500/30 to-transparent">
      </div>

      <div className="container relative">
        <div className="grid lg:grid-cols-[1.1fr_1fr] gap-16 lg:gap-12 items-center">
          {/* LEFT — Copy */}
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
            className="text-center lg:text-left"
          >
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-sm bg-bg-elev border border-border shadow-soft mb-6">
              <Sparkles className="w-3.5 h-3.5 text-brand-600" />
              <span className="text-xs font-medium text-text-soft">Nouvelle version disponible</span>
            </div>

            <h1 className="font-display text-display-2xl mb-6">
              Ce que le client voit,<br />
              <span className="grad-brand-text">ce que vous chiffrez.</span>
            </h1>

            <p className="text-lg sm:text-xl text-text-soft max-w-xl mx-auto lg:mx-0 leading-relaxed mb-10">
              Photographiez une pièce, ArtiVision projette la rénovation et calcule une fourchette à partir de <em>vos</em> tarifs. Envoyez le lien à votre client — il reçoit, il valide, vous récupérez le lead.
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-3 mb-8">
              <Link href="/signup">
                <Button variant="gradient" size="xl" className="w-full sm:w-auto">
                  Commencer gratuitement
                  <ArrowRight className="w-4 h-4" />
                </Button>
              </Link>
              <Link href="/demo">
                <Button variant="outline" size="xl" className="w-full sm:w-auto">
                  Voir la démo
                </Button>
              </Link>
            </div>

            <div className="flex flex-wrap items-center justify-center lg:justify-start gap-x-5 gap-y-2 text-xs text-text-dim">
              <div className="inline-flex items-center gap-1.5"><Check className="w-3.5 h-3.5 text-emerald-500" /> 3 liens gratuits / mois</div>
              <div className="inline-flex items-center gap-1.5"><Check className="w-3.5 h-3.5 text-emerald-500" /> Sans carte bancaire</div>
              <div className="inline-flex items-center gap-1.5"><Check className="w-3.5 h-3.5 text-emerald-500" /> Configuration en 5 min</div>
            </div>
          </motion.div>

          {/* RIGHT — Mockup mobile */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.9, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
            className="relative"
          >
            <PhoneMockup />
          </motion.div>
        </div>
      </div>
    </section>
  );
}

function PhoneMockup() {
  return (
    <div className="relative mx-auto max-w-[340px]">
      {/* Halo behind */}
      <div className="absolute inset-0 -m-12 grad-brand opacity-20 blur-3xl rounded-full pointer-events-none">
      </div>

      {/* Floating notification */}
      <motion.div
        initial={{ opacity: 0, y: -20, x: 40 }}
        animate={{ opacity: 1, y: 0, x: 40 }}
        transition={{ delay: 1.1, duration: 0.6 }}
        className="absolute -top-4 -right-12 z-20 hidden sm:flex glass rounded-lg px-4 py-3 shadow-lg w-64 items-start gap-3"
      >
        <div className="w-9 h-9 rounded-sm grad-brand grid place-items-center flex-shrink-0">
          <Bell className="w-4 h-4 text-white" />
        </div>
        <div className="leading-tight">
          <div className="text-xs font-semibold">Nouveau lead validé</div>
          <div className="text-[11px] text-text-soft mt-0.5">Mme Dupont — SDB 6m² • Estimation 9 600 € HT</div>
        </div>
      </motion.div>

      {/* Phone frame */}
      <div className="relative aspect-[9/19] rounded-[2.5rem] bg-gradient-to-b from-zinc-900 to-zinc-800 p-2.5 shadow-lg">
        <div className="absolute top-2.5 inset-x-0 mx-auto w-32 h-6 bg-black rounded-b-2xl z-10">
        </div>
        <div className="relative w-full h-full rounded-[2rem] overflow-hidden bg-bg-soft">
          {/* Screen content */}
          <div className="absolute inset-0 p-4 pt-10">
            <div className="text-[10px] text-text-dim font-medium mb-2">PROJECTION IA</div>
            <div className="relative rounded-lg overflow-hidden aspect-[4/3] grad-brand">
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_30%,rgba(255,255,255,0.3),transparent_60%)]">
              </div>
              <div className="absolute bottom-2 left-2 right-2 glass rounded-sm px-2.5 py-1.5">
                <div className="text-[9px] text-white font-medium">Salle de bain · 6 m²</div>
                <div className="text-[8px] text-white/70">Gamme Premium</div>
              </div>
            </div>

            <div className="mt-3 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-[10px] text-text-soft">Fourchette</span>
                <span className="text-xs font-semibold">8 400 — 11 200 € HT</span>
              </div>
              <div className="h-1.5 rounded-full bg-surface overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: "72%" }}
                  transition={{ delay: 1.4, duration: 1.2, ease: "easeOut" }}
                  className="h-full grad-brand"
                />
              </div>
            </div>

            <div className="mt-4 grid grid-cols-2 gap-2">
              <Stat label="Photos" value="4" />
              <Stat label="Matériaux" value="12" />
            </div>

            <div className="mt-3 rounded-md grad-brand p-2.5 text-center">
              <div className="text-[10px] text-white font-semibold">Envoyer au client</div>
            </div>
          </div>
        </div>
      </div>

      {/* Floating camera button */}
      <motion.div
        initial={{ opacity: 0, scale: 0 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 1.3, type: "spring" }}
        className="absolute -bottom-4 -left-6 z-20 hidden sm:flex w-16 h-16 rounded-full grad-brand items-center justify-center shadow-glow"
      >
        <Camera className="w-6 h-6 text-white" />
      </motion.div>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-sm bg-surface px-2.5 py-2">
      <div className="text-[9px] text-text-dim">{label}</div>
      <div className="text-sm font-semibold mt-0.5">{value}</div>
    </div>
  );
}
