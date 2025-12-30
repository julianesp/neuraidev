"use client";
import { useState, useEffect } from "react";
import Image from "next/image";
import { LayoutGrid, Columns } from "lucide-react";
import DownloadableImage from "@/components/DownloadableImage";
import ProductoCascada from "@/components/ProductoCascada";

export default function ProductoLista({ productos, categorySlug = "generales" }) {
  const [imageError, setImageError] = useState({});
  const [viewMode, setViewMode] = useState("grid"); // "grid" o "cascade"

  // Cargar preferencia guardada del localStorage
  useEffect(() => {
    const savedViewMode = localStorage.getItem("productViewMode");
    if (savedViewMode) {
      setViewMode(savedViewMode);
    }
  }, []);

  // Guardar preferencia cuando cambie
  const handleViewModeChange = (mode) => {
    setViewMode(mode);
    localStorage.setItem("productViewMode", mode);
  };

  if (!productos || !Array.isArray(productos)) {
    return <div>Cargando productos...</div>;
  }

  return (
    <div className="w-full">
      {/* Toggle de vista */}
      <div className="flex justify-end items-center mb-6 px-4">
        <div className="bg-gray-100 rounded-lg p-1 flex gap-1">
          <button
            onClick={() => handleViewModeChange("grid")}
            className={`flex items-center gap-2 px-4 py-2 rounded-md transition-all ${
              viewMode === "grid"
                ? "bg-white shadow-sm text-blue-600 font-semibold"
                : "text-gray-600 hover:text-gray-800"
            }`}
            title="Vista en cuadrícula"
          >
            <LayoutGrid size={18} />
            <span className="hidden sm:inline">Cuadrícula</span>
          </button>
          <button
            onClick={() => handleViewModeChange("cascade")}
            className={`flex items-center gap-2 px-4 py-2 rounded-md transition-all ${
              viewMode === "cascade"
                ? "bg-white shadow-sm text-blue-600 font-semibold"
                : "text-gray-600 hover:text-gray-800"
            }`}
            title="Vista en cascada"
          >
            <Columns size={18} />
            <span className="hidden sm:inline">Cascada</span>
          </button>
        </div>
      </div>

      {/* Renderizar vista según la selección */}
      {viewMode === "cascade" ? (
        <ProductoCascada productos={productos} categorySlug={categorySlug} />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 px-4">
          {productos.map((producto) => (
            <div key={producto.id} className="border rounded-lg p-4 shadow-md">
              <div className="relative w-full h-48 mb-4">
                <DownloadableImage
                  src={
                    producto.images?.[0] ||
                    "/imageshttps://placehold.co/400x400/e5e7eb/9ca3af?text=Sin+imagen"
                  }
                  alt={producto.title}
                  className="object-cover rounded"
                  priority={producto.id <= 4}
                  width={400}
                  height={300}
                  filename={`${producto.title.replace(/[^a-z0-9]/gi, '-').toLowerCase()}.jpg`}
                />
              </div>
              <h2 className="text-xl font-semibold mb-2">{producto.title}</h2>
              <p className="text-gray-600 mb-4">{producto.description}</p>
              <p className="text-blue-600 font-bold mb-2">${producto.price}</p>
              {/* Botón de agregar al carrito deshabilitado */}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
