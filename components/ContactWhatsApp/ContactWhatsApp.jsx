"use client";

import React, { useEffect, useRef, useState } from "react";
import styles from "./ContactWhatsApp.module.scss";

const CATEGORIAS = [
  "Celulares",
  "Computadores",
  "Accesorios Generales",
  "Desarrollo Web",
  "Servicios Técnicos",
  "Otro",
];

// Una pregunta a la vez: primero lo que busca (lo más fácil de responder)
const PASOS = [
  { campo: "producto", titulo: "¿Qué estás buscando?" },
  { campo: "mensaje", titulo: "Cuéntanos sobre el producto" },
  { campo: "nombre", titulo: "¿Cómo te llamas?" },
  { campo: "telefono", titulo: "¿A qué WhatsApp te escribimos?" },
];

const VACIO = { nombre: "", telefono: "", producto: "", mensaje: "" };

function validar(campo, valor) {
  const v = valor.trim();
  if (campo === "producto" && !v) return "Elige una opción";
  if (campo === "mensaje" && !v) return "Cuéntanos qué producto buscas";
  if (campo === "nombre" && !v) return "Escribe tu nombre";
  if (campo === "telefono") {
    if (!v) return "Escribe tu número de WhatsApp";
    if (!/^\d{10}$/.test(v.replace(/\s/g, ""))) return "Debe tener 10 dígitos";
  }
  return "";
}

export default function ContactWhatsApp() {
  const [formData, setFormData] = useState(VACIO);
  const [paso, setPaso] = useState(0);
  const [error, setError] = useState("");
  const campoRef = useRef(null);
  const yaInteractuo = useRef(false);

  const actual = PASOS[paso];
  const ultimo = paso === PASOS.length - 1;

  // Al pasar de pregunta, el cursor queda listo en el campo nuevo
  // (no en la primera carga, para no mover la página)
  useEffect(() => {
    if (!yaInteractuo.current) return;
    campoRef.current?.focus({ preventScroll: true });
  }, [paso]);

  const cambiar = (campo, valor) => {
    setFormData((prev) => ({ ...prev, [campo]: valor }));
    if (error) setError("");
  };

  const enviarWhatsApp = (datos) => {
    const mensaje = `
Hola, me gustaría obtener información sobre este producto:

👤 *Nombre:* ${datos.nombre}
📱 *Teléfono:* ${datos.telefono}
🛍️ *Producto de interés:* ${datos.producto}
💬 *Detalles del producto:* ${datos.mensaje}
    `.trim();
    const phoneNumber = "573174503604";
    window.open(
      `https://wa.me/${phoneNumber}?text=${encodeURIComponent(mensaje)}`,
      "_blank"
    );
    setFormData(VACIO);
    setPaso(0);
  };

  const siguiente = (datos = formData) => {
    yaInteractuo.current = true;
    const msg = validar(actual.campo, datos[actual.campo]);
    if (msg) return setError(msg);
    setError("");
    if (ultimo) enviarWhatsApp(datos);
    else setPaso((p) => p + 1);
  };

  const atras = () => {
    yaInteractuo.current = true;
    setError("");
    setPaso((p) => Math.max(0, p - 1));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    siguiente();
  };

  // Elegir la categoría avanza sola a la siguiente pregunta
  const elegirCategoria = (c) => {
    setFormData((prev) => ({ ...prev, producto: c }));
    yaInteractuo.current = true;
    setError("");
    setPaso(1);
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
            Responde 4 preguntas rápidas y te contactamos por WhatsApp
          </p>
        </div>

        <form onSubmit={handleSubmit} className={styles.form} noValidate>
          {/* Progreso */}
          <div className={styles.progreso}>
            <span className={styles.progresoTexto}>
              Paso {paso + 1} de {PASOS.length}
            </span>
            <div
              className={styles.barra}
              role="progressbar"
              aria-valuemin={1}
              aria-valuemax={PASOS.length}
              aria-valuenow={paso + 1}
            >
              <div
                className={styles.barraRelleno}
                style={{ width: `${((paso + 1) / PASOS.length) * 100}%` }}
              />
            </div>
          </div>

          <div key={paso} className={styles.paso}>
            <label htmlFor={`cw-${actual.campo}`} className={styles.pregunta}>
              {actual.titulo}
            </label>

            {actual.campo === "producto" && (
              <div className={styles.opciones} role="group" aria-label="Categoría">
                {CATEGORIAS.map((c) => (
                  <button
                    key={c}
                    type="button"
                    onClick={() => elegirCategoria(c)}
                    aria-pressed={formData.producto === c}
                    className={`${styles.opcion} ${
                      formData.producto === c ? styles.opcionActiva : ""
                    }`}
                  >
                    {c}
                  </button>
                ))}
              </div>
            )}

            {actual.campo === "mensaje" && (
              <textarea
                ref={campoRef}
                id="cw-mensaje"
                value={formData.mensaje}
                onChange={(e) => cambiar("mensaje", e.target.value)}
                className={`${styles.textarea} ${error ? styles.inputError : ""}`}
                placeholder="Ej.: audífonos bluetooth con cancelación de ruido, color negro…"
                rows="4"
              />
            )}

            {actual.campo === "nombre" && (
              <input
                ref={campoRef}
                type="text"
                id="cw-nombre"
                value={formData.nombre}
                onChange={(e) => cambiar("nombre", e.target.value)}
                className={`${styles.input} ${error ? styles.inputError : ""}`}
                placeholder="Tu nombre"
                autoComplete="name"
                enterKeyHint="next"
              />
            )}

            {actual.campo === "telefono" && (
              <input
                ref={campoRef}
                type="tel"
                inputMode="numeric"
                id="cw-telefono"
                value={formData.telefono}
                onChange={(e) => cambiar("telefono", e.target.value)}
                className={`${styles.input} ${error ? styles.inputError : ""}`}
                placeholder="3000000000"
                autoComplete="tel-national"
                enterKeyHint="send"
              />
            )}

            {error && <span className={styles.errorText}>{error}</span>}

            {actual.campo === "producto" && formData.producto === "" && (
              <p className={styles.ayuda}>Toca una opción para continuar</p>
            )}
          </div>

          {/* Navegación */}
          <div className={styles.navegacion}>
            {paso > 0 && (
              <button type="button" onClick={atras} className={styles.botonAtras}>
                ← Atrás
              </button>
            )}
            {(paso > 0 || formData.producto) && (
              <button type="submit" className={styles.submitButton}>
                {ultimo ? (
                  <>
                    <svg
                      className={styles.whatsappIcon}
                      viewBox="0 0 24 24"
                      fill="currentColor"
                      aria-hidden="true"
                    >
                      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z" />
                    </svg>
                    Contactar por WhatsApp
                  </>
                ) : (
                  "Siguiente →"
                )}
              </button>
            )}
          </div>

          {ultimo && (
            <p className={styles.privacyText}>
              Al enviar serás redirigido a WhatsApp para continuar la conversación
            </p>
          )}
        </form>
      </div>
    </section>
  );
}
