"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import styles from "./promociones.module.scss";
import FormularioPromocion from "@/components/Dashboard/FormularioPromocion";
import ListaPromociones from "@/components/Dashboard/ListaPromociones";

export default function PromocionesPage() {
  const [promociones, setPromociones] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editando, setEditando] = useState(null);
  const [error, setError] = useState(null);

  // Cargar promociones
  const cargarPromociones = async () => {
    try {
      setLoading(true);
      const response = await fetch("/api/promociones");
      const data = await response.json();

      if (data.success) {
        setPromociones(data.promociones);
      } else {
        setError(data.error);
      }
    } catch (error) {
      console.error("Error al cargar promociones:", error);
      setError("Error al cargar promociones");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    cargarPromociones();
  }, []);

  const handleCrearNueva = () => {
    setEditando(null);
    setShowForm(true);
  };

  const handleEditar = (promocion) => {
    setEditando(promocion);
    setShowForm(true);
  };

  const handleEliminar = async (id) => {
    if (!confirm("¿Estás seguro de eliminar esta promoción?")) return;

    try {
      const response = await fetch(`/api/promociones/${id}`, {
        method: "DELETE",
      });

      const data = await response.json();

      if (data.success) {
        await cargarPromociones();
      } else {
        alert(`Error: ${data.error}`);
      }
    } catch (error) {
      console.error("Error al eliminar promoción:", error);
      alert("Error al eliminar promoción");
    }
  };

  const handleGuardar = async () => {
    setShowForm(false);
    setEditando(null);
    await cargarPromociones();
  };

  const handleCancelar = () => {
    setShowForm(false);
    setEditando(null);
  };

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <div>
          <h1 className={styles.title}>🎁 Gestión de Promociones</h1>
          <p className={styles.subtitle}>
            Crea y administra promociones, combos y ofertas especiales
          </p>
        </div>
        <button onClick={handleCrearNueva} className={styles.btnNuevo}>
          <span>+</span> Nueva Promoción
        </button>
      </div>

      {error && (
        <div className={styles.error}>
          <p>{error}</p>
        </div>
      )}

      <AnimatePresence>
        {showForm && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className={styles.formContainer}
          >
            <FormularioPromocion
              promocion={editando}
              onGuardar={handleGuardar}
              onCancelar={handleCancelar}
            />
          </motion.div>
        )}
      </AnimatePresence>

      {loading ? (
        <div className={styles.loading}>
          <div className={styles.spinner}></div>
          <p>Cargando promociones...</p>
        </div>
      ) : (
        <ListaPromociones
          promociones={promociones}
          onEditar={handleEditar}
          onEliminar={handleEliminar}
        />
      )}
    </div>
  );
}
