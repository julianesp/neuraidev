export default function manifest() {
  return {
    name: "neurai.dev - Tienda Online de Tecnología y Servicios Profesionales",
    short_name: "neurai.dev",
    description:
      "Compra accesorios para celulares, computadoras y más. Servicios profesionales de desarrollo web y soporte técnico en sistemas.",
    start_url: "/",
    display: "standalone",
    background_color: "#ffffff",
    theme_color: "#000000",
    icons: [
      {
        src: "/web-app-manifest-192x192.png",
        sizes: "192x192",
        type: "image/png",
        purpose: "any maskable",
      },
      {
        src: "/web-app-manifest-512x512.png",
        sizes: "512x512",
        type: "image/png",
        purpose: "any maskable",
      },
      {
        src: "/apple-touch-icon.png",
        sizes: "180x180",
        type: "image/png",
      },
    ],
    categories: [
      "shopping",
      "technology",
      "electronics",
      "services",
      "web-development",
    ],
    lang: "es-CO",
    orientation: "portrait-primary",
    scope: "/",
    prefer_related_applications: false,
  };
}
