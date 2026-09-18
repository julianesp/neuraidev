"use client";

import React, { useState, useEffect } from "react";
import FavoriteButton from "@/components/FavoriteButton";
import ProductoCoverflow from "@/components/Producto/ProductoCoverflow";

async function obtenerProductosDestacados() {
  try {
    const res = await fetch("/api/productos/destacados", { cache: "no-store" });
    if (!res.ok) return [];
    return res.json();
  } catch {
    return [];
  }
}

const getAccesorioImagenUrl = (accesorio) => {
  const placeholder =
    "https://placehold.co/400x400/e5e7eb/9ca3af?text=Sin+imagen";
  if (!accesorio) return placeholder;

  const explicitImage =
    accesorio.imagenPrincipal ||
    accesorio.imagen_principal ||
    accesorio.imagen ||
    accesorio.imagen_url;
  if (explicitImage) return explicitImage;

  const imagenes =
    typeof accesorio.imagenes === "string"
      ? (() => {
          try {
            return JSON.parse(accesorio.imagenes);
          } catch {
            return [];
          }
        })()
      : accesorio.imagenes;

  if (Array.isArray(imagenes) && imagenes.length > 0) {
    const primera = imagenes[0];
    if (typeof primera === "string") return primera;
    if (primera && typeof primera === "object") {
      return primera.url || primera.src || primera.imagen || placeholder;
    }
  }

  return placeholder;
};

const AccesoriosDestacados = () => {
  const [destacados, setDestacados] = useState([]);
  const [error, setError] = useState(null);

  useEffect(() => {
    const cargarAccesorios = async () => {
      try {
        const accesoriosData = await obtenerProductosDestacados();
        setDestacados(accesoriosData);
        setError(null);
      } catch (err) {
        console.error("Error al cargar accesorios destacados:", err);
        setError("No se pudieron cargar los accesorios");
      }
    };

    cargarAccesorios();
  }, []);

  if (error) {
    return (
      <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
        <p>{error}</p>
      </div>
    );
  }

  if (destacados.length === 0) {
    return (
      <p className="text-gray-600 text-center py-8">
        No hay accesorios destacados disponibles
      </p>
    );
  }

  return (
    <ProductoCoverflow
      productos={destacados}
      getImagen={getAccesorioImagenUrl}
      getHref={(accesorio) =>
        `/accesorios/${accesorio.categoria}/${accesorio.id}`
      }
      renderBadgeDer={(accesorio) => (
        <div onClick={(e) => e.stopPropagation()}>
          <FavoriteButton producto={accesorio} size="small" />
        </div>
      )}
      renderBadgeIzq={(accesorio) =>
        accesorio.stock && accesorio.stock <= 5 && accesorio.stock > 0 ? (
          <div className="bg-blue-500 text-white text-xs font-bold px-2 py-1 rounded-full">
            ¡{accesorio.stock} unidades!
          </div>
        ) : null
      }
      renderPrecio={(accesorio) => (
        <div className="mt-2 flex items-center gap-2">
          <span className="font-bold text-lg text-green-600">
            $
            {typeof accesorio.precio === "number"
              ? accesorio.precio.toLocaleString("es-CL")
              : accesorio.precio}
          </span>
          {accesorio.precioAnterior && (
            <span className="text-gray-500 line-through text-sm">
              $
              {typeof accesorio.precioAnterior === "number"
                ? accesorio.precioAnterior.toLocaleString("es-CL")
                : accesorio.precioAnterior}
            </span>
          )}
        </div>
      )}
      verTodosHref="/accesorios/destacados"
      verTodosTexto="Ver todos los destacados"
    />
  );
};

export default AccesoriosDestacados;
