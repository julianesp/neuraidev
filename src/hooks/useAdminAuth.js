"use client";

import { useState, useEffect, createContext, useContext } from "react";
import { useRouter } from "next/navigation";

const AdminAuthContext = createContext();

export function AdminAuthProvider({ children }) {
  const [admin, setAdmin] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    checkAuthStatus();
  }, []);

  const checkAuthStatus = async () => {
    try {
      const response = await fetch("/api/admin/auth/me", {
        credentials: "include",
      });

      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          setAdmin(data.data.admin);
          setIsAuthenticated(true);
        } else {
          setAdmin(null);
          setIsAuthenticated(false);
        }
      } else {
        setAdmin(null);
        setIsAuthenticated(false);
      }
    } catch (error) {
      console.error("Error verificando autenticación:", error);
      setAdmin(null);
      setIsAuthenticated(false);
    } finally {
      setLoading(false);
    }
  };

  const login = async (credentials) => {
    try {
      const response = await fetch("/api/admin/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify(credentials),
      });

      const data = await response.json();

      if (data.success) {
        setAdmin(data.data.admin);
        setIsAuthenticated(true);
        return { success: true };
      } else {
        return { success: false, error: data.error };
      }
    } catch (error) {
      console.error("Error en login:", error);
      return { success: false, error: "Error de conexión" };
    }
  };

  const logout = async () => {
    try {
      await fetch("/api/admin/auth/logout", {
        method: "POST",
        credentials: "include",
      });
    } catch (error) {
      console.error("Error en logout:", error);
    } finally {
      setAdmin(null);
      setIsAuthenticated(false);
    }
  };

  const value = {
    admin,
    loading,
    isAuthenticated,
    login,
    logout,
    checkAuthStatus,
  };

  return (
    <AdminAuthContext.Provider value={value}>
      {children}
    </AdminAuthContext.Provider>
  );
}

export function useAdminAuth() {
  const context = useContext(AdminAuthContext);
  if (!context) {
    throw new Error("useAdminAuth debe ser usado dentro de AdminAuthProvider");
  }
  return context;
}

// Hook para proteger rutas de admin
export function useRequireAdminAuth() {
  const { isAuthenticated, loading } = useAdminAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !isAuthenticated) {
      router.push("/admin/login");
    }
  }, [isAuthenticated, loading, router]);

  return { isAuthenticated, loading };
}