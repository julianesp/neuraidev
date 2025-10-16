"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import styles from "./NewsSection.module.scss";

export default function NewsSection() {
  const [selectedMunicipio, setSelectedMunicipio] = useState("general");
  const [noticias, setNoticias] = useState([]);
  const [loading, setLoading] = useState(true);

  const municipios = [
    { id: "general", nombre: "Valle de Sibundoy" },
    { id: "sibundoy", nombre: "Sibundoy" },
    { id: "san-francisco", nombre: "San Francisco" },
    { id: "colon", nombre: "Colón" },
    { id: "santiago", nombre: "Santiago" },
  ];

  useEffect(() => {
    // Cargar noticias desde la API (base de datos en la nube)
    setLoading(true);
    fetch("/api/noticias")
      .then((res) => res.json())
      .then((data) => {
        if (data.success) {
          setNoticias(data.noticias || []);
        }
        setLoading(false);
      })
      .catch((err) => {
        console.error("Error cargando noticias:", err);
        setLoading(false);
      });
  }, []);

  const noticiasFiltradas = selectedMunicipio === "general"
    ? noticias
    : noticias.filter(n => n.municipio === selectedMunicipio);

  return (
    <section className={styles.newsSection}>
      <div className={styles.header}>
        <h2>Noticias del Valle de Sibundoy</h2>
        <p>Mantente informado sobre lo que sucede en nuestra región</p>
      </div>

      {/* Filtros por municipio */}
      <div className={styles.filters}>
        {municipios.map(municipio => (
          <button
            key={municipio.id}
            onClick={() => setSelectedMunicipio(municipio.id)}
            className={`${styles.filterBtn} ${selectedMunicipio === municipio.id ? styles.active : ''}`}
          >
            {municipio.nombre}
          </button>
        ))}
      </div>

      {/* Grid de noticias */}
      <div className={styles.newsGrid}>
        {loading ? (
          <>
            {[1, 2, 3].map(i => (
              <div key={i} className={styles.newsSkeleton}>
                <div className={styles.skeletonImage}></div>
                <div className={styles.skeletonText}></div>
                <div className={styles.skeletonText}></div>
              </div>
            ))}
          </>
        ) : (
          noticiasFiltradas.map(noticia => (
            <article key={noticia.id} className={styles.newsCard}>
              <div className={styles.imageContainer}>
                <Image
                  src={noticia.imagen}
                  alt={noticia.titulo}
                  width={400}
                  height={250}
                  className={styles.newsImage}
                />
                <span className={styles.categoria}>{noticia.categoria}</span>
              </div>
              <div className={styles.content}>
                <time className={styles.fecha}>
                  {new Date(noticia.fecha).toLocaleDateString('es-CO', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric'
                  })}
                </time>
                <h3>{noticia.titulo}</h3>
                <p>{noticia.descripcion}</p>
                <Link href={`/noticias/${noticia.id}`} className={styles.readMore}>
                  Leer más →
                </Link>
              </div>
            </article>
          ))
        )}
      </div>

      <div className={styles.viewAll}>
        <Link href="/noticias" className={styles.viewAllBtn}>
          Ver todas las noticias
        </Link>
      </div>
    </section>
  );
}
