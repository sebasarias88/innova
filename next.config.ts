import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    // Las fotos ya están comprimidas (40–240 KB). Se sirven directo desde /public
    // para evitar depender del optimizador de Vercel en el demo.
    unoptimized: true,
  },
};

export default nextConfig;
