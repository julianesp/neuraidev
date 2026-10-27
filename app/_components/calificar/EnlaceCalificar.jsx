"use client";

import { useState } from "react";
import { Copy, Check, Send } from "lucide-react";

const TIPOS = [
  { valor: "producto", texto: "Compra de producto" },
  { valor: "formateo", texto: "Servicio técnico" },
  { valor: "web", texto: "Página web / software" },
];

const input =
  "w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white";

/**
 * Arma el enlace personalizado a /calificar (nombre, tipo y producto ya
 * escritos) para mandárselo al cliente por WhatsApp. No hace falta que el
 * cliente tenga cuenta: entra, toca las estrellas, comenta y listo.
 */
export default function EnlaceCalificar() {
  const [nombre, setNombre] = useState("");
  const [tipo, setTipo] = useState("producto");
  const [producto, setProducto] = useState("");
  const [telefono, setTelefono] = useState("");
  const [copiado, setCopiado] = useState(false);

  const params = new URLSearchParams();
  if (nombre.trim()) params.set("n", nombre.trim());
  params.set("t", tipo);
  if (producto.trim()) params.set("p", producto.trim());
  const enlace = `https://neurai.dev/calificar?${params.toString()}`;

  const primerNombre = nombre.trim().split(" ")[0];
  const mensaje = [
    `¡Hola${primerNombre ? ` ${primerNombre}` : ""}! 👋 Gracias por confiar en neurai.dev.`,
    "",
    `¿Me ayudas calificando ${producto.trim() ? `tu ${producto.trim()}` : "tu experiencia"} con estrellas? Es menos de 1 minuto:`,
    enlace,
    "",
    "¡Tu opinión me ayuda muchísimo! 🙏",
  ].join("\n");

  // Con número abre el chat de ese cliente; sin número, WhatsApp deja elegir el contacto.
  let numero = telefono.replace(/\D/g, "");
  if (numero.length === 10) numero = `57${numero}`;
  const whatsapp = `https://wa.me/${numero}?text=${encodeURIComponent(mensaje)}`;

  const copiar = async (texto) => {
    try {
      await navigator.clipboard.writeText(texto);
      setCopiado(true);
      setTimeout(() => setCopiado(false), 2000);
    } catch {}
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-5">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Nombre del cliente
          </label>
          <input
            value={nombre}
            onChange={(e) => setNombre(e.target.value)}
            placeholder="Ej.: María López"
            className={input}
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            WhatsApp del cliente (opcional)
          </label>
          <input
            value={telefono}
            onChange={(e) => setTelefono(e.target.value)}
            inputMode="tel"
            placeholder="3001234567"
            className={input}
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            ¿Qué le vendiste o hiciste?
          </label>
          <select value={tipo} onChange={(e) => setTipo(e.target.value)} className={input}>
            {TIPOS.map((t) => (
              <option key={t.valor} value={t.valor}>
                {t.texto}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Producto o servicio (opcional)
          </label>
          <input
            value={producto}
            onChange={(e) => setProducto(e.target.value)}
            placeholder="Ej.: audífonos Bluetooth"
            className={input}
          />
        </div>
      </div>

      <div className="mt-5">
        <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
          Mensaje que se enviará
        </p>
        <pre className="whitespace-pre-wrap break-words text-sm bg-gray-50 dark:bg-gray-900 text-gray-800 dark:text-gray-200 rounded-lg p-3 font-sans">
          {mensaje}
        </pre>
      </div>

      <div className="flex flex-wrap gap-2 mt-4">
        <a
          href={whatsapp}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-2 px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg"
        >
          <Send className="w-4 h-4" />
          Enviar por WhatsApp
        </a>
        <button
          type="button"
          onClick={() => copiar(enlace)}
          className="inline-flex items-center gap-2 px-5 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg"
        >
          {copiado ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
          {copiado ? "¡Copiado!" : "Copiar solo el enlace"}
        </button>
      </div>

      <p className="text-xs text-gray-500 dark:text-gray-400 mt-4">
        Enlace general (sin nombre), para estados o grupos:{" "}
        <button
          type="button"
          onClick={() => copiar("https://neurai.dev/calificar")}
          className="text-blue-600 hover:underline"
        >
          neurai.dev/calificar
        </button>
      </p>
    </div>
  );
}
