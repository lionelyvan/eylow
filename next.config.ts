import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async rewrites() {
    return [
      {
        source: "/",
        destination: "/artist-site.html", // Si tu l'as renommé en index.html, mets "/index.html" ici
      },
    ];
  },
};

export default nextConfig;