import { useState, useEffect } from 'react';
import { usePathname } from 'next/navigation';

/**
 * Hook personalizado para gestionar anuncios
 * Verifica si hay anuncios nuevos que el usuario no ha visto
 */
export function useAnnouncements() {
  const [announcements, setAnnouncements] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [loading, setLoading] = useState(true);
  const pathname = usePathname();

  // Cargar anuncios al montar y cuando cambia la ruta
  useEffect(() => {
    fetchAnnouncements();
  }, []);

  // Recargar anuncios cuando se navega a la página de inicio
  useEffect(() => {
    if (pathname === '/') {
      fetchAnnouncements();
    }
  }, [pathname]);

  const fetchAnnouncements = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/announcements?active=true');

      if (!response.ok) {
        throw new Error('Error al obtener anuncios');
      }

      const data = await response.json();

      if (data.success && data.announcements.length > 0) {
        // IMPORTANTE: Solo mostrar anuncios si estamos en la página de inicio
        if (pathname !== '/') {
          return;
        }

        // Verificar si ya se mostraron anuncios en esta sesión de navegación
        const shownInSession = sessionStorage.getItem('announcements_shown_in_session');

        // Si es la primera vez en esta sesión o se recarga la página
        if (!shownInSession) {
          setAnnouncements(data.announcements);
          // Mostrar modal después de 1 segundo
          setTimeout(() => {
            setShowModal(true);
            // Marcar que ya se mostraron en esta sesión
            sessionStorage.setItem('announcements_shown_in_session', 'true');
          }, 1000);
        }
      }
    } catch (error) {
      console.error('Error fetching announcements:', error);
    } finally {
      setLoading(false);
    }
  };

  const getViewedAnnouncements = () => {
    if (typeof window === 'undefined') return [];

    const viewed = localStorage.getItem('viewed_announcements');
    return viewed ? JSON.parse(viewed) : [];
  };

  const markAsViewed = (announcementIds) => {
    if (typeof window === 'undefined') return;

    const currentViewed = getViewedAnnouncements();
    const updatedViewed = [...new Set([...currentViewed, ...announcementIds])];

    // Mantener solo los últimos 100 anuncios vistos para no saturar localStorage
    const trimmed = updatedViewed.slice(-100);
    localStorage.setItem('viewed_announcements', JSON.stringify(trimmed));
  };

  const closeModal = () => {
    setShowModal(false);
  };

  // Limpiar sessionStorage cuando se sale del home
  useEffect(() => {
    if (pathname !== '/') {
      sessionStorage.removeItem('announcements_shown_in_session');
    }
  }, [pathname]);

  return {
    announcements,
    showModal,
    closeModal,
    loading,
    refetch: fetchAnnouncements
  };
}
