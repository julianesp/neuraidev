"use client";

import { useState } from "react";
import Link from "next/link";
import { Star, CheckCircle2 } from "lucide-react";

const TIPOS = [
  { valor: "producto", texto: "Compré un producto" },
  { valor: "formateo", texto: "Servicio técnico" },
  { valor: "web", texto: "Página web / software" },
];

const ETIQUETAS = ["", "Malo", "Regular", "Bueno", "Muy bueno", "¡Excelente!"];

export default function FormularioCalificar({ nombreInicial, tipoInicial, productoInicial }) {
  const [nombre, setNombre] = useState(nombreInicial);
  const [tipo, setTipo] = useState(tipoInicial || "producto");
  const [producto, setProducto] = useState(productoInicial);
  const [estrellas, setEstrellas] = useState(0);
  const [hover, setHover] = useState(0);
  const [mensaje, setMensaje] = useState("");
  const [trampa, setTrampa] = useState("");
  const [enviando, setEnviando] = useState(false);
  const [error, setError] = useState("");
  const [enviado, setEnviado] = useState(false);

  const enviar = async (e) => {
    e.preventDefault();
    setError("");
    if (!estrellas) return setError("Toca las estrellas para calificar.");
    if (!nombre.trim()) return setError("Escribe tu nombre.");
    if (!mensaje.trim()) return setError("Cuéntanos en pocas palabras cómo te fue.");

    setEnviando(true);
    try {
      const res = await fetch("/api/testimonios", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          cliente_nombre: nombre,
          mensaje,
          calificacion: estrellas,
          tipo,
          producto_relacionado: producto,
          website: trampa,
        }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.error || "No se pudo enviar");
      setEnviado(true);
    } catch (err) {
      setError(err.message || "No se pudo enviar. Intenta de nuevo.");
    } finally {
      setEnviando(false);
    }
  };

  if (enviado) {
    return (
      <div className="max-w-lg mx-auto bg-white dark:bg-gray-800 rounded-2xl shadow-md p-8 text-center">
        <CheckCircle2 className="w-14 h-14 text-blue-600 mx-auto mb-4" />
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
          ¡Gracias, {nombre.split(" ")[0]}!
        </h1>
        <p className="text-gray-600 dark:text-gray-300 mb-6">
          Tu opinión me ayuda muchísimo a que más personas confíen en neurai.dev.
        </p>
        <Link
          href="/"
          className="inline-block bg-blue-600 hover:bg-blue-700 text-white font-semibold px-6 py-3 rounded-lg transition-colors"
        >
          Ir a la tienda
        </Link>
      </div>
    );
  }

  const activa = hover || estrellas;

  return (
    <form
      onSubmit={enviar}
      className="max-w-lg mx-auto bg-white dark:bg-gray-800 rounded-2xl shadow-md p-6 sm:p-8"
    >
      <h1 className="text-2xl font-bold text-gray-900 dark:text-white text-center">
        {nombreInicial ? `Hola ${nombreInicial.split(" ")[0]}, ¿cómo te fue?` : "¿Cómo te fue?"}
      </h1>
      <p className="text-gray-600 dark:text-gray-300 text-center mt-2 mb-6">
        Califica tu experiencia con neurai.dev. Tu comentario se publicará en el
        sitio con tu nombre.
      </p>

      {/* Estrellas */}
      <div className="flex justify-center gap-1" onMouseLeave={() => setHover(0)}>
        {[1, 2, 3, 4, 5].map((n) => (
          <button
            key={n}
            type="button"
            onClick={() => setEstrellas(n)}
            onMouseEnter={() => setHover(n)}
            aria-label={`${n} ${n === 1 ? "estrella" : "estrellas"}`}
            className="p-1"
          >
            <Star
              className={`w-10 h-10 transition-colors ${n <= activa ? "text-amber-400" : "text-gray-300 dark:text-gray-600"}`}
              fill={n <= activa ? "currentColor" : "none"}
            />
          </button>
        ))}
      </div>
      <p className="text-center text-sm font-medium text-gray-700 dark:text-gray-300 h-5 mt-1 mb-6">
        {ETIQUETAS[activa]}
      </p>

      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
        ¿Qué fue?
      </label>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 mb-4">
        {TIPOS.map((t) => (
          <button
            key={t.valor}
            type="button"
            onClick={() => setTipo(t.valor)}
            className={`text-sm px-3 py-2 rounded-lg border transition-colors ${
              tipo === t.valor
                ? "border-blue-600 bg-blue-50 dark:bg-blue-950/40 text-blue-700 dark:text-blue-300 font-semibold"
                : "border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300"
            }`}
          >
            {t.texto}
          </button>
        ))}
      </div>

      <label htmlFor="producto" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
        Producto o servicio (opcional)
      </label>
      <input
        id="producto"
        value={producto}
        onChange={(e) => setProducto(e.target.value)}
        maxLength={120}
        placeholder="Ej.: Audífonos Bluetooth, formateo de portátil…"
        className="w-full px-4 py-2 mb-4 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
      />

      <label htmlFor="nombre" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
        Tu nombre
      </label>
      <input
        id="nombre"
        value={nombre}
        onChange={(e) => setNombre(e.target.value)}
        maxLength={80}
        autoComplete="name"
        className="w-full px-4 py-2 mb-4 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
      />

      <label htmlFor="mensaje" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
        Tu comentario
      </label>
      <textarea
        id="mensaje"
        value={mensaje}
        onChange={(e) => setMensaje(e.target.value)}
        maxLength={1000}
        rows={4}
        placeholder="¿Qué te gustó? ¿Lo recomendarías?"
        className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white resize-none"
      />

      {/* Campo trampa para bots: invisible para personas */}
      <input
        type="text"
        name="website"
        value={trampa}
        onChange={(e) => setTrampa(e.target.value)}
        tabIndex={-1}
        autoComplete="off"
        aria-hidden="true"
        style={{ position: "absolute", left: "-9999px", width: 1, height: 1, opacity: 0 }}
      />

      {error && <p className="text-sm text-red-600 mt-3">{error}</p>}

      <button
        type="submit"
        disabled={enviando}
        className="w-full mt-5 bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 rounded-lg transition-colors disabled:opacity-60"
      >
        {enviando ? "Enviando…" : "Enviar calificación"}
      </button>
    </form>
  );
}
