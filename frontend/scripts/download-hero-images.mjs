// Télécharge l'image de la pièce rénovée pour le hero (effet scan IA)
// Usage : node scripts/download-hero-images.mjs
import { writeFile, mkdir, unlink } from "node:fs/promises";
import { existsSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const PUBLIC_DIR = join(__dirname, "..", "public");

const TARGET = "hero-room.jpg";
const SOURCES = [
  // SDB moderne haut de gamme — premier choix
  "https://images.unsplash.com/photo-1620626011761-996317b8d101?w=1400&q=85&auto=format&fit=crop",
  // Fallback 1
  "https://images.unsplash.com/photo-1552321554-5fefe8c9ef14?w=1400&q=85&auto=format&fit=crop",
  // Fallback 2
  "https://images.unsplash.com/photo-1600566753190-17f0baa2a6c3?w=1400&q=85&auto=format&fit=crop",
];

// Cleanup des anciens fichiers du slider avant/après s'ils traînent
const LEGACY = ["hero-before.jpg", "hero-after.jpg"];

async function cleanup() {
  for (const file of LEGACY) {
    const p = join(PUBLIC_DIR, file);
    if (existsSync(p)) {
      try {
        await unlink(p);
        console.log(`🧹 Supprimé ${file} (obsolète)`);
      } catch {}
    }
  }
}

async function download() {
  const target = join(PUBLIC_DIR, TARGET);
  if (existsSync(target)) {
    console.log(`✔︎ Déjà présent : ${TARGET} (skip)`);
    return;
  }
  for (const url of SOURCES) {
    try {
      console.log(`↓ Téléchargement ${TARGET} depuis Unsplash…`);
      const res = await fetch(url, { redirect: "follow" });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const buf = Buffer.from(await res.arrayBuffer());
      await writeFile(target, buf);
      console.log(`✔︎ ${TARGET} (${(buf.length / 1024).toFixed(0)} KB)`);
      return;
    } catch (err) {
      console.warn(`⚠ Échec ${url} : ${err.message}`);
    }
  }
  throw new Error(`Impossible de télécharger ${TARGET}. Place manuellement public/${TARGET}`);
}

async function main() {
  if (!existsSync(PUBLIC_DIR)) await mkdir(PUBLIC_DIR, { recursive: true });
  await cleanup();
  await download();
  console.log("\n✅ Image hero prête dans frontend/public/" + TARGET);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
