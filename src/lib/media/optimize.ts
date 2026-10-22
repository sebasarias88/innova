"use client";

/**
 * Image optimization in the browser, before uploading (same rules as VM Fashion):
 * WebP with a weight budget for the full image, plus a small thumbnail that the
 * catalog cards use. Keeps storage and egress low on the free plans.
 */
export const IMAGE_RULES = {
  full: { maxSide: 1600, budget: 150 * 1024 },
  thumb: { maxSide: 640, budget: 60 * 1024 },
} as const;

async function decode(file: Blob): Promise<ImageBitmap> {
  // `imageOrientation` respects the EXIF rotation of phone photos.
  return createImageBitmap(file, { imageOrientation: "from-image" });
}

function draw(bitmap: ImageBitmap, maxSide: number) {
  const scale = Math.min(1, maxSide / Math.max(bitmap.width, bitmap.height));
  const canvas = document.createElement("canvas");
  canvas.width = Math.max(1, Math.round(bitmap.width * scale));
  canvas.height = Math.max(1, Math.round(bitmap.height * scale));
  const ctx = canvas.getContext("2d")!;
  ctx.imageSmoothingQuality = "high";
  ctx.drawImage(bitmap, 0, 0, canvas.width, canvas.height);
  return canvas;
}

const toWebp = (canvas: HTMLCanvasElement, quality: number) =>
  new Promise<Blob | null>((resolve) => canvas.toBlob(resolve, "image/webp", quality));

/** Lowers quality, then size, until the file fits its budget. */
async function encode(bitmap: ImageBitmap, rule: { maxSide: number; budget: number }) {
  let side = rule.maxSide;
  let best: Blob | null = null;
  for (let attempt = 0; attempt < 4; attempt++) {
    const canvas = draw(bitmap, side);
    for (const quality of [0.82, 0.74, 0.66, 0.58, 0.5]) {
      const blob = await toWebp(canvas, quality);
      if (!blob || blob.type !== "image/webp") throw new Error("webp_unsupported");
      best = blob;
      if (blob.size <= rule.budget) return blob;
    }
    side = Math.round(side * 0.8);
  }
  return best!;
}

export async function optimizeImage(file: File): Promise<{ full: Blob; thumb: Blob }> {
  const bitmap = await decode(file);
  try {
    const full = await encode(bitmap, IMAGE_RULES.full);
    const thumb = await encode(bitmap, IMAGE_RULES.thumb);
    return { full, thumb };
  } finally {
    bitmap.close();
  }
}
