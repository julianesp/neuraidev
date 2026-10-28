"use client";

import { useEffect, useState } from "react";
import { useUser } from "@clerk/nextjs";
import { useRouter } from "next/navigation";
import Link from "next/link";
import styles from "./perfil.module.scss";

// Componentes de cada sección
import MiPerfil from "@/components/Perfil/MiPerfil";
import MisDirecciones from "@/components/Perfil/MisDirecciones";
import MisFavoritos from "@/components/Perfil/MisFavoritos";
import HistorialCompras from "@/components/Perfil/HistorialCompras";
import MisCalificaciones from "@/app/_components/perfil/MisCalificaciones";

// Iconos
import {
  UserCircleIcon,
  MapPinIcon,
  HeartIcon,
  ShoppingBagIcon,
  StarIcon,
} from "@heroicons/react/24/outline";

const TABS = [
  { id: "historial", label: "Mis Compras", icon: ShoppingBagIcon },
  { id: "calificaciones", label: "Calificaciones", icon: StarIcon },
  { id: "favoritos", label: "Favoritos", icon: HeartIcon },
  { id: "direcciones", label: "Direcciones", icon: MapPinIcon },
  { id: "perfil", label: "Mis datos", icon: UserCircleIcon },
];

const pesos = (n) => `$${Math.round(Number(n) || 0).toLocaleString("es-CO")}`;

const NOMBRE_PROVEEDOR = { facebook: "Facebook", google: "Google" };

