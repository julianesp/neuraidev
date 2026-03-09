"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import styles from "./PromocionesDestacadas.module.scss";

export default function PromocionesDestacadas() {
  const [promociones, setPromociones] = useState([]);
  const [productos, setProductos] = useState({});
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    cargarPromociones();
  }, []);

  const cargarPromociones = async () => {
    try {
      // Cargar promociones activas
      const response = await fetch("/api/promociones?activas=true");
      const data = await response.json();

      if (data.success && data.promociones.length > 0) {
        setPromociones(data.promociones);

        // Cargar información de productos
        const productosIds = data.promociones.flatMap(p => p.productos_ids);
        await cargarProductos(productosIds);
      }
    } catch (error) {
      console.error("Error al cargar promociones:", error);
    } finally {
      setLoading(false);
    }
  };

  const cargarProductos = async (productosIds) => {
    try {
      const supabase = (await import('@/lib/db')).getSupabaseBrowserClient();
      const { data, error } = await supabase
        .from('products')
        .select('id, nombre, precio, precio_oferta, imagen_principal, imagenes')
        .in('id', productosIds);

      if (!error && data) {
        const productosMap = {};
        data.forEach(p => {
          productosMap[p.id] = p;
        });
        setProductos(productosMap);
      }
    } catch (error) {
      console.error("Error al cargar productos:", error);
    }
  };

  const calcularDescuento = (promo) => {
    if (promo.tipo === '2x1') return '2×1';
    if (promo.tipo === '3x2') return '3×2';
    // Siempre es porcentaje ahora
    return `-${promo.descuento_valor}%`;
  };

  const calcularPrecioCombo = (promo) => {
    // Calcular precio sumando productos
    let precioTotal = 0;
    promo.productos_ids.forEach(id => {
      const producto = productos[id];
      if (producto) {
        precioTotal += producto.precio_oferta || producto.precio;
      }
    });

    // Aplicar descuento por porcentaje
    return precioTotal * (1 - promo.descuento_valor / 100);
  };

  const calcularAhorro = (promo) => {
    let precioOriginal = 0;
    promo.productos_ids.forEach(id => {
      const producto = productos[id];
      if (producto) {
        precioOriginal += producto.precio_oferta || producto.precio;
      }
    });

    const precioFinal = calcularPrecioCombo(promo);
    return precioOriginal - precioFinal;
  };

  const handleVerPromocion = (promo) => {
    // Redirigir a la página de checkout de la promoción
    router.push(`/promocion/${promo.id}`);
  };

  // Si no hay promociones o está cargando, no mostrar nada
  if (loading || promociones.length === 0) {
    return null;
  }

  return (
    <section className={styles.container}>
      <div className={styles.header}>
        <h2 className={styles.title}>
          <span className={styles.icon}>🎁</span>
          Promociones Especiales
        </h2>
        <p className={styles.subtitle}>
          Aprovecha estas ofertas exclusivas por tiempo limitado
        </p>
      </div>

      <div className={styles.grid}>
        {promociones.map((promo, index) => (
          <motion.div
            key={promo.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: index * 0.1 }}
            className={styles.card}
            onClick={() => handleVerPromocion(promo)}
          >
            {/* Badge de tipo de promoción */}
            <div
              className={styles.badge}
              style={{ backgroundColor: promo.color_badge }}
            >
              <span className={styles.badgeIcon}>{promo.icono}</span>
              <span className={styles.badgeTexto}>{calcularDescuento(promo)}</span>
            </div>

            {/* Imágenes de productos */}
            <div className={styles.productosImagenes}>
              {promo.productos_ids.slice(0, 3).map((productoId, idx) => {
                const producto = productos[productoId];
                if (!producto) return null;

                const imagen = producto.imagen_principal ||
                              (producto.imagenes && producto.imagenes[0]?.url) ||
                              (Array.isArray(producto.imagenes) && producto.imagenes[0]);

                return (
                  <div
                    key={productoId}
                    className={styles.productoImagen}
                    style={{ zIndex: 3 - idx }}
                  >
                    {imagen ? (
                      <img src={imagen} alt={producto.nombre} />
                    ) : (
                      <div className={styles.noImagen}>📦</div>
                    )}
                  </div>
                );
              })}
              {promo.productos_ids.length > 3 && (
                <div className={styles.masProductos}>
                  +{promo.productos_ids.length - 3}
                </div>
              )}
            </div>

            {/* Información de la promoción */}
            <div className={styles.info}>
              <h3 className={styles.nombre}>{promo.nombre}</h3>
              {promo.descripcion && (
                <p className={styles.descripcion}>{promo.descripcion}</p>
              )}

              {/* Precios */}
              <div className={styles.precios}>
                <div className={styles.precioFinal}>
                  ${Math.round(calcularPrecioCombo(promo)).toLocaleString()}
                </div>
                <div className={styles.ahorro}>
                  Ahorras: ${Math.round(calcularAhorro(promo)).toLocaleString()}
                </div>
              </div>

              {/* Cantidad de productos */}
              <div className={styles.detalle}>
                <span className={styles.cantidadProductos}>
                  {promo.productos_ids.length} {promo.productos_ids.length === 1 ? 'producto' : 'productos'}
                </span>
                {promo.cantidad_minima > 1 && (
                  <span className={styles.minimo}>
                    Mín. {promo.cantidad_minima} unidades
                  </span>
                )}
              </div>

              {/* Fecha de expiración */}
              {promo.fecha_fin && (
                <div className={styles.expira}>
                  ⏰ Válido hasta: {new Date(promo.fecha_fin).toLocaleDateString('es-CO', {
                    day: 'numeric',
                    month: 'short',
                    year: 'numeric'
                  })}
                </div>
              )}

              {/* Botón CTA */}
              <button className={styles.btnVerMas}>
                Ver productos →
              </button>
            </div>
          </motion.div>
        ))}
      </div>
    </section>
  );
}
