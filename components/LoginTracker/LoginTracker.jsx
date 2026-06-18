"use client";

import { useEffect, useRef } from "react";
import { useUser } from "@clerk/nextjs";

/**
 * Registra el acceso del usuario (una vez por carga de sesión).
 * El backend deduplica por usuario+día, así que no genera registros repetidos.
 * No renderiza nada.
 */
export default function LoginTracker() {
  const { isSignedIn, isLoaded } = useUser();
  const sent = useRef(false);

  useEffect(() => {
    if (!isLoaded || !isSignedIn || sent.current) return;
    sent.current = true;
    fetch("/api/user-logins", { method: "POST" }).catch(() => {});
  }, [isLoaded, isSignedIn]);

  return null;
}
