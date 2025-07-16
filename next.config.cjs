const path = require("path");

const nextConfig = {
  reactStrictMode: true,
  devIndicators: false,
  trailingSlash: true,

  // Configuración de imágenes remotas
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "firebasestorage.googleapis.com",
      },
      {
        protocol: "https",
        hostname: "pixabay.com",
      },
      {
        protocol: "https",
        hostname: "unsplash.com",
      },
      {
        protocol: "https",
        hostname: "supabase.com",
      },
      {
        protocol: "https",
        hostname: "nwxetoffoghsimkqfsbv.supabase.co",
      },
      {
        protocol: "https",
        hostname: "www.canva.com",
      },
    ],
  },
};

module.exports = nextConfig;
