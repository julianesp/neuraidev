"use client";

import React from "react";
import AnuncioForm from "../../../../components/AnuncioForm";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Plus } from "lucide-react";

export default function CrearAnuncioPage() {
  const router = useRouter();

  const handleSubmit = async (anuncioData) => {
    try {
      const response = await fetch("/api/anuncios", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(anuncioData),
      });

      const result = await response.json();
      if (!response.ok) {
        throw new Error(result.error || "Error al crear el anuncio");
      }
      
      // Redirigir al listado de anuncios con mensaje de éxito
      router.push("/admin/anuncios?success=true");
    } catch (error) {
      console.error("Error:", error);
      alert("Error al crear el anuncio. Inténtalo de nuevo.");
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-8">
      <div className="container mx-auto px-4">
        {/* Header con navegación */}
        <div className="mb-8">
          <Link
            href="/admin"
            className="inline-flex items-center text-blue-600 hover:text-blue-800 mb-4 transition-colors"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Volver al Panel de Administración
          </Link>
          
          <div className="flex items-center mb-6">
            <div className="flex items-center justify-center w-12 h-12 bg-blue-100 rounded-lg mr-4">
              <Plus className="w-6 h-6 text-blue-600" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-800">
                Crear Nuevo Anuncio
              </h1>
              <p className="text-gray-600">
                Añade un nuevo anuncio al directorio de negocios
              </p>
            </div>
          </div>
        </div>

        {/* Formulario */}
        <AnuncioForm onSubmit={handleSubmit} />
      </div>
    </div>
  );
} 