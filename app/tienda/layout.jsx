"use client";

import { UserButton, useUser } from "@clerk/nextjs";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Home, Package, ShoppingCart, TrendingUp, Store,
  Percent, Users, Settings, Menu, X,
} from "lucide-react";
import { useState, useEffect } from "react";
import TiendaGuard from "@/components/auth/TiendaGuard";

export default function TiendaLayout({ children }) {
  const { user, isLoaded } = useUser();
  const pathname = usePathname();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const esOnboarding = pathname === "/tienda/onboarding";

  const navigation = [
    { name: "Inicio", href: "/tienda/dashboard", icon: Home, current: pathname === "/tienda/dashboard" },
    { name: "Mis Productos", href: "/tienda/productos", icon: Package, current: pathname?.startsWith("/tienda/productos") },
    { name: "Pedidos", href: "/tienda/pedidos", icon: ShoppingCart, current: pathname?.startsWith("/tienda/pedidos") },
    { name: "Ofertas", href: "/tienda/ofertas", icon: Percent, current: pathname?.startsWith("/tienda/ofertas") },
    { name: "Clientes", href: "/tienda/clientes", icon: Users, current: pathname?.startsWith("/tienda/clientes") },
    { name: "Ganancias", href: "/tienda/ganancias", icon: TrendingUp, current: pathname?.startsWith("/tienda/ganancias") },
    { name: "Mi Tienda", href: "/tienda/configuracion", icon: Settings, current: pathname?.startsWith("/tienda/configuracion") },
  ];

  useEffect(() => {
    const saved = localStorage.getItem("tienda-sidebar-open");
    if (saved !== null) {
      setSidebarOpen(saved === "true");
    } else {
      setSidebarOpen(window.innerWidth >= 1024);
    }
  }, []);

  useEffect(() => {
    localStorage.setItem("tienda-sidebar-open", sidebarOpen.toString());
  }, [sidebarOpen]);

  if (!isLoaded) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600" />
      </div>
    );
  }

  // El onboarding no necesita sidebar ni guard
  if (esOnboarding) {
    return <>{children}</>;
  }

  return (
    <TiendaGuard>
      <div className="min-h-screen bg-gray-50 mt-8">
        {/* Toggle móvil */}
        <div className="lg:hidden fixed top-20 right-4 z-50">
          <button onClick={() => setSidebarOpen(!sidebarOpen)}
            className="p-3 rounded-lg bg-blue-600 hover:bg-blue-700 shadow-lg text-white transition-colors">
            {sidebarOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>

        {/* Toggle desktop */}
        <div className="hidden lg:block fixed top-20 right-4 z-50">
          <button onClick={() => setSidebarOpen(!sidebarOpen)}
            className="p-2 rounded-lg bg-white hover:bg-gray-100 shadow-md transition-colors border border-gray-200">
            {sidebarOpen ? <X className="h-5 w-5 text-gray-700" /> : <Menu className="h-5 w-5 text-gray-700" />}
          </button>
        </div>

        {/* Sidebar */}
        <aside className={`fixed inset-y-0 left-0 z-40 w-64 bg-white shadow-lg transform transition-transform duration-300 ease-in-out ${sidebarOpen ? "translate-x-0" : "-translate-x-full"}`}>
          <div className="flex flex-col h-full">
            {/* Logo tienda */}
            <div className="flex items-center h-16 px-6 border-b flex-shrink-0 mt-12">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                  <Store className="w-4 h-4 text-white" />
                </div>
                <span className="text-lg font-bold text-gray-900 truncate max-w-[140px]">
                  {user?.firstName || "Mi Tienda"}
                </span>
              </div>
            </div>

            {/* Nav */}
            <nav className="flex-1 px-4 py-6 space-y-1 overflow-y-auto">
              {navigation.map((item) => {
                const Icon = item.icon;
                return (
                  <Link key={item.name} href={item.href}
                    onClick={() => setSidebarOpen(false)}
                    className={`flex items-center px-4 py-3 text-sm font-medium rounded-lg transition-colors ${
                      item.current
                        ? "bg-blue-50 text-blue-700"
                        : "text-gray-700 hover:bg-gray-100"
                    }`}>
                    <Icon className="w-5 h-5 mr-3" />
                    {item.name}
                  </Link>
                );
              })}
            </nav>

            {/* Usuario */}
            <div className="p-4 border-t flex-shrink-0">
              <div className="flex items-center gap-3">
                <UserButton appearance={{ elements: { avatarBox: "w-9 h-9" } }} />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900 truncate">
                    {user?.fullName || user?.firstName || "Mi Tienda"}
                  </p>
                  <p className="text-xs text-gray-500 truncate">
                    {user?.primaryEmailAddress?.emailAddress}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </aside>

        {/* Contenido */}
        <div className={`transition-all duration-300 min-h-screen ${sidebarOpen ? "lg:pl-64" : "lg:pl-0"}`}>
          <main className="p-6 lg:p-8 pb-24">{children}</main>
        </div>

        {/* Overlay móvil */}
        {sidebarOpen && (
          <div className="fixed inset-0 bg-black bg-opacity-50 z-30 lg:hidden"
            onClick={() => setSidebarOpen(false)} />
        )}
      </div>
    </TiendaGuard>
  );
}
