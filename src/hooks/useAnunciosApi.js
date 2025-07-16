// hooks/useAnunciosApi.js - Hook mejorado que usa la API real
import { useState, useEffect, useCallback } from "react";
import anunciosApi from "../services/anunciosApi";

export const useAnunciosApi = (initialFilters = {}) => {
  const [anuncios, setAnuncios] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [pagination, setPagination] = useState({
    total: 0,
    limit: 12,
    offset: 0,
    hasMore: false,
  });

  // Cargar anuncios desde la API
  const loadAnuncios = useCallback(async (filters = {}, append = false) => {
    setLoading(true);
    setError(null);

    try {
      const response = await anunciosApi.getAnuncios(filters);

      if (append) {
        setAnuncios((prev) => [...prev, ...response.anuncios]);
      } else {
        setAnuncios(response.anuncios);
      }

      setPagination(response.pagination);
    } catch (err) {
      setError(err.message);
      console.error("Error loading anuncios:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  // Cargar anuncios al montar el componente
  useEffect(() => {
    loadAnuncios(initialFilters);
  }, [loadAnuncios, initialFilters]);

  // Crear nuevo anuncio
  const createAnuncio = useCallback(async (anuncioData) => {
    setLoading(true);
    setError(null);

    try {
      const response = await anunciosApi.createAnuncio(anuncioData);

      // Actualizar la lista agregando el nuevo anuncio al principio
      setAnuncios((prev) => [response.anuncio, ...prev]);

      return { success: true, data: response.anuncio };
    } catch (err) {
      setError(err.message);
      return { success: false, error: err.message };
    } finally {
      setLoading(false);
    }
  }, []);

  // Actualizar anuncio existente
  const updateAnuncio = useCallback(async (id, anuncioData) => {
    setLoading(true);
    setError(null);

    try {
      const response = await anunciosApi.updateAnuncio(id, anuncioData);

      // Actualizar el anuncio en la lista
      setAnuncios((prev) =>
        prev.map((anuncio) => (anuncio.id === id ? response.anuncio : anuncio)),
      );

      return { success: true, data: response.anuncio };
    } catch (err) {
      setError(err.message);
      return { success: false, error: err.message };
    } finally {
      setLoading(false);
    }
  }, []);

  // Eliminar anuncio
  const deleteAnuncio = useCallback(async (id) => {
    setLoading(true);
    setError(null);

    try {
      await anunciosApi.deleteAnuncio(id);

      // Remover el anuncio de la lista
      setAnuncios((prev) => prev.filter((anuncio) => anuncio.id !== id));

      return { success: true };
    } catch (err) {
      setError(err.message);
      return { success: false, error: err.message };
    } finally {
      setLoading(false);
    }
  }, []);

  // Registrar click en anuncio
  const registerClick = useCallback(async (id) => {
    try {
      await anunciosApi.registerClick(id);

      // Actualizar contador de clicks localmente
      setAnuncios((prev) =>
        prev.map((anuncio) =>
          anuncio.id === id
            ? { ...anuncio, clicks_count: (anuncio.clicks_count || 0) + 1 }
            : anuncio,
        ),
      );
    } catch (err) {
      console.error("Error registering click:", err);
    }
  }, []);

  // Cargar más anuncios (paginación)
  const loadMore = useCallback(
    async (filters = {}) => {
      if (!pagination.hasMore || loading) return;

      const newFilters = {
        ...filters,
        offset: pagination.offset + pagination.limit,
      };

      await loadAnuncios(newFilters, true);
    },
    [loadAnuncios, pagination, loading],
  );

  // Filtrar anuncios
  const filterAnuncios = useCallback(
    async (filters) => {
      await loadAnuncios(filters);
    },
    [loadAnuncios],
  );

  // Buscar anuncios
  const searchAnuncios = useCallback(
    async (searchTerm, additionalFilters = {}) => {
      const filters = { ...additionalFilters, search: searchTerm, offset: 0 };
      await loadAnuncios(filters);
    },
    [loadAnuncios],
  );

  // Refrescar lista
  const refresh = useCallback(() => {
    loadAnuncios(initialFilters);
  }, [loadAnuncios, initialFilters]);

  return {
    // Estados
    anuncios,
    loading,
    error,
    pagination,

    // Acciones CRUD
    createAnuncio,
    updateAnuncio,
    deleteAnuncio,
    registerClick,

    // Acciones de navegación y filtrado
    loadMore,
    filterAnuncios,
    searchAnuncios,
    refresh,

    // Funciones de utilidad
    setError,
    clearError: () => setError(null),
  };
};
