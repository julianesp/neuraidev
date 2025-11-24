"use client";

import React from "react";
import Image from "next/image";
import Link from "next/link";
import styles from "./transporte.module.css";

export default function ServicioTransporte() {
  const services = [
    {
      id: 1,
      title: "Transporte de Carga",
      description:
        "Servicio confiable de transporte de carga y mudanzas para empresas y particulares.",
      features: [
        "Camiones de diferentes capacidades",
        "Personal especializado en carga",
        "Seguros de mercancía incluidos",
        "Servicios de mudanza completa",
        "Transporte urbano e intermunicipal",
        "Embalaje y protección de objetos",
      ],
      icon: "🚛",
      price: "Desde $80.000",
    },
    {
      id: 2,
      title: "Servicio Express",
      description:
        "Entregas rápidas y seguras en el menor tiempo posible para envíos urgentes.",
      features: [
        "Entrega en el mismo día",
        "Seguimiento en tiempo real",
        "Documentos y paquetes pequeños",
        "Servicio puerta a puerta",
        "Confirmación de entrega",
        "Horarios flexibles",
      ],
      icon: "⚡",
      price: "Desde $25.000",
    },
    {
      id: 3,
      title: "Transporte de Muebles",
      description:
        "Especialistas en traslado de muebles y electrodomésticos con máximo cuidado.",
      features: [
        "Desmonte y armado de muebles",
        "Embalaje especializado",
        "Herramientas profesionales",
        "Protección contra daños",
        "Experiencia en electrodomésticos",
        "Servicio de instalación",
      ],
      icon: "🛋️",
      price: "Desde $120.000",
    },
    {
      id: 4,
      title: "Logística Empresarial",
      description:
        "Soluciones integrales de transporte y logística para empresas de todos los tamaños.",
      features: [
        "Rutas optimizadas",
        "Distribución programada",
        "Almacenamiento temporal",
        "Gestión de inventarios",
        "Reportes de seguimiento",
        "Contratos corporativos",
      ],
      icon: "📦",
      price: "Cotización personalizada",
    },
  ];

  const whyChooseUs = [
    {
      title: "Puntualidad Garantizada",
      description: "Cumplimos con los horarios acordados sin excusas",
      icon: "⏰",
    },
    {
      title: "Vehículos en Perfecto Estado",
      description:
        "Flota moderna y bien mantenida para garantizar la seguridad",
      icon: "🚐",
    },
    {
      title: "Personal Capacitado",
      description:
        "Conductores y auxiliares experimentados en manejo de carga",
      icon: "👷",
    },
    {
      title: "Tarifas Competitivas",
      description: "Precios justos sin comprometer la calidad del servicio",
      icon: "💰",
    },
  ];

  return (
    <div className={styles.transporteContainer}>
      {/* Hero Section */}
      <section className={styles.heroSection}>
        <div className={styles.heroContent}>
          <h1 className={styles.heroTitle}>
            Servicio de{" "}
            <span className={styles.highlight}>Transporte</span>
          </h1>
          <p className={styles.heroDescription}>
            Tu aliado confiable para mudanzas, transporte de carga y entregas express.
            Conectamos destinos con responsabilidad y eficiencia.
          </p>
          <div className={styles.heroButtons}>
            <Link href="#servicios" className={styles.primaryButton}>
              Ver Servicios
            </Link>
            <Link href="tel:+573174503604" className={styles.secondaryButton}>
              Llamar Ahora
            </Link>
          </div>
        </div>
        <div className={styles.heroImage}>
          <div className={styles.truckIcon}>🚛</div>
        </div>
      </section>

      {/* Services Section */}
      <section id="servicios" className={styles.servicesSection}>
        <div className={styles.container}>
          <h2 className={styles.sectionTitle}>Nuestros Servicios de Transporte</h2>
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
                  Solicitar Cotización
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

      {/* Contact Section */}
      <section className={styles.contactSection}>
        <div className={styles.container}>
          <h2 className={styles.contactTitle}>
            ¿Necesitas transportar algo hoy?
          </h2>
          <p className={styles.contactDescription}>
            Contacta con nosotros para una cotización gratuita y sin compromiso
          </p>
          <div className={styles.contactButtons}>
            <Link href="tel:+573174503604" className={styles.phoneButton}>
              📞 +57 317 450 3604
            </Link>
            <Link href="https://wa.me/573174503604?text=Hola, necesito servicio de transporte" className={styles.whatsappButton}>
              💬 WhatsApp
            </Link>
          </div>
          <div className={styles.hoursInfo}>
            <p>🕐 <strong>Horarios:</strong> Lunes a Sábado 6:00 AM - 8:00 PM</p>
            <p>📍 <strong>Cobertura:</strong> Todo el Área Metropolitana</p>
          </div>
        </div>
      </section>
    </div>
  );
}