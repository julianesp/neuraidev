"use client";

import React from "react";
import Image from "next/image";
import Link from "next/link";
import styles from "./contable.module.css";

export default function ServicioContable() {
  const services = [
    {
      id: 1,
      title: "Contabilidad General",
      description:
        "Llevamos la contabilidad completa de tu empresa con precisión y cumplimiento normativo.",
      features: [
        "Registro de todas las operaciones contables",
        "Elaboración de estados financieros",
        "Conciliaciones bancarias",
        "Control de cartera y proveedores",
        "Análisis financiero mensual",
        "Asesoría contable permanente",
      ],
      icon: "📊",
      price: "Desde $350.000/mes",
    },
    {
      id: 2,
      title: "Declaraciones Tributarias",
      description:
        "Preparación y presentación de todas las declaraciones fiscales requeridas por la DIAN.",
      features: [
        "Declaración de Renta",
        "Declaración de IVA bimestral",
        "Información Exógena",
        "Retención en la fuente",
        "Industria y Comercio",
        "Seguimiento de obligaciones",
      ],
      icon: "📋",
      price: "Desde $180.000",
    },
    {
      id: 3,
      title: "Nómina y Seguridad Social",
      description:
        "Gestión integral de nómina y liquidación de aportes al sistema de seguridad social.",
      features: [
        "Liquidación de nómina mensual",
        "Cálculo de prestaciones sociales",
        "Aportes a EPS, ARP, Pensiones",
        "Parafiscales (ICBF, SENA, Cajas)",
        "Certificados laborales",
        "Asesoría en contratación",
      ],
      icon: "👥",
      price: "Desde $15.000/empleado",
    },
    {
      id: 4,
      title: "Constitución de Empresas",
      description:
        "Te acompañamos en todo el proceso de constitución y formalización de tu empresa.",
      features: [
        "Verificación de nombre disponible",
        "Elaboración de estatutos",
        "Registro en Cámara de Comercio",
        "Obtención de RUT",
        "Registro de libros contables",
        "Asesoría en tipo de sociedad",
      ],
      icon: "🏢",
      price: "Desde $450.000",
    },
  ];

  const whyChooseUs = [
    {
      title: "Experiencia Comprobada",
      description: "Más de 8 años asesorando empresas de todos los sectores",
      icon: "⭐",
    },
    {
      title: "Cumplimiento Garantizado",
      description:
        "Nos aseguramos de que cumplas con todas las obligaciones fiscales",
      icon: "✅",
    },
    {
      title: "Tecnología Avanzada",
      description:
        "Utilizamos software especializado para mayor eficiencia y precisión",
      icon: "💻",
    },
    {
      title: "Atención Personalizada",
      description: "Cada cliente recibe un servicio adaptado a sus necesidades",
      icon: "🤝",
    },
  ];

  return (
    <div className={styles.contableContainer}>
      {/* Hero Section */}
      <section className={styles.heroSection}>
        <div className={styles.heroContent}>
          <h1 className={styles.heroTitle}>
            Servicios{" "}
            <span className={styles.highlight}>Contables</span>
          </h1>
          <p className={styles.heroDescription}>
            Mantén tu empresa al día con nuestros servicios contables integrales.
            Expertos en normatividad colombiana y crecimiento empresarial.
          </p>
          <div className={styles.heroButtons}>
            <Link href="#servicios" className={styles.primaryButton}>
              Ver Servicios
            </Link>
            <Link href="#contacto" className={styles.secondaryButton}>
              Consulta Gratuita
            </Link>
          </div>
        </div>
        <div className={styles.heroImage}>
          <div className={styles.calculatorIcon}>🧮</div>
        </div>
      </section>

      {/* Services Section */}
      <section id="servicios" className={styles.servicesSection}>
        <div className={styles.container}>
          <h2 className={styles.sectionTitle}>Nuestros Servicios Contables</h2>
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
                  Solicitar Información
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

      {/* Compliance Section */}
      <section className={styles.complianceSection}>
        <div className={styles.container}>
          <h2 className={styles.sectionTitle}>Calendario Tributario 2025</h2>
          <div className={styles.complianceGrid}>
            <div className={styles.complianceCard}>
              <h3>📅 Fechas Importantes</h3>
              <ul>
                <li>IVA Bimestral: Cada 2 meses</li>
                <li>Retención en la Fuente: Mensual</li>
                <li>Declaración de Renta: Abril - Agosto</li>
                <li>Información Exógena: Abril</li>
              </ul>
            </div>
            <div className={styles.complianceCard}>
              <h3>⚠️ Evita Sanciones</h3>
              <ul>
                <li>Presentación extemporánea</li>
                <li>Errores en declaraciones</li>
                <li>Incumplimiento de fechas</li>
                <li>Libros contables desactualizados</li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section id="contacto" className={styles.ctaSection}>
        <div className={styles.container}>
          <h2 className={styles.ctaTitle}>
            ¿Listo para organizar tus finanzas?
          </h2>
          <p className={styles.ctaDescription}>
            Programa una consulta gratuita y descubre cómo podemos ayudarte
          </p>
          <div className={styles.ctaButtons}>
            <Link href="tel:+573174503604" className={styles.phoneButton}>
              📞 +57 317 450 3604
            </Link>
            <Link href="https://wa.me/573174503604?text=Hola, necesito asesoría contable" className={styles.whatsappButton}>
              💬 WhatsApp
            </Link>
          </div>
          <div className={styles.professionalInfo}>
            <p>🎓 <strong>Contadora Pública Titulada</strong> - Tarjeta Profesional No. 12345</p>
            <p>📍 <strong>Ubicación:</strong> Disponible presencial y virtual</p>
            <p>🕐 <strong>Horarios:</strong> Lunes a Viernes 8:00 AM - 6:00 PM</p>
          </div>
        </div>
      </section>
    </div>
  );
}