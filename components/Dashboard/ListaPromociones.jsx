"use client";

import styles from "./ListaPromociones.module.scss";

export default function ListaPromociones({ promociones, onEditar, onEliminar }) {
  if (promociones.length === 0) {
    return (
      <div className={styles.empty}>
        <div className={styles.emptyIcon}>🎁</div>
        <h3>No hay promociones creadas</h3>
        <p>Crea tu primera promoción para empezar a ofrecer descuentos y combos especiales</p>
      </div>
    );
  }

  const formatearFecha = (fecha) => {
    if (!fecha) return null;
    return new Date(fecha).toLocaleDateString('es-CO', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const TIPO_LABELS = {
    combo: 'Combo',
    descuento_porcentaje: 'Descuento %',
    descuento_fijo: 'Descuento Fijo',
    '2x1': '2×1',
    '3x2': '3×2',
  };

  return (
    <div className={styles.grid}>
      {promociones.map((promo) => (
        <div key={promo.id} className={styles.card}>
          <div className={styles.cardHeader}>
            <div className={styles.badge} style={{ backgroundColor: promo.color_badge }}>
              <span className={styles.icono}>{promo.icono}</span>
              <span className={styles.tipo}>{TIPO_LABELS[promo.tipo]}</span>
            </div>
            <div className={styles.estado}>
              <span className={`${styles.estadoBadge} ${promo.activo ? styles.activo : styles.inactivo}`}>
                {promo.activo ? '✓ Activa' : '○ Inactiva'}
              </span>
            </div>
          </div>

          <div className={styles.cardBody}>
            <h3 className={styles.nombre}>{promo.nombre}</h3>
            {promo.descripcion && (
              <p className={styles.descripcion}>{promo.descripcion}</p>
            )}

            <div className={styles.detalles}>
              <div className={styles.detalle}>
                <span className={styles.label}>Productos:</span>
                <span className={styles.valor}>{promo.productos_ids.length}</span>
              </div>

              {promo.descuento_valor > 0 && (
                <div className={styles.detalle}>
                  <span className={styles.label}>Descuento:</span>
                  <span className={styles.valor}>
                    {promo.descuento_tipo === 'porcentaje'
                      ? `${promo.descuento_valor}%`
                      : `$${promo.descuento_valor.toLocaleString()}`}
                  </span>
                </div>
              )}

              {promo.precio_combo && (
                <div className={styles.detalle}>
                  <span className={styles.label}>Precio combo:</span>
                  <span className={styles.valor}>${promo.precio_combo.toLocaleString()}</span>
                </div>
              )}

              {promo.fecha_inicio && (
                <div className={styles.detalle}>
                  <span className={styles.label}>Inicio:</span>
                  <span className={styles.valorFecha}>{formatearFecha(promo.fecha_inicio)}</span>
                </div>
              )}

              {promo.fecha_fin && (
                <div className={styles.detalle}>
                  <span className={styles.label}>Fin:</span>
                  <span className={styles.valorFecha}>{formatearFecha(promo.fecha_fin)}</span>
                </div>
              )}
            </div>
          </div>

          <div className={styles.cardActions}>
            <button onClick={() => onEditar(promo)} className={styles.btnEditar}>
              ✏️ Editar
            </button>
            <button onClick={() => onEliminar(promo.id)} className={styles.btnEliminar}>
              🗑️ Eliminar
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}
