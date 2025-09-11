// src/app/admin/AdminDashboard.tsx
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import ProductosManager from "../../components/admin/ProductosManager";
import CategoriasManager from "../../components/admin/CategoriasManager";
import TiendasManager from "../../components/admin/TiendasManager";
import VentasManager from "../../components/admin/VentasManager";
import AnalyticsDashboard from "../../components/admin/AnalyticsDashboard";
import CredentialsManager from "../../components/admin/CredentialsManager";

type TabType =
  | "productos"
  | "categorias"
  | "tiendas"
  | "ventas"
  | "analytics"
  | "config";

export default function AdminDashboard() {
  const [activeTab, setActiveTab] = useState<TabType>("productos");
  const router = useRouter();

  const handleLogout = async () => {
    if (confirm("¿Estás seguro de que quieres cerrar sesión?")) {
      try {
        await fetch("/api/admin/auth", { method: "DELETE" });
        router.push("/admin/login");
      } catch (error) {
        console.error("Error al cerrar sesión:", error);
      }
    }
  };

  const tabs = [
    { id: "productos", label: "Productos", icon: "📦" },
    { id: "categorias", label: "Categorías", icon: "🏷️" },
    { id: "tiendas", label: "Tiendas", icon: "🏪" },
    { id: "ventas", label: "Nueva Venta", icon: "💰" },
    { id: "analytics", label: "Analytics", icon: "📊" },
    { id: "config", label: "Configuración", icon: "⚙️" },
  ];

  const renderContent = () => {
    switch (activeTab) {
      case "productos":
        return <ProductosManager />;
      case "categorias":
        return <CategoriasManager />;
      case "tiendas":
        return <TiendasManager />;
      case "ventas":
        return <VentasManager />;
      case "analytics":
        return <AnalyticsDashboard />;
      case "config":
        return <CredentialsManager />;
      default:
        return <ProductosManager />;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header with Logout */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
            Panel de Administración
          </h2>
          <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
            Gestiona productos, categorías y tiendas de Neuraidev
          </p>
        </div>
        <button
          onClick={handleLogout}
          className="flex items-center px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg font-medium transition-colors"
        >
          <svg
            className="w-4 h-4 mr-2"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
            />
          </svg>
          Cerrar Sesión
        </button>
      </div>

      {/* Navigation Tabs */}
      <div className="border-b border-gray-200 dark:border-gray-700">
        <nav className="-mb-px flex space-x-8">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as TabType)}
              className={`py-2 px-4 border-b-2 font-medium text-sm flex items-center gap-2 transition-colors ${
                activeTab === tab.id
                  ? "border-blue-500 text-blue-600 dark:text-blue-400"
                  : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300"
              }`}
            >
              <span className="text-lg">{tab.icon}</span>
              {tab.label}
            </button>
          ))}
        </nav>
      </div>

      {/* Tab Content */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
        {renderContent()}
      </div>
    </div>
  );
}
