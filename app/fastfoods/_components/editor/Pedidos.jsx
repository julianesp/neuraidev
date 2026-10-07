"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { Bike, Check, Loader2, MessageCircle, Store, X } from "lucide-react";
import { enlaceWhatsapp, formatoPrecio, horaLegible } from "@/lib/fastfoods/utils";
import Interruptor from "./Interruptor";

const tarjeta = "bg-white dark:bg-gray-800 rounded-xl shadow-sm p-5";
const input =
  "w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white px-3 py-2 text-sm";
const label = "block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1";

export const NOMBRE_ESTADO = {
  nuevo: "Nuevo",
  preparando: "Preparando",
  listo: "Listo",
  en_camino: "En camino",
  entregado: "Entregado",
  cancelado: "Cancelado",
};

const COLOR_ESTADO = {
  nuevo: "bg-rose-100 text-rose-800 dark:bg-rose-900/40 dark:text-rose-300",
  preparando: "bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-300",
  listo: "bg-blue-100 text-blue-800 dark:bg-blue-900/40 dark:text-blue-300",
  en_camino: "bg-indigo-100 text-indigo-800 dark:bg-indigo-900/40 dark:text-indigo-300",
  entregado: "bg-green-100 text-green-800 dark:bg-green-900/40 dark:text-green-300",
  cancelado: "bg-gray-200 text-gray-700 dark:bg-gray-700 dark:text-gray-300",
};

/** Siguiente paso del pedido y el texto de su botón. */
function siguiente(p) {
  if (p.estado === "nuevo") return ["preparando", "Empezar a preparar"];
  if (p.estado === "preparando") {
    return p.entrega === "domicilio" ? ["en_camino", "Salió a domicilio"] : ["listo", "Listo para recoger"];
  }
  if (p.estado === "listo" || p.estado === "en_camino") return ["entregado", "Entregado"];
  return null;
}

// Tono corto con WebAudio (sin archivos de sonido).
function sonar() {
  try {
    const ctx = new (window.AudioContext || window.webkitAudioContext)();
    [0, 0.25].forEach((t) => {
      const o = ctx.createOscillator();
      const g = ctx.createGain();
      o.frequency.value = 880;
      g.gain.setValueAtTime(0.25, ctx.currentTime + t);
      g.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + t + 0.2);
      o.connect(g).connect(ctx.destination);
      o.start(ctx.currentTime + t);
      o.stop(ctx.currentTime + t + 0.2);
    });
  } catch {}
}

/**
 * Pedidos del negocio con actualización cada 20 s (solo con la pestaña del
 * navegador visible). Suena y marca el título cuando entra un pedido nuevo.
 * Lo usa EditorNegocio para el contador de la pestaña "Pedidos".
 */
export function usePedidos(consultar) {
  const [pedidos, setPedidos] = useState(null);
  const vistos = useRef(null);

  const cargar = useCallback(async () => {
    try {
      const data = await consultar("pedidos=1");
      const lista = data.pedidos || [];
      const nuevos = lista.filter((p) => p.estado === "nuevo").map((p) => p.id);
      if (vistos.current && nuevos.some((id) => !vistos.current.has(id))) sonar();
      vistos.current = new Set(nuevos);
      setPedidos(lista);
    } catch {
      setPedidos((p) => p || []);
    }
  }, [consultar]);

  useEffect(() => {
    cargar();
    const t = setInterval(() => {
      if (!document.hidden) cargar();
    }, 20000);
    return () => clearInterval(t);
  }, [cargar]);

  const cantidadNuevos = (pedidos || []).filter((p) => p.estado === "nuevo").length;
  useEffect(() => {
    const base = document.title.replace(/^\(\d+\) /, "");
    document.title = cantidadNuevos ? `(${cantidadNuevos}) ${base}` : base;
  }, [cantidadNuevos]);

  return { pedidos, cargar, cantidadNuevos };
}

