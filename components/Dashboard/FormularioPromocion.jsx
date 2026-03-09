"use client";

import { useState, useEffect } from "react";
import styles from "./FormularioPromocion.module.scss";
import SelectorProductos from "./SelectorProductos";

const TIPOS_PROMOCION = [
  { value: "combo", label: "Combo (Múltiples productos)", icon: "📦" },
  { value: "descuento_porcentaje", label: "Descuento por Porcentaje", icon: "%" },
  { value: "descuento_fijo", label: "Descuento Fijo", icon: "$" },
  { value: "2x1", label: "2x1 (Lleva 2, paga 1)", icon: "🎯" },
  { value: "3x2", label: "3x2 (Lleva 3, paga 2)", icon: "🎁" },
];

const ICONOS = ["🎁", "🎉", "⭐", "💝", "🔥", "⚡", "🎯", "💰", "🏷️", "✨"];

export default function FormularioPromocion({ promocion, onGuardar, onCancelar }) {
  const [formData, setFormData] = useState({
    nombre: "",
    descripcion: "",
    tipo: "combo",
    activo: true,
    productos_ids: [],
    descuento_tipo: "porcentaje",
    descuento_valor: "",
    cantidad_minima: 1,
    cantidad_maxima: "",
    fecha_inicio: "",
    fecha_fin: "",
    imagen_url: "",
    color_badge: "#FF6B6B",
    icono: "🎁",
    posicion_orden: 0,
  });

  const [loading, setLoading] = useState(false);
  const [showSelectorProductos, setShowSelectorProductos] = useState(false);

  useEffect(() => {
    if (promocion) {
      setFormData({
        ...promocion,
        descuento_valor: promocion.descuento_valor || "",
        cantidad_maxima: promocion.cantidad_maxima || "",
        fecha_inicio: promocion.fecha_inicio
          ? new Date(promocion.fecha_inicio).toISOString().slice(0, 16)
          : "",
        fecha_fin: promocion.fecha_fin
          ? new Date(promocion.fecha_fin).toISOString().slice(0, 16)
          : "",
      });
    }
  }, [promocion]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleProductosSeleccionados = (productosIds) => {
    setFormData((prev) => ({
      ...prev,
      productos_ids: productosIds,
    }));
    setShowSelectorProductos(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const url = promocion
        ? `/api/promociones/${promocion.id}`
        : "/api/promociones";

      const method = promocion ? "PUT" : "POST";

      const response = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...formData,
          descuento_tipo: "porcentaje", // Siempre porcentaje
          descuento_valor: parseFloat(formData.descuento_valor),
          cantidad_minima: parseInt(formData.cantidad_minima) || 1,
          cantidad_maxima: formData.cantidad_maxima
            ? parseInt(formData.cantidad_maxima)
            : null,
          posicion_orden: parseInt(formData.posicion_orden) || 0,
          precio_combo: null, // Siempre null, no lo usamos
        }),
      });

      const data = await response.json();

      if (data.success) {
        onGuardar();
      } else {
        alert(`Error: ${data.error}`);
      }
    } catch (error) {
      console.error("Error al guardar promoción:", error);
      alert("Error al guardar promoción");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className={styles.form}>
      <div className={styles.formHeader}>
        <h2>{promocion ? "Editar Promoción" : "Nueva Promoción"}</h2>
      </div>

      <div className={styles.formGrid}>
        {/* Nombre */}
        <div className={styles.formGroup}>
          <label htmlFor="nombre">
            Nombre de la Promoción <span className={styles.required}>*</span>
          </label>
          <input
            type="text"
            id="nombre"
            name="nombre"
            value={formData.nombre}
            onChange={handleChange}
            required
            placeholder="Ej: Combo Teclado + Mouse"
            className={styles.input}
          />
        </div>

        {/* Tipo */}
        <div className={styles.formGroup}>
          <label htmlFor="tipo">
            Tipo de Promoción <span className={styles.required}>*</span>
          </label>
          <select
            id="tipo"
            name="tipo"
            value={formData.tipo}
            onChange={handleChange}
            required
            className={styles.select}
          >
            {TIPOS_PROMOCION.map((tipo) => (
              <option key={tipo.value} value={tipo.value}>
                {tipo.icon} {tipo.label}
              </option>
            ))}
          </select>
        </div>

        {/* Descripción */}
        <div className={`${styles.formGroup} ${styles.fullWidth}`}>
          <label htmlFor="descripcion">Descripción</label>
          <textarea
            id="descripcion"
            name="descripcion"
            value={formData.descripcion}
            onChange={handleChange}
            rows={3}
            placeholder="Describe los beneficios de esta promoción"
            className={styles.textarea}
          />
        </div>

        {/* Productos */}
        <div className={`${styles.formGroup} ${styles.fullWidth}`}>
          <label>
            Productos incluidos <span className={styles.required}>*</span>
          </label>
          <button
            type="button"
            onClick={() => setShowSelectorProductos(true)}
            className={styles.btnSelector}
          >
            {formData.productos_ids.length > 0
              ? `${formData.productos_ids.length} producto(s) seleccionado(s)`
              : "Seleccionar productos"}
          </button>
          {formData.productos_ids.length > 0 && (
            <p className={styles.hint}>
              IDs: {formData.productos_ids.slice(0, 3).join(", ")}
              {formData.productos_ids.length > 3 && "..."}
            </p>
          )}
        </div>

        {/* Descuento - Siempre obligatorio y solo por porcentaje */}
        {!["2x1", "3x2"].includes(formData.tipo) && (
          <div className={styles.formGroup}>
            <label htmlFor="descuento_valor">
              Descuento (%)
              <span className={styles.required}> *</span>
            </label>
            <input
              type="number"
              id="descuento_valor"
              name="descuento_valor"
              value={formData.descuento_valor}
              onChange={handleChange}
              required
              min="0.01"
              max="100"
              step="0.01"
              placeholder="Ej: 15 o 15.5"
              className={styles.input}
            />
            <p className={styles.hint}>
              El descuento se calculará como porcentaje sobre el precio total de los productos (puedes usar decimales, ej: 15.5%)
            </p>
          </div>
        )}

        {/* Cantidades */}
        <div className={styles.formGroup}>
          <label htmlFor="cantidad_minima">Cantidad Mínima</label>
          <input
            type="number"
            id="cantidad_minima"
            name="cantidad_minima"
            value={formData.cantidad_minima}
            onChange={handleChange}
            min="1"
            className={styles.input}
          />
        </div>

        <div className={styles.formGroup}>
          <label htmlFor="cantidad_maxima">Cantidad Máxima (Opcional)</label>
          <input
            type="number"
            id="cantidad_maxima"
            name="cantidad_maxima"
            value={formData.cantidad_maxima || ""}
            onChange={handleChange}
            min="1"
            className={styles.input}
          />
        </div>

        {/* Fechas - Ahora obligatorias */}
        <div className={styles.formGroup}>
          <label htmlFor="fecha_inicio">
            Fecha de Inicio <span className={styles.required}>*</span>
          </label>
          <input
            type="datetime-local"
            id="fecha_inicio"
            name="fecha_inicio"
            value={formData.fecha_inicio}
            onChange={handleChange}
            required
            className={styles.input}
          />
          <p className={styles.hint}>Fecha y hora en que la promoción estará activa</p>
        </div>

        <div className={styles.formGroup}>
          <label htmlFor="fecha_fin">
            Fecha de Fin <span className={styles.required}>*</span>
          </label>
          <input
            type="datetime-local"
            id="fecha_fin"
            name="fecha_fin"
            value={formData.fecha_fin}
            onChange={handleChange}
            required
            min={formData.fecha_inicio}
            className={styles.input}
          />
          <p className={styles.hint}>
            La promoción expirará en esta fecha. Crea urgencia en tus clientes!
          </p>
        </div>

        {/* Personalización Visual */}
        <div className={styles.formGroup}>
          <label htmlFor="icono">Icono</label>
          <div className={styles.iconGrid}>
            {ICONOS.map((icon) => (
              <button
                key={icon}
                type="button"
                onClick={() =>
                  setFormData((prev) => ({ ...prev, icono: icon }))
                }
                className={`${styles.iconBtn} ${
                  formData.icono === icon ? styles.active : ""
                }`}
              >
                {icon}
              </button>
            ))}
          </div>
        </div>

        <div className={styles.formGroup}>
          <label htmlFor="color_badge">Color del Badge</label>
          <input
            type="color"
            id="color_badge"
            name="color_badge"
            value={formData.color_badge}
            onChange={handleChange}
            className={styles.colorPicker}
          />
        </div>

        <div className={styles.formGroup}>
          <label htmlFor="posicion_orden">Orden de Visualización</label>
          <input
            type="number"
            id="posicion_orden"
            name="posicion_orden"
            value={formData.posicion_orden}
            onChange={handleChange}
            min="0"
            className={styles.input}
          />
        </div>

        {/* Estado */}
        <div className={styles.formGroup}>
          <label className={styles.checkboxLabel}>
            <input
              type="checkbox"
              name="activo"
              checked={formData.activo}
              onChange={handleChange}
              className={styles.checkbox}
            />
            <span>Promoción activa</span>
          </label>
        </div>
      </div>

      {/* Botones */}
      <div className={styles.formActions}>
        <button
          type="button"
          onClick={onCancelar}
          className={styles.btnCancelar}
          disabled={loading}
        >
          Cancelar
        </button>
        <button
          type="submit"
          className={styles.btnGuardar}
          disabled={
            loading ||
            formData.productos_ids.length === 0 ||
            !formData.descuento_valor ||
            !formData.fecha_inicio ||
            !formData.fecha_fin
          }
        >
          {loading ? "Guardando..." : promocion ? "Actualizar" : "Crear Promoción"}
        </button>
      </div>

      {/* Selector de Productos Modal */}
      {showSelectorProductos && (
        <SelectorProductos
          productosSeleccionados={formData.productos_ids}
          onConfirmar={handleProductosSeleccionados}
          onCancelar={() => setShowSelectorProductos(false)}
        />
      )}
    </form>
  );
}
