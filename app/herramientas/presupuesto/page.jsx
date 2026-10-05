import Presupuesto from "./Presupuesto";

export const metadata = {
  title: "Presupuesto personal gratis | Herramientas neurai.dev",
  description:
    "Organiza tu dinero mes a mes: registra tu sueldo, lo que vas a ganar, tus gastos fijos y variables, y mira cuánto te queda disponible para ahorrar.",
  alternates: { canonical: "/herramientas/presupuesto" },
};

export default function PresupuestoPage() {
  return <Presupuesto />;
}