export function PestanaPedidos({ api, id, pedidos, recargar }) {
  const [verCerrados, setVerCerrados] = useState(false);
  const [ocupado, setOcupado] = useState(null);

  if (pedidos === null) {
    return (
      <div className={`${tarjeta} flex justify-center py-12`}>
        <Loader2 className="w-6 h-6 animate-spin text-gray-400" />
      </div>
    );
  }

  const abiertos = pedidos.filter((p) => !["entregado", "cancelado"].includes(p.estado));
  const cerrados = pedidos.filter((p) => ["entregado", "cancelado"].includes(p.estado));
  const lista = verCerrados ? cerrados : abiertos;

  const cambiar = async (pedido, estado) => {
    if (estado === "cancelado" && !window.confirm(`¿Cancelar el pedido #${pedido.codigo}?`)) return;
    setOcupado(pedido.id);
    try {
      await api("PATCH", { body: { tipo: "pedido", fastfood_id: id, id: pedido.id, estado } });
      await recargar();
    } catch (err) {
      window.alert(err.message);
    } finally {
      setOcupado(null);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex gap-2">
        {[
          [false, `En curso (${abiertos.length})`],
          [true, `Cerrados hoy (${cerrados.length})`],
        ].map(([valor, texto]) => (
          <button
            key={texto}
            type="button"
            onClick={() => setVerCerrados(valor)}
            className={`px-4 py-2 rounded-full text-sm font-medium ${
              verCerrados === valor
                ? "bg-gray-900 text-white dark:bg-white dark:text-gray-900"
                : "bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300"
            }`}
          >
            {texto}
          </button>
        ))}
      </div>

      {lista.length === 0 ? (
        <div className={`${tarjeta} text-center text-gray-500 dark:text-gray-400 py-12`}>
          {verCerrados
            ? "No hay pedidos cerrados en las últimas 24 horas."
            : "No hay pedidos en curso. Cuando entre uno, sonará y aparecerá aquí."}
        </div>
      ) : (
        <ul className="grid md:grid-cols-2 gap-4">
          {lista.map((p) => {
            const paso = siguiente(p);
            const whatsapp = enlaceWhatsapp(p.cliente_telefono, `Hola ${p.cliente_nombre}, sobre tu pedido #${p.codigo}: `);
            return (
              <li key={p.id} className={`${tarjeta} space-y-3 ${p.estado === "nuevo" ? "ring-2 ring-rose-500" : ""}`}>
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <p className="text-2xl font-extrabold text-gray-900 dark:text-white">#{p.codigo}</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">{horaLegible(p.created_at)}</p>
                  </div>
                  <span className={`text-xs font-semibold rounded-full px-2.5 py-1 ${COLOR_ESTADO[p.estado]}`}>
                    {NOMBRE_ESTADO[p.estado]}
                  </span>
                </div>

                <ul className="text-sm text-gray-800 dark:text-gray-200">
                  {p.items.map((l) => (
                    <li key={l.id} className="flex justify-between gap-2">
                      <span>
                        <strong>{l.cantidad}×</strong> {l.nombre}
                      </span>
                      <span className="tabular-nums text-gray-500 dark:text-gray-400">
                        {formatoPrecio(l.precio * l.cantidad)}
                      </span>
                    </li>
                  ))}
                </ul>
                {p.nota && (
                  <p className="text-sm rounded-lg bg-amber-50 dark:bg-amber-900/30 text-amber-900 dark:text-amber-200 px-3 py-2">
                    {p.nota}
                  </p>
                )}
                <p className="flex justify-between font-bold text-gray-900 dark:text-white border-t border-gray-100 dark:border-gray-700 pt-2">
                  <span>Total</span>
                  <span>{formatoPrecio(p.total)}</span>
                </p>

                <div className="text-sm text-gray-600 dark:text-gray-300 space-y-1">
                  <p className="flex items-center gap-2">
                    {p.entrega === "domicilio" ? (
                      <Bike className="w-4 h-4 flex-shrink-0 fill-none" />
                    ) : (
                      <Store className="w-4 h-4 flex-shrink-0 fill-none" />
                    )}
                    {p.entrega === "domicilio" ? p.direccion : "Recoge en el local"}
                  </p>
                  <p className="flex items-center justify-between gap-2">
                    <span>
                      {p.cliente_nombre} · {p.cliente_telefono}
                    </span>
                    {whatsapp && (
                      <a
                        href={whatsapp}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 text-green-700 dark:text-green-400 font-medium"
                      >
                        <MessageCircle className="w-4 h-4 fill-none" /> Escribirle
                      </a>
                    )}
                  </p>
                </div>

                {paso && (
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() => cambiar(p, paso[0])}
                      disabled={ocupado === p.id}
                      className="flex-1 inline-flex items-center justify-center gap-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2.5 text-sm disabled:opacity-60"
                    >
                      {ocupado === p.id ? <Loader2 className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />}
                      {paso[1]}
                    </button>
                    <button
                      type="button"
                      onClick={() => cambiar(p, "cancelado")}
                      disabled={ocupado === p.id}
                      title="Cancelar pedido"
                      aria-label={`Cancelar pedido #${p.codigo}`}
                      className="inline-flex items-center justify-center rounded-lg border border-gray-300 dark:border-gray-600 px-3 text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                )}
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}

export function PestanaClientes({ api, id, consultar, negocio, guardar }) {
  const [clientes, setClientes] = useState(null);
  const [ocupado, setOcupado] = useState(null);
  const [sellos, setSellos] = useState({
    activo: !!negocio.sellos_activo,
    meta: negocio.sellos_meta || 10,
    premio: negocio.sellos_premio || "",
  });
  const [guardando, setGuardando] = useState(false);

  const cargar = useCallback(async () => {
    try {
      setClientes((await consultar("clientes=1")).clientes || []);
    } catch (err) {
      window.alert(err.message);
      setClientes([]);
    }
  }, [consultar]);

  useEffect(() => {
    cargar();
  }, [cargar]);

  const guardarSellos = async (e) => {
    e.preventDefault();
    setGuardando(true);
    try {
      await guardar({ sellos: { ...sellos, meta: Number(sellos.meta) } });
    } catch (err) {
      window.alert(err.message);
    } finally {
      setGuardando(false);
    }
  };

  const canjear = async (c) => {
    if (!window.confirm(`¿Entregar el premio a ${c.nombre}? Se descuentan ${negocio.sellos_meta} sellos.`)) return;
    setOcupado(c.telefono);
    try {
      await api("POST", { body: { accion: "canjear", fastfood_id: id, telefono: c.telefono } });
      await cargar();
    } catch (err) {
      window.alert(err.message);
    } finally {
      setOcupado(null);
    }
  };

  const metaActiva = negocio.sellos_activo ? negocio.sellos_meta : null;

  return (
    <div className="space-y-4">
      <form onSubmit={guardarSellos} className={`${tarjeta} space-y-3`}>
        <div>
          <h3 className="font-bold text-gray-900 dark:text-white">Tarjeta de sellos</h3>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
            Opcional. Cada pedido entregado suma un sello al número de celular del cliente. Tú decides
            cada cuántos pedidos y qué premio das.
          </p>
        </div>
        <Interruptor activo={sellos.activo} onCambio={(valor) => setSellos({ ...sellos, activo: valor })}>
          Usar tarjeta de sellos
        </Interruptor>
        {sellos.activo && (
          <div className="grid sm:grid-cols-[140px_1fr] gap-3">
            <div>
              <label className={label}>Cada cuántos pedidos</label>
              <input
                type="number"
                min={2}
                max={50}
                required
                value={sellos.meta}
                onChange={(e) => setSellos({ ...sellos, meta: e.target.value })}
                className={input}
              />
            </div>
            <div>
              <label className={label}>Premio</label>
              <input
                required
                maxLength={80}
                value={sellos.premio}
                onChange={(e) => setSellos({ ...sellos, premio: e.target.value })}
                placeholder="una gaseosa gratis, 20% de descuento…"
                className={input}
              />
            </div>
          </div>
        )}
        <button
          type="submit"
          disabled={guardando}
          className="inline-flex items-center gap-2 px-4 py-2 text-sm bg-blue-600 hover:bg-blue-700 text-white rounded-lg disabled:opacity-60"
        >
          {guardando ? <Loader2 className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />}
          Guardar
        </button>
      </form>

      <div className={tarjeta}>
        <h3 className="font-bold text-gray-900 dark:text-white mb-3">Clientes</h3>
        {clientes === null ? (
          <Loader2 className="w-5 h-5 animate-spin text-gray-400" />
        ) : clientes.length === 0 ? (
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Aquí aparecerán quienes te pidan desde tu página, con cuántas veces han pedido.
          </p>
        ) : (
          <ul className="divide-y divide-gray-100 dark:divide-gray-700">
            {clientes.map((c) => {
              const whatsapp = enlaceWhatsapp(c.telefono, `Hola ${c.nombre}, `);
              const completa = metaActiva && c.sellos >= metaActiva;
              return (
                <li key={c.telefono} className="py-3 flex flex-wrap items-center gap-x-4 gap-y-1">
                  <div className="flex-1 min-w-[10rem]">
                    <p className="font-medium text-gray-900 dark:text-white">{c.nombre}</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      {c.telefono} · {c.entregados} {c.entregados === 1 ? "pedido" : "pedidos"} ·{" "}
                      {formatoPrecio(c.gastado)}
                    </p>
                  </div>
                  {metaActiva && (
                    <span className={`text-sm ${completa ? "font-bold text-green-700 dark:text-green-400" : "text-gray-600 dark:text-gray-300"}`}>
                      {Math.min(c.sellos, metaActiva)}/{metaActiva} sellos
                    </span>
                  )}
                  {completa && (
                    <button
                      type="button"
                      onClick={() => canjear(c)}
                      disabled={ocupado === c.telefono}
                      className="text-sm font-semibold rounded-lg bg-green-600 hover:bg-green-700 text-white px-3 py-1.5 disabled:opacity-60"
                    >
                      Entregar premio
                    </button>
                  )}
                  {whatsapp && (
                    <a
                      href={whatsapp}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-sm text-green-700 dark:text-green-400 font-medium"
                    >
                      WhatsApp
                    </a>
                  )}
                </li>
              );
            })}
          </ul>
        )}
      </div>
    </div>
  );
}
