"use client";

import { useState, useEffect } from "react";
import { useUser } from "@clerk/nextjs";
import { useRouter } from "next/navigation";
import { useToast } from "@/contexts/ToastContext";
import { HeartIcon } from "@heroicons/react/24/outline";
import { HeartIcon as HeartIconSolid } from "@heroicons/react/24/solid";
import styles from "./FavoriteButton.module.scss";

/**
 * Componente de botón de favoritos
 * Se puede usar en cualquier vista de producto
 *
 * @param {Object} producto - Objeto del producto
 * @param {string} className - Clases CSS adicionales
 * @param {boolean} showLabel - Mostrar o no el label "Favorito"
 */
export default function FavoriteButton({
  producto,
  className = "",
  showLabel = false,
  size = "medium", // small, medium, large
}) {
  const { isSignedIn } = useUser();
  const router = useRouter();
  const toast = useToast();
  const [isFavorite, setIsFavorite] = useState(false);
  const [loading, setLoading] = useState(false);

  // Debug log - buscar el ID en diferentes propiedades
  const productoId = producto?.id || producto?._id || producto?.producto_id;
  console.log("🔍 FavoriteButton renderizado", {
    productoId,
    productName: producto?.nombre,
    size,
    hasId: !!productoId,
    allKeys: Object.keys(producto || {}).slice(0, 10),
  });

  useEffect(() => {
    if (isSignedIn && productoId) {
      checkIsFavorite();
    }
  }, [isSignedIn, productoId]);

  const checkIsFavorite = async () => {
    try {
      const response = await fetch("/api/perfil/favoritos");
      if (response.ok) {
        const favoritos = await response.json();
        const exists = favoritos.some((fav) => fav.producto_id === productoId);
        setIsFavorite(exists);
      }
    } catch (error) {
      console.error("Error al verificar favorito:", error);
    }
  };

  const toggleFavorite = async (e) => {
    e.preventDefault();
    e.stopPropagation();

    // Validar que el producto tenga ID
    if (!productoId) {
      console.error("❌ Producto sin ID válido:", { producto, productoId });
      toast.error("Error: Producto sin ID válido", { title: "Error" });
      return;
    }

    // Si no está autenticado, redirigir a login
    if (!isSignedIn) {
      toast.warning("Debes iniciar sesión para agregar favoritos", {
        title: "Inicia Sesión",
      });
      router.push(`/sign-in?redirect_url=/producto/${productoId}`);
      return;
    }

    setLoading(true);

    try {
      if (isFavorite) {
        // Eliminar de favoritos
        console.log(`🗑️ Eliminando favorito del producto: ${productoId}`);
        const response = await fetch(`/api/perfil/favoritos/${productoId}`, {
          method: "DELETE",
        });

        const data = await response.json();
        console.log("📤 Respuesta DELETE:", data);

        if (response.ok) {
          setIsFavorite(false);
          toast.success("Producto eliminado de favoritos");
        } else {
          throw new Error(data.error || "Error al eliminar favorito");
        }
      } else {
        // Agregar a favoritos
        console.log(`❤️ Agregando favorito del producto: ${productoId}`);
        const response = await fetch("/api/perfil/favoritos", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            producto_id: productoId,
            precio: producto.precio,
          }),
        });

        const data = await response.json();
        console.log("📤 Respuesta POST:", data);

        if (response.ok) {
          setIsFavorite(true);
          toast.success("Producto agregado a favoritos", {
            title: "¡Guardado!",
          });
        } else {
          if (data.error === "El producto ya está en favoritos") {
            setIsFavorite(true);
          } else {
            throw new Error(data.error || "Error al agregar favorito");
          }
        }
      }
    } catch (error) {
      console.error("❌ Error en toggleFavorite:", error);
      toast.error(
        isFavorite
          ? "No se pudo eliminar de favoritos"
          : "No se pudo agregar a favoritos",
        { title: "Error" },
      );
    } finally {
      setLoading(false);
    }
  };

  const Icon = isFavorite ? HeartIconSolid : HeartIcon;

  return (
    <button
      onClick={toggleFavorite}
      disabled={loading}
      className={`${styles.favoriteButton} ${styles[size]} ${
        isFavorite ? styles.active : ""
      } ${className}`}
      title={isFavorite ? "Quitar de favoritos" : "Agregar a favoritos"}
      aria-label={isFavorite ? "Quitar de favoritos" : "Agregar a favoritos"}
    >
      <Icon className={`${styles.icon} ${loading ? styles.loading : ""}`} />
      {showLabel && (
        <span className={styles.label}>
          {isFavorite ? "En Favoritos" : "Favorito"}
        </span>
      )}
    </button>
  );
}
