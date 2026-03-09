"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { motion } from "framer-motion";
import styles from "./promocion.module.scss";
import { useCart } from "@/context/CartContext";

export default function PromocionCheckoutPage() {
  const params = useParams();
  const router = useRouter();
  const { addToCart, toggleCart } = useCart();

  const [promocion, setPromocion] = useState(null);
  const [productos, setProductos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [agregando, setAgregando] = useState(false);

  useEffect(() => {
    cargarPromocion();
  }, [params.id]);

  const cargarPromocion = async () => {
    try {
      // Cargar promoción
      const resPromo = await fetch(`/api/promociones/${params.id}`);
      const dataPromo = await resPromo.json();

      if (!dataPromo.success) {
        router.push('/');
        return;
      }

      setPromocion(dataPromo.promocion);

      // Cargar productos
      const supabase = (await import('@/lib/db')).getSupabaseBrowserClient();
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .in('id', dataPromo.promocion.productos_ids);

      if (!error && data) {
        setProductos(data);
      }
    } catch (error) {
      console.error("Error al cargar promoción:", error);
      router.push('/');
    } finally {
      setLoading(false);
    }
  };

  const calcularPrecioOriginal = () => {
    return productos.reduce((sum, p) => sum + (p.precio_oferta || p.precio), 0);
  };

  const calcularDescuento = () => {
    const precioOriginal = calcularPrecioOriginal();
    // Siempre es descuento por porcentaje
    return precioOriginal * (promocion.descuento_valor / 100);
  };

  const calcularPrecioFinal = () => {
    return calcularPrecioOriginal() - calcularDescuento();
  };

  const handleAgregarAlCarrito = async () => {
    setAgregando(true);

    try {
      // Calcular el precio original total de todos los productos
      const precioOriginalTotal = productos.reduce(
        (sum, p) => sum + (p.precio_oferta || p.precio),
        0
      );

      // Calcular el precio con descuento total
      const precioConDescuentoTotal = precioOriginalTotal * (1 - promocion.descuento_valor / 100);

      // Calcular el factor de descuento para aplicar proporcionalmente a cada producto
      const factorDescuento = precioConDescuentoTotal / precioOriginalTotal;

      // Agregar todos los productos al carrito con el precio con descuento
      for (const producto of productos) {
        const precioOriginal = producto.precio_oferta || producto.precio;
        const precioConDescuento = Math.round(precioOriginal * factorDescuento);

        // Crear una copia del producto con el precio con descuento
        const productoConDescuento = {
          ...producto,
          precio: precioConDescuento,
          precio_original: precioOriginal, // Guardar el precio original por referencia
        };

        await addToCart(productoConDescuento, 1);
      }

      // Abrir el modal del carrito
      toggleCart();
    } catch (error) {
      console.error("Error al agregar productos:", error);
      alert("Error al agregar productos al carrito");
    } finally {
      setAgregando(false);
    }
  };

  if (loading) {
    return (
      <div className={styles.loading}>
        <div className={styles.spinner}></div>
        <p>Cargando promoción...</p>
      </div>
    );
  }

  if (!promocion) {
    return null;
  }

  const fechaFin = new Date(promocion.fecha_fin);
  const hoy = new Date();
  const diasRestantes = Math.ceil((fechaFin - hoy) / (1000 * 60 * 60 * 24));

  return (
    <div className={styles.container}>
      <div className={styles.content}>
        {/* Header de la promoción */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className={styles.header}
        >
          <div className={styles.badge} style={{ backgroundColor: promocion.color_badge }}>
            <span className={styles.icon}>{promocion.icono}</span>
            <span className={styles.badgeText}>
              -{promocion.descuento_valor}%
            </span>
          </div>

          <h1 className={styles.titulo}>{promocion.nombre}</h1>
          {promocion.descripcion && (
            <p className={styles.descripcion}>{promocion.descripcion}</p>
          )}

          {/* Contador de tiempo */}
          <div className={styles.tiempoRestante}>
            <span className={styles.reloj}>⏰</span>
            <span className={styles.tiempo}>
              {diasRestantes > 0
                ? `¡Solo ${diasRestantes} ${diasRestantes === 1 ? 'día' : 'días'} restantes!`
                : '¡Última oportunidad!'}
            </span>
            <span className={styles.fecha}>
              Válido hasta: {fechaFin.toLocaleDateString('es-CO', {
                day: 'numeric',
                month: 'long',
                year: 'numeric'
              })}
            </span>
          </div>
        </motion.div>

        {/* Lista de productos */}
        <div className={styles.productos}>
          <h2 className={styles.subtitulo}>Productos incluidos en esta promoción:</h2>

          {productos.map((producto, index) => {
            const imagen = producto.imagen_principal ||
                          (producto.imagenes && producto.imagenes[0]?.url) ||
                          (Array.isArray(producto.imagenes) && producto.imagenes[0]);

            return (
              <motion.div
                key={producto.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
                className={styles.productoCard}
              >
                <div className={styles.productoImagen}>
                  {imagen ? (
                    <img src={imagen} alt={producto.nombre} />
                  ) : (
                    <div className={styles.noImagen}>📦</div>
                  )}
                </div>

                <div className={styles.productoInfo}>
                  <h3 className={styles.productoNombre}>{producto.nombre}</h3>
                  {producto.descripcion && (
                    <p className={styles.productoDescripcion}>
                      {producto.descripcion.substring(0, 150)}...
                    </p>
                  )}

                  <div className={styles.productoPrecio}>
                    <span className={styles.precioTachado}>
                      ${(producto.precio_oferta || producto.precio).toLocaleString()}
                    </span>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>

        {/* Resumen de precios */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className={styles.resumen}
        >
          <div className={styles.resumenCard}>
            <h2 className={styles.resumenTitulo}>Resumen de tu compra</h2>

            <div className={styles.resumenLinea}>
              <span>Precio original:</span>
              <span className={styles.precioOriginal}>
                ${calcularPrecioOriginal().toLocaleString()}
              </span>
            </div>

            <div className={styles.resumenLinea}>
              <span>Descuento aplicado:</span>
              <span className={styles.descuento}>
                -${calcularDescuento().toLocaleString()}
              </span>
            </div>

            <div className={styles.separador}></div>

            <div className={styles.resumenTotal}>
              <span>Total a pagar:</span>
              <span className={styles.total}>
                ${Math.round(calcularPrecioFinal()).toLocaleString()}
              </span>
            </div>

            <div className={styles.ahorro}>
              ¡Ahorras ${Math.round(calcularDescuento()).toLocaleString()}!
            </div>

            <button
              onClick={handleAgregarAlCarrito}
              disabled={agregando}
              className={styles.btnAgregar}
            >
              {agregando ? 'Agregando...' : 'Agregar al carrito y continuar'}
            </button>

            <button
              onClick={() => router.push('/')}
              className={styles.btnVolver}
            >
              Volver al inicio
            </button>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
