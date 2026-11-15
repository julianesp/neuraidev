export const metadata = {
  title: "Directorio de negocios y servicios del Putumayo",
  description:
    "Encuentra tiendas, restaurantes, hoteles, talleres, profesionales y servicios en todo el Putumayo. Contacta directo por WhatsApp o teléfono. Publica tu negocio gratis.",
  alternates: { canonical: "/directorio" },
  // Al compartir el enlace: invitar a registrar el negocio (la imagen sale de opengraph-image.jsx)
  openGraph: {
    title: "Registra tu negocio gratis en el Directorio del Putumayo",
    description:
      "Tiendas, restaurantes, hoteles, talleres y profesionales del Putumayo. Publica tu negocio gratis: WhatsApp directo, fotos, mapa y horario.",
    url: "/directorio",
    siteName: "neurai.dev",
    locale: "es_CO",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Registra tu negocio gratis en el Directorio del Putumayo",
    description:
      "Publica tu negocio gratis: WhatsApp directo, fotos, mapa y horario. Que los clientes del Putumayo te encuentren.",
  },
};

// El CSS global del sitio pinta todos los <svg> con relleno (fill: currentColor), lo que
// convierte los íconos de línea en bloques. Aquí se restablece solo para el directorio.
export default function Layout({ children }) {
  return (
    <>
      <style>{`.directorio-iconos svg.lucide { fill: none; }`}</style>
      <div className="directorio-iconos">{children}</div>
    </>
  );
}
