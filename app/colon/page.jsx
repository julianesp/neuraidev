"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import styles from "./Colon.module.scss";
import LugaresColon from "./LugaresColon";

export default function ColonPage() {
  const [config, setConfig] = useState(null);
  const [eventos, setEventos] = useState([]);
  const [lugaresDb, setLugaresDb] = useState([]);
  const [media, setMedia] = useState([]);
  const [loading, setLoading] = useState(true);

  const cargar = useCallback(
    () =>
      fetch("/api/colon", { cache: "no-store" })
        .then((r) => r.json())
        .then((data) => {
          setConfig(data.config || { titulo: "Colón, Putumayo" });
          setEventos(Array.isArray(data.eventos) ? data.eventos : []);
          setLugaresDb(Array.isArray(data.lugares) ? data.lugares : []);
          setMedia(Array.isArray(data.media) ? data.media : []);
        })
        .catch(() => {
          setConfig((c) => c || { titulo: "Colón, Putumayo" });
        })
        .finally(() => setLoading(false)),
    []
  );

  useEffect(() => {
    cargar();
  }, [cargar]);

  return (
    <main className={styles.container}>
      {/* Banner + foto de perfil */}
      <div className={styles.header}>
        <div className={styles.banner}>
          {config?.banner_url && (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={config.banner_url} alt="" />
          )}
        </div>

        <div className={styles.perfilWrap}>
          <div className={styles.perfil}>
            {config?.perfil_url ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={config.perfil_url} alt={config?.titulo || "Colón"} />
            ) : (
              <div className={styles.perfilPlaceholder}>🏞️</div>
            )}
          </div>
          <h1 className={styles.titulo}>{config?.titulo || "Colón, Putumayo"}</h1>
          {config?.descripcion && (
            <p className={styles.descripcion}>{config.descripcion}</p>
          )}
        </div>
      </div>

      {/* Lugares: parque, termales, iglesia… */}
      <LugaresColon lugaresDb={lugaresDb} media={media} onCambio={cargar} />

      {/* Grid de eventos */}
      <section className={styles.eventosSection}>
        <h2 className={styles.eventosTitulo}>Eventos del pueblo</h2>

        {loading ? (
          <p className={styles.vacio}>Cargando eventos…</p>
        ) : eventos.length === 0 ? (
          <p className={styles.vacio}>Aún no hay eventos publicados.</p>
        ) : (
          <div className={styles.grid}>
            {eventos.map((ev) => (
              <Link
                key={ev.id}
                href={`/colon/evento/${ev.id}`}
                className={`${styles.card} ${ev.destacado ? styles.cardDestacado : ""}`}
              >
                {ev.portada_url ? (
                  <div className={styles.cardImg}>
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={ev.portada_url} alt={ev.titulo} loading="lazy" />
                  </div>
                ) : (
                  <div className={styles.cardPlaceholder} />
                )}
                <div className={styles.cardOverlay}>
                  {ev.fecha_evento && (
                    <span className={styles.cardFecha}>{ev.fecha_evento}</span>
                  )}
                  <span className={styles.cardTitulo}>{ev.titulo}</span>
                </div>
              </Link>
            ))}
          </div>
        )}
      </section>
    </main>
  );
}
