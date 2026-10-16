import { ImageResponse } from "next/og";

// Default preview image when a link to the site is shared (WhatsApp, Facebook, X…).
// Pages with their own photo (products, services) override it.
export const alt = "INNOVA Seguridad y Sistemas · Cámaras de seguridad, energía solar y automatización en Armenia";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function OpengraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          padding: 72,
          background: "radial-gradient(circle at 85% 15%, #0660d8 0%, #04112e 45%, #020817 100%)",
          color: "white",
          fontFamily: "sans-serif",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
          <div style={{ width: 18, height: 18, borderRadius: 999, background: "#e9f205" }} />
          <div style={{ fontSize: 30, letterSpacing: 6, color: "#e9f205" }}>INNOVA SEGURIDAD Y SISTEMAS</div>
        </div>
        <div style={{ display: "flex", flexDirection: "column" }}>
          <div style={{ fontSize: 78, fontWeight: 800, lineHeight: 1.02, letterSpacing: -2 }}>Tecnología que protege,</div>
          <div style={{ fontSize: 78, fontWeight: 800, lineHeight: 1.02, letterSpacing: -2, color: "#e9f205" }}>conecta y transforma</div>
          <div style={{ marginTop: 28, fontSize: 28, color: "rgba(255,255,255,0.75)" }}>
            Cámaras de seguridad · Energía solar · Puertas automáticas · Domótica · UPS
          </div>
        </div>
        <div style={{ display: "flex", justifyContent: "space-between", fontSize: 26, color: "rgba(255,255,255,0.6)" }}>
          <div>Armenia · Quindío · Colombia</div>
          <div>WhatsApp 321 853 9336</div>
        </div>
      </div>
    ),
    size,
  );
}
