"use client";

import React from "react";
import styles from "./TecnicoSistemas.module.scss";
import Image from "next/image";
import Link from "next/link";

export default function TecnicoSistemas() {
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
      id: 4,
      titulo: "Redes y Conectividad",
      descripcion: "Configuración de redes domésticas y empresariales.",
      icono: "🌐",
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
      <section className={styles.hero}>
        <div className={styles.heroContent}>
          <h1 className={styles.title}>Técnico en Sistemas</h1>
          <p className={styles.subtitle}>
            Soluciones profesionales para todos tus problemas informáticos
          </p>
          <Link href="#contacto" className={styles.ctaButton}>
            Solicitar Servicio
          </Link>
        </div>
      </section>

      <section className={styles.about}>
        <div className={styles.aboutContent}>
          <div className={styles.aboutText}>
            <h2>Sobre Mí</h2>
            <p>
              Soy técnico en sistemas con amplia experiencia en mantenimiento,
              reparación y optimización de equipos de cómputo. Me especializo en
              brindar soluciones rápidas y efectivas para hogares y pequeñas
              empresas.
            </p>
            <p>
              Mi objetivo es garantizar que tu equipo funcione de manera óptima,
              brindándote un servicio de calidad y soporte técnico confiable.
            </p>
          </div>
          <div className={styles.aboutImage}>
            <Image
              src="/images/tecnico-sistemas.png"
              alt="Técnico en Sistemas"
              width={500}
              height={400}
              className={styles.image}
            />
          </div>
        </div>
      </section>

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

      <section className={styles.contact} id="contacto">
        <div className={styles.contactContent}>
          <h2>¿Necesitas Ayuda Técnica?</h2>
          <p>
            Contáctame ahora y resolveré tu problema de manera rápida y profesional
          </p>
          <Link
            href="https://wa.me/573174503604?text=Hola,%20necesito%20servicios%20de%20técnico%20en%20sistemas"
            target="_blank"
            rel="noopener noreferrer"
            className={styles.whatsappButton}
          >
            <svg
              className={styles.whatsappIcon}
              viewBox="0 0 24 24"
              fill="currentColor"
            >
              <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z" />
            </svg>
            Contactar por WhatsApp
          </Link>
        </div>
      </section>
    </main>
  );
}
