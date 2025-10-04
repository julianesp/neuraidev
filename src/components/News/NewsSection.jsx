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
    // Simular carga de noticias (aquí conectarías con tu API)
    setLoading(true);
    setTimeout(() => {
      setNoticias([
        {
          id: 1,
          titulo: "Festival del Carnaval del Perdón en Sibundoy",
          descripcion: "La tradicional celebración que reúne a miles de visitantes cada año.",
          imagen: "https://firebasestorage.googleapis.com/v0/b/neuraidev.appspot.com/o/images%2Flocal.png?alt=media&token=28b13e34-2396-4934-925b-75863006bb4b",
          fecha: "2025-02-10",
          municipio: "sibundoy",
          categoria: "cultura"
        },
        {
          id: 2,
          titulo: "Nuevas oportunidades de empleo en la región",
          descripcion: "Empresas locales abren convocatorias para jóvenes profesionales.",
          imagen: "https://firebasestorage.googleapis.com/v0/b/neuraidev.appspot.com/o/images%2Flocal.png?alt=media&token=28b13e34-2396-4934-925b-75863006bb4b",
          fecha: "2025-02-08",
          municipio: "general",
          categoria: "economia"
        },
        {
          id: 3,
          titulo: "Mejoras en la vía Pasto - Mocoa",
          descripcion: "Gobierno departamental anuncia inversión en infraestructura vial.",
          imagen: "https://firebasestorage.googleapis.com/v0/b/neuraidev.appspot.com/o/images%2Flocal.png?alt=media&token=28b13e34-2396-4934-925b-75863006bb4b",
          fecha: "2025-02-05",
          municipio: "general",
          categoria: "infraestructura"
        },
      ]);
      setLoading(false);
    }, 500);
  }, [selectedMunicipio]);

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
