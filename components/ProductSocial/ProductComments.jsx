'use client';

import { useState, useEffect } from 'react';
import { useUser } from '@clerk/nextjs';
import { MessageCircle, Send, Edit2, Trash2, Star } from 'lucide-react';
import { useToast } from '@/contexts/ToastContext';

export default function ProductComments({ productoId }) {
  const { user, isLoaded } = useUser();
  const [comments, setComments] = useState([]);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [newComment, setNewComment] = useState('');
  const [rating, setRating] = useState(0);
  const [editingCommentId, setEditingCommentId] = useState(null);
  const [editText, setEditText] = useState('');
  const toast = useToast();

  useEffect(() => {
    fetchComments();
  }, [productoId]);

  const fetchComments = async () => {
    setLoading(true);
    try {
      const response = await fetch(`/api/products/comments?productoId=${productoId}&limit=50`);
      const data = await response.json();

      if (response.ok) {
        setComments(data.comments || []);
      }
    } catch (error) {
      console.error('Error cargando comentarios:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmitComment = async (e) => {
    e.preventDefault();

    if (!isLoaded || !user) {
      toast?.warning('Debes iniciar sesión para comentar');
      window.location.href = '/sign-in?redirect_url=' + encodeURIComponent(window.location.pathname);
      return;
    }

    if (newComment.trim().length < 3) {
      toast?.warning('El comentario debe tener al menos 3 caracteres');
      return;
    }

    setSubmitting(true);

    try {
      const response = await fetch('/api/products/comments', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          productoId,
          commentText: newComment.trim(),
          rating: rating > 0 ? rating : null,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        toast?.success('¡Comentario publicado!');
        setNewComment('');
        setRating(0);
        fetchComments(); // Recargar comentarios
      } else {
        toast?.error(data.error || 'Error al publicar comentario');
      }
    } catch (error) {
      console.error('Error al publicar comentario:', error);
      toast?.error('Error al procesar tu comentario');
    } finally {
      setSubmitting(false);
    }
  };

  const handleEditComment = async (commentId) => {
    if (editText.trim().length < 3) {
      toast?.warning('El comentario debe tener al menos 3 caracteres');
      return;
    }

    try {
      const response = await fetch('/api/products/comments', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          commentId,
          commentText: editText.trim(),
        }),
      });

      const data = await response.json();

      if (response.ok) {
        toast?.success('Comentario actualizado');
        setEditingCommentId(null);
        setEditText('');
        fetchComments();
      } else {
        toast?.error(data.error || 'Error al actualizar comentario');
      }
    } catch (error) {
      console.error('Error al actualizar comentario:', error);
      toast?.error('Error al procesar tu solicitud');
    }
  };

  const handleDeleteComment = async (commentId) => {
    if (!confirm('¿Estás seguro de que quieres eliminar este comentario?')) {
      return;
    }

    try {
      const response = await fetch(`/api/products/comments?commentId=${commentId}`, {
        method: 'DELETE',
      });

      const data = await response.json();

      if (response.ok) {
        toast?.success('Comentario eliminado');
        fetchComments();
      } else {
        toast?.error(data.error || 'Error al eliminar comentario');
      }
    } catch (error) {
      console.error('Error al eliminar comentario:', error);
      toast?.error('Error al procesar tu solicitud');
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInSeconds = Math.floor((now - date) / 1000);

    if (diffInSeconds < 60) return 'Hace un momento';
    if (diffInSeconds < 3600) return `Hace ${Math.floor(diffInSeconds / 60)} minutos`;
    if (diffInSeconds < 86400) return `Hace ${Math.floor(diffInSeconds / 3600)} horas`;
    if (diffInSeconds < 604800) return `Hace ${Math.floor(diffInSeconds / 86400)} días`;

    return date.toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const RatingStars = ({ rating, interactive = false, onRate }) => {
    return (
      <div className="flex gap-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            size={20}
            className={`
              ${star <= rating ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300 dark:text-gray-600'}
              ${interactive ? 'cursor-pointer hover:scale-110 transition-transform' : ''}
            `}
            onClick={() => interactive && onRate && onRate(star)}
          />
        ))}
      </div>
    );
  };

  return (
    <div className="space-y-6">
      {/* Título */}
      <div className="flex items-center gap-2">
        <MessageCircle size={24} className="text-blue-600 dark:text-blue-400" />
        <h3 className="text-2xl font-bold text-gray-900 dark:text-white">
          Comentarios ({comments.length})
        </h3>
      </div>

      {/* Formulario para nuevo comentario */}
      {isLoaded && user ? (
        <form onSubmit={handleSubmitComment} className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4 space-y-4">
          <div className="flex items-start gap-3">
            <img
              src={user.imageUrl}
              alt={user.fullName || 'Usuario'}
              className="w-10 h-10 rounded-full"
              loading="eager"
            />
            <div className="flex-1 space-y-3">
              <textarea
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                placeholder="Escribe tu comentario..."
                className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg
                         bg-white dark:bg-gray-700 text-gray-900 dark:text-white
                         focus:ring-2 focus:ring-blue-500 focus:border-transparent
                         resize-none"
                rows={3}
                disabled={submitting}
              />

              {/* Calificación opcional */}
              <div className="flex items-center gap-3">
                <span className="text-sm text-gray-600 dark:text-gray-400">
                  Calificación (opcional):
                </span>
                <RatingStars rating={rating} interactive onRate={setRating} />
                {rating > 0 && (
                  <button
                    type="button"
                    onClick={() => setRating(0)}
                    className="text-sm text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
                  >
                    Limpiar
                  </button>
                )}
              </div>

              <div className="flex justify-end">
                <button
                  type="submit"
                  disabled={submitting || newComment.trim().length < 3}
                  className="flex items-center gap-2 px-6 py-2 bg-blue-600 hover:bg-blue-700
                           disabled:bg-gray-400 disabled:cursor-not-allowed
                           text-white rounded-lg transition-colors"
                >
                  <Send size={16} />
                  {submitting ? 'Publicando...' : 'Publicar comentario'}
                </button>
              </div>
            </div>
          </div>
        </form>
      ) : (
        <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-6 text-center">
          <p className="text-gray-600 dark:text-gray-400 mb-4">
            Inicia sesión para dejar un comentario
          </p>
          <a
            href={'/sign-in?redirect_url=' + encodeURIComponent(typeof window !== 'undefined' ? window.location.pathname : '')}
            className="inline-block px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
          >
            Iniciar sesión
          </a>
        </div>
      )}

      {/* Lista de comentarios */}
      <div className="space-y-4">
        {loading ? (
          <div className="text-center py-8 text-gray-500 dark:text-gray-400">
            Cargando comentarios...
          </div>
        ) : comments.length === 0 ? (
          <div className="text-center py-8 text-gray-500 dark:text-gray-400">
            Sé el primero en comentar este producto
          </div>
        ) : (
          comments.map((comment) => (
            <div
              key={comment.id}
              className="bg-white dark:bg-gray-800 rounded-lg p-4 shadow-sm border border-gray-200 dark:border-gray-700"
            >
              <div className="flex items-start gap-3">
                <img
                  src={comment.user_image || '/default-avatar.png'}
                  alt={comment.user_name}
                  className="w-10 h-10 rounded-full"
                  loading="lazy"
                />
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-2">
                    <div>
                      <h4 className="font-semibold text-gray-900 dark:text-white">
                        {comment.user_name}
                      </h4>
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        {formatDate(comment.created_at)}
                        {comment.is_edited && ' (editado)'}
                      </p>
                    </div>

                    {/* Botones de editar/eliminar (solo para el autor) */}
                    {user && user.id === comment.user_id && (
                      <div className="flex gap-2">
                        <button
                          onClick={() => {
                            setEditingCommentId(comment.id);
                            setEditText(comment.comment_text);
                          }}
                          className="text-gray-500 hover:text-blue-600 dark:hover:text-blue-400"
                          title="Editar"
                        >
                          <Edit2 size={16} />
                        </button>
                        <button
                          onClick={() => handleDeleteComment(comment.id)}
                          className="text-gray-500 hover:text-red-600 dark:hover:text-red-400"
                          title="Eliminar"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    )}
                  </div>

                  {/* Calificación */}
                  {comment.rating && (
                    <div className="mb-2">
                      <RatingStars rating={comment.rating} />
                    </div>
                  )}

                  {/* Texto del comentario o formulario de edición */}
                  {editingCommentId === comment.id ? (
                    <div className="space-y-2">
                      <textarea
                        value={editText}
                        onChange={(e) => setEditText(e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg
                                 bg-white dark:bg-gray-700 text-gray-900 dark:text-white
                                 focus:ring-2 focus:ring-blue-500 focus:border-transparent
                                 resize-none"
                        rows={3}
                      />
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleEditComment(comment.id)}
                          className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm"
                        >
                          Guardar
                        </button>
                        <button
                          onClick={() => {
                            setEditingCommentId(null);
                            setEditText('');
                          }}
                          className="px-4 py-2 bg-gray-300 hover:bg-gray-400 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300 rounded-lg text-sm"
                        >
                          Cancelar
                        </button>
                      </div>
                    </div>
                  ) : (
                    <p className="text-gray-700 dark:text-gray-300 whitespace-pre-wrap">
                      {comment.comment_text}
                    </p>
                  )}

                  {/* Contador de likes del comentario (pendiente de implementar) */}
                  {comment.likes_count > 0 && (
                    <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">
                      {comment.likes_count} {comment.likes_count === 1 ? 'Me gusta' : 'Me gusta'}
                    </p>
                  )}
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
