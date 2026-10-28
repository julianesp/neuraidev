"use client";

import { useEffect, useState } from "react";
import { ShoppingBag } from "lucide-react";
import TarjetaOpinion from "@/app/_components/calificar/TarjetaOpinion";
import FormularioCalificar from "@/app/calificar/FormularioCalificar";
import CompartirCalificar from "@/app/_components/calificar/CompartirCalificar";

// `siempreFormulario`: cuando es true, la sección se muestra aunque no haya
// clientes ni testimonios todavía (para que siempre exista el formulario donde
// dejar un comentario). Se usa en la página /clientes. En la home queda false
// para no mostrar un formulario suelto sin prueba social alrededor.
export default function ClientesVitrina({ siempreFormulario = false }) {
  const [clientes, setClientes] = useState([]);
  const [testimonios, setTestimonios] = useState([]);
  const [cargado, setCargado] = useState(false);

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

  // No renderizar hasta cargar. Luego: si hay clientes/testimonios se muestra
  // la vitrina completa; si no hay nada, solo se muestra cuando el contenedor
  // pide el formulario siempre (página /clientes), para no dejar la home con
  // una sección vacía.
  const hayContenido = clientes.length > 0 || testimonios.length > 0;
  if (!cargado) return null;
  if (!hayContenido && !siempreFormulario) return null;

  return (
    <section className="w-full py-16 px-4 bg-gradient-to-br from-blue-50 to-blue-50 dark:from-gray-900 dark:to-gray-800">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-12">
          <h2 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
            Nuestros clientes
          </h2>
          <p className="text-lg text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
            {hayContenido
              ? "Personas que ya confiaron en nosotros. ¡Gracias por elegirnos y ser parte de la familia Neurai.dev!"
              : "¿Ya compraste con nosotros? Cuéntanos tu experiencia y ayuda a otros a conocernos. ¡Tu opinión nos hace mejores!"}
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
                <div className="w-16 h-16 rounded-full bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center text-white text-2xl font-bold mb-3 overflow-hidden">
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
              <TarjetaOpinion key={t.id} opinion={t} />
            ))}
          </div>
        )}

        {/* Formulario para calificar (con login Google/Facebook, foto y el
            15% para clientes de servicio técnico): el mismo de /calificar */}
        <div id="calificar" className="scroll-mt-24">
          <FormularioCalificar embebido />
          <div className="max-w-lg mx-auto mt-6">
            <CompartirCalificar />
          </div>
        </div>
      </div>
    </section>
  );
}
