// src/components/AdminGuard.tsx
"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

interface AdminGuardProps {
  children: React.ReactNode;
}

export default function AdminGuard({ children }: AdminGuardProps) {
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthorized, setIsAuthorized] = useState(false);
  const router = useRouter();


  useEffect(() => {
    const checkAuth = async () => {
      try {
        // Verificar si estamos en una IP local (básico)
        const isLocal = window.location.hostname === "localhost" || 
                       window.location.hostname === "127.0.0.1" || 
                       window.location.hostname.startsWith("192.168.") ||
                       window.location.hostname.startsWith("10.");

        if (!isLocal) {
          // Si no es local, redirigir a 404
          router.push("/");
          return;
        }

        // Verificar autenticación con el servidor
        const res = await fetch("/api/admin/verify", {
          method: "GET",
          credentials: "include"
        });

        if (res.ok) {
          setIsAuthorized(true);
        } else {
          router.push("/admin/login");
        }
      } catch (error) {
        console.error("Error checking authorization:", error);
        router.push("/admin/login");
      } finally {
        setIsLoading(false);
      }
    };

    checkAuth();
  }, [router]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">Verificando acceso...</p>
        </div>
      </div>
    );
  }

  if (!isAuthorized) {
    return null; // El router se encargará de la redirección
  }

  return <>{children}</>;
}