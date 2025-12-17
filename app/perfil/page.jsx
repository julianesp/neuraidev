"use client";

import { useState } from "react";
import { useUser } from "@clerk/nextjs";
import { redirect } from "next/navigation";
import styles from "./perfil.module.scss";

// Componentes de cada sección
import MiPerfil from "@/components/Perfil/MiPerfil";
import MisDirecciones from "@/components/Perfil/MisDirecciones";
import MisFavoritos from "@/components/Perfil/MisFavoritos";
import HistorialCompras from "@/components/Perfil/HistorialCompras";

// Iconos
import {
  UserCircleIcon,
  MapPinIcon,
  HeartIcon,
  ShoppingBagIcon,
} from "@heroicons/react/24/outline";

const TABS = [
  {
    id: "perfil",
    label: "Mi Perfil",
    icon: UserCircleIcon,
    component: MiPerfil,
  },
  {
    id: "direcciones",
    label: "Direcciones",
    icon: MapPinIcon,
    component: MisDirecciones,
  },
  {
    id: "favoritos",
    label: "Favoritos",
    icon: HeartIcon,
    component: MisFavoritos,
  },
  {
    id: "historial",
    label: "Mis Compras",
    icon: ShoppingBagIcon,
    component: HistorialCompras,
  },
];

export default function PerfilPage() {
  const { isLoaded, isSignedIn, user } = useUser();
  const [activeTab, setActiveTab] = useState("perfil");

  // Redirigir si no está autenticado
  if (isLoaded && !isSignedIn) {
    redirect("/sign-in?redirect_url=/perfil");
  }

  // Mostrar loading mientras carga
  if (!isLoaded) {
    return (
      <div className={styles.loadingContainer}>
        <div className={styles.spinner}></div>
        <p>Cargando tu perfil...</p>
      </div>
    );
  }

  // Obtener el componente activo
  const ActiveComponent =
    TABS.find((tab) => tab.id === activeTab)?.component || MiPerfil;

  return (
    <div className={styles.perfilContainer}>
      {/* Header con información del usuario */}
      <div className={styles.header}>
        <div className={styles.userInfo}>
          <img
            src={user?.imageUrl || "/default-avatar.png"}
            alt={user?.fullName || "Usuario"}
            className={styles.avatar}
            loading="eager"
          />
          <div className={styles.userDetails}>
            <h1>
              {user?.fullName || user?.firstName || "Bienvenido"}
            </h1>
            <p className={styles.email}>{user?.primaryEmailAddress?.emailAddress}</p>
          </div>
        </div>
      </div>

      {/* Navegación por pestañas */}
      <div className={styles.tabsContainer}>
        <div className={styles.tabs}>
          {TABS.map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                className={`${styles.tab} ${
                  activeTab === tab.id ? styles.active : ""
                }`}
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
        <ActiveComponent />
      </div>
    </div>
  );
}
