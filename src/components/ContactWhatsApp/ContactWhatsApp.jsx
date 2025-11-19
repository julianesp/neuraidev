"use client";

import React, { useState } from "react";
import styles from "./ContactWhatsApp.module.scss";

export default function ContactWhatsApp() {
  const [formData, setFormData] = useState({
    nombre: "",
    telefono: "",
    producto: "",
    mensaje: "",
  });

  const [errors, setErrors] = useState({});

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
    // Limpiar error cuando el usuario empiece a escribir
    if (errors[name]) {
      setErrors((prev) => ({
        ...prev,
        [name]: "",
      }));
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.nombre.trim()) {
      newErrors.nombre = "Por favor ingresa tu nombre";
    }

    if (!formData.telefono.trim()) {
      newErrors.telefono = "Por favor ingresa tu teléfono";
    } else if (!/^\d{10}$/.test(formData.telefono.replace(/\s/g, ""))) {
      newErrors.telefono = "Ingresa un teléfono válido (10 dígitos)";
    }

    if (!formData.producto.trim()) {
      newErrors.producto = "Por favor indica qué producto te interesa";
    }

    if (!formData.mensaje.trim()) {
      newErrors.mensaje = "Por favor cuéntanos sobre el producto que buscas";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    // Construir el mensaje para WhatsApp
    const mensaje = `
Hola, me gustaría obtener información sobre este producto:

👤 *Nombre:* ${formData.nombre}
📱 *Teléfono:* ${formData.telefono}
🛍️ *Producto de interés:* ${formData.producto}
💬 *Detalles del producto:* ${formData.mensaje}
    `.trim();

    // Número de WhatsApp (debes reemplazarlo con tu número)
    const phoneNumber = "573174503604"; // Formato: código de país + número sin espacios

    // Crear URL de WhatsApp
    const whatsappUrl = `https://wa.me/${phoneNumber}?text=${encodeURIComponent(
      mensaje,
    )}`;

    // Abrir WhatsApp en una nueva ventana
    window.open(whatsappUrl, "_blank");

    // Limpiar formulario
    setFormData({
      nombre: "",
      telefono: "",
      producto: "",
      mensaje: "",
    });
  };

  return (
    <section
      className={`${styles.contactSection} ${styles.fadeInUp} dark:bg-gray-900 dark:backdrop `}
    >
      <div
        className={`${styles.container} dark:bg-gray-900 dark:backdrop`}
        data-aos="fade-up"
      >
        <div className={styles.header}>
          <h2 className={`${styles.title} dark:text-white`}>
            ¿Falta el producto que buscabas?
          </h2>
          <p className={styles.subtitle}>
            Completa el formulario y te contactaremos por WhatsApp para ayudarte
          </p>
        </div>

        <form onSubmit={handleSubmit} className={styles.form}>
          <div className={styles.formGrid}>
            {/* Campo Nombre */}
            <div className={styles.formGroup}>
              <label
                htmlFor="nombre"
                className={styles.label}
                data-aos="fade-right"
              >
                Nombre completo <span className={styles.required}>*</span>
              </label>
              <input
                type="text"
                id="nombre"
                name="nombre"
                data-aos="fade-right"
                value={formData.nombre}
                onChange={handleChange}
                className={`${styles.input} ${
                  errors.nombre ? styles.inputError : ""
                }`}
                placeholder="Ej: Alan Turing"
              />
              {errors.nombre && (
                <span className={styles.errorText}>{errors.nombre}</span>
              )}
            </div>

            {/* Campo Teléfono */}
            <div className={styles.formGroup}>
              <label htmlFor="telefono" className={styles.label} data-aos="fade-left">
                Teléfono / WhatsApp <span className={styles.required}>*</span>
              </label>
              <input
                type="tel"
                id="telefono"
                name="telefono"
                data-aos="fade-left"
                value={formData.telefono}
                onChange={handleChange}
                className={`${styles.input} ${
                  errors.telefono ? styles.inputError : ""
                }`}
                placeholder="Ej: 3001234567"
              />
              {errors.telefono && (
                <span className={styles.errorText}>{errors.telefono}</span>
              )}
            </div>
          </div>

          {/* Campo Producto */}
          <div className={styles.formGroup}>
            <label htmlFor="producto" className={styles.label} data-aos="fade-up">
              Producto de interés <span className={styles.required}>*</span>
            </label>
            <select
              id="producto"
              name="producto"
              value={formData.producto}
              onChange={handleChange}
              data-aos="fade-up"
              className={`${styles.select} ${
                errors.producto ? styles.inputError : ""
              }`}
            >
              <option value="">Selecciona una categoría</option>
              <option value="Celulares">Celulares</option>
              <option value="Computadores">Computadores</option>
              <option value="Accesorios para Damas">
                Accesorios para Damas
              </option>
              <option value="Libros Nuevos">Libros Nuevos</option>
              <option value="Libros Usados">Libros Usados</option>
              <option value="Accesorios Generales">Accesorios Generales</option>
              <option value="Desarrollo Web">Desarrollo Web</option>
              <option value="Servicios Técnicos">Servicios Técnicos</option>
              <option value="Otro">Otro</option>
            </select>
            {errors.producto && (
              <span className={styles.errorText}>{errors.producto}</span>
            )}
          </div>

          {/* Campo Mensaje Adicional */}
          <div className={styles.formGroup}>
            <label htmlFor="mensaje" className={styles.label} data-aos="fade-up">
              Cuéntame acerca de tu producto{" "}
              <span className={styles.required}>*</span>
            </label>
            <textarea
              id="mensaje"
              name="mensaje"
              value={formData.mensaje}
              onChange={handleChange}
              data-aos="fade-up"
              className={`${styles.textarea} ${
                errors.mensaje ? styles.inputError : ""
              }`}
              placeholder="Cuéntanos más detalles sobre lo que necesitas..."
              rows="4"
            />
            {errors.mensaje && (
              <span className={styles.errorText}>{errors.mensaje}</span>
            )}
          </div>

          {/* Botón de envío */}
          <button type="submit" className={styles.submitButton} data-aos="zoom-in">
            <svg
              className={styles.whatsappIcon}
              viewBox="0 0 24 24"
              fill="currentColor"
            >
              <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z" />
            </svg>
            Contactar por WhatsApp
          </button>

          <p className={styles.privacyText}>
            Al enviar este formulario, serás redirigido a WhatsApp para
            continuar la conversación
          </p>
        </form>
      </div>
    </section>
  );
}
