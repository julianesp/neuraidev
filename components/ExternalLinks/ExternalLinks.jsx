"use client";

import { useState } from "react";
import Image from "next/image";
import styles from "./ExternalLinks.module.scss";

// Enlaces curados de sitios externos relevantes
const externalLinks = [
  {
    id: 1,
    title: "Noticias, análisis y reviews de tecnología en español",
    site: "Xataka",
    url: "https://www.xataka.com/",
    domain: "xataka.com",
    category: "Tecnología",
    favicon: "https://www.xataka.com/favicon.ico",
  },
  {
    id: 2,
    title: "Tutoriales de programación y desarrollo web en español",
    site: "Midudev",
    url: "https://www.youtube.com/@midudev/videos",
    domain: "youtube.com/@midudev",
    category: "Programación",
    favicon: "https://www.youtube.com/favicon.ico",
  },
  {
    id: 3,
    title: "Cursos y proyectos de desarrollo web fullstack",
    site: "Fazt Tech",
    url: "https://www.youtube.com/@FaztTech",
    domain: "youtube.com/@FaztTech",
    category: "Desarrollo",
    favicon: "https://www.youtube.com/favicon.ico",
  },
  {
    id: 4,
    title: "Noticias de tecnología, hardware y software para el día a día",
    site: "Computer Hoy",
    url: "https://computerhoy.20minutos.es/",
    domain: "computerhoy.20minutos.es",
    category: "Noticias Tech",
    favicon: "https://computerhoy.20minutos.es/favicon.ico",
  },
  {
    id: 5,
    title: "Aplicaciones, gadgets y tendencias en tecnología de consumo",
    site: "Genbeta",
    url: "https://www.genbeta.com/",
    domain: "genbeta.com",
    category: "Apps & Gadgets",
    favicon: "https://www.genbeta.com/favicon.ico",
  },
  {
    id: 6,
    title: "Noticias y guías sobre Linux, open source y software libre",
    site: "Muy Linux",
    url: "https://www.muylinux.com/",
    domain: "muylinux.com",
    category: "Linux",
    favicon: "https://www.muylinux.com/favicon.ico",
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
              <div className={styles.linkIcon}>
                <Image
                  src={link.favicon}
                  alt={`Logo de ${link.site}`}
                  width={24}
                  height={24}
                  unoptimized
                  onError={(e) => { e.currentTarget.style.display = "none"; }}
                />
              </div>
              <div className={styles.linkMeta}>
                <span className={styles.linkCategory}>{link.category}</span>
                <span className={styles.linkSite}>{link.site}</span>
                <span className={styles.linkDomain}>{link.domain}</span>
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
