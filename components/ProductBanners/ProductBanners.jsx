"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import styles from "./ProductBanners.module.scss";

export default function ProductBanners() {
  const [featuredProducts, setFeaturedProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const loadFeaturedProducts = async () => {
      try {
        const { getFeaturedProducts } = await import("@/lib/productService");
        const products = await getFeaturedProducts(3);
        setFeaturedProducts(products);
      } catch (error) {
        console.error("Error cargando productos destacados:", error);
      } finally {
        setLoading(false);
      }
    };

    loadFeaturedProducts();
  }, []);

  const handleProductClick = (product) => {
    router.push(`/accesorios/${product.categoria}/${product.slug}`);
  };

  if (loading) {
    return (
      <div className={styles.container}>
        <div className={styles.header}>
          <h3 className={styles.title}>Publicidad</h3>
        </div>
        <div className={styles.skeletonWrapper}>
          {[1, 2, 3].map((i) => (
            <div key={i} className={styles.skeleton}></div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h3 className={styles.title}>Publicidad</h3>
        <span className={styles.badge}>ANUNCIO</span>
      </div>

      <div className={styles.bannersWrapper}>
        {featuredProducts.map((product, index) => (
          <div
            key={product.id}
            onClick={() => handleProductClick(product)}
            className={styles.bannerCard}
          >
            <div className={styles.adLabel}>
              <svg className={styles.adIcon} fill="currentColor" viewBox="0 0 20 20">
                <path d="M10 2a6 6 0 00-6 6v3.586l-.707.707A1 1 0 004 14h12a1 1 0 00.707-1.707L16 11.586V8a6 6 0 00-6-6zM10 18a3 3 0 01-3-3h6a3 3 0 01-3 3z" />
              </svg>
              <span>Patrocinado</span>
            </div>

            <div className={styles.imageWrapper}>
              <Image
                src={
                  Array.isArray(product.imagenes)
                    ? product.imagenes[0]
                    : product.imagenes || "/placeholder.png"
                }
                alt={product.nombre}
                width={280}
                height={160}
                className={styles.productImage}
                loading="lazy"
              />
              {product.descuento > 0 && (
                <div className={styles.discountBadge}>
                  -{product.descuento}%
                </div>
              )}
            </div>

            <div className={styles.content}>
              <h4 className={styles.productName}>{product.nombre}</h4>
              <p className={styles.productDescription}>
                {product.descripcion?.substring(0, 60)}
                {product.descripcion?.length > 60 && "..."}
              </p>

              <div className={styles.priceSection}>
                {product.descuento > 0 && (
                  <span className={styles.oldPrice}>
                    ${product.precio?.toLocaleString("es-CO")}
                  </span>
                )}
                <span className={styles.currentPrice}>
                  $
                  {product.descuento > 0
                    ? (
                        product.precio *
                        (1 - product.descuento / 100)
                      ).toLocaleString("es-CO")
                    : product.precio?.toLocaleString("es-CO")}
                </span>
              </div>

              <button className={styles.ctaButton}>
                Ver producto
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
                    d="M9 5l7 7-7 7"
                  />
                </svg>
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Banner adicional para contacto */}
      <div className={styles.contactBanner}>
        <div className={styles.contactContent}>
          <h4 className={styles.contactTitle}>¿Quieres anunciar aquí?</h4>
          <p className={styles.contactDescription}>
            Promociona tus productos y llega a más clientes
          </p>
          <a
            href="https://wa.me/573174503604?text=Hola,%20quiero%20información%20sobre%20publicidad%20en%20NeuraIdev"
            target="_blank"
            rel="noopener noreferrer"
            className={styles.contactButton}
          >
            <svg className={styles.whatsappIcon} fill="currentColor" viewBox="0 0 24 24">
              <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z" />
            </svg>
            Contactar
          </a>
        </div>
      </div>
    </div>
  );
}
