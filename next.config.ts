import type { NextConfig } from "next";

const nextConfig: NextConfig = {
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
