"use client";

import { useState, useEffect } from "react";
import { useUserAuth } from "../../hooks/useUserAuth";
import Link from "next/link";
import Image from "next/image";

export default function FavoritesPage() {
  const { isAuthenticated, loading: authLoading, user } = useUserAuth();
  const [favorites, setFavorites] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchFavorites = async () => {
    try {
      const token = localStorage.getItem("userToken");
      if (!token) return;

      const response = await fetch("/api/favorites", {
        headers: {
          "Authorization": `Bearer ${token}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        setFavorites(data);
      } else {
        setError("Error al cargar favoritos");
      }
    } catch (error) {
      console.error("Error:", error);
      setError("Error de conexión");
    } finally {
      setLoading(false);
    }
  };

  const removeFavorite = async (productId) => {
    try {
      const token = localStorage.getItem("userToken");
      const response = await fetch(`/api/favorites?productId=${productId}`, {
        method: "DELETE",
        headers: {
          "Authorization": `Bearer ${token}`
        }
      });

      if (response.ok) {
        setFavorites(prev => prev.filter(fav => fav.id !== productId));
      } else {
        alert("Error al remover de favoritos");
      }
    } catch (error) {
      console.error("Error:", error);
      alert("Error de conexión");
    }
  };

  useEffect(() => {
    if (!authLoading && isAuthenticated) {
      fetchFavorites();
    } else if (!authLoading && !isAuthenticated) {
      setLoading(false);
    }
  }, [authLoading, isAuthenticated]);

  if (authLoading || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-lg text-gray-600">Cargando favoritos...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center max-w-md">
          <div className="bg-white rounded-2xl shadow-xl p-8">
            <div className="w-16 h-16 bg-gradient-to-r from-red-500 to-pink-500 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
              </svg>
            </div>
            <h1 className="text-2xl font-bold text-gray-900 mb-4">
              Acceso Requerido
            </h1>
            <p className="text-gray-600 mb-6">
              Debes iniciar sesión para ver tus productos favoritos
            </p>
            <div className="space-y-3">
              <Link 
                href="/login"
                className="block w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white py-3 px-4 rounded-lg font-medium hover:from-blue-700 hover:to-purple-700 transition-all duration-200"
              >
                Iniciar Sesión
              </Link>
              <Link 
                href="/register"
                className="block w-full bg-gray-100 text-gray-700 py-3 px-4 rounded-lg font-medium hover:bg-gray-200 transition-all duration-200"
              >
                Crear Cuenta
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                Mis Favoritos
              </h1>
              <p className="mt-2 text-gray-600">
                Productos que has marcado como favoritos
              </p>
            </div>
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full flex items-center justify-center">
                <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
              </div>
              <div>
                <p className="font-medium text-gray-900">{user?.username}</p>
                <p className="text-sm text-gray-500">
                  {favorites.length} favorito{favorites.length !== 1 ? 's' : ''}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8">
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
            <p className="text-red-800">{error}</p>
          </div>
        )}

        {favorites.length === 0 ? (
          <div className="text-center py-12">
            <div className="bg-white rounded-2xl shadow-xl p-8 max-w-md mx-auto">
              <div className="w-16 h-16 bg-gradient-to-r from-gray-400 to-gray-500 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                No tienes favoritos aún
              </h3>
              <p className="text-gray-600 mb-6">
                Explora nuestros productos y marca tus favoritos para verlos aquí
              </p>
              <Link 
                href="/businesses"
                className="inline-block bg-gradient-to-r from-blue-600 to-purple-600 text-white py-3 px-6 rounded-lg font-medium hover:from-blue-700 hover:to-purple-700 transition-all duration-200"
              >
                Explorar Productos
              </Link>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {favorites.map((producto) => (
              <div
                key={producto.id}
                className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow border relative"
              >
                {/* Botón remover favorito */}
                <button
                  onClick={() => removeFavorite(producto.id)}
                  className="absolute top-2 right-2 z-10 w-8 h-8 bg-red-500 text-white rounded-full hover:bg-red-600 transition-colors flex items-center justify-center"
                  title="Remover de favoritos"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>

                {/* Imagen del producto */}
                <div className="aspect-w-1 aspect-h-1 h-48 overflow-hidden">
                  {producto.imagen_principal ? (
                    <Image
                      src={producto.imagen_principal}
                      alt={producto.nombre}
                      className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                      onError={(e) => {
                        e.target.src = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke='currentColor'%3E%3Cpath stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z' /%3E%3C/svg%3E";
                      }}
                    />
                  ) : (
                    <div className="w-full h-full bg-gray-200 flex items-center justify-center">
                      <svg className="w-12 h-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 002 2v12a2 2 0 002 2z" />
                      </svg>
                    </div>
                  )}
                </div>

                {/* Contenido del producto */}
                <div className="p-4">
                  <div className="flex items-start justify-between mb-2">
                    <h3 className="text-lg font-semibold text-gray-900 line-clamp-2">
                      {producto.nombre}
                    </h3>
                    <span className="inline-flex px-2 py-1 text-xs font-medium rounded-full bg-blue-100 text-blue-800 ml-2 flex-shrink-0">
                      {producto.categoria}
                    </span>
                  </div>

                  {producto.descripcion && (
                    <p className="text-gray-600 text-sm mb-3 line-clamp-2">
                      {producto.descripcion}
                    </p>
                  )}

                  <div className="flex items-center justify-between">
                    <span className="text-xl font-bold text-green-600">
                      ${parseFloat(producto.precio).toLocaleString()}
                    </span>
                    
                    <div className="text-xs text-gray-500">
                      Agregado {new Date(producto.favorited_at).toLocaleDateString()}
                    </div>
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