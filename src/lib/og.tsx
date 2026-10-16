import "server-only";
import { readFile } from "node:fs/promises";
import { join } from "node:path";
import { ImageResponse } from "next/og";

/** Size of every share image (Facebook, WhatsApp, LinkedIn, X). */
export const ogSize = { width: 1200, height: 630 };

const asset = (file: string) => readFile(join(process.cwd(), "src/assets/og", file));

/**
 * Branded share image: the INNOVA circuit background, the logo and a title.
 * Used by services, coverage cities and key pages so every link shared on
 * WhatsApp or social media shows what the page is about.
 */
export async function brandOg({ eyebrow, title, subtitle }: { eyebrow: string; title: string; subtitle?: string }) {
  const [bg, logo, regular, bold] = await Promise.all([asset("og-bg.jpg"), asset("logo-og.png"), asset("sora-400.ttf"), asset("sora-700.ttf")]);
  const src = (buf: Buffer, type: string) => `data:${type};base64,${buf.toString("base64")}`;

  return new ImageResponse(
    (
      <div style={{ width: "100%", height: "100%", display: "flex", position: "relative", fontFamily: "Sora", color: "white" }}>
        {/* eslint-disable-next-line @next/next/no-img-element, jsx-a11y/alt-text */}
        <img src={src(bg, "image/jpeg")} width={1200} height={630} style={{ position: "absolute", inset: 0 }} />
        <div
          style={{
            position: "absolute",
            inset: 0,
            background: "linear-gradient(90deg, rgba(4,6,12,0.92) 0%, rgba(4,6,12,0.75) 55%, rgba(4,6,12,0.1) 100%)",
          }}
        />
        <div style={{ position: "relative", display: "flex", flexDirection: "column", justifyContent: "space-between", padding: "64px 72px", width: "100%" }}>
          {/* eslint-disable-next-line @next/next/no-img-element, jsx-a11y/alt-text */}
          <img src={src(logo, "image/png")} width={380} height={Math.round((380 * 184) / 640)} />
          <div style={{ display: "flex", flexDirection: "column", maxWidth: 860 }}>
            <div style={{ fontSize: 24, fontWeight: 700, letterSpacing: 6, color: "#3a78ff", textTransform: "uppercase" }}>{eyebrow}</div>
            <div style={{ marginTop: 14, fontSize: title.length > 34 ? 58 : 70, fontWeight: 700, lineHeight: 1.05, letterSpacing: -1.5 }}>{title}</div>
            {subtitle && <div style={{ marginTop: 18, fontSize: 28, color: "rgba(255,255,255,0.75)", lineHeight: 1.3 }}>{subtitle}</div>}
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 16, fontSize: 22, color: "rgba(255,255,255,0.6)" }}>
            <div style={{ width: 56, height: 4, background: "#2f6bff" }} />
            Armenia, Quindío · WhatsApp 321 853 9336
          </div>
        </div>
      </div>
    ),
    {
      ...ogSize,
      fonts: [
        { name: "Sora", data: regular, weight: 400, style: "normal" },
        { name: "Sora", data: bold, weight: 700, style: "normal" },
      ],
    },
  );
}
