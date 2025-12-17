'use client';

import { useState, useEffect } from 'react';
import { useUser } from '@clerk/nextjs';
import { Heart } from 'lucide-react';
import { useToast } from '@/contexts/ToastContext';

export default function ProductLikes({ productoId }) {
  const { user, isLoaded } = useUser();
  const [totalLikes, setTotalLikes] = useState(0);
  const [userHasLiked, setUserHasLiked] = useState(false);
  const [loading, setLoading] = useState(false);
  const toast = useToast();

  // Cargar estado de likes al montar el componente
  useEffect(() => {
    fetchLikesData();
  }, [productoId, user]);

  const fetchLikesData = async () => {
    try {
      const response = await fetch(`/api/products/likes?productoId=${productoId}`);
      const data = await response.json();

      if (response.ok) {
        setTotalLikes(data.totalLikes);
        setUserHasLiked(data.userHasLiked);
      }
    } catch (error) {
      console.error('Error cargando likes:', error);
    }
  };

  const handleLikeClick = async () => {
    // Verificar si el usuario está autenticado
    if (!isLoaded || !user) {
      toast?.warning('Debes iniciar sesión para dar like');
      // Redirigir a sign-in
      window.location.href = '/sign-in?redirect_url=' + encodeURIComponent(window.location.pathname);
      return;
    }

    setLoading(true);

    try {
      const response = await fetch('/api/products/likes', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ productoId }),
      });

      const data = await response.json();

      if (response.ok) {
        setTotalLikes(data.totalLikes);
        setUserHasLiked(data.userHasLiked);

        if (data.action === 'added') {
          toast?.success('¡Te gusta este producto!');
        } else {
          toast?.info('Like eliminado');
        }
      } else {
        toast?.error(data.error || 'Error al dar like');
      }
    } catch (error) {
      console.error('Error al dar like:', error);
      toast?.error('Error al procesar tu acción');
    } finally {
      setLoading(false);
    }
  };

  return (
    <button
      onClick={handleLikeClick}
      disabled={loading}
      className={`
        flex items-center gap-2 px-4 py-2 rounded-lg
        transition-all duration-200
        ${userHasLiked
          ? 'bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400'
          : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700'
        }
        ${loading ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
        border-2 ${userHasLiked ? 'border-red-300 dark:border-red-700' : 'border-transparent'}
      `}
      title={userHasLiked ? 'Ya no me gusta' : 'Me gusta'}
    >
      <Heart
        className={`
          transition-all duration-200
          ${userHasLiked ? 'fill-current scale-110' : ''}
        `}
        size={20}
      />
      <span className="font-medium">
        {totalLikes} {totalLikes === 1 ? 'Me gusta' : 'Me gusta'}
      </span>
    </button>
  );
}
