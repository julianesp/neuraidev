"use client";

import React, { useState, useEffect } from "react";
import AnunciosPage from "../../components/AnunciosPage.jsx";

export default function AnunciosPublicPage() {
  const [anuncios, setAnuncios] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadAnuncios();
  }, []);

  const loadAnuncios = async () => {
    try {
      setLoading(true);
      const response = await fetch("/api/anuncios?active=true");
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

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-8">
        <div className="container mx-auto px-4">
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Cargando anuncios...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-8">
      <div className="container mx-auto px-4">
        <AnunciosPage 
          anuncios={anuncios} 
          showAdminActions={false}
        />
      </div>
    </div>
  );
} 