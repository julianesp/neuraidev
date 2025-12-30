"use client";

import { useState, useEffect } from "react";
import { X, ChevronLeft, ChevronRight, AlertCircle, Info, AlertTriangle, Wrench, Calendar, ExternalLink } from "lucide-react";

/**
 * Modal de anuncios comunitarios
 * Se muestra debajo del navbar con backdrop-blur
 * Permite navegar entre múltiples anuncios
 */
export default function AnnouncementsModal({ announcements, onClose }) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [sessionId] = useState(() => {
    // Generar o recuperar session ID para usuarios no registrados
    if (typeof window !== 'undefined') {
      let sid = localStorage.getItem('announcement_session_id');
      if (!sid) {
        sid = `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
        localStorage.setItem('announcement_session_id', sid);
      }
      return sid;
    }
    return null;
  });

  const currentAnnouncement = announcements[currentIndex];

  // Registrar vista del anuncio actual
  useEffect(() => {
    if (currentAnnouncement && sessionId) {
      fetch('/api/announcements/view', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          announcementId: currentAnnouncement.id,
          sessionId
        })
      }).catch(err => console.error('Error registrando vista:', err));
    }
  }, [currentAnnouncement, sessionId]);

  const nextAnnouncement = () => {
    if (currentIndex < announcements.length - 1) {
      setCurrentIndex(currentIndex + 1);
    }
  };

  const prevAnnouncement = () => {
    if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 1);
    }
  };

  // Obtener color e icono según el tipo
  const getAnnouncementStyle = (type) => {
    switch (type) {
      case 'alert':
        return {
          bg: 'from-red-500 to-red-600',
          lightBg: 'bg-red-50 dark:bg-red-900/20',
          border: 'border-red-200 dark:border-red-800',
          icon: AlertCircle,
          iconColor: 'text-red-600 dark:text-red-400'
        };
      case 'warning':
        return {
          bg: 'from-yellow-500 to-orange-500',
          lightBg: 'bg-yellow-50 dark:bg-yellow-900/20',
          border: 'border-yellow-200 dark:border-yellow-800',
          icon: AlertTriangle,
          iconColor: 'text-yellow-600 dark:text-yellow-400'
        };
      case 'maintenance':
        return {
          bg: 'from-purple-500 to-purple-600',
          lightBg: 'bg-purple-50 dark:bg-purple-900/20',
          border: 'border-purple-200 dark:border-purple-800',
          icon: Wrench,
          iconColor: 'text-purple-600 dark:text-purple-400'
        };
      case 'event':
        return {
          bg: 'from-blue-500 to-blue-600',
          lightBg: 'bg-blue-50 dark:bg-blue-900/20',
          border: 'border-blue-200 dark:border-blue-800',
          icon: Calendar,
          iconColor: 'text-blue-600 dark:text-blue-400'
        };
      default: // info
        return {
          bg: 'from-green-500 to-green-600',
          lightBg: 'bg-green-50 dark:bg-green-900/20',
          border: 'border-green-200 dark:border-green-800',
          icon: Info,
          iconColor: 'text-green-600 dark:text-green-400'
        };
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return null;
    const date = new Date(dateString);
    return date.toLocaleDateString('es-CO', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const style = getAnnouncementStyle(currentAnnouncement.type);
  const IconComponent = style.icon;

  return (
    <div className="fixed inset-0 flex items-center justify-center px-4 pointer-events-none" style={{ zIndex: 99999, top: '80px' }}>
      {/* Backdrop con blur - empieza debajo del navbar */}
      <div
        className="fixed bg-black/40 backdrop-blur-md pointer-events-auto"
        style={{
          zIndex: 99998,
          top: '60px',
          left: 0,
          right: 0,
          bottom: 0
        }}
        onClick={onClose}
      />

      {/* Modal container */}
      <div className="relative w-full max-w-2xl pointer-events-auto animate-slideDown" style={{ zIndex: 99999 }}>
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl overflow-hidden border-2 border-gray-200 dark:border-gray-700">
          {/* Header con gradiente */}
          <div className={`bg-gradient-to-r ${style.bg} px-6 py-4 text-white`}>
            <div className="flex items-start justify-between gap-4">
              <div className="flex items-start gap-3 flex-1">
                {/* Icono o emoji */}
                <div className="flex-shrink-0 mt-1">
                  {currentAnnouncement.icon && currentAnnouncement.icon.length <= 2 ? (
                    <span className="text-3xl">{currentAnnouncement.icon}</span>
                  ) : (
                    <IconComponent className="w-8 h-8" />
                  )}
                </div>

                {/* Título */}
                <div className="flex-1">
                  <h2 className="text-xl font-bold leading-tight">
                    {currentAnnouncement.title}
                  </h2>
                  <div className="flex items-center gap-3 mt-2 text-sm opacity-90">
                    <span>Por: {currentAnnouncement.author_name}</span>
                    {currentAnnouncement.end_date && (
                      <>
                        <span>•</span>
                        <span>Vigente hasta: {formatDate(currentAnnouncement.end_date)}</span>
                      </>
                    )}
                  </div>
                </div>
              </div>

              {/* Botón cerrar */}
              <button
                onClick={onClose}
                className="flex-shrink-0 p-1 hover:bg-white/20 rounded-lg transition-colors"
                aria-label="Cerrar"
              >
                <X className="w-6 h-6" />
              </button>
            </div>
          </div>

          {/* Contenido */}
          <div className="p-6">
            {/* Imagen opcional */}
            {currentAnnouncement.image_url && (
              <div className="mb-4 rounded-lg overflow-hidden">
                <img
                  src={currentAnnouncement.image_url}
                  alt={currentAnnouncement.title}
                  className="w-full h-48 object-cover"
                />
              </div>
            )}

            {/* Texto del anuncio */}
            <div className={`${style.lightBg} ${style.border} border-2 rounded-lg p-4`}>
              <p className="text-gray-800 dark:text-gray-200 whitespace-pre-wrap leading-relaxed">
                {currentAnnouncement.content}
              </p>
            </div>

            {/* Botón de redirección opcional */}
            {currentAnnouncement.redirect_url && (
              <div className="mt-4">
                <a
                  href={currentAnnouncement.redirect_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={`inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r ${style.bg} text-white font-medium rounded-lg hover:opacity-90 transition-opacity`}
                >
                  <ExternalLink className="w-4 h-4" />
                  Más información
                </a>
              </div>
            )}

            {/* Metadata adicional */}
            <div className="mt-4 flex items-center justify-between text-sm text-gray-600 dark:text-gray-400">
              <div className="flex items-center gap-4">
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${style.lightBg} ${style.iconColor}`}>
                  {currentAnnouncement.type === 'alert' && 'Alerta'}
                  {currentAnnouncement.type === 'warning' && 'Advertencia'}
                  {currentAnnouncement.type === 'info' && 'Información'}
                  {currentAnnouncement.type === 'maintenance' && 'Mantenimiento'}
                  {currentAnnouncement.type === 'event' && 'Evento'}
                </span>
                <span>👁️ {currentAnnouncement.view_count} vistas</span>
              </div>
              <span>
                Publicado: {formatDate(currentAnnouncement.created_at)}
              </span>
            </div>
          </div>

          {/* Footer con navegación */}
          {announcements.length > 1 && (
            <div className="bg-gray-50 dark:bg-gray-700/50 px-6 py-4 border-t border-gray-200 dark:border-gray-700">
              <div className="flex items-center justify-between">
                <button
                  onClick={prevAnnouncement}
                  disabled={currentIndex === 0}
                  className="flex items-center gap-2 px-4 py-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  <ChevronLeft className="w-5 h-5" />
                  Anterior
                </button>

                <div className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  {currentIndex + 1} de {announcements.length}
                </div>

                <button
                  onClick={nextAnnouncement}
                  disabled={currentIndex === announcements.length - 1}
                  className="flex items-center gap-2 px-4 py-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  Siguiente
                  <ChevronRight className="w-5 h-5" />
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      <style jsx>{`
        @keyframes slideDown {
          from {
            opacity: 0;
            transform: translateY(-20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .animate-slideDown {
          animation: slideDown 0.3s ease-out;
        }
      `}</style>
    </div>
  );
}
