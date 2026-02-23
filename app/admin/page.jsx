"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useUser } from "@clerk/nextjs";
import {
  LayoutDashboard,
  FileText,
  ShoppingCart,
  Users,
  TrendingUp,
  Package,
  Settings,
  Eye,
  Calendar,
  ArrowRight,
  Bell,
  Send,
} from "lucide-react";

export default function AdminDashboard() {
  const { user, isLoaded } = useUser();
  const [stats, setStats] = useState({
    blogPosts: { total: 0, published: 0, drafts: 0 },
    products: { total: 0, active: 0 },
    orders: { total: 0, pending: 0 },
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      setLoading(true);

      // Obtener estadísticas del blog
      const blogResponse = await fetch("/api/blog/posts");
      if (blogResponse.ok) {
        const blogData = await blogResponse.json();
        const posts = blogData.posts || [];
        setStats((prev) => ({
          ...prev,
          blogPosts: {
            total: posts.length,
            published: posts.filter((p) => p.published).length,
            drafts: posts.filter((p) => !p.published).length,
          },
        }));
      }

      // Aquí puedes agregar más llamadas para otras estadísticas
      // Por ejemplo: productos, órdenes, etc.
    } catch (error) {
      console.error("Error fetching stats:", error);
    } finally {
      setLoading(false);
    }
  };

  const adminSections = [
    {
      title: "Blog",
      description: "Gestiona artículos y publicaciones",
      icon: FileText,
      href: "/admin/blog",
      stats: `${stats.blogPosts.total} artículos`,
      color: "blue",
      gradient: "from-blue-500 to-blue-600",
    },
    {
      title: "Productos",
      description: "Administra el catálogo de productos",
      icon: Package,
      href: "/admin/productos",
      stats: `${stats.products.total} productos`,
      color: "purple",
      gradient: "from-purple-500 to-purple-600",
    },
    {
      title: "Órdenes",
      description: "Revisa y gestiona pedidos",
      icon: ShoppingCart,
      href: "/admin/ordenes",
      stats: `${stats.orders.total} órdenes`,
      color: "green",
      gradient: "from-green-500 to-green-600",
    },
    {
      title: "Suscriptores",
      description: "Gestiona suscriptores de notificaciones",
      icon: Users,
      href: "/admin/suscriptores",
      stats: "Ver suscriptores",
      color: "pink",
      gradient: "from-pink-500 to-pink-600",
    },
    {
      title: "Análiticas",
      description: "Estadísticas y reportes",
      icon: TrendingUp,
      href: "/admin/analytics",
      stats: "Ver reportes",
      color: "orange",
      gradient: "from-orange-500 to-orange-600",
    },
  ];

  const quickActions = [
    {
      title: "Nuevo Artículo",
      icon: FileText,
      href: "/admin/blog/nuevo",
      color: "blue",
    },
    {
      title: "Notificar Producto",
      icon: Send,
      href: "/admin/notificar-producto",
      color: "purple",
    },
    {
      title: "Ver Sitio",
      icon: Eye,
      href: "/",
      color: "gray",
    },
    {
      title: "Configuración",
      icon: Settings,
      href: "/admin/configuracion",
      color: "gray",
    },
  ];

  const recentActivity = [
    {
      action: "Artículos publicados",
      count: stats.blogPosts.published,
      icon: FileText,
      color: "text-blue-600",
    },
    {
      action: "Borradores",
      count: stats.blogPosts.drafts,
      icon: Calendar,
      color: "text-yellow-600",
    },
  ];

  if (!isLoaded || loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          <p className="mt-4 text-gray-600 dark:text-gray-400">
            Cargando panel de administración...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 ">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8 mt-12">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-4xl font-bold text-gray-900 dark:text-white flex items-center">
                <LayoutDashboard className="mr-3" size={36} />
                Panel de Administración
              </h1>
              <p className="text-gray-600 dark:text-gray-400 mt-2">
                Bienvenido de vuelta, {user?.firstName || "Admin"}
              </p>
            </div>
            <div className="text-right">
              <div className="text-sm text-gray-500 dark:text-gray-400">
                {new Date().toLocaleDateString("es-CO", {
                  weekday: "long",
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                })}
              </div>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="mb-8">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
            Acciones Rápidas
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {quickActions.map((action) => {
              const Icon = action.icon;
              return (
                <Link
                  key={action.title}
                  href={action.href}
                  className={`bg-white dark:bg-gray-800 p-4 rounded-lg shadow hover:shadow-lg transition-shadow flex items-center justify-between group ${
                    action.href.startsWith("/admin")
                      ? ""
                      : "border border-gray-200 dark:border-gray-700"
                  }`}
                >
                  <div className="flex items-center">
                    <div
                      className={`p-3 rounded-lg ${
                        action.color === "blue"
                          ? "bg-blue-100 dark:bg-blue-900"
                          : action.color === "purple"
                          ? "bg-purple-100 dark:bg-purple-900"
                          : "bg-gray-100 dark:bg-gray-700"
                      }`}
                    >
                      <Icon
                        size={24}
                        className={
                          action.color === "blue"
                            ? "text-blue-600 dark:text-blue-400"
                            : action.color === "purple"
                            ? "text-purple-600 dark:text-purple-400"
                            : "text-gray-600 dark:text-gray-400"
                        }
                      />
                    </div>
                    <span className="ml-3 font-medium text-gray-900 dark:text-white">
                      {action.title}
                    </span>
                  </div>
                  <ArrowRight
                    size={20}
                    className="text-gray-400 group-hover:text-gray-600 dark:group-hover:text-gray-300 transition-colors"
                  />
                </Link>
              );
            })}
          </div>
        </div>

        {/* Main Sections Grid */}
        <div className="mb-8">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
            Secciones
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-6">
            {adminSections.map((section) => {
              const Icon = section.icon;
              return (
                <Link
                  key={section.title}
                  href={section.href}
                  className="group bg-white dark:bg-gray-800 rounded-xl shadow-md hover:shadow-xl transition-all overflow-hidden"
                >
                  <div
                    className={`h-2 bg-gradient-to-r ${section.gradient}`}
                  ></div>
                  <div className="p-6">
                    <div className="flex items-start justify-between mb-4">
                      <div
                        className={`p-3 rounded-lg bg-gradient-to-br ${section.gradient} bg-opacity-10`}
                      >
                        <Icon
                          size={28}
                          className={`text-${section.color}-600 dark:text-${section.color}-400`}
                        />
                      </div>
                      <ArrowRight
                        size={20}
                        className="text-gray-400 group-hover:text-gray-600 dark:group-hover:text-gray-300 transition-colors group-hover:translate-x-1"
                      />
                    </div>
                    <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
                      {section.title}
                    </h3>
                    <p className="text-gray-600 dark:text-gray-400 mb-4">
                      {section.description}
                    </p>
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium text-gray-500 dark:text-gray-400">
                        {section.stats}
                      </span>
                      <span
                        className={`text-sm font-semibold text-${section.color}-600 dark:text-${section.color}-400`}
                      >
                        Gestionar →
                      </span>
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        </div>

        {/* Recent Activity */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
              Actividad Reciente
            </h2>
            <div className="space-y-4">
              {recentActivity.map((item, index) => {
                const Icon = item.icon;
                return (
                  <div
                    key={index}
                    className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg"
                  >
                    <div className="flex items-center">
                      <Icon size={20} className={item.color} />
                      <span className="ml-3 text-gray-700 dark:text-gray-300">
                        {item.action}
                      </span>
                    </div>
                    <span className="font-bold text-gray-900 dark:text-white">
                      {item.count}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg shadow p-6 text-white">
            <h2 className="text-xl font-semibold mb-4">Consejos Rápidos</h2>
            <ul className="space-y-3">
              <li className="flex items-start">
                <span className="mr-2">💡</span>
                <span>
                  Usa el editor de blog para publicar noticias de tecnología
                  regularmente
                </span>
              </li>
              <li className="flex items-start">
                <span className="mr-2">📊</span>
                <span>
                  Revisa las estadísticas de vistas para saber qué contenido
                  funciona mejor
                </span>
              </li>
              <li className="flex items-start">
                <span className="mr-2">⭐</span>
                <span>
                  Marca artículos como destacados para darles más visibilidad
                </span>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
