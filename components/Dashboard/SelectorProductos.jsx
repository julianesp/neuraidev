"use client";

import { useState, useEffect } from "react";
import styles from "./SelectorProductos.module.scss";

// ¿La promoción sigue en pie? (activa y sin terminar; las programadas a futuro
// también cuentan para no repetir productos)
function promocionEnCurso(p, ahora) {
  if (!p.activo) return false;
  if (p.fecha_fin && new Date(p.fecha_fin).getTime() <= ahora) return false;
  return true;
}

export default function SelectorProductos({
  productosSeleccionados = [],
  promocionId = null, // la que se está editando: sus productos no se bloquean
  onConfirmar,
  onCancelar,
}) {
  const [productos, setProductos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [seleccionados, setSeleccionados] = useState(productosSeleccionados);
  const [busqueda, setBusqueda] = useState("");
  // id de producto → nombre de la otra promoción en la que ya está
  const [enPromocion, setEnPromocion] = useState(new Map());

  useEffect(() => {
    cargarProductos();
    cargarPromociones();
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

  const cargarPromociones = async () => {
    try {
      const res = await fetch("/api/promociones");
      const data = await res.json();
      const ahora = Date.now();
      const mapa = new Map();
      (data.promociones || [])
        .filter((p) => String(p.id) !== String(promocionId) && promocionEnCurso(p, ahora))
        .forEach((p) =>
          (p.productos_ids || []).forEach((id) => {
            if (!mapa.has(String(id))) mapa.set(String(id), p.nombre);
          }),
        );
      setEnPromocion(mapa);
    } catch (error) {
      console.error("Error al cargar promociones:", error);
    }
  };

  const toggleProducto = (id) => {
    setSeleccionados((prev) =>
      prev.includes(id) ? prev.filter((p) => p !== id) : [...prev, id],
    );
  };

  const productosFiltrados = productos.filter((p) =>
    (p.nombre || "").toLowerCase().includes(busqueda.toLowerCase()),
  );

  // Los elegidos, en el orden en que se marcaron, para mostrarlos bajo el buscador
  const porId = new Map(productos.map((p) => [String(p.id), p]));
  const elegidos = seleccionados.map((id) => ({
    id,
    producto: porId.get(String(id)),
  }));

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

        {/* Productos elegidos, justo debajo del buscador */}
        {elegidos.length > 0 && (
          <div className={styles.elegidos}>
            {elegidos.map(({ id, producto }) => (
              <span key={id} className={styles.chip}>
                {producto?.imagen_principal && (
                  <img src={producto.imagen_principal} alt="" />
                )}
                <span className={styles.chipNombre}>
                  {producto?.nombre || `Producto ${id}`}
                </span>
                <button
                  type="button"
                  onClick={() => toggleProducto(id)}
                  className={styles.chipQuitar}
                  aria-label={`Quitar ${producto?.nombre || "producto"}`}
                >
                  ×
                </button>
              </span>
            ))}
          </div>
        )}

        <div className={styles.lista}>
          {loading ? (
            <p>Cargando productos...</p>
          ) : productosFiltrados.length === 0 ? (
            <p>No se encontraron productos</p>
          ) : (
            productosFiltrados.map((producto) => {
              const marcado = seleccionados.includes(producto.id);
              const otraPromo = enPromocion.get(String(producto.id));
              // Bloqueado si ya está en otra promoción (salvo que ya estuviera
              // marcado: así se puede quitar)
              const bloqueado = !!otraPromo && !marcado;
              return (
                <label
                  key={producto.id}
                  className={`${styles.productoItem} ${marcado ? styles.marcado : ""} ${
                    bloqueado ? styles.bloqueado : ""
                  }`}
                  title={bloqueado ? `Ya está en la promoción "${otraPromo}"` : undefined}
                >
                  <input
                    type="checkbox"
                    checked={marcado}
                    disabled={bloqueado}
                    onChange={() => toggleProducto(producto.id)}
                  />
                  <div className={styles.productoInfo}>
                    {producto.imagen_principal && (
                      <img src={producto.imagen_principal} alt={producto.nombre} />
                    )}
                    <div>
                      <p className={styles.nombre}>{producto.nombre}</p>
                      <p className={styles.precio}>${Number(producto.precio).toLocaleString("es-CO")}</p>
                      {otraPromo && (
                        <p className={styles.yaEnPromo}>Ya está en: {otraPromo}</p>
                      )}
                    </div>
                  </div>
                </label>
              );
            })
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
