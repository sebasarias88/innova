import type { NextConfig } from "next";

// Restrictive directives that do not interfere with Next.js inline scripts.
// Payments use Wompi's hosted page by redirect, so no third-party script runs here.
const csp = [
  "base-uri 'self'",
  "object-src 'none'",
  "frame-ancestors 'none'",
  "form-action 'self' https://checkout.wompi.co",
].join("; ");

// Security headers for every response.
const securityHeaders = [
  { key: "Content-Security-Policy", value: csp },
  { key: "Strict-Transport-Security", value: "max-age=63072000; includeSubDomains; preload" },
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "X-Frame-Options", value: "DENY" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=(), browsing-topics=()" },
];

const nextConfig: NextConfig = {
  poweredByHeader: false,
  async headers() {
    return [
      { source: "/:path*", headers: securityHeaders },
      { source: "/admin/:path*", headers: [{ key: "X-Robots-Tag", value: "noindex, nofollow" }] },
      // The service worker must always be re-checked so updates reach every visitor.
      { source: "/sw.js", headers: [{ key: "Cache-Control", value: "no-cache, no-store, must-revalidate" }, { key: "Service-Worker-Allowed", value: "/" }] },
      { source: "/offline", headers: [{ key: "X-Robots-Tag", value: "noindex" }] },
    ];
  },
  // Old demo URLs → keep shared links working
  async redirects() {
    return [
      { source: "/arma-tu-sistema", destination: "/", permanent: true },
      { source: "/servicios/cableado-estructurado", destination: "/servicios", permanent: true },
    ];
  },
  images: {
    // Las fotos ya están comprimidas (40–240 KB). Se sirven directo desde /public
    // para evitar depender del optimizador de Vercel en el demo.
    unoptimized: true,
  },
};

export default nextConfig;
