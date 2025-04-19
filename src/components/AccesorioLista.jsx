"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import AccesoriosContainer from "./AccesoriosContainer";
// Importamos los datos directamente - asumiendo que el JSON está en /public
// En producción, normalmente obtendrías estos datos de una API

// Este componente se usa para mostrar una página individual de un accesorio
export default function AccesorioPage() {
  const params = useParams();
  const [accesorio, setAccesorio] = useState(null);
  const [otrosAccesorios, setOtrosAccesorios] = useState([]);
  const [telefono, setTelefono] = useState("1234567890");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Función para cargar los datos
    const cargarDatos = async () => {
      try {
        // En un caso real, esto sería una llamada a una API
        const response = await fetch("/accesorios.json");
        const data = await response.json();

        // Obtener el ID del accesorio de la URL
        const accesorioId = params.id;

        if (!accesorioId || !data.accesorios) {
          throw new Error("Accesorio no encontrado");
        }

        // Encontrar el accesorio específico
        const accesorioEncontrado = data.accesorios.find(
          (acc) => acc.id === accesorioId,
        );

        if (!accesorioEncontrado) {
          throw new Error("Accesorio no encontrado");
        }

        // Obtener otros accesorios (excluyendo el actual)
        const accesoriosRelacionados = data.accesorios
          .filter((acc) => acc.id !== accesorioId)
          // Opcional: Puedes filtrar para mostrar primero los de la misma categoría
          .sort((a, b) =>
            a.categoria === accesorioEncontrado.categoria ? -1 : 1,
          )
          .slice(0, 8); // Limitamos a 8 accesorios relacionados

        // Asignar datos
        setAccesorio(accesorioEncontrado);
        setOtrosAccesorios(accesoriosRelacionados);

        // Obtener el teléfono de la configuración
        if (data.configuracion && data.configuracion.telefono) {
          setTelefono(data.configuracion.telefono);
        }
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
          <a href="/accesorios" className="text-primary hover:underline">
            Ver todos los accesorios
          </a>
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
