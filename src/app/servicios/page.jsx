import React from "react";
import styles from "./Servicios.module.scss";
import Image from "next/image";
import Link from "next/link";

export const metadata = {
  title: "Servicios Profesionales | Neurai.dev",
  description:
    "Servicios de desarrollo web, soporte técnico en sistemas y mantenimiento de computadores. Soluciones tecnológicas profesionales en el Valle de Sibundoy.",
  keywords:
    "servicios técnicos, desarrollo web, soporte sistemas, mantenimiento computadores, Valle de Sibundoy",
  openGraph: {
    title: "Servicios Profesionales | Neurai.dev",
    description:
      "Servicios de desarrollo web, soporte técnico en sistemas y mantenimiento de computadores.",
    url: "https://www.neurai.dev/servicios",
    type: "website",
  },
  alternates: {
    canonical: "/servicios",
  },
};

export default function Servicios() {
  const servicios = [
    {
      id: 1,
      titulo: "Técnico en Sistemas",
      descripcion:
        "Soluciones profesionales para mantenimiento, reparación y optimización de equipos de cómputo. Servicio especializado para hogares y pequeñas empresas.",
      imagen:
        "https://0dwas2ied3dcs14f.public.blob.vercel-storage.com/servicios/mantenimiento.jpg",
      link: "/servicios/tecnico-sistemas",
      serviciosIncluidos: [
        "Mantenimiento de Computadores",
        "Instalación de Software",
        "Reparación de Hardware",
        "Configuración de Redes",
        "Recuperación de Datos",
        "Actualización de Equipos",
      ],
      color: "purple",
    },
    {
      id: 2,
      titulo: "Desarrollador Web",
      descripcion:
        "Creación de soluciones digitales innovadoras. Desarrollo de aplicaciones web modernas, e-commerce y sistemas personalizados para tu negocio.",
      imagen:
        "https://0dwas2ied3dcs14f.public.blob.vercel-storage.com/servicios/web_develop.png",
      link: "/servicios/desarrollador-software",
      serviciosIncluidos: [
        "Desarrollo Web",
        "Aplicaciones Web",
        "E-Commerce",
        "APIs y Backend",
        "Bases de Datos",
        "Mantenimiento y Soporte",
      ],
      color: "blue",
    },
  ];

  return (
    <main className={styles.container}>
      {/* Hero Section */}
      <section className={styles.hero}>
        <div className={styles.heroContent}>
          <h1 className={styles.title}>Mis Servicios Profesionales</h1>
          <p className={styles.subtitle}>
            Soluciones técnicas y digitales para impulsar tu negocio o resolver
            tus necesidades tecnológicas
          </p>
        </div>
      </section>

      {/* Introducción */}
      <section className={styles.intro}>
        <div className={styles.introContent}>
          <h2>¿Qué puedo hacer por ti?</h2>
          <p>
            Con años de experiencia en el sector tecnológico, ofrezco servicios
            especializados tanto en soporte técnico como en desarrollo de
            software. Mi objetivo es brindarte soluciones de calidad que se
            adapten a tus necesidades específicas.
          </p>
        </div>
      </section>

      {/* Servicios Cards */}
      <section className={styles.serviciosSection}>
        {servicios.map((servicio, index) => (
          <div
            key={servicio.id}
            className={`${styles.servicioCard} ${
              index % 2 === 0 ? styles.cardLeft : styles.cardRight
            }`}
          >
            <div className={styles.imageContainer}>
              <Image
                src={servicio.imagen}
                alt={servicio.titulo}
                width={600}
                height={400}
                className={styles.servicioImage}
              />
              <div
                className={`${styles.overlay} ${
                  servicio.color === "purple"
                    ? styles.overlayPurple
                    : styles.overlayBlue
                }`}
              ></div>
            </div>

            <div className={styles.cardContent}>
              <h2 className={styles.servicioTitulo}>{servicio.titulo}</h2>
              <p className={styles.servicioDescripcion}>
                {servicio.descripcion}
              </p>

              <div className={styles.serviciosLista}>
                <h3>Servicios incluidos:</h3>
                <ul>
                  {servicio.serviciosIncluidos.map((item, idx) => (
                    <li key={idx}>
                      <span className={styles.checkIcon}>✓</span>
                      {item}
                    </li>
                  ))}
                </ul>
              </div>

              <Link href={servicio.link} className={styles.verMasButton}>
                Ver más detalles
              </Link>
            </div>
          </div>
        ))}
      </section>

      {/* CTA Section */}
      <section className={styles.cta}>
        <div className={styles.ctaContent}>
          <h2>¿Listo para empezar?</h2>
          <p>
            Contáctame ahora y conversemos sobre cómo puedo ayudarte a alcanzar
            tus objetivos
          </p>
          <Link
            href="https://wa.me/573174503604?text=Hola,%20me%20interesan%20tus%20servicios"
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

      {/* Testimonios o Beneficios */}
      <section className={styles.beneficios}>
        <h2 className={styles.sectionTitle}>¿Por qué elegir mis servicios?</h2>
        <div className={styles.beneficiosGrid}>
          <div className={styles.beneficioCard}>
            <div className={styles.beneficioIcon}>⚡</div>
            <h3>Respuesta Rápida</h3>
            <p>Atención inmediata y soluciones eficientes para tus necesidades</p>
          </div>
          <div className={styles.beneficioCard}>
            <div className={styles.beneficioIcon}>💯</div>
            <h3>Calidad Garantizada</h3>
            <p>Trabajo profesional con garantía de satisfacción</p>
          </div>
          <div className={styles.beneficioCard}>
            <div className={styles.beneficioIcon}>💰</div>
            <h3>Precios Justos</h3>
            <p>Tarifas competitivas sin comprometer la calidad</p>
          </div>
          <div className={styles.beneficioCard}>
            <div className={styles.beneficioIcon}>🤝</div>
            <h3>Soporte Continuo</h3>
            <p>Acompañamiento antes, durante y después del servicio</p>
          </div>
        </div>
      </section>
    </main>
  );
}
