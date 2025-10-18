"use client";

import { useUser } from "@clerk/nextjs";
import { useEffect, useState } from "react";
import Link from "next/link";
import { Store, Package, ShoppingCart, TrendingUp, Plus } from "lucide-react";
import { createClient } from "../../lib/supabase/client";

export default function DashboardPage() {
  const { user } = useUser();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    stores: 0,
    products: 0,
    orders: 0,
    hasStore: false,
  });

  useEffect(() => {
    if (user) {
      loadDashboardStats();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  async function loadDashboardStats() {
    try {
      const supabase = createClient();

      // Obtener el perfil del usuario
      const { data: profile } = await supabase
        .from("profiles")
        .select("id")
        .eq("clerk_user_id", user.id)
        .single();

      if (!profile) {
        setLoading(false);
        return;
      }

      // Obtener las tiendas del usuario
      const { data: stores, error: storesError } = await supabase
        .from("stores")
        .select("id")
        .eq("profile_id", profile.id);

      if (storesError) throw storesError;

      const hasStore = stores && stores.length > 0;
      const storeIds = stores?.map((s) => s.id) || [];

      let productsCount = 0;
      let ordersCount = 0;

      if (hasStore && storeIds.length > 0) {
        // Contar productos
        const { count: pCount } = await supabase
          .from("products")
          .select("*", { count: "exact", head: true })
          .in("store_id", storeIds);

        productsCount = pCount || 0;

        // Contar pedidos
        const { count: oCount } = await supabase
          .from("orders")
          .select("*", { count: "exact", head: true })
          .in("store_id", storeIds);

        ordersCount = oCount || 0;
      }

      setStats({
        stores: stores?.length || 0,
        products: productsCount,
        orders: ordersCount,
        hasStore,
      });
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
    <div className="max-w-7xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">
          ¡Hola, {user?.firstName || "Usuario"}! 👋
        </h1>
        <p className="mt-2 text-gray-600">
          Bienvenido a tu panel de control de Neurai.dev
        </p>
      </div>

      {/* No tiene tienda - CTA */}
      {!stats.hasStore && (
        <div className="bg-gradient-to-r from-blue-500 to-purple-600 rounded-2xl p-8 text-white mb-8">
          <div className="max-w-2xl">
            <h2 className="text-2xl font-bold mb-2">
              ¡Crea tu primera tienda!
            </h2>
            <p className="text-blue-100 mb-6">
              Comienza a vender tus productos online en minutos. Configura tu
              tienda, agrega productos y empieza a recibir pedidos.
            </p>
            <Link
              href="/dashboard/tienda/nueva"
              className="inline-flex items-center px-6 py-3 bg-white text-blue-600 rounded-lg hover:bg-blue-50 transition-colors font-medium"
            >
              <Plus className="w-5 h-5 mr-2" />
              Crear mi tienda
            </Link>
          </div>
        </div>
      )}

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <StatCard
          title="Tiendas"
          value={stats.stores}
          icon={Store}
          color="blue"
          href="/dashboard/tienda"
        />
        <StatCard
          title="Productos"
          value={stats.products}
          icon={Package}
          color="green"
          href="/dashboard/productos"
        />
        <StatCard
          title="Pedidos"
          value={stats.orders}
          icon={ShoppingCart}
          color="purple"
          href="/dashboard/pedidos"
        />
        <StatCard
          title="Ventas"
          value="$0"
          icon={TrendingUp}
          color="orange"
          href="/dashboard/pedidos"
        />
      </div>

      {/* Acciones rápidas */}
      {stats.hasStore && (
        <div className="bg-white rounded-xl shadow-sm p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">
            Acciones rápidas
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <QuickAction
              title="Agregar producto"
              description="Agrega un nuevo producto a tu tienda"
              href="/dashboard/productos/nuevo"
              icon={Package}
            />
            <QuickAction
              title="Ver pedidos"
              description="Gestiona los pedidos de tus clientes"
              href="/dashboard/pedidos"
              icon={ShoppingCart}
            />
            <QuickAction
              title="Configurar tienda"
              description="Personaliza tu tienda online"
              href="/dashboard/tienda"
              icon={Store}
            />
          </div>
        </div>
      )}
    </div>
  );
}

function StatCard({ title, value, icon: Icon, color, href }) {
  const colorClasses = {
    blue: "bg-blue-500",
    green: "bg-green-500",
    purple: "bg-purple-500",
    orange: "bg-orange-500",
  };

  return (
    <Link
      href={href}
      className="bg-white rounded-xl shadow-sm p-6 hover:shadow-md transition-shadow"
    >
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-gray-600 mb-1">{title}</p>
          <p className="text-3xl font-bold text-gray-900">{value}</p>
        </div>
        <div className={`${colorClasses[color]} p-3 rounded-lg`}>
          <Icon className="w-6 h-6 text-white" />
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
