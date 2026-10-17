/**
 * WhatsApp click-to-chat links with a pre-written message.
 *
 * Emojis: the messages only use single-code-point emojis (👋 🛒 🚚 🧾 …).
 * Composed emojis (variation selector U+FE0F, ZWJ sequences, skin tones, flags)
 * are what some WhatsApp Web/Desktop versions turn into "?" or "�", so those
 * extra code points are stripped from any text (e.g. notes typed by a customer).
 * The link goes straight to api.whatsapp.com/send: the wa.me short link adds a
 * redirect that has been known to break emojis on desktop.
 */
const UNSAFE = /[\u{1F3FB}-\u{1F3FF}\uFE0E\uFE0F\u200D\u20E3]/gu;

export function waText(text: string) {
  return text
    .replace(UNSAFE, "")
    .replace(/[ \t]+$/gm, "")
    .replace(/^[ \t]+/gm, "")
    .replace(/ {2,}/g, " ")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}

/** Click-to-chat link; Colombian mobile numbers without country code get 57. */
export function waUrl(phone: string, text?: string) {
  let digits = phone.replace(/\D/g, "");
  if (digits.length === 10 && digits.startsWith("3")) digits = `57${digits}`;
  return `https://api.whatsapp.com/send?phone=${digits}${text ? `&text=${encodeURIComponent(waText(text))}` : ""}`;
}

/** "- 2 x Cámara IP 4 MP" lines for order summaries. */
export const itemLines = (items: { name: string; quantity: number }[]) => items.map((i) => `- ${i.quantity} x ${i.name}`);

/** Props for WhatsApp links: new tab, so the site stays open behind it. */
export const newTab = { target: "_blank", rel: "noopener noreferrer" } as const;
