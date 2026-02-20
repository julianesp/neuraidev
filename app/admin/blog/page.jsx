"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import Swal from "sweetalert2";
import {
  Plus,
  Edit,
  Trash2,
  Eye,
  EyeOff,
  Star,
  ExternalLink,
} from "lucide-react";

export default function AdminBlogPanel() {
  const router = useRouter();
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("all"); // all, published, draft

  useEffect(() => {
    fetchPosts();
  }, []);

  const fetchPosts = async () => {
    try {
      setLoading(true);
      const response = await fetch("/api/blog/posts");
      const data = await response.json();

      if (response.ok) {
        setPosts(data.posts || []);
      } else {
        throw new Error(data.error);
      }
    } catch (error) {
      console.error("Error fetching posts:", error);
      await Swal.fire({
        icon: "error",
        title: "Error",
        text: "No se pudieron cargar los artículos",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (postId, title) => {
    const result = await Swal.fire({
      title: "¿Eliminar artículo?",
      text: `¿Estás seguro de que deseas eliminar "${title}"?`,
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      cancelButtonColor: "#3085d6",
      confirmButtonText: "Sí, eliminar",
      cancelButtonText: "Cancelar",
    });

    if (result.isConfirmed) {
      try {
        const response = await fetch(`/api/blog/posts/${postId}`, {
          method: "DELETE",
        });

        if (response.ok) {
          await Swal.fire({
            icon: "success",
            title: "Eliminado",
            text: "El artículo ha sido eliminado",
            timer: 2000,
            showConfirmButton: false,
          });
          fetchPosts();
        } else {
          throw new Error("Error al eliminar");
        }
      } catch (error) {
        await Swal.fire({
          icon: "error",
          title: "Error",
          text: "No se pudo eliminar el artículo",
        });
      }
    }
  };

  const handleTogglePublish = async (post) => {
    try {
      const response = await fetch(`/api/blog/posts/${post.id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          published: !post.published,
        }),
      });

      if (response.ok) {
        await Swal.fire({
          icon: "success",
          title: post.published ? "Ocultado" : "Publicado",
          text: `El artículo ha sido ${post.published ? "ocultado" : "publicado"}`,
          timer: 2000,
          showConfirmButton: false,
        });
        fetchPosts();
      } else {
        throw new Error("Error al actualizar");
      }
    } catch (error) {
      await Swal.fire({
        icon: "error",
        title: "Error",
        text: "No se pudo actualizar el artículo",
      });
    }
  };

  const handleToggleFeatured = async (post) => {
    try {
      const response = await fetch(`/api/blog/posts/${post.id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          featured: !post.featured,
        }),
      });

      if (response.ok) {
        fetchPosts();
      }
    } catch (error) {
      console.error("Error toggling featured:", error);
    }
  };

  const filteredPosts = posts.filter((post) => {
    if (filter === "published") return post.published;
    if (filter === "draft") return !post.published;
    return true;
  });

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8 mt-12 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-4xl font-bold text-gray-900 dark:text-white">
              Panel de Blog
            </h1>
            <p className="text-gray-600 dark:text-gray-400 mt-2">
              Gestiona tus artículos y publicaciones
            </p>
          </div>
          <Link
            href="/admin/blog/nuevo"
            className="inline-flex items-center px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-semibold"
          >
            <Plus size={20} className="mr-2" />
            Nuevo Artículo
          </Link>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
            <div className="text-sm text-gray-600 dark:text-gray-400">
              Total
            </div>
            <div className="text-3xl font-bold text-gray-900 dark:text-white">
              {posts.length}
            </div>
          </div>
          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
            <div className="text-sm text-gray-600 dark:text-gray-400">
              Publicados
            </div>
            <div className="text-3xl font-bold text-green-600">
              {posts.filter((p) => p.published).length}
            </div>
          </div>
          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
            <div className="text-sm text-gray-600 dark:text-gray-400">
              Borradores
            </div>
            <div className="text-3xl font-bold text-yellow-600">
              {posts.filter((p) => !p.published).length}
            </div>
          </div>
          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
            <div className="text-sm text-gray-600 dark:text-gray-400">
              Vistas Totales
            </div>
            <div className="text-3xl font-bold text-blue-600">
              {posts.reduce((acc, p) => acc + (p.views || 0), 0)}
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="mb-6 flex gap-2">
          <button
            onClick={() => setFilter("all")}
            className={`px-4 py-2 rounded-lg font-medium ${
              filter === "all"
                ? "bg-blue-600 text-white"
                : "bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300"
            }`}
          >
            Todos ({posts.length})
          </button>
          <button
            onClick={() => setFilter("published")}
            className={`px-4 py-2 rounded-lg font-medium ${
              filter === "published"
                ? "bg-green-600 text-white"
                : "bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300"
            }`}
          >
            Publicados ({posts.filter((p) => p.published).length})
          </button>
          <button
            onClick={() => setFilter("draft")}
            className={`px-4 py-2 rounded-lg font-medium ${
              filter === "draft"
                ? "bg-yellow-600 text-white"
                : "bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300"
            }`}
          >
            Borradores ({posts.filter((p) => !p.published).length})
          </button>
        </div>

        {/* Posts List */}
        {loading ? (
          <div className="text-center py-12">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            <p className="mt-4 text-gray-600 dark:text-gray-400">
              Cargando artículos...
            </p>
          </div>
        ) : filteredPosts.length === 0 ? (
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-12 text-center">
            <p className="text-gray-600 dark:text-gray-400 text-lg">
              {filter === "all"
                ? "No hay artículos todavía"
                : filter === "published"
                ? "No hay artículos publicados"
                : "No hay borradores"}
            </p>
            <Link
              href="/admin/blog/nuevo"
              className="inline-flex items-center px-6 py-3 mt-4 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-semibold"
            >
              <Plus size={20} className="mr-2" />
              Crear primer artículo
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredPosts.map((post) => (
              <div
                key={post.id}
                className="bg-white dark:bg-gray-800 rounded-lg shadow hover:shadow-lg transition-shadow p-6"
              >
                <div className="flex flex-col lg:flex-row justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <span
                        className={`px-3 py-1 text-xs font-medium rounded-full ${
                          post.published
                            ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"
                            : "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200"
                        }`}
                      >
                        {post.published ? "Publicado" : "Borrador"}
                      </span>
                      <span className="px-3 py-1 text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200 rounded-full">
                        {post.category}
                      </span>
                      {post.featured && (
                        <Star size={16} className="text-yellow-500 fill-yellow-500" />
                      )}
                    </div>

                    <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
                      {post.title}
                    </h2>
                    <p className="text-gray-600 dark:text-gray-400 mb-3 line-clamp-2">
                      {post.excerpt}
                    </p>

                    <div className="flex flex-wrap items-center gap-4 text-sm text-gray-500 dark:text-gray-400">
                      <span>👁️ {post.views || 0} vistas</span>
                      {post.read_time && <span>⏱️ {post.read_time} min</span>}
                      <span>
                        {new Date(
                          post.published_at || post.created_at
                        ).toLocaleDateString("es-CO")}
                      </span>
                    </div>
                  </div>

                  <div className="flex lg:flex-col gap-2">
                    <button
                      onClick={() => handleToggleFeatured(post)}
                      className={`p-2 rounded hover:bg-gray-100 dark:hover:bg-gray-700 ${
                        post.featured ? "text-yellow-500" : "text-gray-400"
                      }`}
                      title={
                        post.featured ? "Quitar destacado" : "Marcar como destacado"
                      }
                    >
                      <Star size={20} className={post.featured ? "fill-yellow-500" : ""} />
                    </button>

                    <button
                      onClick={() => handleTogglePublish(post)}
                      className="p-2 rounded hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-600 dark:text-gray-400"
                      title={post.published ? "Ocultar" : "Publicar"}
                    >
                      {post.published ? <EyeOff size={20} /> : <Eye size={20} />}
                    </button>

                    {post.published && (
                      <Link
                        href={`/blog/${post.slug}`}
                        target="_blank"
                        className="p-2 rounded hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-600 dark:text-gray-400"
                        title="Ver artículo"
                      >
                        <ExternalLink size={20} />
                      </Link>
                    )}

                    <Link
                      href={`/admin/blog/editar/${post.id}`}
                      className="p-2 rounded hover:bg-gray-100 dark:hover:bg-gray-700 text-blue-600"
                      title="Editar"
                    >
                      <Edit size={20} />
                    </Link>

                    <button
                      onClick={() => handleDelete(post.id, post.title)}
                      className="p-2 rounded hover:bg-gray-100 dark:hover:bg-gray-700 text-red-600"
                      title="Eliminar"
                    >
                      <Trash2 size={20} />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
