"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Check, Copy, UtensilsCrossed } from "lucide-react";
import { enlaceWhatsapp, formatoPrecio, horaLegible } from "@/lib/fastfoods/utils";

const PASOS_RECOGER = [
  ["nuevo", "Recibido"],
  ["preparando", "Preparando"],
  ["listo", "Listo para recoger"],
  ["entregado", "Entregado"],
];
const PASOS_DOMICILIO = [
  ["nuevo", "Recibido"],
  ["preparando", "Preparando"],
  ["en_camino", "En camino"],
  ["entregado", "Entregado"],
];

const CERRADOS = ["entregado", "cancelado"];

/**
 * Seguimiento del pedido para el cliente. Se actualiza solo cada 15 s
 * mientras el pedido esté abierto.
 */
export default function SeguimientoPedido({ token, inicial }) {
  const [pedido, setPedido] = useState(inicial);
  const [copiado, setCopiado] = useState(false);

  useEffect(() => {
    if (CERRADOS.includes(pedido.estado)) return;
    const t = setInterval(async () => {
      if (document.hidden) return;
      try {
        const res = await fetch(`/api/fastfoods/pedidos/${token}`, { cache: "no-store" });
        if (res.ok) setPedido(await res.json());
      } catch {}
    }, 15000);
    return () => clearInterval(t);
  }, [token, pedido.estado]);

  const pasos = pedido.entrega === "domicilio" ? PASOS_DOMICILIO : PASOS_RECOGER;
  // "listo" en domicilio cuenta como paso previo a "en camino".
  const estadoPaso = pedido.entrega === "domicilio" && pedido.estado === "listo" ? "preparando" : pedido.estado;
  const indice = pasos.findIndex(([key]) => key === estadoPaso);
  const enlace = typeof window !== "undefined" ? window.location.href : "";

  const mensaje = [
    `¡Hola ${pedido.negocio_nombre}! Acabo de hacer el pedido *#${pedido.codigo}* en neurai.dev:`,
    "",
    ...pedido.items.map((l) => `• ${l.cantidad} x ${l.nombre} — ${formatoPrecio(l.precio * l.cantidad)}`),
    "",
    `*Total: ${formatoPrecio(pedido.total)}*`,
    `Nombre: ${pedido.cliente_nombre}`,
    pedido.entrega === "domicilio" ? `Domicilio: ${pedido.direccion}` : "Recojo en el local",
    pedido.nota ? `Nota: ${pedido.nota}` : null,
  ]
    .filter((l) => l !== null)
    .join("\n");
  const linkWhatsapp = enlaceWhatsapp(pedido.whatsapp, mensaje);

  return (
    <div className="max-w-xl mx-auto px-4 pt-28 pb-16 sm:pt-32">
      <Link href={`/fastfoods/${pedido.slug}`} className="flex items-center gap-3 mb-6">
        <span className="w-12 h-12 rounded-2xl overflow-hidden bg-[var(--ff-tarjeta)] border border-[var(--ff-borde)] flex items-center justify-center flex-shrink-0">
          {pedido.logo_url ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={pedido.logo_url} alt="" className="w-full h-full object-cover" />
          ) : (
            <UtensilsCrossed className="w-6 h-6 text-[var(--ff-primario)] fill-none" />
          )}
        </span>
        <span className="font-bold text-lg">{pedido.negocio_nombre}</span>
      </Link>

      <p className="text-sm text-[var(--ff-texto-suave)]">Pedido · {horaLegible(pedido.created_at)}</p>
      <h1 className="text-4xl font-extrabold tracking-tight">#{pedido.codigo}</h1>

      {pedido.estado === "cancelado" ? (
        <p className="mt-4 rounded-2xl bg-red-100 text-red-800 px-4 py-3 font-semibold">
          El negocio canceló este pedido. Si tienes dudas, escríbeles por WhatsApp.
        </p>
      ) : (
        <ol className="mt-6 space-y-3" aria-label="Estado del pedido">
          {pasos.map(([key, texto], i) => {
            const hecho = i < indice || pedido.estado === "entregado";
            const actual = i === indice && pedido.estado !== "entregado";
            return (
              <li key={key} className="flex items-center gap-3">
                <span
                  className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 font-bold text-sm ${
                    hecho || actual
                      ? "bg-[var(--ff-primario)] text-[var(--ff-sobre-primario)]"
                      : "border-2 border-[var(--ff-borde)] text-[var(--ff-texto-suave)]"
                  } ${actual ? "ring-4 ring-[var(--ff-primario)]/25" : ""}`}
                >
                  {hecho ? <Check className="w-4 h-4" /> : i + 1}
                </span>
                <span className={actual ? "font-bold" : hecho ? "" : "text-[var(--ff-texto-suave)]"}>
                  {texto}
                </span>
              </li>
            );
          })}
        </ol>
      )}

      {pedido.estado === "nuevo" && linkWhatsapp && (
        <div className="mt-6 rounded-2xl bg-[var(--ff-tarjeta)] border border-[var(--ff-borde)] p-4">
          <p className="text-sm">
            Para que lo vean más rápido, avísale al negocio por WhatsApp:
          </p>
          <a
            href={linkWhatsapp}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-3 flex items-center justify-center w-full rounded-xl bg-[#25D366] text-white font-semibold py-3"
          >
            Avisar por WhatsApp
          </a>
        </div>
      )}

      {pedido.sellos && (
        <div className="mt-6 rounded-2xl border border-dashed border-[var(--ff-primario)] p-4">
          <p className="font-semibold">Tarjeta de sellos</p>
          <p className="text-sm text-[var(--ff-texto-suave)]">
            {pedido.sellos.tiene >= pedido.sellos.meta
              ? `¡Completaste tu tarjeta! Pide tu premio: ${pedido.sellos.premio}.`
              : `Cada ${pedido.sellos.meta} pedidos entregados: ${pedido.sellos.premio}.`}
          </p>
          <div className="mt-3 flex flex-wrap gap-1.5" aria-label={`${Math.min(pedido.sellos.tiene, pedido.sellos.meta)} de ${pedido.sellos.meta} sellos`}>
            {Array.from({ length: pedido.sellos.meta }, (_, i) => (
              <span
                key={i}
                className={`w-6 h-6 rounded-full ${
                  i < pedido.sellos.tiene ? "bg-[var(--ff-primario)]" : "border-2 border-[var(--ff-borde)]"
                }`}
              />
            ))}
          </div>
          <p className="mt-2 text-xs text-[var(--ff-texto-suave)]">
            Los sellos se suman cuando el negocio marca el pedido como entregado.
          </p>
        </div>
      )}

      <section className="mt-6 rounded-2xl bg-[var(--ff-tarjeta)] border border-[var(--ff-borde)] p-4">
        <ul className="space-y-1">
          {pedido.items.map((l) => (
            <li key={l.id} className="flex justify-between gap-3">
              <span>
                {l.cantidad} × {l.nombre}
              </span>
              <span className="tabular-nums">{formatoPrecio(l.precio * l.cantidad)}</span>
            </li>
          ))}
        </ul>
        <p className="flex justify-between font-bold text-lg border-t border-[var(--ff-borde)] mt-3 pt-3">
          <span>Total</span>
          <span>{formatoPrecio(pedido.total)}</span>
        </p>
        <p className="mt-2 text-sm text-[var(--ff-texto-suave)]">
          {pedido.entrega === "domicilio" ? `Domicilio: ${pedido.direccion}` : "Recojo en el local"} · Pagas al
          recibir
        </p>
      </section>

      <button
        type="button"
        onClick={async () => {
          try {
            await navigator.clipboard.writeText(enlace);
            setCopiado(true);
            setTimeout(() => setCopiado(false), 1500);
          } catch {}
        }}
        className="mt-4 w-full inline-flex items-center justify-center gap-2 rounded-xl border border-[var(--ff-borde)] py-3 text-sm font-medium"
      >
        {copiado ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4 fill-none" />}
        {copiado ? "Enlace copiado" : "Copiar enlace para ver tu pedido después"}
      </button>
    </div>
  );
}
