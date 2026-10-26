"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useTheme } from "next-themes";
import {
  Chart as ChartJS,
  BarElement,
  CategoryScale,
  LinearScale,
  Tooltip,
} from "chart.js";
import { Bar } from "react-chartjs-2";
import {
  ShoppingCart,
  CreditCard,
  ClipboardList,
  ShieldCheck,
  Smartphone,
  BadgeCheck,
  FileText,
} from "lucide-react";

ChartJS.register(BarElement, CategoryScale, LinearScale, Tooltip);

// Quién actúa en cada paso. Todo en tonos de azul (color principal del sitio).
const ACTORES = {
  cliente: { nombre: "Tú", color: "#2563eb" }, // blue-600
  epayco: { nombre: "ePayco / tu banco", color: "#60a5fa" }, // blue-400
  neurai: { nombre: "Neurai", color: "#1e3a8a" }, // blue-900
};

// Tiempos aproximados en minutos desde que entras a la tienda.
// rango = [inicio, fin] para dibujar la línea de tiempo (barras flotantes).
const PASOS = [
  {
    titulo: "Agrega productos al carrito",
    corto: "1. Carrito",
    actor: "cliente",
    rango: [0, 3],
    icono: ShoppingCart,
    detalle:
      "Explora el catálogo y pulsa “Agregar al carrito” en cada producto. Abre el carrito para revisar cantidades y el total.",
  },
  {
    titulo: "Pulsa “Proceder al pago”",
    corto: "2. Proceder al pago",
    actor: "cliente",
    rango: [3, 4],
    icono: CreditCard,
    detalle:
      "En el carrito elige pagar con ePayco. El total mínimo es de $5.000; si es menor puedes pagar por Nequi y enviar el comprobante por WhatsApp.",
  },
  {
    titulo: "Completa tus datos de envío",
    corto: "3. Datos de envío",
    actor: "cliente",
    rango: [4, 6],
    icono: ClipboardList,
    detalle:
      "Nombre, correo, teléfono, dirección, ciudad y departamento. El correo es importante: allí llega la factura. El precio se verifica en nuestro servidor con el catálogo antes de cobrar.",
  },
  {
    titulo: "Elige el método en el checkout de ePayco",
    corto: "4. Checkout ePayco",
    actor: "epayco",
    rango: [6, 7],
    icono: ShieldCheck,
    detalle:
      "Se abre la ventana segura de ePayco. Escoge tarjeta débito/crédito, PSE o Nequi. Neurai nunca ve ni guarda los datos de tu tarjeta.",
  },
  {
    titulo: "Autoriza el pago en tu banco o app",
    corto: "5. Autorizar pago",
    actor: "cliente",
    rango: [7, 10],
    icono: Smartphone,
    detalle:
      "Con tarjeta suele ser inmediato. Con PSE entras a la página de tu banco y con Nequi apruebas la notificación en tu celular. No cierres la ventana hasta terminar.",
  },
  {
    titulo: "Confirmación del pago",
    corto: "6. Confirmación",
    actor: "epayco",
    rango: [10, 15],
    icono: BadgeCheck,
    detalle:
      "Vuelves a la página de respuesta de pago, que se actualiza sola. ePayco nos avisa del resultado; con PSE o Nequi puede tardar unos minutos en pasar de “Pendiente” a “Aceptada”.",
  },
  {
    titulo: "Factura y coordinación del envío",
    corto: "7. Factura y envío",
    actor: "neurai",
    rango: [15, 17],
    icono: FileText,
    detalle:
      "Con el pago aceptado recibes la factura en tu correo, reservamos el stock y te escribimos por WhatsApp o por el chat de soporte de tu perfil para coordinar la entrega.",
  },
];

