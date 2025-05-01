const path = require("path");

const nextConfig = {
  // output: "export",
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
    ],
  },

  async redirects() {
    // Redirecciones para URLs antiguas
    return [
      {
        source: "/ProductoDetalle",
        destination: "/productos/celulares",
        permanent: false,
      },
      {
        source: "/ProductoDetalle/:path*",
        destination: "/productos/:path*",
        permanent: false,
      },
    ];
  },
};

module.exports = nextConfig;
