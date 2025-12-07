"use client";

import { useState, useEffect } from "react";
import { useToast } from "@/contexts/ToastContext";
import styles from "./MisDirecciones.module.scss";
import {
  PlusIcon,
  PencilIcon,
  TrashIcon,
  MapPinIcon,
  CheckCircleIcon,
} from "@heroicons/react/24/outline";

export default function MisDirecciones() {
  const toast = useToast();
  const [direcciones, setDirecciones] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingAddress, setEditingAddress] = useState(null);

  const [formData, setFormData] = useState({
    nombre_completo: "",
    telefono: "",
    direccion_linea1: "",
    direccion_linea2: "",
    ciudad: "",
    departamento: "",
    codigo_postal: "",
    pais: "Colombia",
    tipo: "casa",
    es_predeterminada: false,
    notas: "",
  });

  useEffect(() => {
    loadDirecciones();
  }, []);

  const loadDirecciones = async () => {
    try {
      const response = await fetch("/api/perfil/direcciones");
      if (response.ok) {
        const data = await response.json();
        setDirecciones(data);
      }
    } catch (error) {
      console.error("Error al cargar direcciones:", error);
      toast.error("Error al cargar direcciones");
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const url = editingAddress
        ? `/api/perfil/direcciones/${editingAddress.id}`
        : "/api/perfil/direcciones";

      const method = editingAddress ? "PUT" : "POST";

      const response = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        toast.success(
          editingAddress
            ? "Dirección actualizada correctamente"
            : "Dirección agregada correctamente",
          { title: "¡Éxito!" }
        );
        loadDirecciones();
        closeModal();
      } else {
        throw new Error("Error al guardar dirección");
      }
    } catch (error) {
      console.error("Error:", error);
      toast.error("No se pudo guardar la dirección", { title: "Error" });
    }
  };

  const handleEdit = (direccion) => {
    setEditingAddress(direccion);
    setFormData({
      nombre_completo: direccion.nombre_completo,
      telefono: direccion.telefono,
      direccion_linea1: direccion.direccion_linea1,
      direccion_linea2: direccion.direccion_linea2 || "",
      ciudad: direccion.ciudad,
      departamento: direccion.departamento,
      codigo_postal: direccion.codigo_postal || "",
      pais: direccion.pais,
      tipo: direccion.tipo,
      es_predeterminada: direccion.es_predeterminada,
      notas: direccion.notas || "",
    });
    setShowModal(true);
  };

  const handleDelete = async (id) => {
    if (!confirm("¿Estás seguro de eliminar esta dirección?")) return;

    try {
      const response = await fetch(`/api/perfil/direcciones/${id}`, {
        method: "DELETE",
      });

      if (response.ok) {
        toast.success("Dirección eliminada correctamente");
        loadDirecciones();
      } else {
        throw new Error("Error al eliminar dirección");
      }
    } catch (error) {
      console.error("Error:", error);
      toast.error("No se pudo eliminar la dirección", { title: "Error" });
    }
  };

  const closeModal = () => {
    setShowModal(false);
    setEditingAddress(null);
    setFormData({
      nombre_completo: "",
      telefono: "",
      direccion_linea1: "",
      direccion_linea2: "",
      ciudad: "",
      departamento: "",
      codigo_postal: "",
      pais: "Colombia",
      tipo: "casa",
      es_predeterminada: false,
      notas: "",
    });
  };

  if (loading) {
    return <div className={styles.loading}>Cargando direcciones...</div>;
  }

  return (
    <div className={styles.misDirecciones}>
      <div className={styles.header}>
        <h2 className={styles.title}>Mis Direcciones de Envío</h2>
        <button
          onClick={() => setShowModal(true)}
          className={styles.btnAdd}
        >
          <PlusIcon className={styles.icon} />
          Nueva Dirección
        </button>
      </div>

      {direcciones.length === 0 ? (
        <div className={styles.empty}>
          <MapPinIcon className={styles.emptyIcon} />
          <p>No tienes direcciones guardadas</p>
          <button onClick={() => setShowModal(true)} className={styles.btnPrimary}>
            Agregar Primera Dirección
          </button>
        </div>
      ) : (
        <div className={styles.grid}>
          {direcciones.map((direccion) => (
            <div
              key={direccion.id}
              className={`${styles.card} ${
                direccion.es_predeterminada ? styles.default : ""
              }`}
            >
              {direccion.es_predeterminada && (
                <div className={styles.badge}>
                  <CheckCircleIcon className={styles.badgeIcon} />
                  Predeterminada
                </div>
              )}

              <div className={styles.cardHeader}>
                <h3>{direccion.nombre_completo}</h3>
                <span className={styles.tipo}>{direccion.tipo}</span>
              </div>

              <div className={styles.cardBody}>
                <p className={styles.address}>
                  {direccion.direccion_linea1}
                  {direccion.direccion_linea2 && <br />}
                  {direccion.direccion_linea2}
                </p>
                <p className={styles.city}>
                  {direccion.ciudad}, {direccion.departamento}
                  {direccion.codigo_postal && ` - ${direccion.codigo_postal}`}
                </p>
                <p className={styles.phone}>{direccion.telefono}</p>
                {direccion.notas && (
                  <p className={styles.notes}>Notas: {direccion.notas}</p>
                )}
              </div>

              <div className={styles.cardActions}>
                <button
                  onClick={() => handleEdit(direccion)}
                  className={styles.btnEdit}
                >
                  <PencilIcon className={styles.icon} />
                  Editar
                </button>
                <button
                  onClick={() => handleDelete(direccion.id)}
                  className={styles.btnDelete}
                >
                  <TrashIcon className={styles.icon} />
                  Eliminar
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal para agregar/editar dirección */}
      {showModal && (
        <div className={styles.modal} onClick={closeModal}>
          <div
            className={styles.modalContent}
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className={styles.modalTitle}>
              {editingAddress ? "Editar Dirección" : "Nueva Dirección"}
            </h3>

            <form onSubmit={handleSubmit} className={styles.form}>
              <div className={styles.formRow}>
                <div className={styles.formGroup}>
                  <label htmlFor="nombre_completo">Nombre Completo *</label>
                  <input
                    type="text"
                    id="nombre_completo"
                    name="nombre_completo"
                    value={formData.nombre_completo}
                    onChange={handleChange}
                    required
                  />
                </div>

                <div className={styles.formGroup}>
                  <label htmlFor="telefono">Teléfono *</label>
                  <input
                    type="tel"
                    id="telefono"
                    name="telefono"
                    value={formData.telefono}
                    onChange={handleChange}
                    required
                  />
                </div>
              </div>

              <div className={styles.formGroup}>
                <label htmlFor="direccion_linea1">Dirección *</label>
                <input
                  type="text"
                  id="direccion_linea1"
                  name="direccion_linea1"
                  value={formData.direccion_linea1}
                  onChange={handleChange}
                  placeholder="Calle, número, barrio"
                  required
                />
              </div>

              <div className={styles.formGroup}>
                <label htmlFor="direccion_linea2">
                  Dirección Línea 2 (Opcional)
                </label>
                <input
                  type="text"
                  id="direccion_linea2"
                  name="direccion_linea2"
                  value={formData.direccion_linea2}
                  onChange={handleChange}
                  placeholder="Apartamento, suite, edificio"
                />
              </div>

              <div className={styles.formRow}>
                <div className={styles.formGroup}>
                  <label htmlFor="ciudad">Ciudad *</label>
                  <input
                    type="text"
                    id="ciudad"
                    name="ciudad"
                    value={formData.ciudad}
                    onChange={handleChange}
                    required
                  />
                </div>

                <div className={styles.formGroup}>
                  <label htmlFor="departamento">Departamento *</label>
                  <input
                    type="text"
                    id="departamento"
                    name="departamento"
                    value={formData.departamento}
                    onChange={handleChange}
                    required
                  />
                </div>

                <div className={styles.formGroup}>
                  <label htmlFor="codigo_postal">Código Postal</label>
                  <input
                    type="text"
                    id="codigo_postal"
                    name="codigo_postal"
                    value={formData.codigo_postal}
                    onChange={handleChange}
                  />
                </div>
              </div>

              <div className={styles.formRow}>
                <div className={styles.formGroup}>
                  <label htmlFor="tipo">Tipo de Dirección</label>
                  <select
                    id="tipo"
                    name="tipo"
                    value={formData.tipo}
                    onChange={handleChange}
                  >
                    <option value="casa">Casa</option>
                    <option value="trabajo">Trabajo</option>
                    <option value="otro">Otro</option>
                  </select>
                </div>
              </div>

              <div className={styles.formGroup}>
                <label htmlFor="notas">Notas de Entrega</label>
                <textarea
                  id="notas"
                  name="notas"
                  value={formData.notas}
                  onChange={handleChange}
                  placeholder="Instrucciones especiales para el delivery"
                  rows="3"
                />
              </div>

              <div className={styles.formGroup}>
                <label className={styles.checkboxLabel}>
                  <input
                    type="checkbox"
                    name="es_predeterminada"
                    checked={formData.es_predeterminada}
                    onChange={handleChange}
                  />
                  <span>Establecer como dirección predeterminada</span>
                </label>
              </div>

              <div className={styles.modalActions}>
                <button
                  type="button"
                  onClick={closeModal}
                  className={styles.btnSecondary}
                >
                  Cancelar
                </button>
                <button type="submit" className={styles.btnPrimary}>
                  {editingAddress ? "Actualizar" : "Guardar"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
