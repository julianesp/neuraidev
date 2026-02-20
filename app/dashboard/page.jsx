"use client";

import { useUser } from "@clerk/nextjs";
import { useEffect, useState } from "react";
import Link from "next/link";
import {
  Package,
  ShoppingCart,
  TrendingUp,
  Plus,
  Star,
  Link as LinkIcon,
  Percent,
  CreditCard,
  DollarSign,
  LayoutDashboard,
  Settings,
  BarChart3,
  FileText,
  ArrowRight,
} from "lucide-react";
import { obtenerEstadisticasProductos } from "@/lib/supabase/productos";
import { obtenerEstadisticasCreditos } from "@/lib/supabase/creditos";

export default function DashboardPage() {
  const { user } = useUser();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    total: 0,
    disponibles: 0,
    destacados: 0,
    sinStock: 0,
  });
  const [statsCreditos, setStatsCreditos] = useState({
    total: 0,
    pendientes: 0,
    vencidos: 0,
    montoPendiente: 0,
  });

  useEffect(() => {
    if (user) {
      loadDashboardStats();
    }
  }, [user]);

  async function loadDashboardStats() {
    try {
      const [estadisticasProductos, estadisticasCreditos] = await Promise.all([
        obtenerEstadisticasProductos(),
        obtenerEstadisticasCreditos(),
      ]);
      setStats(estadisticasProductos);
      setStatsCreditos(estadisticasCreditos);
    } catch (error) {
      console.error("Error loading dashboard stats:", error);
    } finally {
      setLoading(false);
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto mt-8">
      {/* Header */}
      <div className="mb-4 md:mb-8">
        <h1 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white">
          ¡Hola, {user?.firstName || "Usuario"}! 👋
        </h1>
        <p className="mt-2 text-sm md:text-base text-gray-600 dark:text-gray-400">
          Bienvenido a tu panel de control de Neurai.dev
        </p>
      </div>

      {/* Admin Panel Banner */}
      <div className="mb-6">
        <Link
          href="/admin"
          className="block bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl shadow-lg p-6 hover:shadow-xl transition-all group"
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <div className="bg-white/20 backdrop-blur-sm p-3 rounded-lg">
                <LayoutDashboard className="w-8 h-8 text-white" />
              </div>
              <div className="ml-4">
                <h2 className="text-xl md:text-2xl font-bold text-white">
                  Panel de Administración
                </h2>
                <p className="text-blue-100 mt-1 text-sm md:text-base">
                  Gestiona tu blog, estadísticas, productos y más
                </p>
                <div className="flex flex-wrap gap-3 mt-3">
                  <span className="inline-flex items-center text-xs bg-white/20 text-white px-3 py-1 rounded-full">
                    <FileText size={14} className="mr-1" />
                    Blog
                  </span>
                  <span className="inline-flex items-center text-xs bg-white/20 text-white px-3 py-1 rounded-full">
                    <BarChart3 size={14} className="mr-1" />
                    Analytics
                  </span>
                  <span className="inline-flex items-center text-xs bg-white/20 text-white px-3 py-1 rounded-full">
                    <Settings size={14} className="mr-1" />
                    Configuración
                  </span>
                </div>
              </div>
            </div>
            <div className="hidden md:flex items-center text-white">
              <span className="mr-2 font-semibold">Ir al panel</span>
              <ArrowRight className="w-6 h-6 group-hover:translate-x-2 transition-transform" />
            </div>
          </div>
        </Link>
      </div>

      {/* Stats Cards - Productos */}
      <div className="mb-6">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">
          Productos
        </h2>
        <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-4 gap-3 md:gap-6">
          <StatCard
            title="Total Productos"
            value={stats.total}
            icon={Package}
            color="blue"
            href="/dashboard/productos"
          />
          <StatCard
            title="Disponibles"
            value={stats.disponibles}
            icon={Package}
            color="green"
            href="/dashboard/productos"
          />
          <StatCard
            title="Destacados"
            value={stats.destacados}
            icon={Star}
            color="yellow"
            href="/dashboard/productos"
          />
          <StatCard
            title="Sin Stock"
            value={stats.sinStock}
            icon={Package}
            color="red"
            href="/dashboard/productos"
          />
        </div>
      </div>

      {/* Stats Cards - Créditos */}
      <div className="mb-8">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">
          Créditos/Fiados
        </h2>
        <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-4 gap-3 md:gap-6">
          <StatCard
            title="Total Créditos"
            value={statsCreditos.total}
            icon={CreditCard}
            color="purple"
            href="/dashboard/creditos"
          />
          <StatCard
            title="Pendientes"
            value={statsCreditos.pendientes}
            icon={CreditCard}
            color="yellow"
            href="/dashboard/creditos"
          />
          <StatCard
            title="Vencidos"
            value={statsCreditos.vencidos}
            icon={CreditCard}
            color="red"
            href="/dashboard/creditos"
          />
          <StatCard
            title="Por Cobrar"
            value={`$${Number(statsCreditos.montoPendiente).toLocaleString('es-CO')}`}
            icon={DollarSign}
            color="orange"
            href="/dashboard/creditos"
          />
        </div>
      </div>

      {/* Acciones rápidas */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-4 md:p-6">
        <h2 className="text-lg md:text-xl font-semibold text-gray-900 dark:text-white mb-4">
          Acciones rápidas
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4">
          <QuickAction
            title="Panel Admin"
            description="Blog, analytics y configuración"
            href="/admin"
            icon={LayoutDashboard}
            featured
          />
          <QuickAction
            title="Agregar producto"
            description="Agrega un nuevo producto al catálogo"
            href="/dashboard/productos/nuevo"
            icon={Plus}
          />
          <QuickAction
            title="Ver productos"
            description="Gestiona tu catálogo de productos"
            href="/dashboard/productos"
            icon={Package}
          />
          <QuickAction
            title="Ofertas"
            description="Crea descuentos y promociones"
            href="/dashboard/ofertas"
            icon={Percent}
          />
          <QuickAction
            title="Payment Links"
            description="Configura enlaces de pago Nequi/Wompi"
            href="/dashboard/payment-links"
            icon={LinkIcon}
          />
          <QuickAction
            title="Créditos"
            description="Gestiona créditos y fiados a clientes"
            href="/dashboard/creditos"
            icon={CreditCard}
          />
          <QuickAction
            title="Ver tienda"
            description="Ve tu tienda en vivo"
            href="/"
            icon={TrendingUp}
          />
        </div>
      </div>
    </div>
  );
}

function StatCard({ title, value, icon: Icon, color, href }) {
  const colorClasses = {
    blue: "bg-blue-500",
    green: "bg-green-500",
    yellow: "bg-yellow-500",
    red: "bg-red-500",
    purple: "bg-purple-500",
    orange: "bg-orange-500",
  };

  return (
    <Link
      href={href}
      className="bg-white rounded-xl shadow-sm p-4 md:p-6 hover:shadow-md transition-shadow"
    >
      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs md:text-sm text-gray-600 mb-1">{title}</p>
          <p className="text-2xl md:text-3xl font-bold text-gray-900">
            {value}
          </p>
        </div>
        <div className={`${colorClasses[color]} p-2 md:p-3 rounded-lg`}>
          <Icon className="w-5 h-5 md:w-6 md:h-6 text-white" />
        </div>
      </div>
    </Link>
  );
}

function QuickAction({ title, description, href, icon: Icon, featured }) {
  if (featured) {
    return (
      <Link
        href={href}
        className="flex items-start p-4 border-2 border-blue-500 bg-blue-50 dark:bg-blue-900/20 rounded-lg hover:bg-blue-100 dark:hover:bg-blue-900/30 transition-all group"
      >
        <div className="flex-shrink-0 p-2 bg-blue-500 rounded-lg">
          <Icon className="w-5 h-5 text-white" />
        </div>
        <div className="ml-4">
          <h3 className="text-sm font-medium text-blue-900 dark:text-blue-100">
            {title}
          </h3>
          <p className="text-xs text-blue-700 dark:text-blue-300 mt-1">{description}</p>
        </div>
      </Link>
    );
  }

  return (
    <Link
      href={href}
      className="flex items-start p-4 border border-gray-200 dark:border-gray-700 rounded-lg hover:border-blue-500 hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-all group"
    >
      <div className="flex-shrink-0 p-2 bg-gray-100 dark:bg-gray-700 rounded-lg group-hover:bg-blue-100 dark:group-hover:bg-blue-900 transition-colors">
        <Icon className="w-5 h-5 text-gray-600 dark:text-gray-400 group-hover:text-blue-600 dark:group-hover:text-blue-400" />
      </div>
      <div className="ml-4">
        <h3 className="text-sm font-medium text-gray-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400">
          {title}
        </h3>
        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">{description}</p>
      </div>
    </Link>
  );
}
