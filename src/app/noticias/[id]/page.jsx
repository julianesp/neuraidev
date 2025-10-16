"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import styles from "./NoticiaDetalle.module.scss";

export default function NoticiaDetallePage() {
  const params = useParams();
  const [noticia, setNoticia] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const municipios = {
    general: "Valle de Sibundoy",
    sibundoy: "Sibundoy",
    "san-francisco": "San Francisco",
    colon: "Colón",
    santiago: "Santiago",
  };

  const categorias = {
    general: "General",
    cultura: "Cultura",
    economia: "Economía",
    infraestructura: "Infraestructura",
    educacion: "Educación",
    salud: "Salud",
    deportes: "Deportes",
    turismo: "Turismo",
    "medio-ambiente": "Medio Ambiente",
  };

  useEffect(() => {
    fetch("/api/noticias")
      .then((res) => res.json())
      .then((data) => {
        if (data.success) {
          const noticiaEncontrada = data.noticias.find(
            (n) => n.id.toString() === params.id
          );
          if (noticiaEncontrada) {
            setNoticia(noticiaEncontrada);
          } else {
            setError("Noticia no encontrada");
          }
        } else {
          setError("Error al cargar la noticia");
        }
        setLoading(false);
      })
      .catch((err) => {
        console.error("Error cargando noticia:", err);
        setError("Error al cargar la noticia");
        setLoading(false);
      });
  }, [params.id]);

  if (loading) {
    return (
      <div className={styles.container}>
        <div className={styles.loading}>
          <div className={styles.spinner}></div>
          <p>Cargando noticia...</p>
        </div>
      </div>
    );
  }

  if (error || !noticia) {
    return (
      <div className={styles.container}>
        <div className={styles.error}>
          <h1>😕 {error || "Noticia no encontrada"}</h1>
          <Link href="/noticias" className={styles.backBtn}>
            ← Volver a noticias
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <Link href="/noticias" className={styles.backLink}>
        ← Volver a todas las noticias
      </Link>

      <article className={styles.article}>
        {/* Imagen principal */}
        <div className={styles.imageHeader}>
          <Image
            src={noticia.imagen}
            alt={noticia.titulo}
            width={1200}
            height={600}
            className={styles.mainImage}
            priority
          />
          <div className={styles.imageOverlay}>
            <span className={styles.categoria}>
              {categorias[noticia.categoria] || noticia.categoria}
            </span>
          </div>
        </div>

        {/* Contenido */}
        <div className={styles.content}>
          <header className={styles.header}>
            <h1>{noticia.titulo}</h1>

            <div className={styles.meta}>
              <span className={styles.date}>
                📅{" "}
                {new Date(noticia.fecha).toLocaleDateString("es-CO", {
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                })}
              </span>
              <span className={styles.municipio}>
                📍 {municipios[noticia.municipio] || noticia.municipio}
              </span>
              {noticia.autor && (
                <span className={styles.autor}>✍️ {noticia.autor}</span>
              )}
            </div>

            <p className={styles.descripcion}>{noticia.descripcion}</p>
          </header>

          {/* Contenido completo con HTML formateado */}
          <div
            className={styles.articleContent}
            dangerouslySetInnerHTML={{ __html: noticia.contenido }}
          />

          {/* Compartir */}
          <div className={styles.share}>
            <h3>Compartir esta noticia:</h3>
            <div className={styles.shareButtons}>
              <a
                href={`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(
                  typeof window !== "undefined" ? window.location.href : ""
                )}`}
                target="_blank"
                rel="noopener noreferrer"
                className={styles.shareBtn}
              >
                📘 Facebook
              </a>
              <a
                href={`https://twitter.com/intent/tweet?text=${encodeURIComponent(
                  noticia.titulo
                )}&url=${encodeURIComponent(
                  typeof window !== "undefined" ? window.location.href : ""
                )}`}
                target="_blank"
                rel="noopener noreferrer"
                className={styles.shareBtn}
              >
                🐦 Twitter
              </a>
              <a
                href={`https://wa.me/?text=${encodeURIComponent(
                  `${noticia.titulo} - ${
                    typeof window !== "undefined" ? window.location.href : ""
                  }`
                )}`}
                target="_blank"
                rel="noopener noreferrer"
                className={styles.shareBtn}
              >
                💬 WhatsApp
              </a>
            </div>
          </div>
        </div>
      </article>
    </div>
  );
}
