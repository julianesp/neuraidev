"use client";

import { UserButton, useUser } from "@clerk/nextjs";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Home,
  Store,
  Package,
  ShoppingCart,
  Settings,
  Menu,
  X,
} from "lucide-react";
import { useState, useEffect, createContext, useContext } from "react";
import AdminGuard from "@/components/auth/AdminGuard";

// Create context for sidebar state
const SidebarContext = createContext();

export const useSidebar = () => {
  const context = useContext(SidebarContext);
  if (!context) {
    throw new Error("useSidebar must be used within SidebarProvider");
  }
  return context;
};

export default function DashboardLayout({ children }) {
  const { user, isLoaded } = useUser();
  const pathname = usePathname();
  const [sidebarOpen, setSidebarOpen] = useState(false); // Cerrado por defecto, se carga desde localStorage

  const navigation = [
    {
      name: "Inicio",
      href: "/dashboard",
      icon: Home,
      current: pathname === "/dashboard",
    },
    {
      name: "Mi Tienda",
      href: "/dashboard/tienda",
      icon: Store,
      current: pathname?.startsWith("/dashboard/tienda"),
    },
    {
      name: "Productos",
      href: "/dashboard/productos",
      icon: Package,
      current: pathname?.startsWith("/dashboard/productos"),
    },
    {
      name: "Pedidos",
      href: "/dashboard/pedidos",
      icon: ShoppingCart,
      current: pathname?.startsWith("/dashboard/pedidos"),
    },
    {
      name: "Configuración",
      href: "/dashboard/configuracion",
      icon: Settings,
      current: pathname?.startsWith("/dashboard/configuracion"),
    },
  ];

  // Load sidebar state from localStorage on mount
  useEffect(() => {
    const saved = localStorage.getItem("dashboard-sidebar-open");
    if (saved !== null) {
      setSidebarOpen(saved === "true");
    } else {
      // Si no hay estado guardado, abierto en desktop, cerrado en móvil
      const isDesktop = window.innerWidth >= 1024;
      setSidebarOpen(isDesktop);
    }
  }, []);

  // Save sidebar state to localStorage when it changes
  useEffect(() => {
    localStorage.setItem("dashboard-sidebar-open", sidebarOpen.toString());
  }, [sidebarOpen]);

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  if (!isLoaded) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <AdminGuard>
      <SidebarContext.Provider value={{ sidebarOpen, toggleSidebar }}>
        <div className="min-h-screen bg-gray-50 mt-8">
          {/* Mobile sidebar toggle - Posicionado para no interferir con navbar */}
          <div className="lg:hidden fixed top-20 left-4 z-50">
            <button
              onClick={toggleSidebar}
              className="p-3 rounded-lg bg-blue-600 hover:bg-blue-700 shadow-lg text-white transition-colors"
              aria-label={sidebarOpen ? "Cerrar menú" : "Abrir menú"}
            >
              {sidebarOpen ? (
                <X className="h-6 w-6" />
              ) : (
                <Menu className="h-6 w-6" />
              )}
            </button>
          </div>

          {/* Sidebar */}
          <aside
            className={`fixed inset-y-0 left-0 z-40 w-64 bg-white dark:bg-gray-900 shadow-lg transform transition-transform duration-300 ease-in-out ${
              sidebarOpen ? "translate-x-0" : "-translate-x-full"
            }`}
          >
          <div className="flex flex-col h-full">
            {/* Logo */}
            <div className="flex items-center justify-between h-16 px-6 border-b flex-shrink-0 mt-12">
              <Link href="/" className="flex items-center space-x-2">
                <span className="text-2xl font-bold text-blue-600 dark:text-white">
                  Home
                </span>
              </Link>
            </div>

            {/* Navigation */}
            <nav className="flex-1 px-4 py-6 space-y-2 overflow-y-auto mt-0">
              {navigation.map((item) => {
                const Icon = item.icon;
                return (
                  <Link
                    key={item.name}
                    href={item.href}
                    onClick={() => setSidebarOpen(false)}
                    className={`flex items-center px-4 py-3 text-sm font-medium rounded-lg transition-colors ${
                      item.current
                        ? "bg-blue-50 text-blue-700"
                        : "text-gray-700 hover:bg-gray-100"
                    }`}
                  >
                    <Icon className="w-5 h-5 mr-3" />
                    {item.name}
                  </Link>
                );
              })}
            </nav>

            {/* User section */}
            <div className="p-4 border-t flex-shrink-0 bg-white">
              <div className="flex items-center space-x-3">
                <UserButton
                  appearance={{
                    elements: {
                      avatarBox: "w-10 h-10",
                    },
                  }}
                />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900 truncate">
                    {user?.fullName || user?.firstName || "Usuario"}
                  </p>
                  <p className="text-xs text-gray-500 truncate">
                    {user?.primaryEmailAddress?.emailAddress}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </aside>

        {/* Main content */}
        <div className={`transition-all duration-300 min-h-screen dark:bg-gray-700 ${sidebarOpen ? 'lg:pl-64' : 'lg:pl-0'}`}>
          <main className="p-6 lg:p-8 pb-24">{children}</main>
        </div>

        {/* Overlay for mobile */}
        {sidebarOpen && (
          <div
            className="fixed inset-0 bg-black bg-opacity-50 z-30 lg:hidden"
            onClick={toggleSidebar}
          />
        )}
      </div>
      </SidebarContext.Provider>
    </AdminGuard>
  );
}
