/**
 * Every uploaded image has a small thumbnail next to it, used by catalog cards
 * and lists: "products/<id>/<uuid>.webp" → "products/<id>/<uuid>.thumb.webp".
 */
export function thumbPath(path: string) {
  return path.replace(/\.[a-z0-9]+$/i, ".thumb.webp");
}

/** Image file plus its thumbnail (for deleting both). */
export const withThumbs = (paths: string[]) => paths.flatMap((p) => [p, thumbPath(p)]);

/** Same rule on a public URL: the thumbnail sits next to the full image. */
export function thumbUrl(url: string) {
  return url.replace(/\.[a-z0-9]+(?=$|\?)/i, ".thumb.webp");
}
