// hooks/useAnuncios.js
import { useState, useEffect, useCallback } from "react";

// Simulación de datos iniciales (mientras no tenemos BD)
const SAMPLE_ANUNCIOS = [
  {
    id: "1",
    businessName: "Café Central",
    description:
      "El mejor café de la ciudad. Disfruta de nuestros granos artesanales y ambiente acogedor.",
    imageUrl:
      "https://images.unsplash.com/photo-1501339847302-ac426a4a7cbb?w=400",
    linkUrl: "https://cafe-central.com",
    category: "restaurant",
    active: true,
    featured: true,
    contactInfo: {
      phone: "+57 300 123 4567",
      email: "info@cafecentral.com",
      address: "Calle 10 #15-30, Centro",
    },
    createdAt: "2024-01-15T10:00:00Z",
    updatedAt: "2024-01-15T10:00:00Z",
  },
  {
    id: "2",
    businessName: "TechnoStore",
    description:
      "Tecnología de última generación. Computadores, celulares y accesorios al mejor precio.",
    imageUrl: "https://images.unsplash.com/photo-1560472354-b33ff0c44a43?w=400",
    linkUrl: "https://technostore.com",
    category: "technology",
    active: true,
    featured: false,
    contactInfo: {
      phone: "+57 310 987 6543",
      email: "ventas@technostore.com",
      address: "Centro Comercial Plaza, Local 201",
    },
    createdAt: "2024-01-10T14:30:00Z",
    updatedAt: "2024-01-10T14:30:00Z",
  },
  {
    id: "3",
    businessName: "Clínica Salud Integral",
    description:
      "Servicios médicos especializados. Consulta general, odontología y medicina estética.",
    imageUrl: "https://images.unsplash.com/photo-1559757148-5c350d0d3c56?w=400",
    linkUrl: "",
    category: "health",
    active: true,
    featured: true,
    contactInfo: {
      phone: "+57 320 555 1234",
      email: "citas@saludintegral.com",
      address: "Avenida Salud #25-40",
    },
    createdAt: "2024-01-08T09:15:00Z",
    updatedAt: "2024-01-08T09:15:00Z",
  },
];

