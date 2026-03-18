"use client";

import { useUser } from "@clerk/nextjs";
import { useEffect, useState } from "react";
import Link from "next/link";
import {
  Package, ShoppingCart, TrendingUp, Plus, Store,
  CheckCircle, ArrowRight,
} from "lucide-react";

export default function TiendaDashboardPage() {
  const { user } = useUser();
  const [tienda, setTienda] = useState(null);
  const [stats, setStats] = useState({ productos: 0, pedidos: 0, pendientes: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    async function cargar() {
      try {
        const res = await fetch("/api/tiendas/onboarding");
        if (res.ok) {
          const data = await res.json();
          setTienda(data.tienda);
        }
        // Stats de productos del usuario
        const resP = await fetch("/api/productos?limit=1");
        if (resP.ok) {
          const dataP = await resP.json();
          setStats((s) => ({ ...s, productos: dataP.total || 0 }));
        }
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    }
    cargar();
  }, [user]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600" />
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto mt-6">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl md:text-3xl font-bold text-gray-900">
          ¡Hola, {user?.firstName || "Tienda"}!
        </h1>
        <p className="text-gray-500 mt-1 text-sm">
          Panel de control de{" "}
          <span className="font-medium text-gray-700">{tienda?.nombre || "tu tienda"}</span>
        </p>
      </div>

      {/* Banner estado activo */}
      <div className="mb-6 bg-gradient-to-r from-green-500 to-teal-500 rounded-xl p-5 flex items-center gap-4">
        <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center flex-shrink-0">
          <Store className="w-6 h-6 text-white" />
        </div>
        <div className="flex-1">
          <p className="text-white font-semibold">Tu tienda está activa</p>
          <p className="text-green-100 text-sm">
            Tus productos se publican inmediatamente. Los pagos son gestionados por Neurai.
          </p>
        </div>
        <CheckCircle className="w-6 h-6 text-white flex-shrink-0" />
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-8">
        <StatCard title="Mis Productos" value={stats.productos} icon={Package} color="blue" href="/tienda/productos" />
        <StatCard title="Pedidos" value={stats.pedidos} icon={ShoppingCart} color="green" href="/tienda/pedidos" />
        <StatCard title="Pendientes" value={stats.pendientes} icon={TrendingUp} color="yellow" href="/tienda/pedidos" />
      </div>

      {/* Acciones rápidas */}
      <div className="bg-white rounded-xl shadow-sm p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Acciones rápidas</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <QuickAction
            title="Publicar producto"
            description="Agrega un nuevo producto — visible de inmediato"
            href="/tienda/productos/nuevo"
            icon={Plus}
            featured
          />
          <QuickAction
            title="Ver mis productos"
            description="Gestiona tu catálogo completo"
            href="/tienda/productos"
            icon={Package}
          />
          <QuickAction
            title="Ver pedidos"
            description="Revisa los pedidos recibidos"
            href="/tienda/pedidos"
            icon={ShoppingCart}
          />
          <QuickAction
            title="Mi tienda"
            description="Actualiza la información de tu tienda"
            href="/tienda/configuracion"
            icon={Store}
          />
        </div>
      </div>
    </div>
  );
}

function StatCard({ title, value, icon: Icon, color, href }) {
  const colors = {
    blue: "bg-blue-500", green: "bg-green-500", yellow: "bg-yellow-500",
  };
  return (
    <Link href={href} className="bg-white rounded-xl shadow-sm p-5 hover:shadow-md transition-shadow">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs text-gray-500 mb-1">{title}</p>
          <p className="text-3xl font-bold text-gray-900">{value}</p>
        </div>
        <div className={`${colors[color]} p-3 rounded-lg`}>
          <Icon className="w-6 h-6 text-white" />
        </div>
      </div>
    </Link>
  );
}

function QuickAction({ title, description, href, icon: Icon, featured }) {
  return (
    <Link href={href}
      className={`flex items-start p-4 rounded-lg transition-all group ${
        featured
          ? "border-2 border-blue-500 bg-blue-50 hover:bg-blue-100"
          : "border border-gray-200 hover:border-blue-400 hover:bg-blue-50"
      }`}>
      <div className={`flex-shrink-0 p-2 rounded-lg ${featured ? "bg-blue-500" : "bg-gray-100 group-hover:bg-blue-100"}`}>
        <Icon className={`w-5 h-5 ${featured ? "text-white" : "text-gray-600 group-hover:text-blue-600"}`} />
      </div>
      <div className="ml-3">
        <h3 className={`text-sm font-medium ${featured ? "text-blue-900" : "text-gray-900 group-hover:text-blue-700"}`}>
          {title}
        </h3>
        <p className={`text-xs mt-0.5 ${featured ? "text-blue-700" : "text-gray-500"}`}>{description}</p>
      </div>
    </Link>
  );
}
