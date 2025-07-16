// hooks/useAnuncioDetail.js - Hook para manejar detalles de un anuncio
import { useState, useEffect } from "react";
import anunciosApi from "../services/anunciosApi";

export const useAnuncioDetail = (id) => {
  const [anuncio, setAnuncio] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!id) return;

    const loadAnuncio = async () => {
      setLoading(true);
      setError(null);

      try {
        const response = await anunciosApi.getAnuncioById(id);
        setAnuncio(response.anuncio);
      } catch (err) {
        setError(err.message);
        console.error("Error loading anuncio detail:", err);
      } finally {
        setLoading(false);
      }
    };

    loadAnuncio();
  }, [id]);

  const registerClick = async () => {
    if (!anuncio?.id) return;

    try {
      await anunciosApi.registerClick(anuncio.id);

      // Actualizar contador localmente
      setAnuncio((prev) => ({
        ...prev,
        clicks_count: (prev.clicks_count || 0) + 1,
      }));
    } catch (err) {
      console.error("Error registering click:", err);
    }
  };

  return {
    anuncio,
    loading,
    error,
    registerClick,
  };
};
