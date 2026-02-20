import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";

export const metadata = {
  title: "Panel de Administración | Neurai.dev",
  description: "Panel de administración de Neurai.dev",
  robots: {
    index: false,
    follow: false,
  },
};

export default async function AdminLayout({ children }) {
  const { userId } = await auth();

  // Verificar autenticación
  if (!userId) {
    redirect("/sign-in?redirect_url=/admin");
  }

  // Aquí puedes agregar verificación de roles de administrador si es necesario
  // Por ejemplo, verificar que el usuario tenga rol de admin

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {children}
    </div>
  );
}
