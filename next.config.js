// const path = require("path");

// const nextConfig = {
//   reactStrictMode: true,
//   swcMinify: true,
//   trailingSlash: true,

//   images: {
//     // domains: ["www.pexels.com"],
//     remotePatterns: [
//       {
//         protocol: "https",
//         hostname: "firebasestorage.googleapis.com",
//       },
//       {
//         protocol: "https",
//         hostname: "pixabay.com",
//       },
//       // {
//       //   protocol: "https",
//       //   hostname: "pexels.com",
//       // },
//       {
//         protocol: "https",
//         hostname: "unsplash.com",
//       },
//       {
//         protocol: "https",
//         hostname: "supabase.com",
//       },
//       {
//         protocol: "https",
//         hostname: "nwxetoffoghsimkqfsbv.supabase.co",
//       },
//     ],
//   },
// };

// module.exports = nextConfig;

const path = require("path");

const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,
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
    //unoptimized: true, // Necesario con output: export
  },

  // Configuración para API dinámica
  // experimental: {
  //   serverComponentsExternalPackages: [],
  // },

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