export default function ComoComprarPage() {
  const { resolvedTheme } = useTheme();
  const [montado, setMontado] = useState(false);
  const [activo, setActivo] = useState(0);

  // next-themes solo conoce el tema en el cliente; evitamos un desajuste de hidratación.
  useEffect(() => setMontado(true), []);
  const oscuro = montado && resolvedTheme === "dark";

  const colorTexto = oscuro ? "#d1d5db" : "#374151";
  const colorRejilla = oscuro ? "rgba(255,255,255,0.08)" : "rgba(0,0,0,0.06)";

  const data = {
    labels: PASOS.map((p) => p.corto),
    datasets: [
      {
        data: PASOS.map((p) => p.rango),
        backgroundColor: PASOS.map((p, i) =>
          i === activo
            ? ACTORES[p.actor].color
            : `${ACTORES[p.actor].color}99`,
        ),
        borderColor: PASOS.map((p) => ACTORES[p.actor].color),
        borderWidth: PASOS.map((_, i) => (i === activo ? 2 : 0)),
        borderRadius: 6,
        borderSkipped: false,
        barPercentage: 0.7,
      },
    ],
  };

  const options = {
    indexAxis: "y",
    responsive: true,
    maintainAspectRatio: false,
    animation: { duration: 400 },
    onClick: (_evt, elementos) => {
      if (elementos.length) setActivo(elementos[0].index);
    },
    onHover: (evt, elementos) => {
      if (evt.native?.target) {
        evt.native.target.style.cursor = elementos.length ? "pointer" : "default";
      }
    },
    plugins: {
      legend: { display: false },
      tooltip: {
        callbacks: {
          title: (items) => PASOS[items[0].dataIndex].titulo,
          label: (item) => {
            const paso = PASOS[item.dataIndex];
            const [ini, fin] = paso.rango;
            return ` ${ACTORES[paso.actor].nombre} · ~${fin - ini} min (minuto ${ini}–${fin})`;
          },
        },
      },
    },
    scales: {
      x: {
        min: 0,
        max: 18,
        title: {
          display: true,
          text: "Minutos aproximados",
          color: colorTexto,
        },
        ticks: { color: colorTexto, stepSize: 2 },
        grid: { color: colorRejilla },
      },
      y: {
        ticks: { color: colorTexto, font: { weight: "600" } },
        grid: { display: false },
      },
    },
  };

  const pasoActivo = PASOS[activo];
  const IconoActivo = pasoActivo.icono;

  return (
    <div className="min-h-screen bg-white dark:bg-gray-900 pt-24 pb-12">
      <div className="container mx-auto px-4 max-w-5xl">
        <h1 className="text-3xl md:text-4xl font-bold text-center mb-3 text-gray-900 dark:text-white">
          Cómo comprar con ePayco
        </h1>
        <p className="text-center text-gray-600 dark:text-gray-400 mb-10 max-w-2xl mx-auto">
          Así funciona una compra en neurai.dev, desde el carrito hasta la
          factura. Toca una barra del gráfico o un paso para ver el detalle.
        </p>

        {/* Línea de tiempo */}
        <section className="rounded-2xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50 p-4 md:p-6 mb-8">
          <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
              Línea de tiempo de la compra
            </h2>
            <ul className="flex flex-wrap gap-4 text-sm text-gray-700 dark:text-gray-300">
              {Object.values(ACTORES).map((a) => (
                <li key={a.nombre} className="flex items-center gap-2">
                  <span
                    className="inline-block w-3 h-3 rounded-sm"
                    style={{ backgroundColor: a.color }}
                  />
                  {a.nombre}
                </li>
              ))}
            </ul>
          </div>
          <div className="h-[340px] md:h-[380px]">
            {montado && <Bar data={data} options={options} />}
          </div>
          <p className="mt-3 text-xs text-gray-500 dark:text-gray-400">
            Los tiempos son aproximados y dependen del método de pago y de tu
            banco.
          </p>
        </section>

        {/* Detalle del paso seleccionado */}
        <section
          aria-live="polite"
          className="rounded-2xl border-2 border-blue-600 bg-blue-50 dark:bg-blue-950/40 p-5 md:p-6 mb-10 flex gap-4"
        >
          <div className="shrink-0 w-12 h-12 rounded-xl bg-blue-600 text-white flex items-center justify-center">
            <IconoActivo className="w-6 h-6 fill-none" />
          </div>
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-blue-700 dark:text-blue-300 mb-1">
              Paso {activo + 1} de {PASOS.length} ·{" "}
              {ACTORES[pasoActivo.actor].nombre}
            </p>
            <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
              {pasoActivo.titulo}
            </h3>
            <p className="text-gray-700 dark:text-gray-300">
              {pasoActivo.detalle}
            </p>
          </div>
        </section>

        {/* Lista de pasos */}
        <ol className="grid gap-3 sm:grid-cols-2 mb-12">
          {PASOS.map((paso, i) => {
            const Icono = paso.icono;
            const seleccionado = i === activo;
            return (
              <li key={paso.titulo}>
                <button
                  type="button"
                  onClick={() => setActivo(i)}
                  aria-pressed={seleccionado}
                  className={`w-full text-left flex items-center gap-3 rounded-xl border p-4 transition-colors ${
                    seleccionado
                      ? "border-blue-600 bg-blue-50 dark:bg-blue-950/40"
                      : "border-gray-200 dark:border-gray-700 hover:border-blue-400 dark:hover:border-blue-500"
                  }`}
                >
                  <span className="shrink-0 w-9 h-9 rounded-lg bg-blue-600/10 text-blue-600 dark:text-blue-400 flex items-center justify-center">
                    <Icono className="w-5 h-5 fill-none" />
                  </span>
                  <span>
                    <span className="block text-xs text-gray-500 dark:text-gray-400">
                      Paso {i + 1}
                    </span>
                    <span className="font-semibold text-gray-900 dark:text-white">
                      {paso.titulo}
                    </span>
                  </span>
                </button>
              </li>
            );
          })}
        </ol>

        {/* Estados del pago */}
        <section className="mb-12">
          <h2 className="text-2xl font-semibold mb-4 text-gray-900 dark:text-white">
            Estados que puedes ver en la respuesta de pago
          </h2>
          <div className="grid gap-3 md:grid-cols-3">
            <div className="rounded-xl border border-gray-200 dark:border-gray-700 p-4">
              <p className="font-semibold text-gray-900 dark:text-white mb-1">
                Aceptada
              </p>
              <p className="text-sm text-gray-700 dark:text-gray-300">
                El pago quedó aprobado. Tu pedido se confirma y la factura llega
                a tu correo.
              </p>
            </div>
            <div className="rounded-xl border border-gray-200 dark:border-gray-700 p-4">
              <p className="font-semibold text-gray-900 dark:text-white mb-1">
                Pendiente
              </p>
              <p className="text-sm text-gray-700 dark:text-gray-300">
                Común con PSE o Nequi mientras el banco responde. No pagues de
                nuevo: la página se actualiza sola cuando hay respuesta.
              </p>
            </div>
            <div className="rounded-xl border border-gray-200 dark:border-gray-700 p-4">
              <p className="font-semibold text-gray-900 dark:text-white mb-1">
                Rechazada
              </p>
              <p className="text-sm text-gray-700 dark:text-gray-300">
                El banco no aprobó el pago y no se hizo ningún cobro. Puedes
                intentar con otro método.
              </p>
            </div>
          </div>
        </section>

        <div className="text-center">
          <p className="text-gray-700 dark:text-gray-300 mb-4">
            ¿Dudas con tu pago? Escríbenos por WhatsApp al{" "}
            <a
              href="https://wa.me/573174503604"
              className="font-semibold text-blue-600 dark:text-blue-400 hover:underline"
            >
              +57 317 450 3604
            </a>
            .
          </p>
          <div className="flex flex-wrap justify-center gap-3">
            <Link
              href="/accesorios/generales"
              className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-6 rounded-xl transition-colors"
            >
              Ver productos
            </Link>
            <Link
              href="/preguntas-frecuentes"
              className="border border-gray-300 dark:border-gray-600 text-gray-800 dark:text-gray-200 hover:border-blue-600 font-semibold py-3 px-6 rounded-xl transition-colors"
            >
              Preguntas frecuentes
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
