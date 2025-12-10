"use client";

import { useState, useEffect } from "react";
import { useToast } from "@/contexts/ToastContext";
import { useCart } from "@/context/CartContext";
import { useRouter } from "next/navigation";
import styles from "./MisFavoritos.module.scss";
import {
  HeartIcon,
  ShoppingCartIcon,
  TrashIcon,
} from "@heroicons/react/24/outline";
import { HeartIcon as HeartIconSolid } from "@heroicons/react/24/solid";

export default function MisFavoritos() {
  const toast = useToast();
  const { addToCart } = useCart();
  const router = useRouter();
  const [favoritos, setFavoritos] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadFavoritos();
  }, []);

  const loadFavoritos = async () => {
    try {
      const response = await fetch("/api/perfil/favoritos");
      if (response.ok) {
        const data = await response.json();
        console.log("📦 Favoritos cargados:", data);
        setFavoritos(data);
      }
    } catch (error) {
      console.error("Error al cargar favoritos:", error);
      toast.error("Error al cargar favoritos");
    } finally {
      setLoading(false);
    }
  };

  const handleRemove = async (productoId) => {
    try {
      const response = await fetch(`/api/perfil/favoritos/${productoId}`, {
        method: "DELETE",
      });

      if (response.ok) {
        toast.success("Producto eliminado de favoritos");
        loadFavoritos();
      } else {
        throw new Error("Error al eliminar favorito");
      }
    } catch (error) {
      console.error("Error:", error);
      toast.error("No se pudo eliminar de favoritos");
    }
  };

  const handleAddToCart = async (producto) => {
    const success = await addToCart(producto, 1);
    if (success) {
      toast.success(`${producto.nombre} agregado al carrito`);
    }
  };

  const handleViewProduct = (id) => {
    router.push(`/producto/${id}`);
  };

  if (loading) {
    return <div className={styles.loading}>Cargando favoritos...</div>;
  }

  return (
    <div className={styles.misFavoritos}>
      <div className={styles.header}>
        <h2 className={styles.title}>
          <HeartIconSolid className={styles.titleIcon} />
          Mis Favoritos
        </h2>
        <span className={styles.count}>
          {favoritos.length} {favoritos.length === 1 ? "producto" : "productos"}
        </span>
      </div>

      {favoritos.length === 0 ? (
        <div className={styles.empty}>
          <HeartIcon className={styles.emptyIcon} />
          <p>No tienes productos favoritos</p>
          <button
            onClick={() => router.push("/")}
            className={styles.btnPrimary}
          >
            Explorar Productos
          </button>
        </div>
      ) : (
        <div className={styles.grid}>
          {favoritos.map((item) => {
            const producto = item.producto || {};

            console.log(`🔍 Item ${item.id}:`, { item, producto });

            // Procesar imagen: puede ser string, array, o JSON string
            let imagen = null;
            if (producto.imagen) {
              imagen = producto.imagen;
            } else if (producto.imagenes) {
              try {
                // Si es string JSON, parsear
                const imgArray =
                  typeof producto.imagenes === "string"
                    ? JSON.parse(producto.imagenes)
                    : producto.imagenes;
                imagen = imgArray?.[0]?.url || imgArray?.[0];
              } catch (e) {
                imagen = producto.imagenes;
              }
            }

            const precioActual = parseFloat(producto.precio?.toString() || 0);
            const precioAlAgregar = parseFloat(item.precio_al_agregar || 0);
            const cambioPrecio = precioActual !== precioAlAgregar;

            return (
              <div key={item.id} className={styles.card}>
                {cambioPrecio && precioActual < precioAlAgregar && (
                  <div className={styles.priceDropBadge}>¡Precio reducido!</div>
                )}

                <div
                  className={styles.imageContainer}
                  onClick={() => handleViewProduct(producto.id)}
                >
                  {imagen ? (
                    <img
                      src={imagen}
                      alt={producto.nombre}
                      className={styles.image}
                      onError={(e) => {
                        console.error("Error cargando imagen:", imagen);
                        e.target.style.display = "none";
                      }}
                    />
                  ) : (
                    <div className={styles.imagePlaceholder}>📦 Sin imagen</div>
                  )}
                </div>

                <div className={styles.content}>
                  <h3
                    className={styles.productName}
                    onClick={() => handleViewProduct(producto.id)}
                  >
                    {producto.nombre}
                  </h3>

                  <div className={styles.priceSection}>
                    <div className={styles.currentPrice}>
                      ${precioActual?.toLocaleString()}
                    </div>
                    {cambioPrecio && (
                      <div className={styles.oldPrice}>
                        ${precioAlAgregar?.toLocaleString()}
                      </div>
                    )}
                  </div>

                  <div className={styles.stock}>
                    {producto.stock > 0 ? (
                      <span className={styles.inStock}>
                        En stock ({producto.stock} unidades)
                      </span>
                    ) : (
                      <span className={styles.outOfStock}>Agotado</span>
                    )}
                  </div>

                  <div className={styles.actions}>
                    <button
                      onClick={() => handleAddToCart(producto)}
                      disabled={producto.stock === 0}
                      className={styles.btnCart}
                    >
                      <ShoppingCartIcon className={styles.icon} />
                      Agregar al Carrito
                    </button>
                    <button
                      onClick={() => handleRemove(item.producto_id)}
                      className={styles.btnRemove}
                      title="Eliminar de favoritos"
                    >
                      <TrashIcon className={styles.icon} />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