export default function PerfilPage() {
  const { isLoaded, isSignedIn, user } = useUser();
  const router = useRouter();
  const [activeTab, setActiveTab] = useState("historial");
  const [datos, setDatos] = useState(null);

  // Sin sesión: a iniciar sesión y volver aquí
  useEffect(() => {
    if (isLoaded && !isSignedIn) router.replace("/sign-in?redirect_url=/perfil");
  }, [isLoaded, isSignedIn, router]);

  // Resumen: compras, favoritos, calificaciones y 15%
  useEffect(() => {
    if (!isSignedIn) return;
    fetch("/api/perfil/resumen")
      .then((r) => (r.ok ? r.json() : null))
      .then(setDatos)
      .catch(() => {});
  }, [isSignedIn]);

  if (!isLoaded || !isSignedIn) {
    return (
      <div className={styles.loadingContainer}>
        <div className={styles.spinner}></div>
        <p>Cargando tu perfil...</p>
      </div>
    );
  }

  // Foto: la de Facebook si entró con Facebook; si no, la de su cuenta
  const fb = user.externalAccounts?.find((a) => /facebook/.test(a.provider || ""));
  const foto = fb?.imageUrl || user.imageUrl;
  const proveedores = (datos?.proveedores || []).map((p) => NOMBRE_PROVEEDOR[p] || p);
  const desde = new Date(datos?.miembroDesde || user.createdAt);

  const resumen = datos?.resumen;
  const compras = (resumen?.pedidosPagados || 0) + (resumen?.ventasRegistradas || 0);
  const descuento = datos?.descuento;
  const descuentoActivo = descuento && (descuento.estado === "disponible" || descuento.estado === "reservado");
  const tieneCalificacionTecnica = (datos?.calificaciones || []).some((c) => c.tipo === "formateo");

  const stats = [
    { valor: datos ? compras : "…", texto: compras === 1 ? "Compra" : "Compras" },
    { valor: datos ? pesos(resumen?.totalGastado) : "…", texto: "En compras" },
    { valor: datos ? datos.favoritos : "…", texto: "Favoritos" },
    { valor: datos ? datos.calificaciones.length : "…", texto: "Calificaciones" },
  ];

  return (
    <div className="max-w-5xl mx-auto px-4 py-10">
      {/* Cabecera */}
      <section className="rounded-2xl bg-blue-600 text-white p-6 sm:p-8 shadow-lg">
        <div className="flex flex-col sm:flex-row items-center sm:items-end gap-5 text-center sm:text-left">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={foto || "/default-avatar.png"}
            alt={user.fullName || "Tu foto"}
            className="w-28 h-28 rounded-full object-cover border-4 border-white shadow-xl"
            loading="eager"
          />
          <div className="flex-1 min-w-0">
            <h1 className="text-2xl sm:text-3xl font-bold truncate">
              {user.fullName || user.firstName || "Bienvenido"}
            </h1>
            <p className="text-blue-100 text-sm truncate">{user.primaryEmailAddress?.emailAddress}</p>
            <div className="flex flex-wrap justify-center sm:justify-start gap-2 mt-3">
              {proveedores.map((p) => (
                <span key={p} className="text-xs font-semibold bg-white/20 rounded-full px-3 py-1">
                  Conectado con {p}
                </span>
              ))}
              <span className="text-xs font-semibold bg-white/20 rounded-full px-3 py-1">
                En neurai.dev desde {desde.toLocaleDateString("es-CO", { month: "long", year: "numeric" })}
              </span>
              {resumen?.haComprado && (
                <span className="text-xs font-semibold bg-white text-blue-700 rounded-full px-3 py-1">
                  ✓ Cliente de neurai
                </span>
              )}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-6">
          {stats.map((s) => (
            <div key={s.texto} className="rounded-xl bg-white/15 px-4 py-3 text-center">
              <p className="text-xl font-bold">{s.valor}</p>
              <p className="text-xs text-blue-100">{s.texto}</p>
            </div>
          ))}
        </div>
      </section>

      {/* 15% de cliente de servicio técnico */}
      {descuentoActivo ? (
        <div className="mt-6 rounded-2xl border-2 border-blue-600 bg-blue-50 dark:bg-blue-950/40 p-5 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div>
            <p className="text-lg font-bold text-blue-700 dark:text-blue-300">
              🎁 Tienes {descuento.porcentaje || 15}% de descuento
            </p>
            <p className="text-sm text-gray-700 dark:text-gray-300">
              Se aplica solo en el carrito en tu próxima compra de la tienda, con esta cuenta.
            </p>
          </div>
          <Link
            href="/accesorios"
            className="shrink-0 bg-blue-600 hover:bg-blue-700 text-white font-semibold px-5 py-2.5 rounded-lg transition-colors"
          >
            Ir a la tienda
          </Link>
        </div>
      ) : descuento?.estado === "usado" ? (
        <p className="mt-6 text-sm text-gray-600 dark:text-gray-400 text-center">
          Ya usaste tu 15% de descuento. ¡Gracias por tu calificación!
        </p>
      ) : datos && !tieneCalificacionTecnica ? (
        <div className="mt-6 rounded-2xl border border-blue-200 dark:border-blue-800 bg-blue-50 dark:bg-blue-950/40 p-5 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-sm text-gray-700 dark:text-gray-300">
            <strong className="text-blue-700 dark:text-blue-300">¿Te hice formateo o mantenimiento?</strong>{" "}
            Califícame y, cuando revise tu comentario, ganas 15% de descuento en una compra.
          </p>
          <Link
            href="/#calificar"
            className="shrink-0 bg-blue-600 hover:bg-blue-700 text-white font-semibold px-5 py-2.5 rounded-lg transition-colors"
          >
            Calificar
          </Link>
        </div>
      ) : datos && tieneCalificacionTecnica ? (
        <p className="mt-6 text-sm text-gray-600 dark:text-gray-400 text-center">
          Tu calificación está en revisión: cuando la apruebe se activa tu 15% de descuento.
        </p>
      ) : null}

      {/* Navegación por pestañas */}
      <div className={`${styles.tabsContainer} mt-8`}>
        <div className={styles.tabs}>
          {TABS.map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                className={`${styles.tab} ${activeTab === tab.id ? styles.active : ""}`}
                onClick={() => setActiveTab(tab.id)}
              >
                <Icon className={styles.tabIcon} />
                <span className={styles.tabLabel}>{tab.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Contenido de la pestaña activa */}
      <div className={styles.content}>
        {activeTab === "historial" && <HistorialCompras />}
        {activeTab === "calificaciones" && (
          <MisCalificaciones calificaciones={datos?.calificaciones || []} />
        )}
        {activeTab === "favoritos" && <MisFavoritos />}
        {activeTab === "direcciones" && <MisDirecciones />}
        {activeTab === "perfil" && <MiPerfil />}
      </div>
    </div>
  );
}
