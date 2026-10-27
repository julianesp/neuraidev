"use client";

import { useState, useEffect } from "react";
import styles from "./SelectorProductos.module.scss";

export default function SelectorProductos({ productosSeleccionados = [], onConfirmar, onCancelar }) {
  const [productos, setProductos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [seleccionados, setSeleccionados] = useState(productosSeleccionados);
  const [busqueda, setBusqueda] = useState("");

  useEffect(() => {
    cargarProductos();
  }, []);

  // D1 solo se consulta desde el servidor: se usa la API de productos del admin.
  const cargarProductos = async () => {
    try {
      const res = await fetch("/api/productos");
      const data = await res.json();
      const lista = (data.productos || [])
        .filter(
          (p) =>
            (p.disponible === 1 || p.disponible === true) &&
            p.categoria !== "servicios",
        )
        .sort((a, b) => (a.nombre || "").localeCompare(b.nombre || "", "es"));
      setProductos(lista);
    } catch (error) {
      console.error("Error al cargar productos:", error);
    } finally {
      setLoading(false);
    }
  };

  const toggleProducto = (id) => {
    setSeleccionados(prev =>
      prev.includes(id) ? prev.filter(p => p !== id) : [...prev, id]
    );
  };

  const productosFiltrados = productos.filter(p =>
    (p.nombre || "").toLowerCase().includes(busqueda.toLowerCase())
  );

  return (
    <div className={styles.overlay} onClick={onCancelar}>
      <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
        <div className={styles.header}>
          <h3>Seleccionar Productos</h3>
          <button onClick={onCancelar} className={styles.btnCerrar}>×</button>
        </div>

        <input
          type="text"
          placeholder="Buscar productos..."
          value={busqueda}
          onChange={(e) => setBusqueda(e.target.value)}
          className={styles.busqueda}
        />

        <div className={styles.contador}>
          {seleccionados.length} producto(s) seleccionado(s)
        </div>

        <div className={styles.lista}>
          {loading ? (
            <p>Cargando productos...</p>
          ) : productosFiltrados.length === 0 ? (
            <p>No se encontraron productos</p>
          ) : (
            productosFiltrados.map(producto => (
              <label key={producto.id} className={styles.productoItem}>
                <input
                  type="checkbox"
                  checked={seleccionados.includes(producto.id)}
                  onChange={() => toggleProducto(producto.id)}
                />
                <div className={styles.productoInfo}>
                  {producto.imagen_principal && (
                    <img src={producto.imagen_principal} alt={producto.nombre} />
                  )}
                  <div>
                    <p className={styles.nombre}>{producto.nombre}</p>
                    <p className={styles.precio}>${Number(producto.precio).toLocaleString("es-CO")}</p>
                  </div>
                </div>
              </label>
            ))
          )}
        </div>

        <div className={styles.acciones}>
          <button onClick={onCancelar} className={styles.btnCancelar}>
            Cancelar
          </button>
          <button
            onClick={() => onConfirmar(seleccionados)}
            className={styles.btnConfirmar}
            disabled={seleccionados.length === 0}
          >
            Confirmar Selección
          </button>
        </div>
      </div>
    </div>
  );
}
