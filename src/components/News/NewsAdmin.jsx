"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import RichTextEditor from "./RichTextEditor";
import styles from "./NewsAdmin.module.scss";

export default function NewsAdmin() {
  const [noticias, setNoticias] = useState([]);
  const [formData, setFormData] = useState({
    titulo: "",
    descripcion: "",
    contenido: "",
    imagen: "",
    fecha: new Date().toISOString().split('T')[0],
    municipio: "general",
    categoria: "general",
    autor: "",
  });
  const [editingId, setEditingId] = useState(null);
  const [previewImage, setPreviewImage] = useState("");
  const [mensaje, setMensaje] = useState({ tipo: "", texto: "" });

  const municipios = [
    { id: "general", nombre: "Valle de Sibundoy" },
    { id: "sibundoy", nombre: "Sibundoy" },
    { id: "san-francisco", nombre: "San Francisco" },
    { id: "colon", nombre: "Colón" },
    { id: "santiago", nombre: "Santiago" },
  ];

  const categorias = [
    { id: "general", nombre: "General" },
    { id: "cultura", nombre: "Cultura" },
    { id: "economia", nombre: "Economía" },
    { id: "infraestructura", nombre: "Infraestructura" },
    { id: "educacion", nombre: "Educación" },
    { id: "salud", nombre: "Salud" },
    { id: "deportes", nombre: "Deportes" },
    { id: "turismo", nombre: "Turismo" },
    { id: "medio-ambiente", nombre: "Medio Ambiente" },
  ];

  // Cargar noticias desde la API
  useEffect(() => {
    fetchNoticias();
  }, []);

  const fetchNoticias = async () => {
    try {
      const response = await fetch("/api/noticias");
      const data = await response.json();
      if (data.success) {
        setNoticias(data.noticias);
      }
    } catch (err) {
      console.error("Error cargando noticias:", err);
      setMensaje({
        tipo: "error",
        texto: "Error al cargar noticias de la base de datos",
      });
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));

    if (name === "imagen") {
      setPreviewImage(value);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.titulo || !formData.descripcion || !formData.imagen) {
      setMensaje({
        tipo: "error",
        texto: "Por favor completa todos los campos obligatorios",
      });
      return;
    }

    try {
      if (editingId) {
        // Actualizar noticia existente
        const response = await fetch("/api/noticias", {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ ...formData, id: editingId }),
        });

        const data = await response.json();
        if (data.success) {
          setMensaje({ tipo: "success", texto: "✅ Noticia actualizada exitosamente en la nube" });
          setEditingId(null);
          fetchNoticias(); // Recargar lista
        } else {
          throw new Error(data.error);
        }
      } else {
        // Crear nueva noticia
        const response = await fetch("/api/noticias", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(formData),
        });

        const data = await response.json();
        if (data.success) {
          setMensaje({ tipo: "success", texto: "✅ Noticia creada exitosamente en la nube" });
          fetchNoticias(); // Recargar lista
        } else {
          throw new Error(data.error);
        }
      }

      // Limpiar formulario
      setFormData({
        titulo: "",
        descripcion: "",
        contenido: "",
        imagen: "",
        fecha: new Date().toISOString().split('T')[0],
        municipio: "general",
        categoria: "general",
        autor: "",
      });
      setPreviewImage("");

      // Ocultar mensaje después de 3 segundos
      setTimeout(() => setMensaje({ tipo: "", texto: "" }), 3000);
    } catch (error) {
      console.error("Error guardando noticia:", error);
      setMensaje({
        tipo: "error",
        texto: `Error al guardar: ${error.message}`,
      });
      setTimeout(() => setMensaje({ tipo: "", texto: "" }), 5000);
    }
  };

  const handleEdit = (noticia) => {
    setFormData(noticia);
    setEditingId(noticia.id);
    setPreviewImage(noticia.imagen);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleDelete = async (id) => {
    if (confirm("¿Estás seguro de eliminar esta noticia de la base de datos?")) {
      try {
        const response = await fetch(`/api/noticias?id=${id}`, {
          method: "DELETE",
        });

        const data = await response.json();
        if (data.success) {
          setMensaje({ tipo: "success", texto: "✅ Noticia eliminada exitosamente de la nube" });
          fetchNoticias(); // Recargar lista
        } else {
          throw new Error(data.error);
        }

        setTimeout(() => setMensaje({ tipo: "", texto: "" }), 3000);
      } catch (error) {
        console.error("Error eliminando noticia:", error);
        setMensaje({
          tipo: "error",
          texto: `Error al eliminar: ${error.message}`,
        });
        setTimeout(() => setMensaje({ tipo: "", texto: "" }), 5000);
      }
    }
  };

  const handleExport = () => {
    const dataStr = JSON.stringify({ noticias }, null, 2);
    const dataBlob = new Blob([dataStr], { type: "application/json" });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "noticias-backup.json";
    link.click();
    URL.revokeObjectURL(url);

    setMensaje({
      tipo: "success",
      texto: "✅ Backup de noticias exportado (las noticias ya están en la nube, no es necesario guardar este archivo)",
    });
    setTimeout(() => setMensaje({ tipo: "", texto: "" }), 5000);
  };

  const handleCancelEdit = () => {
    setEditingId(null);
    setFormData({
      titulo: "",
      descripcion: "",
      contenido: "",
      imagen: "",
      fecha: new Date().toISOString().split('T')[0],
      municipio: "general",
      categoria: "general",
      autor: "",
    });
    setPreviewImage("");
  };

  return (
    <div className={styles.adminContainer}>
      <div className={styles.header}>
        <h1>
          {editingId ? "✏️ Editar Noticia" : "📰 Administrar Noticias"}
        </h1>
        <p>Gestiona las noticias del Valle de Sibundoy</p>
        <button onClick={handleExport} className={styles.exportBtn}>
          💾 Exportar JSON
        </button>
      </div>

      {/* Mensaje de notificación */}
      {mensaje.texto && (
        <div className={`${styles.mensaje} ${styles[mensaje.tipo]}`}>
          {mensaje.texto}
        </div>
      )}

      {/* Formulario */}
      <form onSubmit={handleSubmit} className={styles.form}>
        <div className={styles.formGrid}>
          {/* Título */}
          <div className={styles.formGroup}>
            <label htmlFor="titulo">
              Título de la noticia <span className={styles.required}>*</span>
            </label>
            <input
              type="text"
              id="titulo"
              name="titulo"
              value={formData.titulo}
              onChange={handleInputChange}
              placeholder="Ej: Festival del Carnaval del Perdón"
              required
            />
          </div>

          {/* Fecha */}
          <div className={styles.formGroup}>
            <label htmlFor="fecha">
              Fecha de publicación <span className={styles.required}>*</span>
            </label>
            <input
              type="date"
              id="fecha"
              name="fecha"
              value={formData.fecha}
              onChange={handleInputChange}
              required
            />
          </div>

          {/* Municipio */}
          <div className={styles.formGroup}>
            <label htmlFor="municipio">
              Municipio <span className={styles.required}>*</span>
            </label>
            <select
              id="municipio"
              name="municipio"
              value={formData.municipio}
              onChange={handleInputChange}
              required
            >
              {municipios.map((m) => (
                <option key={m.id} value={m.id}>
                  {m.nombre}
                </option>
              ))}
            </select>
          </div>

          {/* Categoría */}
          <div className={styles.formGroup}>
            <label htmlFor="categoria">
              Categoría <span className={styles.required}>*</span>
            </label>
            <select
              id="categoria"
              name="categoria"
              value={formData.categoria}
              onChange={handleInputChange}
              required
            >
              {categorias.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.nombre}
                </option>
              ))}
            </select>
          </div>

          {/* Autor */}
          <div className={styles.formGroup}>
            <label htmlFor="autor">Autor (opcional)</label>
            <input
              type="text"
              id="autor"
              name="autor"
              value={formData.autor}
              onChange={handleInputChange}
              placeholder="Ej: Redacción Valle de Sibundoy"
            />
          </div>

          {/* URL de imagen */}
          <div className={styles.formGroup}>
            <label htmlFor="imagen">
              URL de la imagen <span className={styles.required}>*</span>
            </label>
            <input
              type="url"
              id="imagen"
              name="imagen"
              value={formData.imagen}
              onChange={handleInputChange}
              placeholder="https://ejemplo.com/imagen.jpg"
              required
            />
          </div>
        </div>

        {/* Vista previa de imagen */}
        {previewImage && (
          <div className={styles.imagePreview}>
            <p className={styles.previewLabel}>Vista previa de la imagen:</p>
            <Image
              src={previewImage}
              alt="Vista previa"
              width={400}
              height={250}
              className={styles.previewImg}
            />
          </div>
        )}

        {/* Descripción corta */}
        <div className={styles.formGroup}>
          <label htmlFor="descripcion">
            Descripción corta (para tarjeta){" "}
            <span className={styles.required}>*</span>
          </label>
          <textarea
            id="descripcion"
            name="descripcion"
            value={formData.descripcion}
            onChange={handleInputChange}
            placeholder="Descripción breve de 1-2 líneas"
            rows={2}
            maxLength={150}
            required
          />
          <small>{formData.descripcion.length}/150 caracteres</small>
        </div>

        {/* Contenido completo con editor enriquecido */}
        <div className={styles.formGroup}>
          <label htmlFor="contenido">
            Contenido completo de la noticia
            <span className={styles.editorInfo}>
              {" "}
              (usa la barra de herramientas para dar formato)
            </span>
          </label>
          <RichTextEditor
            value={formData.contenido}
            onChange={(value) =>
              setFormData((prev) => ({ ...prev, contenido: value }))
            }
            placeholder="Escribe aquí el contenido completo de la noticia. Usa las herramientas de arriba para dar formato al texto..."
          />
        </div>

        {/* Botones */}
        <div className={styles.formActions}>
          {editingId && (
            <button
              type="button"
              onClick={handleCancelEdit}
              className={styles.cancelBtn}
            >
              Cancelar
            </button>
          )}
          <button type="submit" className={styles.submitBtn}>
            {editingId ? "💾 Actualizar noticia" : "➕ Crear noticia"}
          </button>
        </div>
      </form>

      {/* Lista de noticias */}
      <div className={styles.newsList}>
        <h2>Noticias publicadas ({noticias.length})</h2>
        {noticias.length === 0 ? (
          <p className={styles.emptyState}>
            No hay noticias publicadas. Crea la primera noticia usando el
            formulario de arriba.
          </p>
        ) : (
          <div className={styles.newsGrid}>
            {noticias.map((noticia) => (
              <article key={noticia.id} className={styles.newsCard}>
                <div className={styles.newsImage}>
                  <Image
                    src={noticia.imagen}
                    alt={noticia.titulo}
                    width={300}
                    height={200}
                    style={{ objectFit: "cover" }}
                  />
                  <span className={styles.badge}>{noticia.categoria}</span>
                </div>
                <div className={styles.newsContent}>
                  <div className={styles.newsMeta}>
                    <span className={styles.date}>
                      📅{" "}
                      {new Date(noticia.fecha).toLocaleDateString("es-CO", {
                        year: "numeric",
                        month: "long",
                        day: "numeric",
                      })}
                    </span>
                    <span className={styles.municipio}>
                      📍 {municipios.find((m) => m.id === noticia.municipio)?.nombre}
                    </span>
                  </div>
                  <h3>{noticia.titulo}</h3>
                  <p>{noticia.descripcion}</p>
                  {noticia.autor && (
                    <p className={styles.autor}>Por: {noticia.autor}</p>
                  )}
                  <div className={styles.cardActions}>
                    <button
                      onClick={() => handleEdit(noticia)}
                      className={styles.editBtn}
                    >
                      ✏️ Editar
                    </button>
                    <button
                      onClick={() => handleDelete(noticia.id)}
                      className={styles.deleteBtn}
                    >
                      🗑️ Eliminar
                    </button>
                  </div>
                </div>
              </article>
            ))}
          </div>
        )}
      </div>

      {/* Instrucciones */}
      <div className={styles.instructions}>
        <h3>📋 Instrucciones</h3>
        <ol>
          <li>
            Completa el formulario con los datos de la noticia (título,
            descripción, imagen, etc.)
          </li>
          <li>Puedes usar imágenes subidas a Firebase Storage u otro servicio</li>
          <li>
            Haz clic en &quot;Crear noticia&quot; para añadirla a la lista
          </li>
          <li>
            Puedes editar o eliminar noticias usando los botones en cada tarjeta
          </li>
          <li>
            Cuando termines, haz clic en &quot;Exportar JSON&quot; para descargar el
            archivo
          </li>
          <li>
            Guarda el archivo descargado en{" "}
            <code>/public/noticias.json</code>
          </li>
          <li>
            Las noticias aparecerán automáticamente en la sección de noticias del
            sitio
          </li>
        </ol>
      </div>
    </div>
  );
}
