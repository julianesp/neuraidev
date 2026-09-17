"use client";

import { useEffect, useState } from "react";
import { useUser } from "@clerk/nextjs";
import { Star, X, CheckCircle, Wrench } from "lucide-react";

/**
 * Modal de calificación del servicio técnico / formateo.
 *
 * Al iniciar sesión, consulta si el email del usuario tiene una invitación
 * pendiente (cargada por el admin en /dashboard/calificaciones). Si la tiene,
 * se muestra PRIMERO esta pregunta: estrellas (1-5) + comentario.
 *
 * La calificación entra como testimonio 'pendiente' y NO se publica hasta que
 * el admin la apruebe; además le llega una notificación a Telegram.
 *
 * Se monta globalmente desde LoginTracker (no renderiza nada si no aplica).
 */
export default function CalificacionFormateoModal() {
  const { isSignedIn, isLoaded, user } = useUser();

  const [abierto, setAbierto] = useState(false);
  const [nombre, setNombre] = useState("");
  const [calificacion, setCalificacion] = useState(0);
  const [hover, setHover] = useState(0);
  const [mensaje, setMensaje] = useState("");
  const [enviando, setEnviando] = useState(false);
  const [enviado, setEnviado] = useState(false);
  const [error, setError] = useState("");

  // Al iniciar sesión, preguntar al backend si hay invitación pendiente.
  useEffect(() => {
    if (!isLoaded || !isSignedIn) return;

    // Evitar re-mostrarlo en la misma sesión del navegador.
    const yaVisto = sessionStorage.getItem("calificacion_formateo_vista");
    if (yaVisto) return;

    let activo = true;
    fetch("/api/formateo/mi-invitacion")
      .then((r) => r.json())
      .then((data) => {
        if (!activo) return;
        if (data.tieneInvitacion) {
          setNombre(data.nombreSugerido || "");
          setAbierto(true);
        }
      })
      .catch(() => {});

    return () => {
      activo = false;
    };
  }, [isLoaded, isSignedIn]);

  function cerrar() {
    // Marcar como vista para no volver a interrumpir en esta sesión.
    sessionStorage.setItem("calificacion_formateo_vista", "1");
    setAbierto(false);
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");

    if (calificacion < 1) {
      setError("Selecciona cuántas estrellas nos das.");
      return;
    }
    if (!mensaje.trim()) {
      setError("Cuéntanos brevemente qué te pareció el servicio.");
      return;
    }

    setEnviando(true);
    try {
      const res = await fetch("/api/formateo/mi-invitacion", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          calificacion,
          mensaje: mensaje.trim(),
          nombre: nombre.trim(),
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "No se pudo enviar");
      sessionStorage.setItem("calificacion_formateo_vista", "1");
      setEnviado(true);
    } catch (err) {
      setError(err.message);
    } finally {
      setEnviando(false);
    }
  }

  if (!abierto) return null;

  const estrellaActiva = hover || calificacion;

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <div className="relative w-full max-w-md bg-white dark:bg-gray-800 rounded-2xl shadow-2xl overflow-hidden">
        {/* Cerrar */}
        <button
          onClick={cerrar}
          aria-label="Cerrar"
          className="absolute top-3 right-3 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 z-10"
        >
          <X className="w-5 h-5" />
        </button>

        {enviado ? (
          <div className="text-center px-6 py-10">
            <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
            <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
              ¡Gracias por tu calificación!
            </h3>
            <p className="text-gray-600 dark:text-gray-400 mb-6">
              La revisaremos y, una vez aprobada, se publicará en la página del
              servicio técnico.
            </p>
            <button
              onClick={cerrar}
              className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg"
            >
              Cerrar
            </button>
          </div>
        ) : (
          <>
            {/* Cabecera */}
            <div className="bg-gradient-to-br from-blue-600 to-purple-600 px-6 py-6 text-center text-white">
              <div className="w-14 h-14 rounded-full bg-white/20 flex items-center justify-center mx-auto mb-3">
                <Wrench className="w-7 h-7" />
              </div>
              <h3 className="text-lg font-bold">
                ¿Qué te pareció mi servicio de formateo?
              </h3>
              <p className="text-sm text-white/85 mt-1">
                Tu opinión me ayuda muchísimo. ¡Solo te tomará un momento!
              </p>
            </div>

            <form onSubmit={handleSubmit} className="px-6 py-6 space-y-4">
              {/* Estrellas */}
              <div className="flex flex-col items-center gap-2">
                <div className="flex gap-1">
                  {Array.from({ length: 5 }).map((_, i) => {
                    const valor = i + 1;
                    return (
                      <button
                        key={valor}
                        type="button"
                        onClick={() => setCalificacion(valor)}
                        onMouseEnter={() => setHover(valor)}
                        onMouseLeave={() => setHover(0)}
                        aria-label={`${valor} estrella${valor > 1 ? "s" : ""}`}
                        className="p-1 transition-transform hover:scale-110"
                      >
                        <Star
                          className="w-9 h-9 text-amber-400"
                          fill={valor <= estrellaActiva ? "currentColor" : "none"}
                        />
                      </button>
                    );
                  })}
                </div>
                <span className="text-xs text-gray-500 dark:text-gray-400 h-4">
                  {estrellaActiva > 0 &&
                    [
                      "",
                      "Muy malo",
                      "Malo",
                      "Regular",
                      "Bueno",
                      "¡Excelente!",
                    ][estrellaActiva]}
                </span>
              </div>

              {/* Nombre */}
              <input
                type="text"
                placeholder="Tu nombre (así aparecerá tu comentario)"
                value={nombre}
                onChange={(e) => setNombre(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
              />

              {/* Comentario */}
              <textarea
                placeholder="Cuéntanos tu experiencia con el formateo…"
                value={mensaje}
                onChange={(e) => setMensaje(e.target.value)}
                rows={4}
                maxLength={1000}
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white resize-none"
              />

              {error && (
                <div className="p-3 bg-red-50 text-red-700 rounded-lg text-sm">
                  {error}
                </div>
              )}

              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={cerrar}
                  className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700"
                >
                  Ahora no
                </button>
                <button
                  type="submit"
                  disabled={enviando}
                  className="flex-1 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg disabled:opacity-60"
                >
                  {enviando ? "Enviando…" : "Enviar calificación"}
                </button>
              </div>

              <p className="text-[11px] text-center text-gray-400">
                Tu comentario se publica solo después de ser revisado.
              </p>
            </form>
          </>
        )}
      </div>
    </div>
  );
}
