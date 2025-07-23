"use client";

import { useState, useEffect } from "react";
import { useUserAuth } from "../../../hooks/useUserAuth";

// Mapeo de business a categorías de productos
const businessToCategory = {
  "peluqueria-bella": "health",
  "tienda-tech": "technology", 
  "boutique-moda": "shop",
  "accesorios-cell": "technology",
  "supermercado-local": "general",
  "restaurante-sabor": "restaurant"
};

export default function ProductsClient({ businessId }) {
  const { isAuthenticated, user } = useUserAuth();
  const [productos, setProductos] = useState([]);
  const [favorites, setFavorites] = useState(new Set());
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchProductos = async () => {
      try {
        const categoria = businessToCategory[businessId];
        if (!categoria) {
          setError("Categoría no encontrada para este negocio");
          return;
        }

        const response = await fetch(`/api/productos?categoria=${categoria}`);
        if (response.ok) {
          const data = await response.json();
          setProductos(data);
        } else {
          setError("Error al cargar productos");
        }
      } catch (err) {
        console.error("Error fetching productos:", err);
        setError("Error de conexión");
      } finally {
        setLoading(false);
      }
    };

    fetchProductos();
  }, [businessId]);

  useEffect(() => {
    if (isAuthenticated) {
      fetchFavorites();
    }
  }, [isAuthenticated]);

  const fetchFavorites = async () => {
    try {
      const token = localStorage.getItem("userToken");
      const response = await fetch("/api/favorites", {
        headers: { "Authorization": `Bearer ${token}` }
      });

      if (response.ok) {
        const data = await response.json();
        const favoriteIds = new Set(data.map(fav => fav.id));
        setFavorites(favoriteIds);
      }
    } catch (error) {
      console.error("Error fetching favorites:", error);
    }
  };

  const toggleFavorite = async (productId) => {
    if (!isAuthenticated) {
      alert("Debes iniciar sesión para agregar favoritos");
      return;
    }

    try {
      const token = localStorage.getItem("userToken");
      const isFavorite = favorites.has(productId);

      if (isFavorite) {
        // Remover de favoritos
        const response = await fetch(`/api/favorites?productId=${productId}`, {
          method: "DELETE",
          headers: { "Authorization": `Bearer ${token}` }
        });

        if (response.ok) {
          setFavorites(prev => {
            const newFavorites = new Set(prev);
            newFavorites.delete(productId);
            return newFavorites;
          });
        }
      } else {
        // Agregar a favoritos
        const response = await fetch("/api/favorites", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${token}`
          },
          body: JSON.stringify({ productId })
        });

        if (response.ok) {
          setFavorites(prev => new Set([...prev, productId]));
        }
      }
    } catch (error) {
      console.error("Error toggling favorite:", error);
      alert("Error al actualizar favoritos");
    }
  };

  if (loading) {
    return (
      <div className="py-8">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Cargando productos...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="py-8 text-center">
        <p className="text-red-600">{error}</p>
      </div>
    );
  }

  if (productos.length === 0) {
    return (
      <div className="py-8">
        <div className="text-center bg-gray-50 rounded-lg p-8">
          <svg className="w-16 h-16 text-gray-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
          </svg>
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            No hay productos disponibles
          </h3>
          <p className="text-gray-600">
            Este negocio aún no ha agregado productos a su catálogo.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="py-8">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">
          Nuestros Productos
        </h2>
        <p className="text-gray-600">
          Descubre nuestra selección de productos de calidad
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {productos.map((producto) => (
          <div
            key={producto.id}
            className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow border"
          >
            {/* Imagen del producto */}
            <div className="aspect-w-1 aspect-h-1 h-48 overflow-hidden relative">
              {producto.imagen_principal ? (
                <img
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
              
              {/* Botón de favorito */}
              <button
                onClick={() => toggleFavorite(producto.id)}
                className={`absolute top-2 right-2 w-8 h-8 rounded-full flex items-center justify-center transition-all duration-200 ${
                  favorites.has(producto.id)
                    ? "bg-red-500 text-white shadow-lg"
                    : "bg-white/80 text-gray-600 hover:bg-white hover:text-red-500"
                }`}
                title={favorites.has(producto.id) ? "Remover de favoritos" : "Agregar a favoritos"}
              >
                <svg 
                  className="w-4 h-4" 
                  fill={favorites.has(producto.id) ? "currentColor" : "none"} 
                  stroke="currentColor" 
                  viewBox="0 0 24 24"
                >
                  <path 
                    strokeLinecap="round" 
                    strokeLinejoin="round" 
                    strokeWidth={2} 
                    d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" 
                  />
                </svg>
              </button>
            </div>

            {/* Contenido del producto */}
            <div className="p-4">
              <h3 className="text-lg font-semibold text-gray-900 mb-2 line-clamp-2">
                {producto.nombre}
              </h3>

              {producto.descripcion && (
                <p className="text-gray-600 text-sm mb-3 line-clamp-2">
                  {producto.descripcion}
                </p>
              )}

              <div className="flex items-center justify-between">
                <span className="text-xl font-bold text-green-600">
                  ${parseFloat(producto.precio).toLocaleString()}
                </span>
                
                <button className="bg-blue-600 text-white px-3 py-1.5 rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium">
                  Ver más
                </button>
              </div>

              {/* Imágenes adicionales */}
              {Array.isArray(producto.imagenes) && producto.imagenes.length > 0 && (
                <div className="mt-3 flex gap-1 overflow-x-auto">
                  {producto.imagenes.slice(0, 3).map((imagen, index) => (
                    <img
                      key={index}
                      src={imagen}
                      alt={`${producto.nombre} ${index + 1}`}
                      className="w-10 h-10 object-cover rounded flex-shrink-0"
                      onError={(e) => {
                        e.target.style.display = 'none';
                      }}
                    />
                  ))}
                  {producto.imagenes.length > 3 && (
                    <div className="w-10 h-10 bg-gray-100 rounded flex items-center justify-center text-xs text-gray-500 flex-shrink-0">
                      +{producto.imagenes.length - 3}
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      {productos.length > 0 && (
        <div className="mt-8 text-center">
          <p className="text-gray-600">
            Mostrando {productos.length} producto{productos.length !== 1 ? 's' : ''}
          </p>
        </div>
      )}
    </div>
  );
}