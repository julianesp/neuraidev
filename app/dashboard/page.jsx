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

function QuickAction({ title, description, href, icon: Icon }) {
  return (
    <Link
      href={href}
      className="flex items-start p-4 border border-gray-200 rounded-lg hover:border-blue-500 hover:bg-blue-50 transition-all group"
    >
      <div className="flex-shrink-0 p-2 bg-gray-100 rounded-lg group-hover:bg-blue-100 transition-colors">
        <Icon className="w-5 h-5 text-gray-600 group-hover:text-blue-600" />
      </div>
      <div className="ml-4">
        <h3 className="text-sm font-medium text-gray-900 group-hover:text-blue-600">
          {title}
        </h3>
        <p className="text-xs text-gray-500 mt-1">{description}</p>
      </div>
    </Link>
  );
}
