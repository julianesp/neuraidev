"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import styles from "./StoreStatus.module.scss";

export default function StoreStatus() {
  const [isOpen, setIsOpen] = useState(true);
  const [loading, setLoading] = useState(true);
  const supabase = createClient();

  // Función para verificar si está dentro del horario
  const isWithinBusinessHours = (openTime, closeTime) => {
    const now = new Date();
    const currentTime = now.getHours() * 60 + now.getMinutes();

    const [openHour, openMin] = openTime.split(":").map(Number);
    const [closeHour, closeMin] = closeTime.split(":").map(Number);

    const openMinutes = openHour * 60 + openMin;
    const closeMinutes = closeHour * 60 + closeMin;

    return currentTime >= openMinutes && currentTime < closeMinutes;
  };

  // Función para obtener el estado de la tienda
  const fetchStoreStatus = async () => {
    try {
      const { data, error } = await supabase
        .from("StoreStatus")
        .select("*")
        .eq("id", 1)
        .single();

      if (error) {
        console.error("Error al obtener estado de la tienda:", error);
        // Si hay error, usar localStorage como fallback
        const savedStatus = localStorage.getItem("storeStatus");
        setIsOpen(savedStatus ? JSON.parse(savedStatus) : true);
        return;
      }

      if (data) {
        let finalStatus = data.is_open;

        // Si hay override manual activo
        if (data.manual_override) {
          // Verificar si el override ha expirado
          if (data.override_until) {
            const overrideDate = new Date(data.override_until);
            const now = new Date();

            if (now > overrideDate) {
              // Override expirado, usar horario automático
              finalStatus = isWithinBusinessHours(
                data.open_time,
                data.close_time,
              );

              // Actualizar en la BD para quitar el override
              await supabase
                .from("StoreStatus")
                .update({
                  manual_override: false,
                  override_until: null,
                  is_open: finalStatus,
                })
                .eq("id", 1);
            }
          }
        } else {
          // Sin override, usar horario automático
          finalStatus = isWithinBusinessHours(data.open_time, data.close_time);

          // Actualizar estado si cambió
          if (finalStatus !== data.is_open) {
            await supabase
              .from("StoreStatus")
              .update({ is_open: finalStatus })
              .eq("id", 1);
          }
        }

        setIsOpen(finalStatus);
        localStorage.setItem("storeStatus", JSON.stringify(finalStatus));
      }
    } catch (err) {
      console.error("Error al verificar estado:", err);
      // Fallback a localStorage
      const savedStatus = localStorage.getItem("storeStatus");
      setIsOpen(savedStatus ? JSON.parse(savedStatus) : true);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStoreStatus();

    // Actualizar cada 60 segundos
    const interval = setInterval(fetchStoreStatus, 60000);

    // Suscripción a cambios en tiempo real
    const channel = supabase
      .channel("store-status-changes")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "StoreStatus",
          filter: "id=eq.1",
        },
        () => {
          fetchStoreStatus();
        },
      )
      .subscribe();

    return () => {
      clearInterval(interval);
      supabase.removeChannel(channel);
    };
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
