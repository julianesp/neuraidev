"use client";

import React, { useState, useEffect, useCallback } from "react";
import styles from "./TecnicoSistemas.module.scss";
import Link from "next/link";

const STORAGE_KEY = "tecnico_sistemas_orden_fotos";

// ── Datos de trabajos realizados ──────────────────────────────────────────────

const trabajosBase = [
  {
    id: 1,
    titulo: "Trabajo en computador — Caso 1",
    descripcion: "Mantenimiento preventivo y correctivo: limpieza interna, cambio de pasta térmica y optimización del sistema.",
    fotos: [
      "https://0dwas2ied3dcs14f.public.blob.vercel-storage.com/images/computer_1/IMG_20260117_092927.jpg",
      "https://0dwas2ied3dcs14f.public.blob.vercel-storage.com/images/computer_1/IMG_20260117_094612.jpg",
      "https://0dwas2ied3dcs14f.public.blob.vercel-storage.com/images/computer_1/IMG_20260117_094843.jpg",
      "https://0dwas2ied3dcs14f.public.blob.vercel-storage.com/images/computer_1/IMG_20260117_101702.jpg",
      "https://0dwas2ied3dcs14f.public.blob.vercel-storage.com/images/computer_1/IMG_20260117_101707.jpg",
      "https://0dwas2ied3dcs14f.public.blob.vercel-storage.com/images/computer_1/IMG_20260117_110601.jpg",
      "https://0dwas2ied3dcs14f.public.blob.vercel-storage.com/images/computer_1/IMG_20260117_111738.jpg",
      "https://0dwas2ied3dcs14f.public.blob.vercel-storage.com/images/computer_1/IMG_20260117_111741.jpg",
      "https://0dwas2ied3dcs14f.public.blob.vercel-storage.com/images/computer_1/IMG_20260117_114122.jpg",
      "https://0dwas2ied3dcs14f.public.blob.vercel-storage.com/images/computer_1/IMG_20260117_174452.jpg",
      "https://0dwas2ied3dcs14f.public.blob.vercel-storage.com/images/computer_1/IMG_20260117_174459.jpg",
      "https://0dwas2ied3dcs14f.public.blob.vercel-storage.com/images/computer_1/IMG_20260117_174506.jpg",
      "https://0dwas2ied3dcs14f.public.blob.vercel-storage.com/images/computer_1/IMG_20260117_174519.jpg",
      "https://0dwas2ied3dcs14f.public.blob.vercel-storage.com/images/computer_1/IMG_20260117_174524.jpg",
      "https://0dwas2ied3dcs14f.public.blob.vercel-storage.com/images/computer_1/IMG_20260117_174531.jpg",
      "https://0dwas2ied3dcs14f.public.blob.vercel-storage.com/images/computer_1/IMG_20260117_175456.jpg",
    ],
  },
  {
    id: 2,
    titulo: "Trabajo en computador — Caso 2",
    descripcion: "Diagnóstico de hardware, reemplazo de componentes y formateo con instalación limpia del sistema operativo.",
    fotos: [
      "https://0dwas2ied3dcs14f.public.blob.vercel-storage.com/images/computer_2/IMG_20250612_100716.jpg",
      "https://0dwas2ied3dcs14f.public.blob.vercel-storage.com/images/computer_2/IMG_20250612_100731.jpg",
      "https://0dwas2ied3dcs14f.public.blob.vercel-storage.com/images/computer_2/IMG_20250612_113531.jpg",
      "https://0dwas2ied3dcs14f.public.blob.vercel-storage.com/images/computer_2/IMG_20250612_115352.jpg",
      "https://0dwas2ied3dcs14f.public.blob.vercel-storage.com/images/computer_2/IMG_20250612_115404.jpg",
      "https://0dwas2ied3dcs14f.public.blob.vercel-storage.com/images/computer_2/IMG_20250612_115637.jpg",
      "https://0dwas2ied3dcs14f.public.blob.vercel-storage.com/images/computer_2/IMG_20250612_115656.jpg",
      "https://0dwas2ied3dcs14f.public.blob.vercel-storage.com/images/computer_2/IMG_20250612_120552.jpg",
      "https://0dwas2ied3dcs14f.public.blob.vercel-storage.com/images/computer_2/IMG_20250612_120739.jpg",
      "https://0dwas2ied3dcs14f.public.blob.vercel-storage.com/images/computer_2/IMG_20250612_124002.jpg",
      "https://0dwas2ied3dcs14f.public.blob.vercel-storage.com/images/computer_2/IMG_20250612_124011.jpg",
      "https://0dwas2ied3dcs14f.public.blob.vercel-storage.com/images/computer_2/IMG_20251106_194446.jpg",
      "https://0dwas2ied3dcs14f.public.blob.vercel-storage.com/images/computer_2/IMG_20251106_194524.jpg",
      "https://0dwas2ied3dcs14f.public.blob.vercel-storage.com/images/computer_2/IMG_20251106_194608.jpg",
      "https://0dwas2ied3dcs14f.public.blob.vercel-storage.com/images/computer_2/IMG_20251106_194612.jpg",
    ],
  },
  {
    id: 3,
    titulo: "Trabajo en computador — Caso 3",
    descripcion: "Reparación de hardware, actualización de componentes y optimización del rendimiento general del equipo.",
    fotos: [
      "https://0dwas2ied3dcs14f.public.blob.vercel-storage.com/images/computer_3/IMG_20251106_194617.jpg",
      "https://0dwas2ied3dcs14f.public.blob.vercel-storage.com/images/computer_3/IMG_20251106_194624.jpg",
      "https://0dwas2ied3dcs14f.public.blob.vercel-storage.com/images/computer_3/IMG_20251106_194857.jpg",
      "https://0dwas2ied3dcs14f.public.blob.vercel-storage.com/images/computer_3/IMG_20251106_194903.jpg",
      "https://0dwas2ied3dcs14f.public.blob.vercel-storage.com/images/computer_3/IMG_20251106_194918.jpg",
      "https://0dwas2ied3dcs14f.public.blob.vercel-storage.com/images/computer_3/IMG_20251106_194931.jpg",
      "https://0dwas2ied3dcs14f.public.blob.vercel-storage.com/images/computer_3/IMG_20251106_194938.jpg",
      "https://0dwas2ied3dcs14f.public.blob.vercel-storage.com/images/computer_3/IMG_20251106_200633.jpg",
      "https://0dwas2ied3dcs14f.public.blob.vercel-storage.com/images/computer_3/IMG_20251106_200643.jpg",
      "https://0dwas2ied3dcs14f.public.blob.vercel-storage.com/images/computer_3/IMG_20251106_200707.jpg",
      "https://0dwas2ied3dcs14f.public.blob.vercel-storage.com/images/computer_3/IMG_20251106_200734.jpg",
      "https://0dwas2ied3dcs14f.public.blob.vercel-storage.com/images/computer_3/IMG_20251106_200745.jpg",
      "https://0dwas2ied3dcs14f.public.blob.vercel-storage.com/images/computer_3/IMG_20251106_201100.jpg",
      "https://0dwas2ied3dcs14f.public.blob.vercel-storage.com/images/computer_3/IMG_20251106_201135.jpg",
      "https://0dwas2ied3dcs14f.public.blob.vercel-storage.com/images/computer_3/IMG_20251106_201139.jpg",
      "https://0dwas2ied3dcs14f.public.blob.vercel-storage.com/images/computer_3/IMG_20251106_202001.jpg",
    ],
  },
];

