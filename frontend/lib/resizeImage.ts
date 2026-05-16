/**
 * Réduit les photos côté navigateur avant envoi API / stockage,
 * pour rester sous la limite Vercel (~4,5 Mo de corps de requête).
 */

export type ResizeImageOptions = {
  maxWidth?: number;
  quality?: number;
  /** Taille max cible du JPEG (octets) ; réduit qualité / largeur si dépassé. */
  maxBytes?: number;
};

/** Marge pour l'en-tête multipart + champs (limite fonction Vercel ≈ 4,5 Mo). */
export const UPLOAD_BODY_BUDGET_BYTES = 4 * 1024 * 1024;

function renderToJpegBlob(
  file: File,
  maxWidth: number,
  quality: number,
): Promise<Blob> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    const url = URL.createObjectURL(file);
    img.onload = () => {
      URL.revokeObjectURL(url);
      let { width, height } = img;
      if (width > maxWidth) {
        height = Math.round((height * maxWidth) / width);
        width = maxWidth;
      }
      const canvas = document.createElement("canvas");
      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext("2d");
      if (!ctx) {
        reject(new Error("Canvas non disponible"));
        return;
      }
      ctx.drawImage(img, 0, 0, width, height);
      canvas.toBlob(
        (blob) => {
          if (blob) resolve(blob);
          else reject(new Error("Impossible d'encoder l'image"));
        },
        "image/jpeg",
        quality,
      );
    };
    img.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error("Impossible de lire l'image"));
    };
    img.src = url;
  });
}

export async function resizeImageToJpegBlob(
  file: File,
  options: ResizeImageOptions = {},
): Promise<Blob> {
  let maxWidth = options.maxWidth ?? 1280;
  let quality = options.quality ?? 0.82;
  const maxBytes = options.maxBytes;

  let blob = await renderToJpegBlob(file, maxWidth, quality);
  if (!maxBytes || blob.size <= maxBytes) return blob;

  for (let i = 0; i < 8; i++) {
    if (quality > 0.52) {
      quality = Math.max(0.52, quality - 0.1);
    } else if (maxWidth > 640) {
      maxWidth = Math.round(maxWidth * 0.82);
      quality = 0.72;
    } else {
      break;
    }
    blob = await renderToJpegBlob(file, maxWidth, quality);
    if (blob.size <= maxBytes) return blob;
  }
  return blob;
}

export async function resizeImageToJpegFile(
  file: File,
  options?: ResizeImageOptions,
): Promise<File> {
  const blob = await resizeImageToJpegBlob(file, options);
  const base =
    file.name.replace(/\.[^.]+$/, "").trim() || "photo";
  return new File([blob], `${base}.jpg`, {
    type: "image/jpeg",
    lastModified: Date.now(),
  });
}

export function resizeImageToJpegDataUrl(
  file: File,
  maxWidth = 1280,
  quality = 0.82,
): Promise<string> {
  return resizeImageToJpegBlob(file, { maxWidth, quality }).then(
    (blob) =>
      new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(String(reader.result));
        reader.onerror = () => reject(new Error("Lecture de l'image impossible"));
        reader.readAsDataURL(blob);
      }),
  );
}

/**
 * Compresse chaque photo avant POST multipart (analyse multi-angles).
 */
export async function prepareImagesForUpload(files: File[]): Promise<File[]> {
  if (!files.length) return [];

  const n = files.length;
  const maxWidth = n >= 5 ? 960 : n >= 3 ? 1024 : 1280;
  const quality = n >= 6 ? 0.7 : n >= 4 ? 0.76 : 0.82;
  const overhead = 80_000;
  const perFileBudget = Math.max(
    180_000,
    Math.floor((UPLOAD_BODY_BUDGET_BYTES - overhead) / n),
  );

  let prepared = await Promise.all(
    files.map((f) =>
      resizeImageToJpegFile(f, { maxWidth, quality, maxBytes: perFileBudget }),
    ),
  );

  let total = prepared.reduce((sum, f) => sum + f.size, 0);
  if (total <= UPLOAD_BODY_BUDGET_BYTES) return prepared;

  prepared = await Promise.all(
    files.map((f) =>
      resizeImageToJpegFile(f, {
        maxWidth: 800,
        quality: 0.62,
        maxBytes: Math.min(320_000, perFileBudget),
      }),
    ),
  );

  total = prepared.reduce((sum, f) => sum + f.size, 0);
  if (total > UPLOAD_BODY_BUDGET_BYTES) {
    throw new Error(
      "Les photos restent trop lourdes après compression. Retirez une image ou utilisez des fichiers plus petits.",
    );
  }
  return prepared;
}
