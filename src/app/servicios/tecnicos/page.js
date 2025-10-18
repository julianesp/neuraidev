"use client";

import React from "react";
import Image from "next/image";
import Link from "next/link";
import styles from "./servicios.module.css";

export default function Servicios() {
  const services = [
    {
      id: 1,
      title: "Mantenimiento de Computadores",
      description:
        "Servicio completo de mantenimiento preventivo y correctivo para equipos de cómputo.",
      features: [
        "Limpieza interna y externa de componentes",
        "Revisión y optimización del sistema",
        "Actualización de drivers y software",
        "Diagnóstico de hardware",
        "Cambio de pasta térmica",
        "Upgrade de RAM y SSD disponibles en tienda",
      ],
      icon: "🔧",
      price: "Desde $50.000",
    },
    {
      id: 2,
      title: "Formateo de Computadores",
      description:
        "Formateo completo con instalación del sistema operativo y programas esenciales.",
      features: [
        "Formateo completo del disco duro",
        "Instalación de Windows/Linux",
        "Configuración inicial del sistema",
        "Instalación de programas básicos",
        "Transferencia de archivos importantes",
        "Configuración de antivirus",
        "Upgrade a SSD para mayor velocidad",
      ],
      icon: "💻",
      price: "Desde $80.000",
    },
    {
      id: 5,
      title: "Venta de Componentes",
      description:
        "Componentes originales y de calidad para mejorar el rendimiento de tu computador.",
      features: [
        "Memoria RAM DDR4 - Puskill",
        "Discos SSD mSATA EXRAM de alta velocidad",
        "Hub USB C para mayor conectividad",
        "Accesorios para computadores",
        "Garantía en todos los productos",
        "Instalación incluida con el servicio",
      ],
      icon: "💾",
      price: "Desde $63.900",
    },
    {
      id: 3,
      title: "Desarrollo Web",
      description:
        "Creación de páginas web modernas, responsivas y optimizadas para tu negocio.",
      features: [
        "Diseño web responsivo",
        "Desarrollo con tecnologías modernas",
        "Optimización SEO",
        "Integración con redes sociales",
        "Panel de administración",
        "Hosting y dominio incluido",
      ],
      icon: "🌐",
      price: "Desde $300.000",
    },
    {
      id: 4,
      title: "Soporte Técnico",
      description:
        "Asesoría y soporte técnico personalizado para resolver problemas informáticos.",
      features: [
        "Diagnóstico de problemas",
        "Soporte remoto y presencial",
        "Configuración de redes",
        "Instalación de software",
        "Recuperación de datos",
        "Asesoría en compra de equipos",
      ],
      icon: "🛠️",
      price: "Desde $40.000",
    },
  ];

  const whyChooseUs = [
    {
      title: "Experiencia Comprobada",
      description: "Más de 5 años brindando servicios técnicos especializados",
      icon: "⭐",
    },
    {
      title: "Atención Personalizada",
      description:
        "Cada cliente recibe un servicio adaptado a sus necesidades específicas",
      icon: "👤",
    },
    {
      title: "Garantía de Calidad",
      description:
        "Todos nuestros servicios incluyen garantía y seguimiento post-servicio",
      icon: "✅",
    },
    {
      title: "Precios Competitivos",
      description: "Tarifas justas y transparentes sin costos ocultos",
      icon: "💰",
    },
  ];

  return (
    <div className={styles.serviciosContainer}>
      {/* Hero Section */}
      <section className={styles.heroSection}>
        <div className={styles.heroContent}>
          <h1 className={styles.heroTitle}>
            Servicios Técnicos{" "}
            <span className={styles.highlight}>Profesionales</span>
          </h1>
          <p className={styles.heroDescription}>
            Soluciones completas en tecnología para particulares y empresas.
            Mantenimiento, desarrollo web y soporte técnico especializado.
          </p>
          <div className={styles.heroButtons}>
            <Link href="#servicios" className={styles.primaryButton}>
              Ver Servicios
            </Link>
            <Link href="#contacto" className={styles.secondaryButton}>
              Cotizar Ahora
            </Link>
          </div>
        </div>
        <div className={styles.heroImage}>
          <Image
            src="/images/services/hero-tech.png"
            alt="Servicios técnicos profesionales"
            width={600}
            height={400}
            className={styles.heroImg}
          />
        </div>
      </section>

      {/* Services Section */}
      <section id="servicios" className={styles.servicesSection}>
        <div className={styles.container}>
          <h2 className={styles.sectionTitle}>Nuestros Servicios</h2>
          <div className={styles.servicesGrid}>
            {services.map((service) => (
              <div key={service.id} className={styles.serviceCard}>
                <div className={styles.serviceIcon}>{service.icon}</div>
                <h3 className={styles.serviceTitle}>{service.title}</h3>
                <p className={styles.serviceDescription}>
                  {service.description}
                </p>
                <ul className={styles.serviceFeatures}>
                  {service.features.map((feature, index) => (
                    <li key={index} className={styles.feature}>
                      <span className={styles.checkmark}>✓</span>
                      {feature}
                    </li>
                  ))}
                </ul>
                <div className={styles.servicePrice}>{service.price}</div>
                <button className={styles.serviceButton}>
                  Solicitar Servicio
                </button>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Why Choose Us Section */}
      <section className={styles.whySection}>
        <div className={styles.container}>
          <h2 className={styles.sectionTitle}>¿Por qué elegirnos?</h2>
          <div className={styles.whyGrid}>
            {whyChooseUs.map((item, index) => (
              <div key={index} className={styles.whyCard}>
                <div className={styles.whyIcon}>{item.icon}</div>
                <h3 className={styles.whyTitle}>{item.title}</h3>
                <p className={styles.whyDescription}>{item.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Components Section */}
      <section className={styles.componentsSection}>
        <div className={styles.container}>
          <h2 className={styles.sectionTitle}>Componentes Disponibles en Tienda</h2>
          <div className={styles.componentsGrid}>
            <div className={styles.componentCard}>
              <div className={styles.componentIcon}>💾</div>
              <h3>Memoria RAM DDR4</h3>
              <p>Puskill - 8GB DDR4 para mejorar el rendimiento</p>
              <div className={styles.componentPrice}>$104.900</div>
              <Link href="/accesorios/computadoras" className={styles.componentButton}>
                Ver en Tienda
              </Link>
            </div>
            <div className={styles.componentCard}>
              <div className={styles.componentIcon}>⚡</div>
              <h3>Disco SSD mSATA</h3>
              <p>EXRAM 256GB - Velocidad extrema para tu PC</p>
              <div className={styles.componentPrice}>$124.900</div>
              <Link href="/accesorios/computadoras" className={styles.componentButton}>
                Ver en Tienda
              </Link>
            </div>
            <div className={styles.componentCard}>
              <div className={styles.componentIcon}>🔌</div>
              <h3>Hub USB C</h3>
              <p>Extensor USB 7 en 1 - Más conectividad</p>
              <div className={styles.componentPrice}>$63.900</div>
              <Link href="/accesorios/computadoras" className={styles.componentButton}>
                Ver en Tienda
              </Link>
            </div>
          </div>
          <div className={styles.componentsNote}>
            <p>💡 <strong>Instalación incluida:</strong> Todos los componentes incluyen instalación gratuita con el servicio de mantenimiento o formateo.</p>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section id="contacto" className={styles.ctaSection}>
        <div className={styles.container}>
          <h2 className={styles.ctaTitle}>
            ¿Listo para mejorar tu tecnología?
          </h2>
          <p className={styles.ctaDescription}>
            Contáctanos para una consulta gratuita y descubre cómo podemos
            ayudarte
          </p>
          <div className={styles.ctaButtons}>
            <Link href="/profile" className={styles.primaryButton}>
              Contactar Ahora
            </Link>
            <Link href="tel:+573174503604" className={styles.phoneButton}>
              📞 Llamar Directamente
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
