"use client";

import Link from "next/link";
import {
  Code,
  Smartphone,
  Zap,
  Search,
  ShoppingCart,
  Palette,
  MessageCircle,
} from "lucide-react";
import styles from "./WebDevSection.module.scss";

export default function WebDevSection() {
  const servicios = [
    {
      icon: <Code size={40} />,
      titulo: "Desarrollo Web",
      descripcion: "Sitios web modernos, rápidos y optimizados",
      color: "#667eea",
    },
    {
      icon: <Smartphone size={40} />,
      titulo: "Diseño Responsive",
      descripcion: "Tu sitio se verá perfecto en todos los dispositivos",
      color: "#f093fb",
    },
    {
      icon: <ShoppingCart size={40} />,
      titulo: "Tiendas Online",
      descripcion: "E-commerce completo con pasarelas de pago",
      color: "#4facfe",
    },
    // {
    //   icon: <Search size={40} />,
    //   titulo: "Posicionamiento SEO",
    //   descripcion: "Aparece en las primeras posiciones de Google",
    //   color: "#43e97b",
    // },
    {
      icon: <Zap size={40} />,
      titulo: "Optimización de Rendimiento",
      descripcion: "Sitios ultra rápidos que convierten visitantes en clientes",
      color: "#fa709a",
    },
    {
      icon: <Palette size={40} />,
      titulo: "Diseño Personalizado",
      descripcion: "Cada proyecto es único y refleja la identidad de tu marca",
      color: "#fee140",
    },
  ];

  // const proyectos = [
  //   {
  //     nombre: "NeuraIStore",
  //     descripcion: "Tienda online de accesorios tecnológicos",
  //     tecnologias: ["Next.js", "Prisma", "PostgreSQL"],
  //     url: "/accesorios",
  //   },
  //   {
  //     nombre: "Sistema de Gestión",
  //     descripcion: "Panel administrativo para control de inventario",
  //     tecnologias: ["React", "Node.js", "MongoDB"],
  //     url: "/admin",
  //   },
  // ];

  return (
    <section className={styles.webDevSection}>
      <div className={styles.container}>
        {/* Header */}
        <div className={styles.header}>
          <span className={styles.badge}>Desarrollo Web</span>
          <h2>Transformamos tus ideas en realidad digital</h2>
          <p>
            Creamos sitios web profesionales que impulsan tu negocio. Desde
            landing pages hasta tiendas online completas.
          </p>
        </div>

        {/* Servicios Grid */}
        <div className={styles.servicesGrid}>
          {servicios.map((servicio, index) => (
            <div key={index} className={styles.serviceCard}>
              <div
                className={styles.iconWrapper}
                style={{
                  background: `linear-gradient(135deg, ${servicio.color}, ${servicio.color}dd)`,
                }}
              >
                {servicio.icon}
              </div>
              <h3>{servicio.titulo}</h3>
              <p>{servicio.descripcion}</p>
            </div>
          ))}
        </div>

        {/* Proyectos Destacados */}
        {/* <div className={styles.proyectos}>
          <h3>Proyectos Destacados</h3>
          <div className={styles.proyectosGrid}>
            {proyectos.map((proyecto, index) => (
              <Link
                key={index}
                href={proyecto.url}
                className={styles.proyectoCard}
              >
                <h4>{proyecto.nombre}</h4>
                <p>{proyecto.descripcion}</p>
                <div className={styles.tecnologias}>
                  {proyecto.tecnologias.map((tech, i) => (
                    <span key={i} className={styles.tech}>
                      {tech}
                    </span>
                  ))}
                </div>
              </Link>
            ))}
          </div>
        </div> */}

        {/* CTA */}
        <div className={styles.cta}>
          <h3>¿Tienes un proyecto en mente?</h3>
          <p>Conversemos sobre cómo podemos ayudarte a crecer en línea</p>
          <div className={styles.ctaButtons}>
            <Link
              href="https://wa.me/573174503604?text=Hola, me interesa un sitio web profesional"
              target="_blank"
              className={styles.primaryBtn}
            >
              <MessageCircle size={20} />
              Solicitar Cotización
            </Link>
            {/* <Link href="/servicios" className={styles.secondaryBtn}>
              Ver Todos los Servicios
            </Link> */}
          </div>
        </div>
      </div>
    </section>
  );
}
