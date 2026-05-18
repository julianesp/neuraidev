"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import styles from "./OfertasEspeciales.module.scss";

// Configuración de temas para diferentes fechas especiales (movido fuera del componente)
const specialDates = {
  september: {
    name: "Amor y Amistad",
    period: "Septiembre",
    colors: {
      primary: "#b5e9ff",
      secondary: "#87ceeb",
      accent: "#ffd93d",
      gradient:
        // "linear-gradient(135deg, #b5e9ff 0%, #87ceeb 50%, #ffd93d 100%)",
        "linear-gradient(135deg, #0070f3 0%, #4682b4 40%, #ffa500 80%, #e6b800 100%),",
    },
    emoji: "🎁",
    description: "Celebra el amor y la amistad con ofertas especiales",
  },
  mothers: {
    name: "Día de la Madre",
    period: "Mayo",
    colors: {
      primary: "#e91e63",
      secondary: "#f8bbd9",
      accent: "#fff",
      gradient: "linear-gradient(135deg, #e91e63 0%, #f8bbd9 50%, #fff 100%)",
    },
    emoji: "👩‍❤️‍👨",
    description: "Honra a mamá con regalos tecnológicos especiales",
  },
  fathers: {
    name: "Día del Padre",
    period: "Junio",
    colors: {
      primary: "#2196f3",
      secondary: "#64b5f6",
      accent: "#fff",
      gradient: "linear-gradient(135deg, #2196f3 0%, #64b5f6 50%, #fff 100%)",
    },
    emoji: "👨‍👩‍👧‍👦",
    description: "Sorprende a papá con tecnología de última generación",
  },
  christmas: {
    name: "Navidad",
    period: "Diciembre",
    colors: {
      primary: "#d32f2f",
      secondary: "#4caf50",
      accent: "#ffd700",
      gradient:
        "linear-gradient(135deg, #d32f2f 0%, #4caf50 50%, #ffd700 100%)",
    },
    emoji: "🎄",
    description: "Regalos tecnológicos perfectos para esta Navidad",
  },
  valentine: {
    name: "San Valentín",
    period: "Febrero",
    colors: {
      primary: "#e91e63",
      secondary: "#ff4081",
      accent: "#fff",
      gradient: "linear-gradient(135deg, #e91e63 0%, #ff4081 50%, #fff 100%)",
    },
    emoji: "❤️",
    description: "Demuestra tu amor con tecnología de corazón",
  },
};

