const path = require("path");

const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,
  trailingSlash: true,

  // exportPathMap: async function () {
  //   const paths = {
  //     "/": { page: "/" },
  //     // Agrega aquí otras páginas estáticas
  //   };

  //   return paths;
  // },

  images: {
    // domains: ["www.pexels.com"],
    remotePatterns: [
      {
        protocol: "https",
        hostname: "firebasestorage.googleapis.com",
      },
      {
        protocol: "https",
        hostname: "pixabay.com",
      },
      // {
      //   protocol: "https",
      //   hostname: "pexels.com",
      // },
      {
        protocol: "https",
        hostname: "unsplash.com",
      },
      {
        protocol: "https",
        hostname: "supabase.com",
      },
      // {
      //   protocol: "https",
      //   hostname: "nwxetoffoghsimkqfsbv.supabase.co",
      // },
    ],
  },
};

module.exports = nextConfig;
