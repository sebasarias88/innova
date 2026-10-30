import type { MetadataRoute } from "next";
import { isIndexable, siteUrl } from "@/lib/site-url";

// Link-preview bots (WhatsApp, Facebook, X, LinkedIn, Telegram…) must always be
// able to read the page and its share image, even while Google is kept out.
const previewBots = ["facebookexternalhit", "Facebot", "meta-externalagent", "WhatsApp", "Twitterbot", "LinkedInBot", "TelegramBot", "Slackbot", "Discordbot", "Pinterestbot"];

export default function robots(): MetadataRoute.Robots {
  const preview = { userAgent: previewBots, allow: "/", disallow: ["/admin", "/api/"] };
  if (!isIndexable()) return { rules: [preview, { userAgent: "*", disallow: "/" }] };
  return {
    rules: [preview, { userAgent: "*", allow: "/", disallow: ["/admin", "/api/", "/carrito", "/pago", "/offline", "/mantenimiento"] }],
    sitemap: `${siteUrl()}/sitemap.xml`,
    host: siteUrl(),
  };
}
