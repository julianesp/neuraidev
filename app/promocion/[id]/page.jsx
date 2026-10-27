"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { motion } from "framer-motion";
import styles from "./promocion.module.scss";
import { useCart } from "@/context/CartContext";

export default function PromocionCheckoutPage() {
  const params = useParams();
  const router = useRouter();
  const { addToCart, toggleCart, cart } = useCart();

  const [promocion, setPromocion] = useState(null);
  const [productos, setProductos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [agregando, setAgregando] = useState(false);
  // Unidades (o juegos, si es un combo) que el cliente quiere llevar
  const [cantidad, setCantidad] = useState(1);

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
      // La API ya trae los productos con precio vigente y precio en la promo
      // (D1 no se consulta desde el navegador).
      setProductos(dataPromo.promocion.productos || []);
      setCantidad(dataPromo.promocion.unidades || 1);
    } catch (error) {
      console.error("Error al cargar promoción:", error);
      router.push('/');
    } finally {
      setLoading(false);
    }
  };

  // Rango permitido: desde el mínimo de la promoción hasta su máximo, sin
  // pasar de la existencia de cada producto (descontando lo que ya está en
  // el carrito).
  const minimo = promocion?.cantidad_minima || 1;
  const disponible = productos.length
    ? Math.min(
        ...productos.map((p) => {
          const enCarrito = cart
            .filter((i) => String(i.id) === String(p.id))
            .reduce((s, i) => s + i.cantidad, 0);
          return Math.max((Number(p.stock) || 0) - enCarrito, 0);
        })
      )
    : 0;
  const maximo = Math.min(promocion?.cantidad_maxima || Infinity, disponible);
  const sinExistencias = maximo < minimo;
  const cantidadFinal = Math.min(Math.max(cantidad, minimo), Math.max(maximo, minimo));

  // Totales para la cantidad elegida (el descuento por unidad no cambia
  // dentro del rango mínimo–máximo)
  const calcularPrecioOriginal = () =>
    productos.reduce((sum, p) => sum + p.precio, 0) * cantidadFinal;

  const calcularPrecioFinal = () =>
    productos.reduce((sum, p) => sum + p.precio_promocion, 0) * cantidadFinal;

  const calcularDescuento = () => calcularPrecioOriginal() - calcularPrecioFinal();

  const handleAgregarAlCarrito = async () => {
    setAgregando(true);

    try {
      // Se agregan a precio normal en la cantidad que activa la promoción;
      // el carrito y el checkout aplican el descuento automáticamente.
      if (sinExistencias) return;
      for (const producto of productos) {
        await addToCart(producto, cantidadFinal);
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
          <div className={styles.badge} style={{ backgroundColor: "#2563eb" }}>
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
                      ${producto.precio.toLocaleString("es-CO")}
                    </span>{" "}
                    <strong>${producto.precio_promocion.toLocaleString("es-CO")}</strong>
                    {cantidadFinal > 1 && ` c/u × ${cantidadFinal}`}
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

            {/* Cantidad: entre el mínimo y el máximo de la promoción, según existencias */}
            <div className={styles.cantidad}>
              <span>{productos.length > 1 ? "Combos:" : "Unidades:"}</span>
              <div className={styles.cantidadControles}>
                <button
                  type="button"
                  onClick={() => setCantidad(Math.max(cantidadFinal - 1, minimo))}
                  disabled={sinExistencias || cantidadFinal <= minimo}
                  aria-label="Disminuir cantidad"
                >
                  −
                </button>
                <span>{sinExistencias ? 0 : cantidadFinal}</span>
                <button
                  type="button"
                  onClick={() => setCantidad(Math.min(cantidadFinal + 1, maximo))}
                  disabled={sinExistencias || cantidadFinal >= maximo}
                  aria-label="Aumentar cantidad"
                >
                  +
                </button>
              </div>
            </div>
            <p className={styles.cantidadAyuda}>
              {sinExistencias
                ? "No hay existencias suficientes para esta promoción en este momento."
                : `Puedes llevar de ${minimo} a ${maximo} con descuento${
                    promocion.cantidad_maxima && maximo < promocion.cantidad_maxima
                      ? " (según existencias)"
                      : ""
                  }.`}
            </p>

            <div className={styles.resumenLinea}>
              <span>Precio original:</span>
              <span className={styles.precioOriginal}>
                ${calcularPrecioOriginal().toLocaleString("es-CO")}
              </span>
            </div>

            <div className={styles.resumenLinea}>
              <span>Descuento aplicado:</span>
              <span className={styles.descuento}>
                -${calcularDescuento().toLocaleString("es-CO")}
              </span>
            </div>

            <div className={styles.separador}></div>

            <div className={styles.resumenTotal}>
              <span>Total a pagar:</span>
              <span className={styles.total}>
                ${Math.round(calcularPrecioFinal()).toLocaleString("es-CO")}
              </span>
            </div>

            <div className={styles.ahorro}>
              ¡Ahorras ${Math.round(calcularDescuento()).toLocaleString("es-CO")}!
            </div>

            <button
              onClick={handleAgregarAlCarrito}
              disabled={agregando || sinExistencias}
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
