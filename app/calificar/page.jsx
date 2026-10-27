import FormularioCalificar from "./FormularioCalificar";

export const metadata = {
  title: "Califica tu experiencia",
  description:
    "Cuéntanos cómo te fue con tu compra o servicio en neurai.dev. Tu opinión ayuda a otras personas a decidir.",
  alternates: { canonical: "/calificar" },
  // Página para clientes que reciben el enlace: no hace falta indexarla
  robots: { index: false, follow: true },
};

// Enlace que se comparte por WhatsApp desde /dashboard/calificaciones:
//   /calificar?n=Nombre&t=producto|formateo|web&p=Producto o servicio
export default async function CalificarPage({ searchParams }) {
  const params = await searchParams;
  const texto = (v, max) => (typeof v === "string" ? v.trim().slice(0, max) : "");

  return (
    <main className="min-h-screen bg-gray-50 dark:bg-gray-900 py-12 px-4">
      <FormularioCalificar
        nombreInicial={texto(params?.n, 80)}
        tipoInicial={["producto", "formateo", "web"].includes(params?.t) ? params.t : ""}
        productoInicial={texto(params?.p, 120)}
      />
    </main>
  );
}
