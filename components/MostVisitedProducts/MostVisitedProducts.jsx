"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import styles from "./MostVisitedProducts.module.scss";

export default function MostVisitedProducts() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchMostVisitedProducts();
  }, []);

  const fetchMostVisitedProducts = async () => {
    try {
      // Verificar que estamos en el cliente
      if (typeof window === "undefined") {
        setProducts([]);
        setLoading(false);
        return;
      }

      const response = await fetch("/api/products/most-visited");

      if (!response.ok) {
        console.warn("API response not OK:", response.status);
        // En caso de error, no mostramos nada (componente se oculta)
        setProducts([]);
        setLoading(false);
        return;
      }

      const data = await response.json();

      // La API ya devuelve máximo 10 y mínimo 3 productos reales
      const productsToShow = data.products || [];
      setProducts(productsToShow);
    } catch (error) {
      console.warn("Error fetching most visited products:", error.message);
      // En caso de error, simplemente no mostramos el componente
      setProducts([]);
    } finally {
      setLoading(false);
    }
  };

  // Función para obtener la primera imagen del producto
  const getProductImage = (product) => {
    if (Array.isArray(product.imagenes) && product.imagenes.length > 0) {
      return product.imagenes[0];
    }
    if (typeof product.imagenes === "string") {
      return product.imagenes;
    }
    return "/placeholder-product.jpg";
  };

  // Función para formatear precio
  const formatPrice = (price) => {
    return new Intl.NumberFormat("es-CO", {
      style: "currency",
      currency: "COP",
      minimumFractionDigits: 0,
    }).format(price);
  };

  if (loading) {
    return (
      <section className={styles.container}>
        <div className={styles.header}>
          <h2 className={`${styles.title} text-black dark:text-white`}>
            🔥 Productos Más Visitados
          </h2>
          <p className={`${styles.subtitle} text-black dark:text-white`}>
            Los productos que más están llamando la atención de nuestros
            clientes
          </p>
        </div>
        <div className={styles.gridSkeleton}>
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div
              key={i}
              className={`${styles.skeletonCard} ${styles[`item${i}`]}`}
            >
              <div className={styles.skeletonImage}></div>
              <div className={styles.skeletonText}></div>
            </div>
          ))}
        </div>
      </section>
    );
  }

  if (!products || products.length === 0) {
    return null;
  }

  return (
    <section className={styles.container}>
      <div className={styles.header}>
        <h2 className={styles.title}>
          <span className={styles.fireIcon}>🔥</span>
          Productos Más Visitados
        </h2>
        <p className={styles.subtitle}>
          Los productos que más están llamando la atención de nuestros clientes
        </p>
      </div>

      <div className={styles.grid}>
        {products.map((product, index) => {
          const itemClass = `item${index + 1}`;

          return (
            <Link
              key={product.id}
              href={`/producto/${product.id}`}
              className={`${styles.card} ${styles[itemClass]}`}
            >
              <div className={styles.imageContainer}>
                <Image
                  src={getProductImage(product)}
                  alt={product.nombre}
                  fill
                  sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                  className={styles.image}
                  priority={index < 2}
                />

                {/* Badge de visitas */}
                <div className={styles.badge}>
                  <svg
                    className={styles.badgeIcon}
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                    />
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                    />
                  </svg>
                  {product.metadata?.views_count || product.views_count || 0}
                </div>

                {/* Overlay con degradado */}
                <div className={styles.overlay}></div>
              </div>

              <div className={styles.content}>
                <h3 className={styles.productName}>{product.nombre}</h3>
                <div className={styles.priceContainer}>
                  <span className={styles.price}>
                    {formatPrice(product.precio)}
                  </span>
                  {product.stock > 0 ? (
                    <span className={styles.inStock}>En stock</span>
                  ) : (
                    <span className={styles.outOfStock}>Agotado</span>
                  )}
                </div>
              </div>
            </Link>
          );
        })}
      </div>

      {/* Link para ver todos los productos */}
      {/* <div className={styles.footer}>
        <Link href="/productos" className={styles.viewAllButton}>
          Ver todos los productos
          <svg
            className={styles.arrowIcon}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M17 8l4 4m0 0l-4 4m4-4H3"
            />
          </svg>
        </Link>
      </div> */}
    </section>
  );
}
