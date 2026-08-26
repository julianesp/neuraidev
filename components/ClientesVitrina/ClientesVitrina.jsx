"use client";

import { useEffect, useState } from "react";
import { Star, ShoppingBag, Quote, Send, CheckCircle } from "lucide-react";

// `siempreFormulario`: cuando es true, la sección se muestra aunque no haya
// clientes ni testimonios todavía (para que siempre exista el formulario donde
// dejar un comentario). Se usa en la página /clientes. En la home queda false
// para no mostrar un formulario suelto sin prueba social alrededor.
export default function ClientesVitrina({ siempreFormulario = false }) {
  const [clientes, setClientes] = useState([]);
  const [testimonios, setTestimonios] = useState([]);
  const [cargado, setCargado] = useState(false);

  // Formulario
  const [form, setForm] = useState({
    cliente_nombre: "",
    cliente_email: "",
    mensaje: "",
    producto_relacionado: "",
    calificacion: 5,
  });
  const [enviando, setEnviando] = useState(false);
  const [enviado, setEnviado] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    let activo = true;
    Promise.all([
      fetch("/api/clientes-vitrina").then((r) => r.json()).catch(() => ({ clientes: [] })),
      fetch("/api/testimonios").then((r) => r.json()).catch(() => ({ testimonios: [] })),
    ]).then(([c, t]) => {
      if (!activo) return;
      setClientes(c.clientes || []);
      setTestimonios(t.testimonios || []);
      setCargado(true);
    });
    return () => {
      activo = false;
    };
  }, []);

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setEnviando(true);
    try {
      const res = await fetch("/api/testimonios", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "No se pudo enviar");
      setEnviado(true);
      setForm({
        cliente_nombre: "",
        cliente_email: "",
        mensaje: "",
        producto_relacionado: "",
        calificacion: 5,
      });
    } catch (err) {
      setError(err.message);
    } finally {
      setEnviando(false);
    }
  }

  // No renderizar hasta cargar. Luego: si hay clientes/testimonios se muestra
  // la vitrina completa; si no hay nada, solo se muestra cuando el contenedor
  // pide el formulario siempre (página /clientes), para no dejar la home con
  // una sección vacía.
  const hayContenido = clientes.length > 0 || testimonios.length > 0;
  if (!cargado) return null;
  if (!hayContenido && !siempreFormulario) return null;

  return (
    <section className="w-full py-16 px-4 bg-gradient-to-br from-blue-50 to-purple-50 dark:from-gray-900 dark:to-gray-800">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-12">
          <h2 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
            Nuestros clientes
          </h2>
          <p className="text-lg text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
            Personas que ya confiaron en nosotros. ¡Gracias por elegirnos y ser
            parte de la familia Neurai.dev!
          </p>
        </div>

        {/* Clientes publicados */}
        {clientes.length > 0 && (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 mb-14">
            {clientes.map((c) => (
              <div
                key={c.id}
                className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm p-5 flex flex-col items-center text-center hover:shadow-md transition-shadow"
              >
                <div className="w-16 h-16 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white text-2xl font-bold mb-3 overflow-hidden">
                  {c.avatar_url ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={c.avatar_url}
                      alt={c.nombre}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    c.nombre?.charAt(0).toUpperCase() || "?"
                  )}
                </div>
                <p className="font-semibold text-gray-900 dark:text-white">
                  {c.nombre}
                </p>
                {c.productos.length > 0 && (
                  <div className="mt-2 flex flex-wrap gap-1 justify-center">
                    {c.productos.slice(0, 3).map((p, i) => (
                      <span
                        key={i}
                        className="inline-flex items-center gap-1 text-[11px] bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 px-2 py-0.5 rounded-full"
                      >
                        <ShoppingBag className="w-3 h-3" />
                        {p}
                      </span>
                    ))}
                    {c.productos.length > 3 && (
                      <span className="text-[11px] text-gray-400">
                        +{c.productos.length - 3}
                      </span>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        {/* Testimonios aprobados */}
        {testimonios.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-14">
            {testimonios.map((t) => (
              <div
                key={t.id}
                className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm p-6 relative"
              >
                <Quote className="w-8 h-8 text-blue-200 dark:text-blue-900 mb-2" />
                {t.calificacion && (
                  <div className="flex text-amber-400 mb-2">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <Star
                        key={i}
                        className="w-4 h-4"
                        fill={i < t.calificacion ? "currentColor" : "none"}
                      />
                    ))}
                  </div>
                )}
                <p className="text-gray-700 dark:text-gray-300 italic mb-4">
                  &ldquo;{t.mensaje}&rdquo;
                </p>
                <div className="flex items-center justify-between">
                  <p className="font-semibold text-gray-900 dark:text-white">
                    — {t.cliente_nombre}
                  </p>
                  {t.producto_relacionado && (
                    <span className="text-xs text-gray-400 flex items-center gap-1">
                      <ShoppingBag className="w-3 h-3" />
                      {t.producto_relacionado}
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Formulario para dejar testimonio */}
        <div className="max-w-2xl mx-auto bg-white dark:bg-gray-800 rounded-2xl shadow-md p-6 md:p-8">
          {enviado ? (
            <div className="text-center py-6">
              <CheckCircle className="w-14 h-14 text-green-500 mx-auto mb-4" />
              <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
                ¡Gracias por tu comentario!
              </h3>
              <p className="text-gray-600 dark:text-gray-400">
                Lo revisaremos y, una vez aprobado, aparecerá aquí en la web.
              </p>
              <button
                onClick={() => setEnviado(false)}
                className="mt-4 text-blue-600 hover:text-blue-700 font-medium"
              >
                Dejar otro comentario
              </button>
            </div>
          ) : (
            <>
              <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-1">
                ¿Compraste con nosotros? Cuéntanos tu experiencia
              </h3>
              <p className="text-sm text-gray-500 dark:text-gray-400 mb-5">
                Tu comentario se publicará después de ser revisado.
              </p>

              {error && (
                <div className="mb-4 p-3 bg-red-50 text-red-700 rounded-lg text-sm">
                  {error}
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <input
                    type="text"
                    required
                    placeholder="Tu nombre *"
                    value={form.cliente_nombre}
                    onChange={(e) =>
                      setForm({ ...form, cliente_nombre: e.target.value })
                    }
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                  />
                  <input
                    type="email"
                    placeholder="Tu email (opcional)"
                    value={form.cliente_email}
                    onChange={(e) =>
                      setForm({ ...form, cliente_email: e.target.value })
                    }
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                  />
                </div>

                <input
                  type="text"
                  placeholder="¿Qué producto compraste? (opcional)"
                  value={form.producto_relacionado}
                  onChange={(e) =>
                    setForm({ ...form, producto_relacionado: e.target.value })
                  }
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                />

                <textarea
                  required
                  rows={4}
                  maxLength={1000}
                  placeholder="Escribe tu comentario *"
                  value={form.mensaje}
                  onChange={(e) => setForm({ ...form, mensaje: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white resize-none"
                />

                <div className="flex items-center gap-2">
                  <span className="text-sm text-gray-600 dark:text-gray-400">
                    Tu calificación:
                  </span>
                  <div className="flex">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <button
                        key={i}
                        type="button"
                        onClick={() => setForm({ ...form, calificacion: i + 1 })}
                        className="p-0.5"
                        aria-label={`${i + 1} estrellas`}
                      >
                        <Star
                          className="w-6 h-6 text-amber-400"
                          fill={i < form.calificacion ? "currentColor" : "none"}
                        />
                      </button>
                    ))}
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={enviando}
                  className="w-full inline-flex items-center justify-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:bg-gray-400 font-medium"
                >
                  <Send className="w-4 h-4" />
                  {enviando ? "Enviando..." : "Enviar comentario"}
                </button>
              </form>
            </>
          )}
        </div>
      </div>
    </section>
  );
}
