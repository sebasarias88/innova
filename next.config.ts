import type { NextConfig } from "next";

// Security headers for every response. A full Content-Security-Policy is added
// together with the Wompi checkout (it needs the widget's domains).
const securityHeaders = [
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
