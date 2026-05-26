"use client";

import { useState, useEffect } from "react";
import styles from "./StoreStatus.module.scss";

export default function StoreStatus() {
  const [isOpen, setIsOpen] = useState(true);
  const [loading, setLoading] = useState(true);

  // Función para obtener el estado de la tienda
  const fetchStoreStatus = async () => {
    try {
      const res = await fetch('/api/tiendas/info');
      if (!res.ok) throw new Error('Error al obtener estado');
      const data = await res.json();
      const status = data.storeStatus || data;
      setIsOpen(!!status.is_open);
      localStorage.setItem("storeStatus", JSON.stringify(!!status.is_open));
    } catch (err) {
      console.error("Error al verificar estado:", err);
      const savedStatus = localStorage.getItem("storeStatus");
      setIsOpen(savedStatus ? JSON.parse(savedStatus) : true);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStoreStatus();
    const interval = setInterval(fetchStoreStatus, 300000);
    return () => clearInterval(interval);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (loading) {
    return null; // O un skeleton loader si prefieres
  }

  return (
    <div className={styles.storeStatusContainer}>
      <div
        className={`${styles.storeButton} ${isOpen ? styles.open : styles.closed}`}
        aria-label={isOpen ? "Tienda abierta" : "Tienda cerrada"}
      >
        <div className={styles.statusIcon}>
          <span className={styles.dot}></span>
        </div>
        <span className={styles.statusText}>
          {isOpen ? "Disponible" : "Cerrado"}
        </span>
      </div>
    </div>
  );
}