const OfertasEspeciales = () => {
  const [currentTheme, setCurrentTheme] = useState(null);

  // Solo mostrar tema de Amor y Amistad (Septiembre)
  useEffect(() => {
    setCurrentTheme(specialDates.september);
  }, []); // Ahora no necesita dependencias porque specialDates es constante

  // Ofertas especiales con diferentes categorías
  const offers = [
    {
      id: 1,
      category: "Mantenimiento",
      title: "Mantenimiento + Formateo",
      originalPrice: 130000,
      discountPrice: 89000,
      discount: "15%",
      description: "Revive tu computador con nuestro servicio completo",
      features: [
        "Limpieza profunda de componentes",
        "Formateo e instalación de Windows",
        "Instalación de programas esenciales",
        "Optimización del sistema",
        "Garantía de 30 días",
        "Oferta de otros programas",
      ],
      icon: "🔧",
      popular: true,
    },
    {
      id: 2,
      category: "Desarrollo Web",
      title: "Página Web",
      originalPrice: 500000,
      discountPrice: 350000,
      discount: "10%",
      description: "Presencia digital profesional para tu negocio",
      features: [
        "Diseño responsivo y moderno",
        "Integración redes sociales",
        "Optimización de imágenes",
        "Tiempo de entrega a considerar",
        "Soporte post-lanzamiento",
        "Documentación de la página",
      ],
      icon: "🌐",
      popular: false,
    },
    {
      id: 4,
      category: "Soporte Técnico",
      title: "Soporte Técnico Mensual",
      originalPrice: 80000,
      discountPrice: 55000,
      discount: "30%",
      description: "Tranquilidad tecnológica todo el mes",
      features: [
        "Soporte remoto o presencial",
        "Ayuda con la instalación de programas",
        "Respaldo automático de datos",
        "Actualizaciones de programas",
      ],
      icon: "🛠️",
      popular: false,
    },
  ];

  if (!currentTheme) {
    return <div className={styles.loading}>Cargando ofertas...</div>;
  }

  return (
    <div
      className={styles.ofertasContainer}
      style={{
        background: currentTheme.colors.gradient,
        "--primary-color": currentTheme.colors.primary,
        "--secondary-color": currentTheme.colors.secondary,
        "--accent-color": currentTheme.colors.accent,
      }}
    >
      {/* Hero Section */}
      <section className={styles.heroSection}>
        <div className={styles.heroContent}>
          <h1 className={styles.heroTitle}>
            <span className={styles.themeEmoji}>{currentTheme.emoji}</span>
            Ofertas de {currentTheme.name}
            <span className={styles.themeEmoji}>{currentTheme.emoji}</span>
          </h1>
          <p className={styles.heroSubtitle}>{currentTheme.description}</p>
          <p className={styles.heroDescription}>
            También aprovecha nuestros descuentos especiales en servicios
            tecnológicos publicados
          </p>
          <p>¡Ofertas limitadas por tiempo limitado!</p>
          <div className={styles.heroStats}>
            <div className={styles.stat}>
              <span className={styles.statNumber}>10%</span>
              <span className={styles.statLabel}>Descuento máximo</span>
            </div>
            <div className={styles.stat}>
              <Link href="/accesorios" className={styles.accesoriosButton}>
                🛍️ Ver Accesorios
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Offers Section */}
      <section className={styles.offersSection}>
        <div className={styles.container}>
          <h2 className={styles.sectionTitle}>Nuestras Ofertas Especiales</h2>
          <div className={styles.offersGrid}>
            {offers.map((offer) => (
              <div
                key={offer.id}
                className={`${styles.offerCard} ${offer.popular ? styles.popular : ""}`}
              >
                {offer.popular && (
                  <div className={styles.popularBadge}>
                    <span className={styles.starIcon}>⭐</span>
                    <span className={styles.popularText}>MÁS POPULAR</span>
                  </div>
                )}

                <div className={styles.offerHeader}>
                  <div className={styles.offerIcon}>{offer.icon}</div>
                  <div className={styles.offerCategory}>{offer.category}</div>
                  <div className={styles.discountBadge}>-{offer.discount}</div>
                </div>

                <h3 className={styles.offerTitle}>{offer.title}</h3>
                <p className={styles.offerDescription}>{offer.description}</p>

                {/* <div className={styles.priceSection}>
                  <span className={styles.originalPrice}>
                    ${offer.originalPrice.toLocaleString()}
                  </span>
                  <span className={styles.discountPrice}>
                    ${offer.discountPrice.toLocaleString()}
                  </span>
                  <span className={styles.savings}>
                    Ahorras $
                    {(
                      offer.originalPrice - offer.discountPrice
                    ).toLocaleString()}
                  </span>
                </div> */}

                <ul className={styles.featuresList}>
                  {offer.features.map((feature, index) => (
                    <li key={index} className={styles.feature}>
                      <span className={styles.checkmark}>✓</span>
                      {feature}
                    </li>
                  ))}
                </ul>

                <Link
                  href={`https://wa.me/573174503604?text=Hola,%20estoy%20interesado%20en%20la%20oferta%20de%20${encodeURIComponent(offer.title)}%20de%20Amor%20y%20Amistad.%20¿Podrías%20darme%20más%20información?`}
                  className={styles.ctaButton}
                >
                  Solicitar Oferta
                  <Image
                    src="https://media.neurai.dev/redes/social%20%281%29.png"
                    alt="WhatsApp"
                    width={20}
                    height={20}
                    className={styles.whatsappIcon}
                  />
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Urgency Section */}
      <section className={styles.urgencySection}>
        <div className={styles.container}>
          <div className={styles.urgencyContent}>
            <h2 className={styles.urgencyTitle}>
              ⏰ ¡Tiempo limitado! Ofertas de {currentTheme.name}
            </h2>
            <p className={styles.urgencyText}>
              No dejes pasar esta oportunidad única. Nuestras ofertas especiales
              de {currentTheme.name} terminan pronto.
            </p>
            <div className={styles.urgencyButtons}>
              <Link
                href="https://wa.me/573174503604?text=Hola,%20estoy%20interesado%20en%20las%20ofertas%20de%20Amor%20y%20Amistad"
                className={`${styles.primaryButton} dark:bg-black dark:text-white `}
              >
                Contactar Ahora
                <Image
                  src="https://media.neurai.dev/redes/social%20%281%29.png"
                  alt="WhatsApp"
                  width={20}
                  height={20}
                  className={styles.whatsappIcon}
                />
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default OfertasEspeciales;
