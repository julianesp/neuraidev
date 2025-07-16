"use client";

import React, { useState, useEffect, Suspense } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { ArrowLeft, Plus, Edit, Trash2, Eye, CheckCircle, XCircle } from "lucide-react";
import AnunciosPage from "../../../components/AnunciosPage.jsx";

function AdminAnunciosContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [anuncios, setAnuncios] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showSuccessMessage, setShowSuccessMessage] = useState(false);

  useEffect(() => {
    // Mostrar mensaje de éxito si viene de crear anuncio
    if (searchParams.get("success") === "true") {
      setShowSuccessMessage(true);
      setTimeout(() => setShowSuccessMessage(false), 5000);
    }
    
    loadAnuncios();
  }, [searchParams]);

  const loadAnuncios = async () => {
    try {
      setLoading(true);
      const response = await fetch("/api/anuncios");
      if (response.ok) {
        const data = await response.json();
        setAnuncios(data.anuncios || []);
      }
    } catch (error) {
      console.error("Error cargando anuncios:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (anuncio) => {
    router.push(`/admin/anuncios/editar/${anuncio.id}`);
  };

  const handleDelete = async (anuncioId) => {
    if (!confirm("¿Estás seguro de que quieres eliminar este anuncio?")) {
      return;
    }

    try {
      const response = await fetch(`/api/anuncios/${anuncioId}`, {
        method: "DELETE",
      });

      if (response.ok) {
        // Recargar la lista
        loadAnuncios();
        alert("Anuncio eliminado exitosamente");
      } else {
        alert("Error al eliminar el anuncio");
      }
    } catch (error) {
      console.error("Error:", error);
      alert("Error al eliminar el anuncio");
    }
  };

  const toggleStatus = async (anuncioId, currentStatus) => {
    try {
      const response = await fetch(`/api/anuncios/${anuncioId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          active: !currentStatus,
        }),
      });

      if (response.ok) {
        loadAnuncios();
      } else {
        alert("Error al actualizar el estado del anuncio");
      }
    } catch (error) {
      console.error("Error:", error);
      alert("Error al actualizar el estado del anuncio");
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
          
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-800">
                Gestión de Anuncios
              </h1>
              <p className="text-gray-600">
                Administra todos los anuncios del directorio
              </p>
            </div>
            
            <Link
              href="/admin/anuncios/crear"
              className="inline-flex items-center bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors"
            >
              <Plus className="w-5 h-5 mr-2" />
              Crear Anuncio
            </Link>
          </div>
        </div>

        {/* Mensaje de éxito */}
        {showSuccessMessage && (
          <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mb-6 flex items-center">
            <CheckCircle className="w-5 h-5 mr-2" />
            Anuncio creado exitosamente
            <button
              onClick={() => setShowSuccessMessage(false)}
              className="ml-auto"
            >
              <XCircle className="w-5 h-5" />
            </button>
          </div>
        )}

        {/* Lista de anuncios */}
        {loading ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Cargando anuncios...</p>
          </div>
        ) : (
          <AnunciosPage 
            anuncios={anuncios} 
            onEdit={handleEdit}
            showAdminActions={true}
          />
        )}
      </div>
    </div>
  );
}

export default function AdminAnunciosPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-8">
        <div className="container mx-auto px-4">
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Cargando...</p>
          </div>
        </div>
      </div>
    }>
      <AdminAnunciosContent />
    </Suspense>
  );
} 