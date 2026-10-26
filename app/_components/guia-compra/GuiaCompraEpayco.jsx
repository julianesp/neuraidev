"use client";

import { useEffect, useRef, useState } from "react";
import { Pause, Play } from "lucide-react";
import PantallaCompra from "./PantallaCompra";
import { Phone, anim, usePrefersReducedMotion } from "./ui";

// Duración de cada paso en la demo (ms). El de datos de envío es más largo
// porque se escriben los campos letra por letra.
const PASOS = [
  {
    titulo: "Agrega productos al carrito",
    texto:
      "En la ficha del producto pulsa “Agregar al carrito”. Puedes sumar varios productos antes de pagar.",
    ms: 3000,
  },
  {
    titulo: "Pulsa “Proceder al pago”",
    texto:
      "Abre el carrito, revisa cantidades y total. El mínimo para pagar con ePayco es $5.000.",
    ms: 2800,
  },
  {
    titulo: "Completa tus datos de envío",
    texto:
      "Nombre, correo, teléfono y dirección. Tu factura llega a ese correo. El precio se verifica en nuestro servidor antes de cobrar.",
    ms: 5600,
  },
  {
    titulo: "Elige cómo pagar en ePayco",
    texto:
      "Se abre el checkout seguro de ePayco: tarjeta crédito/débito, PSE o Nequi. Neurai nunca ve los datos de tu tarjeta.",
    ms: 3000,
  },
  {
    titulo: "Aprueba el pago",
    texto:
      "Con Nequi aceptas la notificación en tu celular; con PSE entras a tu banco. No cierres la ventana hasta terminar.",
    ms: 3400,
  },
  {
    titulo: "Recibe la confirmación",
    texto:
      "La página de respuesta se actualiza sola. Con PSE o Nequi puede quedar unos minutos en “Pendiente”: no pagues de nuevo.",
    ms: 3600,
  },
  {
    titulo: "Factura y entrega",
    texto:
      "Te llega la factura al correo y te escribimos por el chat de soporte o WhatsApp para coordinar la entrega.",
    ms: 4600,
  },
];

export default function GuiaCompraEpayco() {
  const [paso, setPaso] = useState(0);
  const [pausado, setPausado] = useState(false);
  const [visible, setVisible] = useState(false);
  const reduced = usePrefersReducedMotion();
  const rootRef = useRef(null);

  const reproduciendo = visible && !pausado && !reduced;

  // Solo se reproduce mientras la sección está en pantalla.
  useEffect(() => {
    const el = rootRef.current;
    if (!el) return;
    const io = new IntersectionObserver(
      ([entry]) => setVisible(entry.isIntersecting),
      { threshold: 0.25 },
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  useEffect(() => {
    if (!reproduciendo) return;
    const id = window.setTimeout(
      () => setPaso((p) => (p + 1) % PASOS.length),
      PASOS[paso].ms,
    );
    return () => window.clearTimeout(id);
  }, [reproduciendo, paso]);

  return (
    <div
      ref={rootRef}
      className={`${anim.root} grid items-center gap-8 md:grid-cols-2 md:gap-14`}
    >
      <ol className="order-2 space-y-1.5 md:order-1">
        {PASOS.map((item, i) => {
          const activo = i === paso;
          return (
            <li key={item.titulo}>
              <button
                type="button"
                onClick={() => {
                  setPaso(i);
                  setPausado(true);
                }}
                aria-current={activo ? "step" : undefined}
                className={`flex w-full items-start gap-3 rounded-xl border p-3 text-left transition-colors ${
                  activo
                    ? "border-blue-200 bg-blue-50 ring-1 ring-blue-600/30 dark:border-blue-800 dark:bg-blue-950"
                    : "border-transparent hover:bg-gray-50 dark:hover:bg-gray-700/40"
                }`}
              >
                <span
                  className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-xs font-semibold ${
                    activo
                      ? "bg-blue-600 text-white"
                      : "border border-gray-300 text-gray-500 dark:border-gray-600 dark:text-gray-400"
                  }`}
                >
                  {i + 1}
                </span>
                <span className="min-w-0 flex-1">
                  <span
                    className={`block text-sm font-semibold ${
                      activo
                        ? "text-gray-900 dark:text-white"
                        : "text-gray-500 dark:text-gray-400"
                    }`}
                  >
                    {item.titulo}
                  </span>
                  <span
                    className={`grid transition-[grid-template-rows] duration-300 motion-reduce:transition-none ${
                      activo ? "grid-rows-[1fr]" : "grid-rows-[0fr]"
                    }`}
                  >
                    <span className="overflow-hidden">
                      <span className="block pt-1 text-sm leading-snug text-gray-600 dark:text-gray-300">
                        {item.texto}
                      </span>
                    </span>
                  </span>
                </span>
              </button>
            </li>
          );
        })}
      </ol>

      <div className="order-1 flex flex-col items-center md:order-2">
        <Phone>
          <PantallaCompra step={paso} />
        </Phone>
        {!reduced && (
          <button
            type="button"
            onClick={() => setPausado((p) => !p)}
            className="mt-5 inline-flex h-11 items-center gap-2 rounded-full border border-gray-300 px-4 text-sm font-medium text-gray-700 hover:border-blue-600 dark:border-gray-600 dark:text-gray-200"
          >
            {pausado ? (
              <Play className="h-4 w-4" aria-hidden="true" />
            ) : (
              <Pause className="h-4 w-4" aria-hidden="true" />
            )}
            {pausado ? "Reproducir animación" : "Pausar animación"}
          </button>
        )}
      </div>
    </div>
  );
}
