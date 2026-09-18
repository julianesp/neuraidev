"use client";

import React, { useState, useEffect } from "react";
import ProductoCoverflow from "@/components/Producto/ProductoCoverflow";

async function obtenerProductosRecientes(limit = 10) {
  const res = await fetch(`/api/productos/nuevos?limit=${limit}`);
  if (!res.ok) return [];
  const data = await res.json();
  return Array.isArray(data) ? data : data.productos || [];
}

const getProductoImagenUrl = (producto) => {
  const placeholder =
    "https://media.neurai.dev/Accesorios/books/used/algebra_intermedia/2.jpg";
  return (
    producto.imagen_principal ||
    (producto.imagenes && producto.imagenes.length > 0
      ? producto.imagenes[0].url
      : placeholder)
  );
};

// Etiqueta amigable de la fecha de ingreso.
const formatearFechaCreacion = (fecha) => {
  if (!fecha) return "Nuevo";

  const fechaCreacion = new Date(fecha);
  const ahora = new Date();
  const diferenciaDias = Math.floor(
    (ahora - fechaCreacion) / (1000 * 60 * 60 * 24),
  );

  if (diferenciaDias === 0) return "Hoy";
  if (diferenciaDias === 1) return "Ayer";
  if (diferenciaDias < 7) return `Hace ${diferenciaDias} días`;
  if (diferenciaDias < 30)
    return `Hace ${Math.floor(diferenciaDias / 7)} semanas`;
  return fechaCreacion.toLocaleDateString("es-ES");
};

const ProductosRecientes = () => {
  const [recientes, setRecientes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [errorState, setErrorState] = useState(null);

  useEffect(() => {
    const fetchProductos = async () => {
      try {
        setLoading(true);
        const productosData = await obtenerProductosRecientes();
        setRecientes(productosData);
        setErrorState(null);
      } catch (err) {
        console.error("Error al cargar productos recientes:", err);
        setErrorState("No se pudieron cargar los productos");
      } finally {
        setLoading(false);
      }
    };

    fetchProductos();
  }, []);

  if (errorState) {
    return (
      <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
        <p>{errorState}</p>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
        <span className="ml-2 text-gray-600">
          Cargando productos recientes...
        </span>
      </div>
    );
  }

  if (recientes.length === 0) {
    return (
      <p className="text-gray-600 text-center py-8">
        No hay productos nuevos disponibles
      </p>
    );
  }

  return (
    <ProductoCoverflow
      productos={recientes}
      getImagen={getProductoImagenUrl}
      getHref={(producto) => `/accesorios/${producto.categoria}/${producto.id}`}
      renderBadgeIzq={() => (
        <div className="bg-blue-500 text-white px-2 py-1 rounded-full text-xs font-bold">
          NUEVO
        </div>
      )}
      renderBadgeDer={(producto) => (
        <div className="bg-white bg-opacity-90 text-gray-700 px-2 py-1 rounded-full text-xs font-medium">
          {formatearFechaCreacion(producto.fechaIngreso)}
        </div>
      )}
      renderPrecio={(producto) => (
        <div className="mt-2 flex items-center gap-2">
          <span className="font-bold text-lg text-green-600">
            $
            {typeof producto.precio === "number"
              ? producto.precio.toLocaleString("es-CL")
              : producto.precio}
          </span>
          {producto.precioAnterior && (
            <span className="text-gray-500 line-through text-sm">
              $
              {typeof producto.precioAnterior === "number"
                ? producto.precioAnterior.toLocaleString("es-CL")
                : producto.precioAnterior}
            </span>
          )}
        </div>
      )}
      verTodosHref="/accesorios"
      verTodosTexto="Ver todos los productos"
    />
  );
};

export default ProductosRecientes;
