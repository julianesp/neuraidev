"use client";

import Link from "next/link";
import {
  Store,
  Package,
  ShoppingCart,
  TrendingUp,
  CheckCircle,
  ArrowRight,
} from "lucide-react";
import styles from "./WebDevSection.module.scss";

export default function WebDevSection() {
  const beneficios = [
    {
      icon: <Store size={36} />,
      titulo: "Perfil listo",
      descripcion: "Tu tienda configurada y activa desde el primer día",
      color: "#0070f3",
    },
    {
      icon: <Package size={36} />,
      titulo: "Publica fácil",
      descripcion: "Tus productos aparecen visibles al instante para todos",
      color: "#764ba2",
    },
    {
      icon: <ShoppingCart size={36} />,
      titulo: "Recibe pedidos",
      descripcion: "Gestiona pedidos y clientes en tiempo real",
      color: "#0070f3",
    },
    {
      icon: <TrendingUp size={36} />,
      titulo: "Ve tus ganancias",
      descripcion: "Dashboard con estadísticas de ventas actualizado",
      color: "#43e97b",
    },
  ];

  const pasos = [
    "Regístrate — menos de un minuto",
    "Configura tu tienda (nombre y categoría)",
    "Publica productos — activos de inmediato",
  ];

  return (
    <section className={styles.webDevSection}>
      <div className={styles.container}>
        {/* Header */}
        <div className={styles.header}>
          <span className={styles.badge}>Para tiendas y negocios</span>
          <h2>Vende tus productos en Neurai</h2>
          <p>
            Te entregamos tu espacio listo y configurado. Solo accede y empieza
            a publicar — tus productos quedan activos inmediatamente.
          </p>
        </div>

        {/* Beneficios Grid */}
        {/* <div className={styles.servicesGrid}>
          {beneficios.map((b, index) => (
            <div key={index} className={styles.serviceCard}>
              <div
                className={styles.iconWrapper}
                style={{
                  background: `linear-gradient(135deg, ${b.color}, ${b.color}dd)`,
                }}
              >
                {b.icon}
              </div>
              <h3>{b.titulo}</h3>
              <p>{b.descripcion}</p>
            </div>
          ))}
        </div> */}

        {/* CTA */}
        <div className={styles.cta}>
          {/* <h3>Tu tienda en 3 pasos</h3> */}
          {/* <ul style={{ listStyle: "none", padding: 0, marginBottom: "24px", textAlign: "left", maxWidth: "360px", margin: "0 auto 24px" }}>
            {pasos.map((paso, i) => (
              <li key={i} style={{ display: "flex", alignItems: "center", gap: "10px", padding: "6px 0", color: "rgba(255,255,255,0.9)", fontSize: "0.95rem" }}>
                <span style={{ width: "22px", height: "22px", background: "rgba(255,255,255,0.2)", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "0.75rem", fontWeight: "bold", flexShrink: 0 }}>
                  {i + 1}
                </span>
                {paso}
              </li>
            ))}
          </ul> */}
          {/* <p style={{ fontSize: "0.85rem", opacity: 0.75, marginBottom: "28px" }}>
            Los pagos en línea los gestionamos nosotros — tú solo te enfocas en vender.
          </p> */}
          <div className={styles.ctaButtons}>
            <Link href="/para-tiendas" className={styles.primaryBtn}>
              Crear mi tienda gratis
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
