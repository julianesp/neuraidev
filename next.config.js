const isGithubActions = process.env.GITHUB_ACTIONS || false;

let assetPrefix = "";
let basePath = "";

if (isGithubActions) {
  // Ajusta esto al nombre de tu repositorio
  const repo = process.env.GITHUB_REPOSITORY.replace(/.*?\//, "");
  assetPrefix = `/${repo}/`;
  basePath = `/${repo}`;
}
const path = require("path");

const nextConfig = {
  // output: "export",
  reactStrictMode: true,
  devIndicators: false,
  trailingSlash: true,
  //added
  assetPrefix: assetPrefix,
  basePath: basePath,

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

  // async redirects() {
  //   // Redirecciones para URLs antiguas
  //   return [
  //     {
  //       source: "/ProductoDetalle",
  //       destination: "/productos/celulares",
  //       permanent: false,
  //     },
  //     {
  //       source: "/ProductoDetalle/:path*",
  //       destination: "/productos/:path*",
  //       permanent: false,
  //     },
  //   ];
  // },
};

module.exports = nextConfig;
