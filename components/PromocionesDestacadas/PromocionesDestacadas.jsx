"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { ShoppingCart, Check } from "lucide-react";
import { useCart } from "@/context/CartContext";
import { useToast } from "@/contexts/ToastContext";
import styles from "./PromocionesDestacadas.module.scss";
import usePistaRebote from "./usePistaRebote";

export default function PromocionesDestacadas() {
  const [promociones, setPromociones] = useState([]);
  const [productos, setProductos] = useState({});
  const [loading, setLoading] = useState(true);
  const pistaRef = useRef(null);
  const router = useRouter();
  const { addToCart } = useCart();
  const toast = useToast();
  // id de la promo recién agregada, para mostrar "Agregado" un momento
  const [agregada, setAgregada] = useState(null);

  useEffect(() => {
    cargarPromociones();
  }, []);

  // /api/promociones ya trae los productos de cada promoción con su precio
  // vigente y su precio en la promo (D1 no se consulta desde el navegador).
  const cargarPromociones = async () => {
    try {
      const response = await fetch("/api/promociones?activas=true");
      const data = await response.json();

      if (data.success) {
        const conProductos = (data.promociones || []).filter(
          (p) => p.productos?.length > 0
        );
        setPromociones(conProductos);
        const productosMap = {};
        conProductos.forEach((p) =>
          p.productos.forEach((prod) => {
            productosMap[prod.id] = prod;
          })
        );
        setProductos(productosMap);
      }
    } catch (error) {
      console.error("Error al cargar promociones:", error);
    } finally {
      setLoading(false);
    }
  };

  const calcularDescuento = (promo) => {
    if (promo.tipo === '2x1') return '2×1';
    if (promo.tipo === '3x2') return '3×2';
    // Siempre es porcentaje ahora
    return `-${promo.descuento_valor}%`;
  };

  const calcularPrecioCombo = (promo) => promo.precio_promocion || 0;

  const calcularAhorro = (promo) =>
    (promo.precio_total || 0) - (promo.precio_promocion || 0);

  // Agrega los productos de la promo con la cantidad mínima que activa el
  // descuento (el carrito calcula el descuento solo). Respeta el stock.
  const agregarAlCarrito = async (e, promo) => {
    e.stopPropagation();
    const unidades = Math.max(1, Number(promo.unidades || promo.cantidad_minima) || 1);
    let agregados = 0;
    let sinStock = 0;
    for (const producto of promo.productos || []) {
      const stock = Number(producto.stock ?? 999);
      if (stock <= 0) {
        sinStock += 1;
        continue;
      }
      await addToCart(producto, Math.min(unidades, stock));
      agregados += 1;
    }

    if (agregados === 0) {
      toast?.warning?.("Los productos de esta promoción están agotados", {
        title: "Sin stock",
      });
      return;
    }
    toast?.success?.(
      unidades > 1
        ? `Se agregaron ${unidades} unidades para activar el descuento`
        : "Se agregó al carrito con el descuento",
      { title: promo.nombre, duration: 3000 },
    );
    if (sinStock > 0) {
      toast?.warning?.(`${sinStock} producto(s) de la promoción no tienen stock`, {
        title: "Stock limitado",
      });
    }
    setAgregada(promo.id);
    setTimeout(() => setAgregada((id) => (id === promo.id ? null : id)), 2000);
  };

  const handleVerPromocion = (promo) => {
    // Redirigir a la página de checkout de la promoción
    router.push(`/promocion/${promo.id}`);
  };

  // Las tarjetas van de un lado al otro, chocan y rebotan
  const pistaActiva = usePistaRebote(pistaRef, loading ? 0 : promociones.length);

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

      <div
        ref={pistaRef}
        className={`${styles.pista} ${pistaActiva ? styles.pistaActiva : ""}`}
        aria-label="Promociones"
      >
        {promociones.map((promo, index) => (
          <div key={promo.id} className={styles.movil} data-rebote>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: index * 0.1 }}
            className={styles.card}
            onClick={() => handleVerPromocion(promo)}
          >
            {/* Badge de tipo de promoción */}
            <div
              className={styles.badge}
              style={{ backgroundColor: "#2563eb" }}
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
                  ${Math.round(calcularPrecioCombo(promo)).toLocaleString("es-CO")}
                </div>
                <div className={styles.ahorro}>
                  Ahorras: ${Math.round(calcularAhorro(promo)).toLocaleString("es-CO")}
                </div>
              </div>

              {/* Cantidad de productos */}
              <div className={styles.detalle}>
                <span className={styles.cantidadProductos}>
                  {promo.productos_ids.length} {promo.productos_ids.length === 1 ? 'producto' : 'productos'}
                </span>
                {(promo.cantidad_minima > 1 || promo.cantidad_maxima) && (
                  <span className={styles.minimo}>
                    {promo.cantidad_maxima
                      ? `De ${promo.cantidad_minima} a ${promo.cantidad_maxima} unidades`
                      : `Mín. ${promo.cantidad_minima} unidades`}
                  </span>
                )}
              </div>

              {/* Botones */}
              <div className={styles.botones}>
                <button
                  type="button"
                  className={styles.btnCarrito}
                  onClick={(e) => agregarAlCarrito(e, promo)}
                >
                  {agregada === promo.id ? (
                    <>
                      <Check size={16} /> Agregado
                    </>
                  ) : (
                    <>
                      <ShoppingCart size={16} />
                      <span className={styles.textoLargo}>Agregar al carrito</span>
                      <span className={styles.textoCorto}>Agregar</span>
                    </>
                  )}
                </button>
                <button type="button" className={styles.btnVerMas}>
                  <span className={styles.textoLargo}>Ver productos →</span>
                  <span className={styles.textoCorto}>Ver →</span>
                </button>
              </div>
            </div>
          </motion.div>
          </div>
        ))}
      </div>
    </section>
  );
}
