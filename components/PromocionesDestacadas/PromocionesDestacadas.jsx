"use client";

import { useState, useEffect } from "react";
import { ShoppingCart, Check } from "lucide-react";
import ProductoCoverflow from "@/components/Producto/ProductoCoverflow";
import coverflowStyles from "@/components/Producto/ProductoCoverflow.module.scss";
import { useCart } from "@/context/CartContext";
import { useToast } from "@/contexts/ToastContext";
import styles from "./PromocionesDestacadas.module.scss";

export default function PromocionesDestacadas() {
  const [promociones, setPromociones] = useState([]);
  const [productos, setProductos] = useState({});
  const [loading, setLoading] = useState(true);
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

  const calcularAhorro = (promo) =>
    (promo.precio_total || 0) - (promo.precio_promocion || 0);

  // Imagen de la promo: la del primer producto incluido
  const imagenPromo = (promo) => {
    const producto = productos[promo.productos_ids?.[0]] || promo.productos?.[0];
    if (!producto) return "https://placehold.co/400x400/e5e7eb/9ca3af?text=Promoci%C3%B3n";
    const primera = Array.isArray(producto.imagenes) ? producto.imagenes[0] : null;
    return (
      producto.imagen_principal ||
      (typeof primera === "string" ? primera : primera?.url) ||
      "https://placehold.co/400x400/e5e7eb/9ca3af?text=Promoci%C3%B3n"
    );
  };

  const formato = (n) => `$${Math.round(n || 0).toLocaleString("es-CO")}`;

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

  // Si no hay promociones o está cargando, no mostrar nada
  if (loading || promociones.length === 0) {
    return null;
  }

  // Mismo coverflow que Destacados y Nuevos; avanza solo cada 3 s, con
  // flechas y botón de pausa.
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

      <ProductoCoverflow
        productos={promociones}
        etiqueta="promociones"
        autoAvance={3000}
        getImagen={imagenPromo}
        getHref={(promo) => `/promocion/${promo.id}`}
        renderBadgeIzq={(promo) => (
          <div className={styles.badge}>
            {promo.icono && <span>{promo.icono}</span>}
            {calcularDescuento(promo)}
          </div>
        )}
        renderPrecio={(promo) => {
          const ahorro = calcularAhorro(promo);
          const unidades = Number(promo.unidades) || 1;
          return (
            <div className={styles.precioInfo}>
              {promo.descripcion && (
                <p className={styles.descripcion}>{promo.descripcion}</p>
              )}
              <div className={styles.precios}>
                <span className={styles.precioFinal}>
                  {formato(promo.precio_promocion)}
                </span>
                {ahorro > 0 && (
                  <span className={styles.precioAntes}>
                    {formato(promo.precio_total)}
                  </span>
                )}
              </div>
              {ahorro > 0 && (
                <p className={styles.ahorro}>
                  Ahorras {formato(ahorro)}
                  {unidades > 1 ? ` llevando ${unidades}` : ""}
                </p>
              )}
              {(promo.cantidad_minima > 1 || promo.cantidad_maxima) && (
                <p className={styles.minimo}>
                  {promo.cantidad_maxima
                    ? `De ${promo.cantidad_minima} a ${promo.cantidad_maxima} unidades`
                    : `Mín. ${promo.cantidad_minima} unidades`}
                </p>
              )}
            </div>
          );
        }}
        renderAccion={(promo) => (
          <button
            type="button"
            className={coverflowStyles.botonAccion}
            onClick={(e) => agregarAlCarrito(e, promo)}
          >
            {agregada === promo.id ? (
              <>
                <Check /> Agregado
              </>
            ) : (
              <>
                <ShoppingCart /> Agregar
              </>
            )}
          </button>
        )}
      />
    </section>
  );
}
