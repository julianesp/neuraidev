"use client";

import { useUser } from "@clerk/nextjs";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

/**
 * Guard para el espacio de tiendas en /tienda/*
 * Solo permite acceso a usuarios con publicMetadata.role === "tienda"
 * Redirige al onboarding si el usuario está autenticado pero aún no tiene perfil
 */
export default function TiendaGuard({ children }) {
  const { user, isLoaded } = useUser();
  const router = useRouter();

  const esTienda = user?.publicMetadata?.role === "tienda";

  useEffect(() => {
    if (!isLoaded) return;
    if (!user) {
      router.push("/sign-in?redirect_url=/tienda/dashboard");
      return;
    }
    // Sin rol tienda → redirigir al onboarding para completar el registro
    if (!esTienda) {
      router.push("/tienda/onboarding");
    }
  }, [isLoaded, user, esTienda, router]);

  if (!isLoaded) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600" />
      </div>
    );
  }

  if (!user) return null;

  if (!esTienda) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-blue-50">
        <div className="text-center max-w-sm p-8 bg-white rounded-2xl shadow-lg">
          <div className="w-16 h-16 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <span className="text-3xl">⏳</span>
          </div>
          <h2 className="text-xl font-bold text-gray-900 mb-2">
            Activación pendiente
          </h2>
          <p className="text-gray-500 text-sm">
            Tu solicitud de tienda fue recibida. En breve será activada.
            Te notificaremos cuando puedas acceder.
          </p>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
