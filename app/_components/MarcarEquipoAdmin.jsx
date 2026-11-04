"use client";

import { useEffect } from "react";
import { useUser } from "@clerk/nextjs";
import { isAdmin } from "@/lib/auth/roles";
import { COOKIE_EQUIPO_ADMIN } from "@/lib/auth/equipo-admin";

/**
 * Marca este navegador como equipo del dueño (cookie de 2 años) cuando entra
 * un admin. Las vistas del blog desde equipos marcados no se cuentan, aunque
 * después se cierre la sesión.
 */
export default function MarcarEquipoAdmin() {
  const { user, isLoaded } = useUser();

  useEffect(() => {
    if (!isLoaded || !isAdmin(user)) return;
    document.cookie = `${COOKIE_EQUIPO_ADMIN}=1; path=/; max-age=${60 * 60 * 24 * 730}; samesite=lax; secure`;
  }, [user, isLoaded]);

  return null;
}