// ── Página pública lee el orden guardado por el admin ─────────────────────────

function useTrabajosOrdenados() {
  const [trabajos, setTrabajos] = useState(trabajosBase);

  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const orden = JSON.parse(saved);
        setTrabajos(
          trabajosBase.map((t) => {
            const key = `computer_${t.id}`;
            return orden[key] ? { ...t, fotos: orden[key] } : t;
          })
        );
      }
    } catch {
      // usar orden por defecto
    }
  }, []);

  return trabajos;
}

// ── Lightbox ──────────────────────────────────────────────────────────────────

function Lightbox({ fotos, indiceInicial, onClose }) {
  const [indice, setIndice] = useState(indiceInicial);

  const prev = useCallback(() => setIndice((i) => (i - 1 + fotos.length) % fotos.length), [fotos.length]);
  const next = useCallback(() => setIndice((i) => (i + 1) % fotos.length), [fotos.length]);

  useEffect(() => {
    const handler = (e) => {
      if (e.key === "Escape") onClose();
      if (e.key === "ArrowLeft") prev();
      if (e.key === "ArrowRight") next();
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [onClose, prev, next]);

  return (
    <div className={styles.lightbox} onClick={onClose}>
      <div className={styles.lightboxInner} onClick={(e) => e.stopPropagation()}>
        <button className={styles.lightboxClose} onClick={onClose} aria-label="Cerrar">
          <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>

        <button className={styles.lightboxPrev} onClick={prev} aria-label="Anterior">
          <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </button>

        <img src={fotos[indice]} alt={`Foto ${indice + 1}`} className={styles.lightboxImg} />

        <button className={styles.lightboxNext} onClick={next} aria-label="Siguiente">
          <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </button>

        <span className={styles.lightboxCounter}>{indice + 1} / {fotos.length}</span>
      </div>
    </div>
  );
}

// ── Galería de un trabajo ─────────────────────────────────────────────────────

function GaleriaTrabajo({ trabajo }) {
  const [lightboxFotos, setLightboxFotos] = useState(null);
  const [lightboxIndice, setLightboxIndice] = useState(0);

  const abrirLightbox = (fotos, indice) => {
    setLightboxFotos(fotos);
    setLightboxIndice(indice);
  };

  return (
    <>
      <div className={styles.trabajoItem}>
        <div className={styles.trabajoHeader}>
          <span className={styles.trabajoNumero}>{trabajo.id}</span>
          <h3 className={styles.trabajoTitulo}>{trabajo.titulo}</h3>
        </div>
        <div className={styles.trabajoDivider} />

        <div className={styles.galeriaGrid}>
          {trabajo.fotos.map((url, idx) => (
            <div
              key={idx}
              className={styles.galeriaFoto}
              onClick={() => abrirLightbox(trabajo.fotos, idx)}
            >
              <img src={url} alt={`${trabajo.titulo} — foto ${idx + 1}`} loading="lazy" />
              <div className={styles.galeriaOverlay}>
                <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM10 7v3m0 0v3m0-3h3m-3 0H7" />
                </svg>
              </div>
            </div>
          ))}
        </div>
      </div>

      {lightboxFotos && (
        <Lightbox
          fotos={lightboxFotos}
          indiceInicial={lightboxIndice}
          onClose={() => setLightboxFotos(null)}
        />
      )}
    </>
  );
}

// ── Página principal ──────────────────────────────────────────────────────────

export default function TecnicoSistemas() {
  const trabajos = useTrabajosOrdenados();

  const servicios = [
    {
      id: 1,
      titulo: "Mantenimiento de Computadores",
      descripcion: "Limpieza, optimización y reparación de equipos de cómputo.",
      icono: "🖥️",
    },
    {
      id: 2,
      titulo: "Instalación de Software",
      descripcion: "Instalación y configuración de sistemas operativos y programas.",
      icono: "💿",
    },
    {
      id: 3,
      titulo: "Reparación de Hardware",
      descripcion: "Diagnóstico y reparación de componentes físicos del equipo.",
      icono: "🔧",
    },
    {
      id: 5,
      titulo: "Recuperación de Datos",
      descripcion: "Recuperación de información de discos duros y dispositivos.",
      icono: "💾",
    },
    {
      id: 6,
      titulo: "Actualización de Equipos",
      descripcion: "Mejora de componentes para aumentar el rendimiento.",
      icono: "⚡",
    },
  ];

  return (
    <main className={styles.container}>
      {/* Hero */}
      <section className={styles.hero}>
        <div className={styles.heroContent}>
          <h1 className={styles.title}>Técnico en Sistemas</h1>
          <p className={styles.subtitle}>
            Soluciones profesionales para todos tus problemas informáticos
          </p>
          <Link
            href="https://wa.me/573174503604?text=Me%20interesa%20contratar%20tus%20servicios%20como%20técnico%20en%20sistemas"
            className={styles.ctaButton}
          >
            Solicitar Servicio
          </Link>
        </div>
      </section>

      {/* Sobre el servicio */}
      <section className={styles.about}>
        <div className={styles.aboutContent}>
          <div className={styles.aboutText}>
            <h2>Sobre el Servicio</h2>
            <p>
              Servicio técnico en sistemas con amplia experiencia en
              mantenimiento, reparación y optimización de equipos de cómputo.
              Nos especializamos en brindar soluciones rápidas y efectivas para
              hogares y pequeñas empresas.
            </p>
            <p>
              Nuestro objetivo es garantizar que tu equipo funcione de manera
              óptima, brindándote un servicio de calidad y soporte técnico
              confiable.
            </p>
          </div>
        </div>
      </section>

      {/* Servicios */}
      <section className={styles.services}>
        <h2 className={styles.sectionTitle}>Mis Servicios</h2>
        <div className={styles.servicesGrid}>
          {servicios.map((servicio) => (
            <div key={servicio.id} className={styles.serviceCard}>
              <div className={styles.serviceIcon}>{servicio.icono}</div>
              <h3 className={styles.serviceTitle}>{servicio.titulo}</h3>
              <p className={styles.serviceDescription}>{servicio.descripcion}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Trabajos realizados */}
      <section className={styles.trabajos}>
        <h2 className={styles.sectionTitle}>Trabajos Realizados</h2>
        <p className={styles.trabajosIntro}>
          Evidencia fotográfica de algunos de los trabajos de mantenimiento y
          reparación realizados. Cada caso documenta el proceso completo desde
          el diagnóstico hasta la entrega del equipo.
        </p>

        {trabajos.map((trabajo) => (
          <GaleriaTrabajo key={trabajo.id} trabajo={trabajo} />
        ))}
      </section>

      {/* Licencias */}
      <section className={styles.licenses}>
        <h2 className={styles.sectionTitle}>Licencias de Software</h2>
        <p className={styles.licensesSubtitle}>
          Adquiere licencias originales para proteger y potenciar tu equipo
        </p>
        <div className={styles.licensesGrid}>
          <div className={styles.licenseCard}>
            <div className={styles.licenseIcon}>🛡️</div>
            <h3 className={styles.licenseTitle}>Licencias de Antivirus</h3>
            <p className={styles.licenseDescription}>
              Protege tu equipo con las mejores soluciones antivirus del
              mercado. Licencias originales con soporte y actualizaciones
              garantizadas.
            </p>
            <ul className={styles.licenseFeatures}>
              <li>Protección en tiempo real</li>
              <li>Actualizaciones automáticas</li>
              <li>Licencias originales</li>
            </ul>
            <Link
              href="https://wa.me/573174503604?text=Me%20interesa%20contratar%20tus%20servicios%20como%20técnico%20en%20sistemas"
              target="_blank"
              rel="noopener noreferrer"
              className={styles.licenseButton}
            >
              Pedir servicio
            </Link>
          </div>

          <div className={styles.licenseCard}>
            <div className={styles.licenseIcon}>📊</div>
            <h3 className={styles.licenseTitle}>Licencias de Office</h3>
            <p className={styles.licenseDescription}>
              Obtén Microsoft Office original para trabajar con todas las
              herramientas profesionales que necesitas.
            </p>
            <ul className={styles.licenseFeatures}>
              <li>Word, Excel, PowerPoint</li>
              <li>Outlook y OneNote</li>
              <li>Activación por un año</li>
              <li>Licencias originales</li>
            </ul>
            <Link
              href="https://wa.me/573174503604?text=Me%20interesa%20contratar%20tus%20servicios%20como%20técnico%20en%20sistemas"
              target="_blank"
              rel="noopener noreferrer"
              className={styles.licenseButton}
            >
              Pedir servicio
            </Link>
          </div>
        </div>
      </section>

      {/* Contacto */}
      <section className={styles.contact} id="contacto">
        <div className={styles.contactContent}>
          <h2>¿Necesitas Ayuda Técnica?</h2>
          <p>
            Contáctame ahora y resolveré tu problema de manera rápida y
            profesional
          </p>
          <Link
            href="https://wa.me/573174503604?text=Me%20interesa%20contratar%20tus%20servicios%20como%20técnico%20en%20sistemas"
            target="_blank"
            rel="noopener noreferrer"
            className={styles.whatsappButton}
          >
            <svg className={styles.whatsappIcon} viewBox="0 0 24 24" fill="currentColor">
              <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z" />
            </svg>
            Contactar por WhatsApp
          </Link>
        </div>
      </section>
    </main>
  );
}
