"use client";

import { useUser } from "@clerk/nextjs";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { isAdmin } from "@/lib/auth/roles";

/**
 * Componente que protege rutas de administración
 * Redirige a inicio si el usuario no es admin
 */
export default function AdminGuard({ children }) {
  const { user, isLoaded } = useUser();
  const router = useRouter();

  useEffect(() => {
    if (isLoaded && (!user || !isAdmin(user))) {
      // Redirigir a inicio con mensaje
      router.push("/?error=unauthorized");
    }
  }, [isLoaded, user, router]);

  // Mostrar loading mientras carga
  if (!isLoaded) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  // Si no es admin, mostrar mensaje mientras redirige
  if (!user || !isAdmin(user)) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
            Acceso Denegado
          </h2>
          <p className="text-gray-600 dark:text-gray-400">
            No tienes permisos para acceder a esta área.
          </p>
        </div>
      </div>
    );
  }

  // Si es admin, mostrar contenido
  return <>{children}</>;
}
