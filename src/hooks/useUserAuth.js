import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

export function useUserAuth() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);

  const checkAuth = async () => {
    try {
      const token = localStorage.getItem("userToken");
      
      if (!token) {
        setIsAuthenticated(false);
        setLoading(false);
        return;
      }

      const response = await fetch("/api/users/verify", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ token }),
      });

      const data = await response.json();

      if (data.valid) {
        setIsAuthenticated(true);
        setUser(data.user);
      } else {
        setIsAuthenticated(false);
        localStorage.removeItem("userToken");
      }
    } catch (error) {
      console.error("Error verificando autenticación:", error);
      setIsAuthenticated(false);
      localStorage.removeItem("userToken");
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    localStorage.removeItem("userToken");
    setIsAuthenticated(false);
    setUser(null);
  };

  const login = (token, userData) => {
    localStorage.setItem("userToken", token);
    setIsAuthenticated(true);
    setUser(userData);
  };

  useEffect(() => {
    checkAuth();
  }, []);

  return {
    isAuthenticated,
    loading,
    user,
    logout,
    login,
    checkAuth
  };
}