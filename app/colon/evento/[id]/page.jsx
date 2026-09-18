"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import styles from "./EventoDetalle.module.scss";

export default function EventoDetallePage() {
  const params = useParams();
  const id = params?.id;
  const [evento, setEvento] = useState(null);
  const [estado, setEstado] = useState("cargando"); // cargando | ok | no-encontrado | error

  useEffect(() => {
    if (!id) return;
    fetch(`/api/colon/eventos/${id}`)
      .then(async (r) => {
        if (r.status === 404) {
          setEstado("no-encontrado");
          return null;
        }
        if (!r.ok) {
          setEstado("error");
          return null;
        }
        const data = await r.json();
        setEvento(data.evento);
        setEstado("ok");
        return data;
      })
      .catch(() => setEstado("error"));
  }, [id]);

  if (estado === "cargando") {
    return <p className={styles.estado}>Cargando evento…</p>;
  }

  if (estado === "no-encontrado") {
    return (
      <div className={styles.estado}>
        <p>Este evento no existe o fue eliminado.</p>
        <Link href="/colon" className={styles.volver}>
          ← Volver a Colón
        </Link>
      </div>
    );
  }

  if (estado === "error" || !evento) {
    return (
      <div className={styles.estado}>
        <p>Ocurrió un error al cargar el evento.</p>
        <Link href="/colon" className={styles.volver}>
          ← Volver a Colón
        </Link>
      </div>
    );
  }

  return (
    <main className={styles.container}>
      <div className={styles.hero}>
        {evento.portada_url && (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={evento.portada_url} alt={evento.titulo} />
        )}
      </div>

      <div className={styles.content}>
        <Link href="/colon" className={styles.volver}>
          ← Volver a Colón
        </Link>

        {evento.fecha_evento && (
          <div className={styles.fecha}>{evento.fecha_evento}</div>
        )}
        <h1 className={styles.titulo}>{evento.titulo}</h1>

        {evento.descripcion && (
          <p className={styles.descripcion}>{evento.descripcion}</p>
        )}

        {Array.isArray(evento.fotos) && evento.fotos.length > 0 && (
          <>
            <h2 className={styles.galeriaTitulo}>Galería</h2>
            <div className={styles.galeria}>
              {evento.fotos.map((f) => (
                <div key={f.id} className={styles.galeriaItem}>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={f.url} alt="" loading="lazy" />
                </div>
              ))}
            </div>
          </>
        )}
      </div>
    </main>
  );
}
