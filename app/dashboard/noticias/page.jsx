"use client";

import { useState, useEffect } from "react";
import { Newspaper, Plus, Trash2, ExternalLink, Globe, Facebook, Link as LinkIcon } from "lucide-react";
import Image from "next/image";

export default function NoticiasPage() {
  const [noticias, setNoticias] = useState([]);
  const [mostrarFormulario, setMostrarFormulario] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    cargarNoticias();
  }, []);

  const cargarNoticias = async () => {
    try {
      const response = await fetch("/api/noticias");
      if (response.ok) {
        const data = await response.json();
        setNoticias(data.noticias || []);
      }
    } catch (error) {
      console.error("Error al cargar noticias:", error);
    } finally {
      setLoading(false);
    }
  };

  const eliminarNoticia = async (index) => {
    if (!confirm("¿Estás seguro de eliminar esta noticia?")) return;

    try {
      const response = await fetch("/api/noticias", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ index }),
      });

      if (response.ok) {
        await cargarNoticias();
      }
    } catch (error) {
      console.error("Error al eliminar noticia:", error);
      alert("Error al eliminar la noticia");
    }
  };

  return (
    <div className="max-w-7xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white flex items-center gap-3">
              <Newspaper className="w-8 h-8 text-blue-600" />
              Gestión de Noticias
            </h1>
            <p className="mt-2 text-gray-600 dark:text-gray-400">
              Publica noticias externas y de Facebook para mostrar en el inicio
            </p>
          </div>
          <button
            onClick={() => setMostrarFormulario(!mostrarFormulario)}
            className="flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors shadow-lg hover:shadow-xl"
          >
            <Plus className="w-5 h-5" />
            {mostrarFormulario ? "Cancelar" : "Nueva Noticia"}
          </button>
        </div>
      </div>

      {/* Formulario */}
      {mostrarFormulario && (
        <FormularioNoticia
          onGuardar={() => {
            cargarNoticias();
            setMostrarFormulario(false);
          }}
          onCancelar={() => setMostrarFormulario(false)}
        />
      )}

      {/* Lista de Noticias */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md">
        <div className="p-6 border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
            Noticias Publicadas ({noticias.length})
          </h2>
        </div>

        {loading ? (
          <div className="p-12 text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          </div>
        ) : noticias.length === 0 ? (
          <div className="p-12 text-center">
            <Newspaper className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
              No hay noticias publicadas
            </h3>
            <p className="text-gray-600 dark:text-gray-400 mb-6">
              Agrega tu primera noticia haciendo clic en "Nueva Noticia"
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 p-6">
            {noticias.map((noticia, index) => (
              <div
                key={index}
                className="bg-white dark:bg-gray-700 rounded-lg overflow-hidden shadow-md hover:shadow-lg transition-shadow border border-gray-200 dark:border-gray-600"
              >
                {/* Imagen */}
                <div className="relative h-40 bg-gray-200 dark:bg-gray-600">
                  {noticia.imagen ? (
                    <Image
                      src={noticia.imagen}
                      alt={noticia.titulo}
                      fill
                      className="object-cover"
                      sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <Globe className="w-12 h-12 text-gray-400" />
                    </div>
                  )}

                  {noticia.tipo === "facebook" && (
                    <div className="absolute top-2 right-2 bg-blue-600 text-white px-2 py-1 rounded flex items-center gap-1 text-xs">
                      <Facebook className="w-3 h-3" />
                      Facebook
                    </div>
                  )}
                </div>

                {/* Contenido */}
                <div className="p-4">
                  <h3 className="font-bold text-gray-900 dark:text-white mb-2 line-clamp-2">
                    {noticia.titulo}
                  </h3>
                  {noticia.descripcion && (
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-3 line-clamp-2">
                      {noticia.descripcion}
                    </p>
                  )}

                  <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400 mb-3">
                    <Globe className="w-3 h-3" />
                    <span className="truncate">{noticia.sitioWeb || "Sin fuente"}</span>
                  </div>

                  {/* Acciones */}
                  <div className="flex gap-2">
                    <a
                      href={noticia.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex-1 flex items-center justify-center gap-1 px-3 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors text-sm"
                    >
                      <ExternalLink className="w-4 h-4" />
                      Ver
                    </a>
                    <button
                      onClick={() => eliminarNoticia(index)}
                      className="flex items-center justify-center gap-1 px-3 py-2 bg-red-600 text-white rounded hover:bg-red-700 transition-colors text-sm"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function FormularioNoticia({ onGuardar, onCancelar }) {
  const [tipoNoticia, setTipoNoticia] = useState("url"); // url o facebook
  const [url, setUrl] = useState("");
  const [cargandoMetadatos, setCargandoMetadatos] = useState(false);
  const [metadatos, setMetadatos] = useState(null);
  const [modoManual, setModoManual] = useState(false);

  // Estados para campos manuales
  const [titulo, setTitulo] = useState("");
  const [descripcion, setDescripcion] = useState("");
  const [imagen, setImagen] = useState("");
  const [sitioWeb, setSitioWeb] = useState("");

  const extraerMetadatos = async () => {
    if (!url) return;

    setCargandoMetadatos(true);
    setModoManual(false);
    try {
      const response = await fetch("/api/noticias/metadatos", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url }),
      });

      if (response.ok) {
        const data = await response.json();

        if (data.manual) {
          // Si es Facebook o falla la extracción, activar modo manual
          setModoManual(true);
          setSitioWeb(data.sitioWeb || "");
          if (data.mensaje) {
            alert(data.mensaje);
          }
        } else {
          setMetadatos(data);
          // Pre-llenar campos editables
          setTitulo(data.titulo || "");
          setDescripcion(data.descripcion || "");
          setImagen(data.imagen || "");
          setSitioWeb(data.sitioWeb || "");
        }
      }
    } catch (error) {
      console.error("Error al extraer metadatos:", error);
      setModoManual(true);
      alert("Error al extraer metadatos. Por favor, ingresa los datos manualmente.");
    } finally {
      setCargandoMetadatos(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const noticia = {
      tipo: tipoNoticia,
      url,
      titulo: titulo || metadatos?.titulo || "",
      descripcion: descripcion || metadatos?.descripcion || "",
      imagen: imagen || metadatos?.imagen || "",
      sitioWeb: sitioWeb || metadatos?.sitioWeb || new URL(url).hostname,
      fecha: new Date().toISOString(),
    };

    // Validar que haya título
    if (!noticia.titulo) {
      alert("El título es obligatorio");
      return;
    }

    try {
      const response = await fetch("/api/noticias", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(noticia),
      });

      if (response.ok) {
        onGuardar();
      } else {
        alert("Error al guardar la noticia");
      }
    } catch (error) {
      console.error("Error:", error);
      alert("Error al guardar la noticia");
    }
  };

  return (
    <form onSubmit={handleSubmit} className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 mb-6">
      <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
        Agregar Nueva Noticia
      </h3>

      {/* Tipo de noticia */}
      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          Tipo de Noticia
        </label>
        <div className="flex gap-4">
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="radio"
              value="url"
              checked={tipoNoticia === "url"}
              onChange={(e) => setTipoNoticia(e.target.value)}
              className="w-4 h-4 text-blue-600"
            />
            <LinkIcon className="w-4 h-4" />
            <span className="text-gray-700 dark:text-gray-300">URL Externa</span>
          </label>
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="radio"
              value="facebook"
              checked={tipoNoticia === "facebook"}
              onChange={(e) => setTipoNoticia(e.target.value)}
              className="w-4 h-4 text-blue-600"
            />
            <Facebook className="w-4 h-4" />
            <span className="text-gray-700 dark:text-gray-300">Facebook</span>
          </label>
        </div>
      </div>

      {/* URL */}
      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          URL de la Noticia *
        </label>
        <div className="flex gap-2">
          <input
            type="url"
            required
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            placeholder={
              tipoNoticia === "facebook"
                ? "https://www.facebook.com/..."
                : "https://ejemplo.com/noticia"
            }
            className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
          />
          <button
            type="button"
            onClick={extraerMetadatos}
            disabled={!url || cargandoMetadatos}
            className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed"
          >
            {cargandoMetadatos ? "Extrayendo..." : "Extraer Info"}
          </button>
        </div>
        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
          Pega la URL y haz clic en "Extraer Info" para obtener automáticamente el título, descripción e imagen
        </p>
      </div>

      {/* Formulario de edición manual o vista previa */}
      {(metadatos || modoManual) && (
        <div className="mb-4 space-y-4">
          <div className="p-4 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg border border-yellow-200 dark:border-yellow-800">
            <h4 className="font-semibold text-gray-900 dark:text-white mb-3 flex items-center gap-2">
              {modoManual ? "📝 Completa los datos manualmente" : "✏️ Edita los datos si es necesario"}
            </h4>

            {/* Título */}
            <div className="mb-3">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Título de la Noticia *
              </label>
              <input
                type="text"
                required
                value={titulo}
                onChange={(e) => setTitulo(e.target.value)}
                placeholder="Ej: Nueva actualización de tecnología"
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
              />
            </div>

            {/* Descripción */}
            <div className="mb-3">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Descripción
              </label>
              <textarea
                value={descripcion}
                onChange={(e) => setDescripcion(e.target.value)}
                placeholder="Breve descripción de la noticia..."
                rows="3"
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
              />
            </div>

            {/* URL de la imagen */}
            <div className="mb-3">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                URL de la Imagen
              </label>
              <input
                type="url"
                value={imagen}
                onChange={(e) => setImagen(e.target.value)}
                placeholder="https://ejemplo.com/imagen.jpg"
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
              />
              {imagen && (
                <div className="mt-2 relative h-32 rounded overflow-hidden">
                  <Image
                    src={imagen}
                    alt="Vista previa"
                    fill
                    className="object-cover"
                    sizes="(max-width: 768px) 100vw, 50vw"
                    onError={() => setImagen("")}
                  />
                </div>
              )}
            </div>

            {/* Sitio Web */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Nombre del Sitio Web / Fuente
              </label>
              <input
                type="text"
                value={sitioWeb}
                onChange={(e) => setSitioWeb(e.target.value)}
                placeholder="Ej: TechCrunch, El Tiempo, Facebook"
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
              />
            </div>
          </div>
        </div>
      )}

      {/* Botones */}
      <div className="flex gap-4 justify-end">
        <button
          type="button"
          onClick={onCancelar}
          className="px-6 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
        >
          Cancelar
        </button>
        <button
          type="submit"
          disabled={!url || (!titulo && !metadatos?.titulo)}
          className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed"
        >
          Publicar Noticia
        </button>
      </div>
    </form>
  );
}
