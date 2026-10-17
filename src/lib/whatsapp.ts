/**
 * WhatsApp click-to-chat links (wa.me) with a pre-written message.
 *
 * Emojis are removed on purpose: depending on the phone, WhatsApp Web/Desktop
 * version and browser, emojis in a pre-filled message sometimes arrive as "?"
 * or "�". Plain text with WhatsApp formatting (*bold*) always arrives intact.
 */
const EMOJI = /[\p{Extended_Pictographic}\u{1F1E6}-\u{1F1FF}\u{1F3FB}-\u{1F3FF}️‍⃣]/gu;

export function waText(text: string) {
  return text
    .replace(EMOJI, "")
    .replace(/[ \t]+$/gm, "")
    .replace(/^[ \t]+/gm, "")
    .replace(/ {2,}/g, " ")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}

/** wa.me link; Colombian mobile numbers without country code get 57. */
export function waUrl(phone: string, text?: string) {
  let digits = phone.replace(/\D/g, "");
  if (digits.length === 10 && digits.startsWith("3")) digits = `57${digits}`;
  return `https://wa.me/${digits}${text ? `?text=${encodeURIComponent(waText(text))}` : ""}`;
}

/** "- 2 x Cámara IP 4 MP" lines for order summaries. */
export const itemLines = (items: { name: string; quantity: number }[]) => items.map((i) => `- ${i.quantity} x ${i.name}`);
