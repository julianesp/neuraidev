"use client";

import { useState, useEffect } from "react";
import { useUser } from "@clerk/nextjs";
import { useToast } from "@/contexts/ToastContext";
import styles from "./MiPerfil.module.scss";
import {
  UserIcon,
  EnvelopeIcon,
  PhoneIcon,
  CakeIcon,
  BellIcon,
} from "@heroicons/react/24/outline";

export default function MiPerfil() {
  const { user } = useUser();
  const toast = useToast();
  const [loading, setLoading] = useState(false);
  const [profile, setProfile] = useState(null);

  const [formData, setFormData] = useState({
    telefono: "",
    fecha_nacimiento: "",
    preferencias_notificaciones: {
      email_promociones: true,
      email_pedidos: true,
      email_novedades: false,
      push_promociones: false,
      push_pedidos: true,
    },
  });

  // Cargar perfil del usuario
  useEffect(() => {
    loadProfile();
  }, [user]);

  const loadProfile = async () => {
    try {
      const response = await fetch("/api/perfil");
      if (response.ok) {
        const data = await response.json();
        setProfile(data);
        setFormData({
          telefono: data.telefono || "",
          fecha_nacimiento: data.fecha_nacimiento || "",
          preferencias_notificaciones:
            data.preferencias_notificaciones || formData.preferencias_notificaciones,
        });
      }
    } catch (error) {
      console.error("Error al cargar perfil:", error);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleNotificationChange = (key) => {
    setFormData((prev) => ({
      ...prev,
      preferencias_notificaciones: {
        ...prev.preferencias_notificaciones,
        [key]: !prev.preferencias_notificaciones[key],
      },
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await fetch("/api/perfil", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        toast.success("Perfil actualizado correctamente", {
          title: "¡Éxito!",
        });
        loadProfile();
      } else {
        throw new Error("Error al actualizar perfil");
      }
    } catch (error) {
      console.error("Error:", error);
      toast.error("No se pudo actualizar el perfil", {
        title: "Error",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.miPerfil}>
      <h2 className={styles.title}>Información Personal</h2>

      <form onSubmit={handleSubmit} className={styles.form}>
        {/* Información de Clerk (solo lectura) */}
        <div className={styles.section}>
          <h3 className={styles.sectionTitle}>Información de Cuenta</h3>
          <p className={styles.sectionSubtitle}>
            Esta información está gestionada por tu cuenta de usuario
          </p>

          <div className={styles.formGrid}>
            <div className={styles.formGroup}>
              <label>
                <UserIcon className={styles.icon} />
                Nombre Completo
              </label>
              <input
                type="text"
                value={user?.fullName || ""}
                disabled
                className={styles.inputDisabled}
              />
            </div>

            <div className={styles.formGroup}>
              <label>
                <EnvelopeIcon className={styles.icon} />
                Correo Electrónico
              </label>
              <input
                type="email"
                value={user?.primaryEmailAddress?.emailAddress || ""}
                disabled
                className={styles.inputDisabled}
              />
            </div>
          </div>
        </div>

        {/* Información adicional (editable) */}
        <div className={styles.section}>
          <h3 className={styles.sectionTitle}>Información Adicional</h3>

          <div className={styles.formGrid}>
            <div className={styles.formGroup}>
              <label htmlFor="telefono">
                <PhoneIcon className={styles.icon} />
                Teléfono
              </label>
              <input
                type="tel"
                id="telefono"
                name="telefono"
                value={formData.telefono}
                onChange={handleChange}
                placeholder="Ej: +57 123 456 7890"
                className={styles.input}
              />
            </div>

            <div className={styles.formGroup}>
              <label htmlFor="fecha_nacimiento">
                <CakeIcon className={styles.icon} />
                Fecha de Nacimiento
              </label>
              <input
                type="date"
                id="fecha_nacimiento"
                name="fecha_nacimiento"
                value={formData.fecha_nacimiento}
                onChange={handleChange}
                className={styles.input}
              />
            </div>
          </div>
        </div>

        {/* Preferencias de notificaciones */}
        <div className={styles.section}>
          <h3 className={styles.sectionTitle}>
            <BellIcon className={styles.iconTitle} />
            Preferencias de Notificaciones
          </h3>
          <p className={styles.sectionSubtitle}>
            Elige cómo quieres recibir actualizaciones
          </p>

          <div className={styles.notificationsGrid}>
            <div className={styles.notificationItem}>
              <label className={styles.switchLabel}>
                <input
                  type="checkbox"
                  checked={formData.preferencias_notificaciones.email_promociones}
                  onChange={() => handleNotificationChange("email_promociones")}
                  className={styles.checkbox}
                />
                <span className={styles.switchSlider}></span>
                <div className={styles.switchText}>
                  <strong>Promociones por Email</strong>
                  <small>Ofertas especiales y descuentos</small>
                </div>
              </label>
            </div>

            <div className={styles.notificationItem}>
              <label className={styles.switchLabel}>
                <input
                  type="checkbox"
                  checked={formData.preferencias_notificaciones.email_pedidos}
                  onChange={() => handleNotificationChange("email_pedidos")}
                  className={styles.checkbox}
                />
                <span className={styles.switchSlider}></span>
                <div className={styles.switchText}>
                  <strong>Estado de Pedidos</strong>
                  <small>Actualizaciones sobre tus compras</small>
                </div>
              </label>
            </div>

            <div className={styles.notificationItem}>
              <label className={styles.switchLabel}>
                <input
                  type="checkbox"
                  checked={formData.preferencias_notificaciones.email_novedades}
                  onChange={() => handleNotificationChange("email_novedades")}
                  className={styles.checkbox}
                />
                <span className={styles.switchSlider}></span>
                <div className={styles.switchText}>
                  <strong>Novedades y Noticias</strong>
                  <small>Nuevos productos y actualizaciones</small>
                </div>
              </label>
            </div>

            <div className={styles.notificationItem}>
              <label className={styles.switchLabel}>
                <input
                  type="checkbox"
                  checked={formData.preferencias_notificaciones.push_pedidos}
                  onChange={() => handleNotificationChange("push_pedidos")}
                  className={styles.checkbox}
                />
                <span className={styles.switchSlider}></span>
                <div className={styles.switchText}>
                  <strong>Notificaciones Push</strong>
                  <small>Alertas en tiempo real de tus pedidos</small>
                </div>
              </label>
            </div>
          </div>
        </div>

        {/* Botones de acción */}
        <div className={styles.actions}>
          <button
            type="submit"
            disabled={loading}
            className={styles.btnPrimary}
          >
            {loading ? "Guardando..." : "Guardar Cambios"}
          </button>
        </div>
      </form>
    </div>
  );
}
