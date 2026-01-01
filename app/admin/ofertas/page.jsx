import { redirect } from "next/navigation";
import { getCurrentUserWithRole } from "@/lib/auth/server-roles";
import AdminOfertas from "@/components/AdminOfertas";

export const metadata = {
  title: "Gestión de Ofertas | neurai.dev",
  description: "Panel de administración de ofertas y descuentos",
};

// Forzar renderizado dinámico porque usa autenticación
export const dynamic = "force-dynamic";

export default async function AdminOfertasPage() {
  // Verificar autenticación y permisos de admin
  const { user, isAdmin } = await getCurrentUserWithRole();

  if (!user) {
    redirect("/sign-in");
  }

  if (!isAdmin) {
    redirect("/");
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <AdminOfertas />
    </div>
  );
}