const useAnuncios = (initialData = null) => {
  const [anuncios, setAnuncios] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Inicializar datos
  useEffect(() => {
    setLoading(true);
    try {
      // Si se proporcionan datos iniciales, usarlos; si no, usar datos de muestra
      const initialAnuncios = initialData || SAMPLE_ANUNCIOS;

      // Simular carga desde localStorage o API
      const savedAnuncios =
        typeof window !== "undefined" ? localStorage.getItem("anuncios") : null;

      if (savedAnuncios) {
        setAnuncios(JSON.parse(savedAnuncios));
      } else {
        setAnuncios(initialAnuncios);
        // Guardar datos de muestra en localStorage
        if (typeof window !== "undefined") {
          localStorage.setItem("anuncios", JSON.stringify(initialAnuncios));
        }
      }
    } catch (err) {
      setError("Error al cargar los anuncios");
      console.error("Error loading anuncios:", err);
    } finally {
      setLoading(false);
    }
  }, [initialData]);

  // Función para guardar en localStorage (temporal hasta tener BD)
  const saveToStorage = useCallback((newAnuncios) => {
    if (typeof window !== "undefined") {
      localStorage.setItem("anuncios", JSON.stringify(newAnuncios));
    }
  }, []);

  // Crear nuevo anuncio
  const createAnuncio = useCallback(
    async (anuncioData) => {
      setLoading(true);
      setError(null);

      try {
        const newAnuncio = {
          ...anuncioData,
          id: Date.now().toString(), // Temporal hasta tener BD
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };

        const updatedAnuncios = [newAnuncio, ...anuncios];
        setAnuncios(updatedAnuncios);
        saveToStorage(updatedAnuncios);

        return { success: true, data: newAnuncio };
      } catch (err) {
        const errorMessage = "Error al crear el anuncio";
        setError(errorMessage);
        console.error("Error creating anuncio:", err);
        return { success: false, error: errorMessage };
      } finally {
        setLoading(false);
      }
    },
    [anuncios, saveToStorage],
  );

  // Actualizar anuncio existente
  const updateAnuncio = useCallback(
    async (id, anuncioData) => {
      setLoading(true);
      setError(null);

      try {
        const updatedAnuncios = anuncios.map((anuncio) =>
          anuncio.id === id
            ? { ...anuncioData, id, updatedAt: new Date().toISOString() }
            : anuncio,
        );

        setAnuncios(updatedAnuncios);
        saveToStorage(updatedAnuncios);

        return {
          success: true,
          data: updatedAnuncios.find((a) => a.id === id),
        };
      } catch (err) {
        const errorMessage = "Error al actualizar el anuncio";
        setError(errorMessage);
        console.error("Error updating anuncio:", err);
        return { success: false, error: errorMessage };
      } finally {
        setLoading(false);
      }
    },
    [anuncios, saveToStorage],
  );

  // Eliminar anuncio
  const deleteAnuncio = useCallback(
    async (id) => {
      setLoading(true);
      setError(null);

      try {
        const updatedAnuncios = anuncios.filter((anuncio) => anuncio.id !== id);
        setAnuncios(updatedAnuncios);
        saveToStorage(updatedAnuncios);

        return { success: true };
      } catch (err) {
        const errorMessage = "Error al eliminar el anuncio";
        setError(errorMessage);
        console.error("Error deleting anuncio:", err);
        return { success: false, error: errorMessage };
      } finally {
        setLoading(false);
      }
    },
    [anuncios, saveToStorage],
  );

  // Obtener anuncio por ID
  const getAnuncioById = useCallback(
    (id) => {
      return anuncios.find((anuncio) => anuncio.id === id);
    },
    [anuncios],
  );

  // Cambiar estado activo de un anuncio
  const toggleAnuncioStatus = useCallback(
    async (id) => {
      const anuncio = getAnuncioById(id);
      if (!anuncio) return { success: false, error: "Anuncio no encontrado" };

      return await updateAnuncio(id, { ...anuncio, active: !anuncio.active });
    },
    [getAnuncioById, updateAnuncio],
  );

  // Cambiar estado destacado de un anuncio
  const toggleAnuncioFeatured = useCallback(
    async (id) => {
      const anuncio = getAnuncioById(id);
      if (!anuncio) return { success: false, error: "Anuncio no encontrado" };

      return await updateAnuncio(id, {
        ...anuncio,
        featured: !anuncio.featured,
      });
    },
    [getAnuncioById, updateAnuncio],
  );

  // Obtener anuncios por categoría
  const getAnunciosByCategory = useCallback(
    (category) => {
      return anuncios.filter(
        (anuncio) => anuncio.category === category && anuncio.active,
      );
    },
    [anuncios],
  );

  // Obtener anuncios destacados
  const getFeaturedAnuncios = useCallback(() => {
    return anuncios.filter((anuncio) => anuncio.featured && anuncio.active);
  }, [anuncios]);

  // Obtener anuncios activos
  const getActiveAnuncios = useCallback(() => {
    return anuncios.filter((anuncio) => anuncio.active);
  }, [anuncios]);

  // Buscar anuncios
  const searchAnuncios = useCallback(
    (searchTerm) => {
      const term = searchTerm.toLowerCase().trim();
      if (!term) return getActiveAnuncios();

      return anuncios.filter(
        (anuncio) =>
          anuncio.active &&
          (anuncio.businessName.toLowerCase().includes(term) ||
            anuncio.description.toLowerCase().includes(term) ||
            anuncio.category.toLowerCase().includes(term)),
      );
    },
    [anuncios, getActiveAnuncios],
  );

  // Estadísticas
  const getStats = useCallback(() => {
    const totalAnuncios = anuncios.length;
    const activeAnuncios = anuncios.filter((a) => a.active).length;
    const featuredAnuncios = anuncios.filter(
      (a) => a.featured && a.active,
    ).length;
    const categoriesCount = {};

    anuncios.forEach((anuncio) => {
      if (anuncio.active) {
        categoriesCount[anuncio.category] =
          (categoriesCount[anuncio.category] || 0) + 1;
      }
    });

    return {
      total: totalAnuncios,
      active: activeAnuncios,
      featured: featuredAnuncios,
      inactive: totalAnuncios - activeAnuncios,
      categoriesCount,
    };
  }, [anuncios]);

  return {
    // Estados
    anuncios,
    loading,
    error,

    // Métodos CRUD
    createAnuncio,
    updateAnuncio,
    deleteAnuncio,
    getAnuncioById,

    // Métodos de utilidad
    toggleAnuncioStatus,
    toggleAnuncioFeatured,
    getAnunciosByCategory,
    getFeaturedAnuncios,
    getActiveAnuncios,
    searchAnuncios,
    getStats,

    // Métodos de control
    setAnuncios,
    setError,
  };
};

export default useAnuncios;
