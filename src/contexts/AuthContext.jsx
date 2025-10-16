"use client";

import { createContext, useContext, useState, useEffect } from "react";
import { useRouter } from "next/navigation";

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  // Verificar autenticación al cargar
  useEffect(() => {
    const authToken = localStorage.getItem("admin_auth_token");
    const authExpiry = localStorage.getItem("admin_auth_expiry");

    if (authToken && authExpiry) {
      const now = new Date().getTime();
      if (now < parseInt(authExpiry)) {
        setIsAuthenticated(true);
      } else {
        // Token expirado
        localStorage.removeItem("admin_auth_token");
        localStorage.removeItem("admin_auth_expiry");
      }
    }
    setIsLoading(false);
  }, []);

  const login = (username, password) => {
    // IMPORTANTE: Cambia estas credenciales por las tuyas
    const ADMIN_USERNAME = process.env.NEXT_PUBLIC_ADMIN_USERNAME || "admin";
    const ADMIN_PASSWORD = process.env.NEXT_PUBLIC_ADMIN_PASSWORD || "neurai2025";

    if (username === ADMIN_USERNAME && password === ADMIN_PASSWORD) {
      const token = btoa(`${username}:${Date.now()}`); // Token simple
      const expiry = new Date().getTime() + 24 * 60 * 60 * 1000; // 24 horas

      localStorage.setItem("admin_auth_token", token);
      localStorage.setItem("admin_auth_expiry", expiry.toString());
      setIsAuthenticated(true);
      return true;
    }
    return false;
  };

  const logout = () => {
    localStorage.removeItem("admin_auth_token");
    localStorage.removeItem("admin_auth_expiry");
    setIsAuthenticated(false);
    router.push("/admin/login");
  };

  return (
    <AuthContext.Provider
      value={{ isAuthenticated, isLoading, login, logout }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth debe ser usado dentro de AuthProvider");
  }
  return context;
}
