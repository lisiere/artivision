"use client";
import { motion } from "framer-motion";
import { cn } from "@/lib/cn";

interface AIScanProps {
  src: string;
  className?: string;
  /** Durée d'un cycle complet (scan + pause + reset), en secondes */
  duration?: number;
  caption?: { title: string; subtitle: string };
}

export function AIScan({
  src,
  className,
  duration = 4.8,
  caption = { title: "Salle de bain · 6 m²", subtitle: "Gamme Premium" },
}: AIScanProps) {
  return (
    <div className={cn("relative w-full h-full overflow-hidden", className)}>
      {/* COUCHE 1 — Image couleur (état "rénové", toujours visible en fond) */}
      <img
        src={src}
        alt="Projection IA de la rénovation"
        className="absolute inset-0 w-full h-full object-cover select-none"
        draggable={false}
      />

      {/* COUCHE 2 — Image gris/brut, masquée progressivement par le scan */}
      <motion.div
        className="absolute inset-0 will-change-[clip-path]"
        initial={{ clipPath: "inset(0 0 0 0%)" }}
        animate={{
          clipPath: [
            "inset(0 0 0 0%)",
            "inset(0 0 0 100%)",
            "inset(0 0 0 100%)",
            "inset(0 0 0 0%)",
            "inset(0 0 0 0%)",
          ],
        }}
        transition={{
          duration,
          repeat: Infinity,
          times: [0, 0.55, 0.82, 0.83, 1],
          ease: "linear",
        }}
      >
        <img
          src={src}
          alt=""
          className="absolute inset-0 w-full h-full object-cover select-none"
          draggable={false}
          style={{ filter: "grayscale(1) contrast(0.85) brightness(0.78)" }}
        />
        {/* Voile gris brut */}
        <div className="absolute inset-0 bg-zinc-800/35 mix-blend-multiply" />
      </motion.div>

      {/* COUCHE 3 — Grille tech subtile (effet "analyse algorithmique") */}
      <div
        className="absolute inset-0 pointer-events-none opacity-25 z-[1]"
        style={{
          backgroundImage: `
            linear-gradient(to right, rgba(168,85,247,0.3) 1px, transparent 1px),
            linear-gradient(to bottom, rgba(168,85,247,0.3) 1px, transparent 1px)
          `,
          backgroundSize: "24px 24px",
        }}
      />

      {/* COUCHE 4 — Rayon lumineux qui balaye */}
      <motion.div
        className="absolute top-0 bottom-0 z-10 pointer-events-none will-change-transform"
        style={{ width: "2px" }}
        initial={{ left: "-2%", opacity: 0 }}
        animate={{
          left: ["-2%", "100%", "100%", "-2%", "-2%"],
          opacity: [0, 1, 1, 0, 0],
        }}
        transition={{
          duration,
          repeat: Infinity,
          times: [0, 0.55, 0.82, 0.83, 1],
          ease: "linear",
        }}
      >
        {/* Halo large diffus derrière */}
        <div
          className="absolute top-0 bottom-0 -translate-x-1/2 w-32 pointer-events-none"
          style={{
            background:
              "linear-gradient(to right, transparent 0%, rgba(168,85,247,0.15) 35%, rgba(216,180,254,0.55) 50%, rgba(168,85,247,0.15) 65%, transparent 100%)",
            filter: "blur(8px)",
          }}
        />
        {/* Ligne nette lumineuse */}
        <div
          className="absolute top-0 bottom-0 w-full bg-white"
          style={{ boxShadow: "0 0 20px 4px rgba(192,132,252,0.9), 0 0 40px 8px rgba(168,85,247,0.5)" }}
        />
      </motion.div>

      {/* COUCHE 5 — Badge "ANALYSE IA" qui pulse */}
      <div className="absolute top-2 left-2 z-20">
        <motion.div
          className="px-2 py-1 rounded-sm backdrop-blur-md flex items-center gap-1.5"
          animate={{
            backgroundColor: [
              "rgba(0,0,0,0.65)",
              "rgba(0,0,0,0.65)",
              "rgba(124,58,237,0.85)",
              "rgba(124,58,237,0.85)",
              "rgba(0,0,0,0.65)",
            ],
          }}
          transition={{
            duration,
            repeat: Infinity,
            times: [0, 0.5, 0.6, 0.82, 1],
            ease: "linear",
          }}
        >
          <motion.span
            className="block w-1.5 h-1.5 rounded-full"
            animate={{
              backgroundColor: [
                "rgb(192,132,252)",
                "rgb(192,132,252)",
                "rgb(52,211,153)",
                "rgb(52,211,153)",
                "rgb(192,132,252)",
              ],
              boxShadow: [
                "0 0 6px rgba(192,132,252,0.8)",
                "0 0 6px rgba(192,132,252,0.8)",
                "0 0 6px rgba(52,211,153,0.9)",
                "0 0 6px rgba(52,211,153,0.9)",
                "0 0 6px rgba(192,132,252,0.8)",
              ],
            }}
            transition={{
              duration,
              repeat: Infinity,
              times: [0, 0.5, 0.6, 0.82, 1],
              ease: "linear",
            }}
          />
          <span className="text-[9px] font-bold tracking-wider text-white">
            ANALYSE IA
          </span>
        </motion.div>
      </div>

      {/* COUCHE 6 — Légende en bas */}
      <div className="absolute bottom-2 left-2 right-2 z-20 glass rounded-sm px-2.5 py-1.5">
        <div className="text-[9px] text-white font-medium">{caption.title}</div>
        <div className="text-[8px] text-white/75">{caption.subtitle}</div>
      </div>
    </div>
  );
}
