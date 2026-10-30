"use client";

/**
 * Last resort when even the main layout fails: plain HTML (no fonts or
 * components that could fail again), with WhatsApp to keep selling.
 */
export default function GlobalError({ retry }: { error: Error & { digest?: string }; retry: () => void }) {
  return (
    <html lang="es">
      <body style={{ margin: 0, minHeight: "100dvh", display: "grid", placeItems: "center", background: "#050816", color: "#fff", fontFamily: "system-ui, sans-serif", padding: 24 }}>
        <main style={{ maxWidth: 440, textAlign: "center" }}>
          <h1 style={{ fontSize: 28, lineHeight: 1.15 }}>No pudimos cargar la página</h1>
          <p style={{ color: "rgba(255,255,255,.7)" }}>Inténtalo de nuevo en un momento o escríbenos por WhatsApp.</p>
          <p style={{ display: "flex", flexDirection: "column", gap: 12, alignItems: "center", marginTop: 28 }}>
            <a
              href="https://api.whatsapp.com/send?phone=573218539336&text=Hola%2C%20INNOVA%20%F0%9F%91%8B%20Quisiera%20hacer%20un%20pedido%20o%20una%20consulta."
              target="_blank"
              rel="noopener noreferrer"
              style={{ background: "#25D366", color: "#050816", borderRadius: 999, padding: "14px 26px", fontWeight: 600, textDecoration: "none" }}
            >
              Pedir por WhatsApp
            </a>
            <button
              type="button"
              onClick={() => retry()}
              style={{ background: "none", border: "1px solid rgba(255,255,255,.25)", color: "#fff", borderRadius: 999, padding: "13px 26px", fontWeight: 600, cursor: "pointer" }}
            >
              Reintentar
            </button>
          </p>
        </main>
      </body>
    </html>
  );
}
