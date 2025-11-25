"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import AccesoriosContainer from "@/containers/AccesoriosContainer/page";
import Link from "next/link";
import { getProductById, getRelatedProducts } from "@/lib/productService";

export default function AccesorioPage() {
  const params = useParams();
  const [accesorio, setAccesorio] = useState(null);
  const [otrosAccesorios, setOtrosAccesorios] = useState([]);
  const [telefono] = useState("573174503604");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Función para cargar los datos desde Supabase usando el servicio centralizado
    const cargarDatos = async () => {
      try {
        // Obtener el ID del accesorio de la URL
        const accesorioId = params.id;

        if (!accesorioId) {
          throw new Error("ID de accesorio no encontrado");
        }

        // Buscar el accesorio específico usando el servicio
        const producto = await getProductById(accesorioId);

        if (!producto) {
          throw new Error("Accesorio no encontrado en la base de datos");
        }

        // Verificar que el producto tiene stock disponible
        if (producto.stock <= 0) {
          console.warn("[AccesorioPage] Producto sin stock:", producto.nombre);
        }

        // Obtener productos relacionados usando el servicio
        const productosRelacionados = await getRelatedProducts(
          accesorioId,
          producto.categoria || "generales",
          8,
        );

        // Asignar datos
        setAccesorio(producto);
        setOtrosAccesorios(productosRelacionados);
      } catch (error) {
        console.error("Error al cargar los datos:", error);
        // Aquí podrías mostrar un mensaje de error al usuario
      } finally {
        setLoading(false);
      }
    };

    cargarDatos();
  }, [params.id]);

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!accesorio) {
    return (
      <div className="max-w-6xl mx-auto p-4 bg-white rounded-lg shadow-lg">
        <h1 className="text-xl font-bold text-center">
          No se encontró el accesorio
        </h1>
        <p className="text-center mt-4">
          <Link href="/accesorios" className="text-primary hover:underline">
            Ver todos los accesorios
          </Link>
        </p>
      </div>
    );
  }

  return (
    <AccesoriosContainer
      accesorio={accesorio}
      otrosAccesorios={otrosAccesorios}
      telefono={telefono}
    />
  );
}
