export const metadata = {
  title: "Directorio de negocios y servicios del Putumayo",
  description:
    "Encuentra tiendas, restaurantes, hoteles, talleres, profesionales y servicios en todo el Putumayo. Contacta directo por WhatsApp o teléfono. Publica tu negocio gratis.",
  alternates: { canonical: "/directorio" },
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
