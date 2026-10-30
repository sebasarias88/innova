import { site, waLink } from "@/lib/site";

/**
 * Tiny self-contained HTML pages for when things go wrong: no database, no
 * JavaScript, no external requests (only the logo, which the service worker
 * keeps cached). Used by /offline and /mantenimiento.
 */
export function fallbackHtml({ title, text, retry }: { title: string; text: string; retry: boolean }) {
  const wa = waLink("Hola, INNOVA 👋 Quisiera hacer un pedido o una consulta.").replace(/&/g, "&amp;");
  return `<!doctype html>
<html lang="es">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<meta name="robots" content="noindex">
<meta name="theme-color" content="#050816">
<title>${title} · ${site.shortName}</title>
<style>
  *{box-sizing:border-box}
  body{margin:0;min-height:100dvh;display:grid;place-items:center;background:#050816;color:#fff;
       font:16px/1.5 system-ui,-apple-system,"Segoe UI",Roboto,sans-serif;padding:24px}
  main{max-width:440px;text-align:center}
  img{height:44px;width:auto}
  h1{font-size:1.75rem;line-height:1.15;margin:32px 0 12px}
  p{color:rgba(255,255,255,.7);margin:0 0 28px}
  .actions{display:flex;flex-direction:column;gap:12px;align-items:center}
  a{display:inline-flex;align-items:center;justify-content:center;gap:8px;border-radius:999px;padding:14px 26px;
    font-weight:600;text-decoration:none;min-width:240px}
  .wa{background:#25D366;color:#050816}
  .retry{border:1px solid rgba(255,255,255,.2);color:#fff}
  a:focus-visible{outline:2px solid #e3f53b;outline-offset:3px}
  small{display:block;margin-top:28px;color:rgba(255,255,255,.45)}
</style>
</head>
<body>
<main>
  <img src="/brand/logo-white.svg" alt="${site.name}">
  <h1>${title}</h1>
  <p>${text}</p>
  <div class="actions">
    <a class="wa" href="${wa}" target="_blank" rel="noopener noreferrer">Pedir por WhatsApp</a>
    ${retry ? `<a class="retry" href="/">Reintentar</a>` : ""}
  </div>
  <small>${site.phone.label} · ${site.name}</small>
</main>
</body>
</html>`;
}
