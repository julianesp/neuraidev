"use client";

import { useState } from "react";
import styles from "./ExternalLinks.module.scss";

// Enlaces curados de sitios externos relevantes
const externalLinks = [
  {
    id: 1,
    title: "Las mejores ofertas en tecnología esta semana",
    site: "TechCrunch",
    url: "https://techcrunch.com/",
    category: "Tecnología",
    icon: "💻",
  },
  {
    id: 2,
    title: "Tendencias en gadgets para 2025",
    site: "The Verge",
    url: "https://www.theverge.com/tech",
    category: "Gadgets",
    icon: "📱",
  },
  {
    id: 3,
    title: "Guía de compra: Los mejores libros del mes",
    site: "Goodreads",
    url: "https://www.goodreads.com/",
    category: "Libros",
    icon: "📚",
  },
  {
    id: 4,
    title: "Análisis y reviews de productos tecnológicos",
    site: "CNET",
    url: "https://www.cnet.com/",
    category: "Reviews",
    icon: "⭐",
  },
  {
    id: 5,
    title: "Noticias de e-commerce y retail",
    site: "Retail Dive",
    url: "https://www.retaildive.com/",
    category: "E-commerce",
    icon: "🛒",
  },
];

export default function ExternalLinks() {
  const [expandedLink, setExpandedLink] = useState(null);

  const toggleLink = (id) => {
    setExpandedLink(expandedLink === id ? null : id);
  };

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h3 className={styles.title}>Contenido Recomendado</h3>
        <svg
          className={styles.externalIcon}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
          />
        </svg>
      </div>

      <p className={styles.description}>
        Enlaces a contenido útil de sitios web de confianza
      </p>

      <div className={styles.linksList}>
        {externalLinks.map((link) => (
          <div key={link.id} className={styles.linkCard}>
            <div className={styles.linkHeader}>
              <div className={styles.linkIcon}>{link.icon}</div>
              <div className={styles.linkMeta}>
                <span className={styles.linkCategory}>{link.category}</span>
                <span className={styles.linkSite}>{link.site}</span>
              </div>
            </div>

            <h4 className={styles.linkTitle}>{link.title}</h4>

            <a
              href={link.url}
              target="_blank"
              rel="noopener noreferrer nofollow"
              className={styles.linkButton}
              onClick={(e) => {
                e.stopPropagation();
              }}
            >
              <span>Visitar sitio</span>
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
            </a>

            <div className={styles.disclaimer}>
              <svg className={styles.infoIcon} fill="currentColor" viewBox="0 0 20 20">
                <path
                  fillRule="evenodd"
                  d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
                  clipRule="evenodd"
                />
              </svg>
              <span>Enlace externo</span>
            </div>
          </div>
        ))}
      </div>

      <div className={styles.legalNote}>
        <p className={styles.legalText}>
          Los enlaces compartidos son solo informativos. No copiamos contenido de
          otros sitios, únicamente compartimos enlaces a fuentes originales.
        </p>
      </div>
    </div>
  );
}
