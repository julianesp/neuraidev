"use client";

import { useEffect, useRef } from "react";
import { usePathname } from "next/navigation";

// Registra una visita por página visitada (una vez por sesión de pestaña)
export default function VisitasTracker() {
  const pathname = usePathname();
  const tracked = useRef(new Set());

  useEffect(() => {
    // No contar rutas del dashboard/admin
    if (pathname.startsWith("/dashboard") || pathname.startsWith("/admin")) return;
    // No contar la misma página dos veces en la misma sesión
    if (tracked.current.has(pathname)) return;
    tracked.current.add(pathname);

    fetch("/api/analytics/track", { method: "POST" }).catch(() => {});
  }, [pathname]);

  return null;
}
