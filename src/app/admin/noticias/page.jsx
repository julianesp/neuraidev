"use client";

import NewsAdmin from "@/components/News/NewsAdmin";
import ProtectedRoute from "@/components/ProtectedRoute";
import { useAuth } from "@/contexts/AuthContext";

export default function AdminNoticiasPage() {
  const { logout } = useAuth();

  return (
    <ProtectedRoute>
      <div style={{ position: "relative" }}>
        {/* Botón de cerrar sesión */}
        <button
          onClick={logout}
          style={{
            position: "fixed",
            top: "20px",
            right: "20px",
            background: "rgba(231, 76, 60, 0.9)",
            color: "white",
            border: "none",
            padding: "12px 24px",
            borderRadius: "25px",
            fontWeight: "600",
            cursor: "pointer",
            zIndex: 1000,
            transition: "all 0.3s ease",
            boxShadow: "0 4px 15px rgba(231, 76, 60, 0.3)",
          }}
          onMouseEnter={(e) => {
            e.target.style.background = "rgba(192, 57, 43, 0.9)";
            e.target.style.transform = "translateY(-2px)";
            e.target.style.boxShadow = "0 6px 20px rgba(231, 76, 60, 0.4)";
          }}
          onMouseLeave={(e) => {
            e.target.style.background = "rgba(231, 76, 60, 0.9)";
            e.target.style.transform = "translateY(0)";
            e.target.style.boxShadow = "0 4px 15px rgba(231, 76, 60, 0.3)";
          }}
        >
          🚪 Cerrar Sesión
        </button>
        <NewsAdmin />
      </div>
    </ProtectedRoute>
  );
}
