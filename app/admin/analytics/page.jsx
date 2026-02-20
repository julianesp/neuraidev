"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  Eye,
  TrendingUp,
  Calendar,
  BarChart3,
  Users,
  Clock,
  Star,
  ExternalLink,
} from "lucide-react";

export default function AnalyticsPage() {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [timeFilter, setTimeFilter] = useState("all"); // all, week, month
  const [stats, setStats] = useState({
    totalViews: 0,
    totalPosts: 0,
    avgViews: 0,
    mostViewed: null,
  });

  useEffect(() => {
    fetchAnalytics();
  }, []);

  const fetchAnalytics = async () => {
    try {
      setLoading(true);
      const response = await fetch("/api/blog/posts?published=true");
      const data = await response.json();

      if (response.ok) {
        const posts = data.posts || [];

        // Ordenar por vistas (descendente)
        const sortedPosts = [...posts].sort((a, b) => (b.views || 0) - (a.views || 0));
        setPosts(sortedPosts);

        // Calcular estadísticas
        const totalViews = posts.reduce((acc, post) => acc + (post.views || 0), 0);
        const avgViews = posts.length > 0 ? Math.round(totalViews / posts.length) : 0;
        const mostViewed = sortedPosts[0];

        setStats({
          totalViews,
          totalPosts: posts.length,
          avgViews,
          mostViewed,
        });
      }
    } catch (error) {
      console.error("Error fetching analytics:", error);
    } finally {
      setLoading(false);
    }
  };

  const getViewsPercentage = (views) => {
    if (stats.totalViews === 0) return 0;
    return Math.round((views / stats.totalViews) * 100);
  };

  const getCategoryStats = () => {
    const categories = {};
    posts.forEach((post) => {
      if (!categories[post.category]) {
        categories[post.category] = {
          count: 0,
          views: 0,
        };
      }
      categories[post.category].count++;
      categories[post.category].views += post.views || 0;
    });

    return Object.entries(categories)
      .map(([name, data]) => ({
        name,
        count: data.count,
        views: data.views,
        avgViews: Math.round(data.views / data.count),
      }))
      .sort((a, b) => b.views - a.views);
  };

  const categoryStats = getCategoryStats();

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          <p className="mt-4 text-gray-600 dark:text-gray-400">
            Cargando estadísticas...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <Link
            href="/admin"
            className="inline-flex items-center text-blue-600 hover:text-blue-800 dark:text-blue-400 mb-4"
          >
            <ArrowLeft size={20} className="mr-2" />
            Volver al panel
          </Link>
          <div className="flex justify-between items-start">
            <div>
              <h1 className="text-4xl font-bold text-gray-900 dark:text-white flex items-center">
                <BarChart3 className="mr-3" size={36} />
                Estadísticas del Blog
              </h1>
              <p className="text-gray-600 dark:text-gray-400 mt-2">
                Análisis de visitas y rendimiento de tus publicaciones
              </p>
            </div>
            <button
              onClick={fetchAnalytics}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-semibold"
            >
              Actualizar
            </button>
          </div>
        </div>

        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Vistas Totales
                </p>
                <p className="text-3xl font-bold text-gray-900 dark:text-white mt-2">
                  {stats.totalViews.toLocaleString()}
                </p>
              </div>
              <div className="p-3 bg-blue-100 dark:bg-blue-900 rounded-lg">
                <Eye size={24} className="text-blue-600 dark:text-blue-400" />
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Artículos Publicados
                </p>
                <p className="text-3xl font-bold text-gray-900 dark:text-white mt-2">
                  {stats.totalPosts}
                </p>
              </div>
              <div className="p-3 bg-purple-100 dark:bg-purple-900 rounded-lg">
                <Calendar size={24} className="text-purple-600 dark:text-purple-400" />
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Promedio de Vistas
                </p>
                <p className="text-3xl font-bold text-gray-900 dark:text-white mt-2">
                  {stats.avgViews}
                </p>
              </div>
              <div className="p-3 bg-green-100 dark:bg-green-900 rounded-lg">
                <TrendingUp size={24} className="text-green-600 dark:text-green-400" />
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Más Popular
                </p>
                <p className="text-lg font-bold text-gray-900 dark:text-white mt-2 truncate">
                  {stats.mostViewed
                    ? `${stats.mostViewed.views} vistas`
                    : "N/A"}
                </p>
              </div>
              <div className="p-3 bg-yellow-100 dark:bg-yellow-900 rounded-lg">
                <Star size={24} className="text-yellow-600 dark:text-yellow-400" />
              </div>
            </div>
          </div>
        </div>

        {/* Top Posts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow">
            <div className="p-6 border-b border-gray-200 dark:border-gray-700">
              <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                Artículos Más Vistos
              </h2>
              <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                Top 10 artículos con más visitas
              </p>
            </div>
            <div className="p-6">
              <div className="space-y-4">
                {posts.slice(0, 10).map((post, index) => (
                  <div
                    key={post.id}
                    className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700 rounded-lg hover:shadow-md transition-shadow"
                  >
                    <div className="flex items-center flex-1 min-w-0">
                      <div className="flex-shrink-0 w-8 h-8 flex items-center justify-center bg-blue-100 dark:bg-blue-900 text-blue-600 dark:text-blue-400 font-bold rounded-full">
                        {index + 1}
                      </div>
                      <div className="ml-4 flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                          {post.title}
                        </p>
                        <div className="flex items-center mt-1 text-xs text-gray-500 dark:text-gray-400">
                          <span className="mr-2">{post.category}</span>
                          <span>•</span>
                          <span className="ml-2">
                            {new Date(post.published_at || post.created_at).toLocaleDateString("es-CO")}
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className="ml-4 flex items-center">
                      <div className="text-right mr-3">
                        <p className="text-lg font-bold text-gray-900 dark:text-white">
                          {post.views || 0}
                        </p>
                        <p className="text-xs text-gray-500 dark:text-gray-400">
                          {getViewsPercentage(post.views || 0)}%
                        </p>
                      </div>
                      <Link
                        href={`/blog/${post.slug}`}
                        target="_blank"
                        className="text-blue-600 hover:text-blue-800 dark:text-blue-400"
                      >
                        <ExternalLink size={16} />
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Category Performance */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow">
            <div className="p-6 border-b border-gray-200 dark:border-gray-700">
              <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                Rendimiento por Categoría
              </h2>
              <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                Estadísticas agrupadas por categoría
              </p>
            </div>
            <div className="p-6">
              <div className="space-y-4">
                {categoryStats.map((category, index) => (
                  <div
                    key={category.name}
                    className="p-4 bg-gray-50 dark:bg-gray-700 rounded-lg"
                  >
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="font-semibold text-gray-900 dark:text-white">
                        {category.name}
                      </h3>
                      <span className="text-sm text-gray-600 dark:text-gray-400">
                        {category.count} artículos
                      </span>
                    </div>
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600 dark:text-gray-400">
                          Vistas totales
                        </span>
                        <span className="font-bold text-gray-900 dark:text-white">
                          {category.views.toLocaleString()}
                        </span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600 dark:text-gray-400">
                          Promedio por artículo
                        </span>
                        <span className="font-bold text-gray-900 dark:text-white">
                          {category.avgViews}
                        </span>
                      </div>
                      {/* Progress bar */}
                      <div className="w-full bg-gray-200 dark:bg-gray-600 rounded-full h-2 mt-2">
                        <div
                          className="bg-blue-600 h-2 rounded-full transition-all"
                          style={{
                            width: `${getViewsPercentage(category.views)}%`,
                          }}
                        ></div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* All Posts Table */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow overflow-hidden">
          <div className="p-6 border-b border-gray-200 dark:border-gray-700">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white">
              Todos los Artículos
            </h2>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
              <thead className="bg-gray-50 dark:bg-gray-700">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Artículo
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Categoría
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Fecha
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Vistas
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    % Total
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Acciones
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                {posts.map((post) => (
                  <tr key={post.id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                    <td className="px-6 py-4">
                      <div className="flex items-center">
                        {post.featured && (
                          <Star size={16} className="text-yellow-500 fill-yellow-500 mr-2" />
                        )}
                        <div>
                          <div className="text-sm font-medium text-gray-900 dark:text-white">
                            {post.title}
                          </div>
                          {post.read_time && (
                            <div className="text-sm text-gray-500 dark:text-gray-400">
                              {post.read_time} min de lectura
                            </div>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200">
                        {post.category}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                      {new Date(post.published_at || post.created_at).toLocaleDateString("es-CO")}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <Eye size={16} className="text-gray-400 mr-2" />
                        <span className="text-sm font-bold text-gray-900 dark:text-white">
                          {(post.views || 0).toLocaleString()}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                      {getViewsPercentage(post.views || 0)}%
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      <div className="flex items-center space-x-2">
                        <Link
                          href={`/blog/${post.slug}`}
                          target="_blank"
                          className="text-blue-600 hover:text-blue-900 dark:text-blue-400"
                        >
                          <ExternalLink size={16} />
                        </Link>
                        <Link
                          href={`/admin/blog/editar/${post.id}`}
                          className="text-gray-600 hover:text-gray-900 dark:text-gray-400"
                        >
                          Editar
                        </Link>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
