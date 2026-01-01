import AdminOfertas from "@/components/AdminOfertas";

export const metadata = {
  title: "Gestión de Ofertas | Dashboard",
  description: "Panel de administración de ofertas y descuentos",
};

export default function DashboardOfertasPage() {
  // La autenticación ya está manejada por el layout del dashboard (AdminGuard)

  return (
    <div className="max-w-7xl mx-auto">
      <AdminOfertas />
    </div>
  );
}
