"use client";

import { useEffect, useRef } from "react";
import { useUser } from "@clerk/nextjs";
import CalificacionFormateoModal from "@/components/CalificacionFormateo/CalificacionFormateoModal";

/**
 * Registra el acceso del usuario (una vez por carga de sesión).
 * El backend deduplica por usuario+día, así que no genera registros repetidos.
 *
 * Además monta el modal de calificación del servicio técnico: si el email del
 * usuario tiene una invitación pendiente, se le muestra primero la pregunta
 * sobre el formateo (el propio modal decide si aplica).
 */
export default function LoginTracker() {
  const { isSignedIn, isLoaded } = useUser();
  const sent = useRef(false);

  useEffect(() => {
    if (!isLoaded || !isSignedIn || sent.current) return;
    sent.current = true;
    fetch("/api/user-logins", { method: "POST" }).catch(() => {});
  }, [isLoaded, isSignedIn]);

  return <CalificacionFormateoModal />;
}
