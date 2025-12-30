"use client";

import { useState, useEffect } from "react";
import { useUser } from "@clerk/nextjs";
import { useRouter } from "next/navigation";
import {
  Megaphone,
  Plus,
  Edit,
  Trash2,
  Eye,
  AlertCircle,
  Info,
  AlertTriangle,
  Wrench,
  Calendar,
  RefreshCw,
  Save,
  X
} from "lucide-react";
import Swal from "sweetalert2";

export default function MisAnunciosPage() {
  const { user, isLoaded } = useUser();
  const router = useRouter();
  const [anuncios, setAnuncios] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [editingAnnouncement, setEditingAnnouncement] = useState(null);

  const [formData, setFormData] = useState({
    title: '',
    content: '',
    type: 'info',
    priority: 5,
    icon: '📢',
    endDate: '',
    imageUrl: '',
    redirectUrl: '',
    authorName: ''
  });

  // Redirigir si no está autenticado
  useEffect(() => {
    if (isLoaded && !user) {
      router.push('/sign-in?redirect=/mis-anuncios');
    }
  }, [isLoaded, user, router]);

  useEffect(() => {
    if (user) {
      fetchMyAnnouncements();
    }
  }, [user]);

  const fetchMyAnnouncements = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch('/api/announcements/my-announcements');

      if (!response.ok) {
        throw new Error('Error al obtener tus anuncios');
      }

      const data = await response.json();

      if (data.success) {
        setAnuncios(data.announcements || []);
      }
    } catch (err) {
      console.error('Error fetching my announcements:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const openCreateModal = () => {
    setEditingAnnouncement(null);
    setFormData({
      title: '',
      content: '',
      type: 'info',
      priority: 5,
      icon: '📢',
      endDate: '',
      imageUrl: '',
      redirectUrl: '',
      authorName: user?.fullName || user?.firstName || 'Usuario'
    });
    setShowModal(true);
  };

  const openEditModal = (announcement) => {
    setEditingAnnouncement(announcement);
    setFormData({
      title: announcement.title,
      content: announcement.content,
      type: announcement.type,
      priority: announcement.priority,
      icon: announcement.icon || '📢',
      endDate: announcement.end_date ? new Date(announcement.end_date).toISOString().slice(0, 16) : '',
      imageUrl: announcement.image_url || '',
      redirectUrl: announcement.redirect_url || '',
      authorName: announcement.author_name || ''
    });
    setShowModal(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const url = '/api/announcements';
      const method = editingAnnouncement ? 'PATCH' : 'POST';

      const body = {
        ...(editingAnnouncement && { id: editingAnnouncement.id }),
        title: formData.title,
        content: formData.content,
        type: formData.type,
        priority: parseInt(formData.priority),
        icon: formData.icon,
        endDate: formData.endDate || null,
        imageUrl: formData.imageUrl || null,
        redirectUrl: formData.redirectUrl || null,
        authorName: formData.authorName || null
      };

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body)
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Error al guardar el anuncio');
      }

      await fetchMyAnnouncements();
      setShowModal(false);

      Swal.fire({
        title: '¡Éxito!',
        text: editingAnnouncement ? 'Anuncio actualizado correctamente' : 'Anuncio creado correctamente',
        icon: 'success',
        confirmButtonColor: '#2563eb',
        confirmButtonText: 'Aceptar'
      });
    } catch (err) {
      Swal.fire({
        title: 'Error',
        text: err.message,
        icon: 'error',
        confirmButtonColor: '#dc2626',
        confirmButtonText: 'Aceptar'
      });
    }
  };

  const handleDelete = async (id) => {
    const result = await Swal.fire({
      title: '¿Estás seguro?',
      text: "¿Deseas eliminar este anuncio? Esta acción no se puede deshacer.",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#dc2626',
      cancelButtonColor: '#6b7280',
      confirmButtonText: 'Sí, eliminar',
      cancelButtonText: 'Cancelar'
    });

    if (!result.isConfirmed) return;

    try {
      const response = await fetch(`/api/announcements?id=${id}`, {
        method: 'DELETE'
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Error al eliminar el anuncio');
      }

      await fetchMyAnnouncements();

      Swal.fire({
        title: '¡Eliminado!',
        text: 'El anuncio ha sido eliminado correctamente',
        icon: 'success',
        confirmButtonColor: '#2563eb',
        confirmButtonText: 'Aceptar'
      });
    } catch (err) {
      Swal.fire({
        title: 'Error',
        text: err.message,
        icon: 'error',
        confirmButtonColor: '#dc2626',
        confirmButtonText: 'Aceptar'
      });
    }
  };

  const toggleStatus = async (announcement) => {
    try {
      const newStatus = announcement.status === 'active' ? 'archived' : 'active';

      const response = await fetch('/api/announcements', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: announcement.id,
          status: newStatus
        })
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Error al cambiar estado');
      }

      await fetchMyAnnouncements();

      Swal.fire({
        title: '¡Actualizado!',
        text: `El anuncio ha sido ${newStatus === 'active' ? 'activado' : 'archivado'} correctamente`,
        icon: 'success',
        confirmButtonColor: '#2563eb',
        confirmButtonText: 'Aceptar',
        timer: 2000,
        timerProgressBar: true
      });
    } catch (err) {
      Swal.fire({
        title: 'Error',
        text: err.message,
        icon: 'error',
        confirmButtonColor: '#dc2626',
        confirmButtonText: 'Aceptar'
      });
    }
  };

  const getTypeIcon = (type) => {
    switch (type) {
      case 'alert': return <AlertCircle className="w-5 h-5 text-red-600" />;
      case 'warning': return <AlertTriangle className="w-5 h-5 text-yellow-600" />;
      case 'maintenance': return <Wrench className="w-5 h-5 text-purple-600" />;
      case 'event': return <Calendar className="w-5 h-5 text-blue-600" />;
      default: return <Info className="w-5 h-5 text-green-600" />;
    }
  };

  const getTypeBadge = (type) => {
    const styles = {
      alert: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200',
      warning: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200',
      info: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
      maintenance: 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200',
      event: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200'
    };
    return styles[type] || styles.info;
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'Sin fecha límite';
    const date = new Date(dateString);
    return date.toLocaleDateString('es-CO', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (!isLoaded || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8 px-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            Mis Anuncios Comunitarios
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Gestiona tus publicaciones para la comunidad
          </p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-4 shadow">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-100 dark:bg-blue-900 rounded-lg">
                <Megaphone className="w-5 h-5 text-blue-600 dark:text-blue-400" />
              </div>
              <div>
                <div className="text-sm text-gray-600 dark:text-gray-400">Total</div>
                <div className="text-2xl font-bold text-gray-900 dark:text-white">{anuncios.length}</div>
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-lg p-4 shadow">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-green-100 dark:bg-green-900 rounded-lg">
                <Eye className="w-5 h-5 text-green-600 dark:text-green-400" />
              </div>
              <div>
                <div className="text-sm text-gray-600 dark:text-gray-400">Activos</div>
                <div className="text-2xl font-bold text-green-600">
                  {anuncios.filter(a => a.status === 'active').length}
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-lg p-4 shadow">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-purple-100 dark:bg-purple-900 rounded-lg">
                <Eye className="w-5 h-5 text-purple-600 dark:text-purple-400" />
              </div>
              <div>
                <div className="text-sm text-gray-600 dark:text-gray-400">Total Vistas</div>
                <div className="text-2xl font-bold text-purple-600">
                  {anuncios.reduce((sum, a) => sum + (a.view_count || 0), 0)}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex justify-between items-center mb-6">
          <button
            onClick={fetchMyAnnouncements}
            disabled={loading}
            className="flex items-center gap-2 px-4 py-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            Actualizar
          </button>
          <button
            onClick={openCreateModal}
            className="flex items-center gap-2 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors"
          >
            <Plus className="w-4 h-4" />
            Nuevo Anuncio
          </button>
        </div>

        {/* Error message */}
        {error && (
          <div className="mb-6 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
            <p className="text-red-800 dark:text-red-200">Error: {error}</p>
          </div>
        )}

        {/* Announcements List */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow">
          {loading ? (
            <div className="text-center py-12">
              <RefreshCw className="w-16 h-16 text-blue-500 mx-auto mb-4 animate-spin" />
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                Cargando tus anuncios...
              </h3>
            </div>
          ) : anuncios.length === 0 ? (
            <div className="text-center py-12">
              <Megaphone className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                No tienes anuncios aún
              </h3>
              <p className="text-gray-600 dark:text-gray-400 mb-4">
                Crea tu primer anuncio para compartir información con la comunidad
              </p>
              <button
                onClick={openCreateModal}
                className="inline-flex items-center gap-2 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors"
              >
                <Plus className="w-4 h-4" />
                Crear Anuncio
              </button>
            </div>
          ) : (
            <div className="divide-y divide-gray-200 dark:divide-gray-700">
              {anuncios.map((anuncio) => (
                <div key={anuncio.id} className="p-6 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
                  <div className="flex items-start gap-4">
                    {/* Icono/Emoji */}
                    <div className="flex-shrink-0">
                      {anuncio.icon && anuncio.icon.length <= 2 ? (
                        <span className="text-4xl">{anuncio.icon}</span>
                      ) : (
                        getTypeIcon(anuncio.type)
                      )}
                    </div>

                    {/* Contenido */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-4 mb-2">
                        <div className="flex-1">
                          <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-1">
                            {anuncio.title}
                          </h3>
                          <div className="flex items-center gap-3 text-sm text-gray-600 dark:text-gray-400 mb-2">
                            <span>{formatDate(anuncio.created_at)}</span>
                          </div>
                        </div>

                        {/* Badges */}
                        <div className="flex items-center gap-2">
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${getTypeBadge(anuncio.type)}`}>
                            {anuncio.type}
                          </span>
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                            anuncio.status === 'active'
                              ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                              : 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200'
                          }`}>
                            {anuncio.status}
                          </span>
                        </div>
                      </div>

                      <p className="text-gray-700 dark:text-gray-300 mb-3 line-clamp-2">
                        {anuncio.content}
                      </p>

                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4 text-sm text-gray-600 dark:text-gray-400">
                          <span className="flex items-center gap-1">
                            <Eye className="w-4 h-4" />
                            {anuncio.view_count} vistas
                          </span>
                          <span>Prioridad: {anuncio.priority}</span>
                          {anuncio.end_date && (
                            <span>Válido hasta: {formatDate(anuncio.end_date)}</span>
                          )}
                        </div>

                        {/* Acciones */}
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => toggleStatus(anuncio)}
                            className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                              anuncio.status === 'active'
                                ? 'bg-yellow-100 text-yellow-800 hover:bg-yellow-200 dark:bg-yellow-900 dark:text-yellow-200'
                                : 'bg-green-100 text-green-800 hover:bg-green-200 dark:bg-green-900 dark:text-green-200'
                            }`}
                          >
                            {anuncio.status === 'active' ? 'Archivar' : 'Activar'}
                          </button>
                          <button
                            onClick={() => openEditModal(anuncio)}
                            className="p-2 text-blue-600 hover:bg-blue-100 dark:hover:bg-blue-900 rounded-lg transition-colors"
                          >
                            <Edit className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDelete(anuncio.id)}
                            className="p-2 text-red-600 hover:bg-red-100 dark:hover:bg-red-900 rounded-lg transition-colors"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Modal Crear/Editar */}
      {showModal && (
        <AnnouncementFormModal
          formData={formData}
          setFormData={setFormData}
          onSubmit={handleSubmit}
          onClose={() => setShowModal(false)}
          isEditing={!!editingAnnouncement}
        />
      )}
    </div>
  );
}

// Componente Modal de Formulario
function AnnouncementFormModal({ formData, setFormData, onSubmit, onClose, isEditing }) {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex justify-between items-start mb-6">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
              {isEditing ? 'Editar Anuncio' : 'Nuevo Anuncio'}
            </h2>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
            >
              <X className="w-6 h-6" />
            </button>
          </div>

          <form onSubmit={onSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Título *
              </label>
              <input
                type="text"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Contenido *
              </label>
              <textarea
                value={formData.content}
                onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                rows="5"
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Nombre del Autor *
              </label>
              <input
                type="text"
                value={formData.authorName}
                onChange={(e) => setFormData({ ...formData, authorName: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                placeholder="Tu nombre o nombre de la organización"
                required
              />
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                Este nombre aparecerá como autor del anuncio
              </p>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Tipo
                </label>
                <select
                  value={formData.type}
                  onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white"
                >
                  <option value="info">Información</option>
                  <option value="alert">Alerta</option>
                  <option value="warning">Advertencia</option>
                  <option value="maintenance">Mantenimiento</option>
                  <option value="event">Evento</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Prioridad (1 = más importante)
                </label>
                <input
                  type="number"
                  min="1"
                  max="10"
                  value={formData.priority}
                  onChange={(e) => setFormData({ ...formData, priority: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Icono/Emoji
                </label>
                <input
                  type="text"
                  value={formData.icon}
                  onChange={(e) => setFormData({ ...formData, icon: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white"
                  placeholder="📢"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Válido hasta
                </label>
                <input
                  type="datetime-local"
                  value={formData.endDate}
                  onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                URL de Imagen (opcional)
              </label>
              <input
                type="url"
                value={formData.imageUrl}
                onChange={(e) => setFormData({ ...formData, imageUrl: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white"
                placeholder="https://ejemplo.com/imagen.jpg"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Enlace de Redirección (opcional)
              </label>
              <input
                type="url"
                value={formData.redirectUrl}
                onChange={(e) => setFormData({ ...formData, redirectUrl: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                placeholder="https://ejemplo.com/mas-informacion"
              />
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                Si agregas un enlace, se mostrará un botón "Más información" en el anuncio
              </p>
            </div>

            <div className="flex gap-3 pt-4">
              <button
                type="submit"
                className="flex-1 flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-6 rounded-lg transition-colors"
              >
                <Save className="w-4 h-4" />
                {isEditing ? 'Guardar Cambios' : 'Crear Anuncio'}
              </button>
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-3 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
              >
                Cancelar
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
