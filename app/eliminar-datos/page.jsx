"use client";

import React, { useState } from "react";
import { useUser } from "@clerk/nextjs";

export default function EliminarDatosPage() {
  const { user, isSignedIn } = useUser();
  const [formData, setFormData] = useState({
    nombre: "",
    email: "",
    razon: "",
    confirmacion: false,
  });
  const [enviado, setEnviado] = useState(false);
  const [enviando, setEnviando] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setEnviando(true);

    try {
      const response = await fetch("/api/eliminar-datos", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          nombre: isSignedIn ? user?.fullName : formData.nombre,
          email: isSignedIn
            ? user?.primaryEmailAddress?.emailAddress
            : formData.email,
          razon: formData.razon,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        setEnviado(true);
      } else {
        alert("Error al enviar la solicitud: " + (data.error || "Error desconocido"));
      }
    } catch (error) {
      console.error("Error al enviar solicitud:", error);
      alert("Error al enviar la solicitud. Por favor, intenta nuevamente.");
    } finally {
      setEnviando(false);
    }
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-12 px-4 sm:px-6 lg:px-8 relative">
      {/* Fondo con backdrop-filter */}
      <div className="absolute inset-0 bg-gradient-to-br from-blue-100/20 via-purple-50/15 to-pink-100/20 dark:from-blue-900/20 dark:via-purple-900/15 dark:to-pink-900/20"></div>
      <div className="absolute inset-0 backdrop-blur-[1px] bg-white/5 dark:bg-black/10"></div>

      {/* Contenido */}
      <div className="max-w-4xl mx-auto bg-white/95 dark:bg-gray-800/90 backdrop-blur-sm rounded-lg shadow-lg p-8 relative z-10 border border-white/20 dark:border-gray-700/30">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
            Solicitud de Eliminación de Datos
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Respetamos tu privacidad y tu derecho a controlar tus datos
            personales
          </p>
        </div>

        {!enviado ? (
          <div className="space-y-10">
            <section>
              <h2 className="text-2xl font-semibold text-gray-800 dark:text-gray-200 mb-4">
                ¿Qué datos recopilamos?
              </h2>
              <p className="text-gray-700 dark:text-gray-300 leading-relaxed mb-4">
                En NeuraI.dev, recopilamos y almacenamos la siguiente
                información cuando usas nuestros servicios:
              </p>
              <ul className="list-disc list-inside space-y-2 text-gray-700 dark:text-gray-300 ml-4">
                <li>
                  <strong>Información de perfil:</strong> Nombre, correo
                  electrónico, foto de perfil (si inicias sesión con Facebook u
                  otros proveedores)
                </li>
                <li>
                  <strong>Datos de compras:</strong> Historial de pedidos,
                  direcciones de envío, información de facturación
                </li>
                <li>
                  <strong>Interacciones sociales:</strong> Comentarios, likes,
                  calificaciones de productos
                </li>
                <li>
                  <strong>Datos técnicos:</strong> Dirección IP, tipo de
                  navegador, páginas visitadas
                </li>
                <li>
                  <strong>Favoritos:</strong> Productos guardados en tu lista
                  de favoritos
                </li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-gray-800 dark:text-gray-200 mb-4">
                ¿Qué sucederá al eliminar tus datos?
              </h2>
              <p className="text-gray-700 dark:text-gray-300 leading-relaxed mb-4">
                Cuando solicites la eliminación de tus datos:
              </p>
              <ul className="list-disc list-inside space-y-2 text-gray-700 dark:text-gray-300 ml-4">
                <li>
                  Tu cuenta de usuario será desactivada permanentemente
                </li>
                <li>
                  Tus datos personales (nombre, email, foto) serán eliminados
                  de nuestros sistemas
                </li>
                <li>
                  Tus comentarios y likes serán anonimizados (mostrarán
                  "Usuario eliminado")
                </li>
                <li>
                  Tu historial de pedidos se conservará solo si es requerido
                  por ley fiscal o contable (hasta 5 años)
                </li>
                <li>
                  No podrás recuperar tu cuenta después de la eliminación
                </li>
              </ul>
              <div className="mt-4 p-4 bg-yellow-50 dark:bg-yellow-900/20 border-l-4 border-yellow-400 dark:border-yellow-600">
                <p className="text-sm text-yellow-800 dark:text-yellow-200">
                  <strong>Nota importante:</strong> Si tienes pedidos pendientes
                  o en proceso, estos deben completarse antes de procesar tu
                  solicitud de eliminación.
                </p>
              </div>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-gray-800 dark:text-gray-200 mb-4">
                Tiempo de procesamiento
              </h2>
              <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
                Procesaremos tu solicitud en un plazo máximo de{" "}
                <strong>30 días calendario</strong> desde la recepción de la
                misma. Recibirás una confirmación por correo electrónico una vez
                completado el proceso.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-gray-800 dark:text-gray-200 mb-4">
                Solicitar eliminación de datos
              </h2>
              <p className="text-gray-700 dark:text-gray-300 leading-relaxed mb-6">
                Completa el siguiente formulario para iniciar el proceso de
                eliminación de tus datos personales:
              </p>

              <form
                onSubmit={handleSubmit}
                className="space-y-6 bg-gray-50 dark:bg-gray-700/50 p-6 rounded-lg"
              >
                <div>
                  <label
                    htmlFor="nombre"
                    className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
                  >
                    Nombre completo *
                  </label>
                  <input
                    type="text"
                    id="nombre"
                    name="nombre"
                    required
                    value={isSignedIn ? user?.fullName || "" : formData.nombre}
                    onChange={handleChange}
                    disabled={isSignedIn}
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-800 text-gray-900 dark:text-white disabled:opacity-60"
                  />
                </div>

                <div>
                  <label
                    htmlFor="email"
                    className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
                  >
                    Correo electrónico *
                  </label>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    required
                    value={
                      isSignedIn
                        ? user?.primaryEmailAddress?.emailAddress || ""
                        : formData.email
                    }
                    onChange={handleChange}
                    disabled={isSignedIn}
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-800 text-gray-900 dark:text-white disabled:opacity-60"
                  />
                  <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                    Debe coincidir con el correo registrado en tu cuenta
                  </p>
                </div>

                <div>
                  <label
                    htmlFor="razon"
                    className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
                  >
                    Razón de la solicitud (opcional)
                  </label>
                  <textarea
                    id="razon"
                    name="razon"
                    rows="4"
                    value={formData.razon}
                    onChange={handleChange}
                    placeholder="Cuéntanos por qué deseas eliminar tus datos (opcional)"
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                  ></textarea>
                </div>

                <div className="flex items-start">
                  <input
                    type="checkbox"
                    id="confirmacion"
                    name="confirmacion"
                    required
                    checked={formData.confirmacion}
                    onChange={handleChange}
                    className="mt-1 h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                  <label
                    htmlFor="confirmacion"
                    className="ml-2 text-sm text-gray-700 dark:text-gray-300"
                  >
                    Confirmo que entiendo que esta acción es permanente e
                    irreversible, y que mi cuenta y datos personales serán
                    eliminados de forma definitiva.
                  </label>
                </div>

                <div className="flex gap-4">
                  <button
                    type="submit"
                    disabled={enviando || !formData.confirmacion}
                    className="flex-1 bg-red-600 hover:bg-red-700 disabled:bg-gray-400 text-white font-semibold py-3 px-6 rounded-lg transition-colors duration-200 disabled:cursor-not-allowed"
                  >
                    {enviando ? "Enviando..." : "Solicitar Eliminación"}
                  </button>
                </div>
              </form>
            </section>

            <section className="border-t border-gray-200 dark:border-gray-700 pt-8">
              <h2 className="text-2xl font-semibold text-gray-800 dark:text-gray-200 mb-4">
                Métodos alternativos de contacto
              </h2>
              <p className="text-gray-700 dark:text-gray-300 leading-relaxed mb-4">
                También puedes solicitar la eliminación de tus datos contactándonos
                directamente:
              </p>
              <ul className="list-none space-y-3 text-gray-700 dark:text-gray-300">
                <li className="flex items-center">
                  <span className="text-2xl mr-3">📧</span>
                  <div>
                    <strong>Email:</strong>{" "}
                    <a
                      href="mailto:julii1295@gmail.com"
                      className="text-blue-600 dark:text-blue-400 hover:underline"
                    >
                      julii1295@gmail.com
                    </a>
                  </div>
                </li>
                <li className="flex items-center">
                  <span className="text-2xl mr-3">💬</span>
                  <div>
                    <strong>WhatsApp:</strong>{" "}
                    <a
                      href="https://wa.me/573174503604"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-600 dark:text-blue-400 hover:underline"
                    >
                      +57 317 450 3604
                    </a>
                  </div>
                </li>
                <li className="flex items-center">
                  <span className="text-2xl mr-3">📍</span>
                  <div>
                    <strong>Dirección:</strong> Calle 1A # 6 - 7, Colón -
                    Putumayo, Colombia
                  </div>
                </li>
              </ul>
              <p className="mt-4 text-sm text-gray-600 dark:text-gray-400">
                Al contactarnos por otros medios, asegúrate de incluir tu nombre
                completo y correo electrónico registrado para que podamos
                verificar tu identidad.
              </p>
            </section>

            <section className="bg-blue-50 dark:bg-blue-900/20 p-6 rounded-lg border border-blue-200 dark:border-blue-800">
              <h3 className="text-lg font-semibold text-blue-900 dark:text-blue-100 mb-2">
                ¿Tienes dudas?
              </h3>
              <p className="text-blue-800 dark:text-blue-200 text-sm">
                Si tienes preguntas sobre nuestro manejo de datos o el proceso de
                eliminación, consulta nuestra{" "}
                <a
                  href="/politicas"
                  className="underline hover:text-blue-600 dark:hover:text-blue-300"
                >
                  Política de Privacidad
                </a>{" "}
                o contáctanos directamente.
              </p>
            </section>
          </div>
        ) : (
          <div className="text-center py-12">
            <div className="mb-6">
              <svg
                className="mx-auto h-24 w-24 text-green-500"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
            </div>
            <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
              Solicitud recibida
            </h2>
            <p className="text-gray-700 dark:text-gray-300 mb-6 max-w-2xl mx-auto">
              Tu solicitud de eliminación de datos ha sido recibida
              correctamente. Procesaremos tu solicitud en un plazo máximo de 30
              días y te enviaremos una confirmación por correo electrónico.
            </p>
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-8">
              Número de referencia:{" "}
              <span className="font-mono font-semibold">
                {Math.random().toString(36).substring(2, 10).toUpperCase()}
              </span>
            </p>
            <button
              onClick={() => (window.location.href = "/")}
              className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-8 rounded-lg transition-colors duration-200"
            >
              Volver al inicio
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
