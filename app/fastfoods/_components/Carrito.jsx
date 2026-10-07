"use client";

import { createContext, useContext, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2, Minus, Plus, RotateCcw, ShoppingBag, X } from "lucide-react";
import { formatoPrecio } from "@/lib/fastfoods/utils";

/**
 * Carrito de un negocio: el cliente elige platos y cantidades y hace el pedido
 * en la plataforma (/api/fastfoods/pedidos). Luego ve su seguimiento en
 * /fastfoods/pedido/<token>, desde donde también puede avisar por WhatsApp.
 *
 * Las secciones de la plantilla son de servidor; aquí solo viven los botones
 * de agregar, "pedir lo mismo" y la barra/hoja del pedido.
 *
 * En localStorage (si el navegador lo permite) se recuerdan: el carrito por
 * negocio, el último pedido por negocio y los datos del cliente.
 */
const CarritoContext = createContext(null);

const claveCarrito = (slug) => `fastfood-carrito:${slug}`;
const claveUltimo = (slug) => `fastfood-ultimo:${slug}`;
const CLAVE_CLIENTE = "fastfood-cliente";

function leer(clave, porDefecto) {
  try {
    return JSON.parse(localStorage.getItem(clave) || "null") ?? porDefecto;
  } catch {
    return porDefecto;
  }
}

function guardar(clave, valor) {
  try {
    localStorage.setItem(clave, JSON.stringify(valor));
  } catch {}
}

/** Máximo que se puede pedir de algo: lo que queda del especial, o 20. */
function maximo(pedible) {
  return pedible?.quedan == null ? 20 : Math.min(20, pedible.quedan);
}

export function CarritoProvider({ negocio, pedibles, children }) {
  // pedibles: { [id]: { id, nombre, precio, quedan } } — quedan null = sin límite
  const [carrito, setCarrito] = useState({}); // { [id]: cantidad }
  const [abierto, setAbierto] = useState(false);

  // Ajusta un carrito a lo que hoy se puede pedir (platos borrados, especiales vencidos o agotados).
  const ajustar = (c) =>
    Object.fromEntries(
      Object.entries(c || {})
        .map(([id, n]) => [id, Math.min(Number(n) || 0, maximo(pedibles[id]))])
        .filter(([id, n]) => pedibles[id] && n > 0)
    );

  useEffect(() => {
    setCarrito(ajustar(leer(claveCarrito(negocio.slug), {})));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [negocio.slug, pedibles]);

  const fijar = (siguiente) => {
    setCarrito(siguiente);
    guardar(claveCarrito(negocio.slug), siguiente);
  };

  const actualizar = (id, delta) => {
    const n = Math.max(0, Math.min((carrito[id] || 0) + delta, maximo(pedibles[id])));
    const siguiente = { ...carrito, [id]: n };
    if (n === 0) delete siguiente[id];
    fijar(siguiente);
  };

  return (
    <CarritoContext.Provider
      value={{ negocio, pedibles, carrito, actualizar, fijar, ajustar, abierto, setAbierto }}
    >
      {children}
    </CarritoContext.Provider>
  );
}

function useCarrito() {
  return useContext(CarritoContext);
}

export function BotonAgregar({ id, nombre }) {
  const ctx = useCarrito();
  const pedible = ctx?.pedibles[id];
  if (!pedible) return null;
  if (pedible.quedan === 0) {
    return (
      <span className="flex-shrink-0 rounded-full bg-stone-200 text-stone-700 px-3 py-1.5 text-sm font-semibold">
        Agotado
      </span>
    );
  }
  const cantidad = ctx.carrito[id] || 0;
  return (
    <Contador
      cantidad={cantidad}
      tope={cantidad >= maximo(pedible)}
      onMas={() => ctx.actualizar(id, 1)}
      onMenos={() => ctx.actualizar(id, -1)}
      nombre={nombre}
    />
  );
}

function Contador({ cantidad, tope, onMas, onMenos, nombre }) {
  if (cantidad === 0) {
    return (
      <button
        type="button"
        onClick={onMas}
        aria-label={`Agregar ${nombre}`}
        className="flex-shrink-0 w-11 h-11 rounded-full flex items-center justify-center bg-[var(--ff-primario)] text-[var(--ff-sobre-primario)] active:scale-90 transition-transform"
      >
        <Plus className="w-5 h-5" />
      </button>
    );
  }
  return (
    <div className="flex-shrink-0 flex items-center gap-1.5 rounded-full border border-[var(--ff-borde)] bg-[var(--ff-tarjeta)] p-1">
      <button
        type="button"
        onClick={onMenos}
        aria-label={`Quitar ${nombre}`}
        className="w-9 h-9 rounded-full flex items-center justify-center active:scale-90 transition-transform"
      >
        <Minus className="w-4 h-4" />
      </button>
      <span className="w-5 text-center font-semibold tabular-nums">{cantidad}</span>
      <button
        type="button"
        onClick={onMas}
        disabled={tope}
        aria-label={`Agregar otro ${nombre}`}
        className="w-9 h-9 rounded-full flex items-center justify-center bg-[var(--ff-primario)] text-[var(--ff-sobre-primario)] active:scale-90 transition-transform disabled:opacity-40"
      >
        <Plus className="w-4 h-4" />
      </button>
    </div>
  );
}

/** "Pedir lo mismo de la vez pasada" (último pedido en este negocio, en este navegador). */
export function PedirLoMismo() {
  const ctx = useCarrito();
  const [ultimo, setUltimo] = useState(null);

  useEffect(() => {
    if (!ctx) return;
    const ajustado = ctx.ajustar(leer(claveUltimo(ctx.negocio.slug), {}));
    setUltimo(Object.keys(ajustado).length ? ajustado : null);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ctx?.negocio.slug, ctx?.pedibles]);

  if (!ultimo) return null;
  const texto = Object.entries(ultimo)
    .map(([id, n]) => `${n}× ${ctx.pedibles[id].nombre}`)
    .join(", ");

  return (
    <div className="max-w-3xl mx-auto px-4 pt-6">
      <button
        type="button"
        onClick={() => {
          ctx.fijar(ultimo);
          ctx.setAbierto(true);
        }}
        className="w-full flex items-center gap-3 rounded-2xl border border-[var(--ff-borde)] bg-[var(--ff-tarjeta)] p-3 text-left"
      >
        <span className="w-10 h-10 flex-shrink-0 rounded-full bg-[var(--ff-primario)] text-[var(--ff-sobre-primario)] flex items-center justify-center">
          <RotateCcw className="w-5 h-5 fill-none" />
        </span>
        <span className="min-w-0">
          <span className="block font-semibold">Pedir lo mismo de la vez pasada</span>
          <span className="block text-sm text-[var(--ff-texto-suave)] truncate">{texto}</span>
        </span>
      </button>
    </div>
  );
}

const inputClase =
  "w-full rounded-xl border border-[var(--ff-borde)] bg-[var(--ff-tarjeta)] text-[var(--ff-texto)] px-4 py-3 text-base placeholder:text-[var(--ff-texto-suave)]";

/** Barra flotante "Ver pedido" + hoja con el resumen, los datos y "Hacer pedido". */
export function BarraPedido() {
  const ctx = useCarrito();
  const router = useRouter();
  const [datos, setDatos] = useState({ nombre: "", telefono: "", entrega: "recoger", direccion: "", nota: "" });
  const [enviando, setEnviando] = useState(false);
  const [error, setError] = useState("");

  // Datos del cliente recordados de pedidos anteriores (en cualquier negocio).
  useEffect(() => {
    const c = leer(CLAVE_CLIENTE, {});
    setDatos((d) => ({
      ...d,
      nombre: c.nombre || "",
      telefono: c.telefono || "",
      direccion: c.direccion || "",
    }));
  }, []);

  if (!ctx) return null;
  const { negocio, pedibles, carrito, actualizar, fijar, abierto, setAbierto } = ctx;

  const lineas = Object.entries(carrito)
    .filter(([id]) => pedibles[id])
    .map(([id, cantidad]) => ({ ...pedibles[id], cantidad }));
  const totalItems = lineas.reduce((s, l) => s + l.cantidad, 0);
  const total = lineas.reduce((s, l) => s + l.cantidad * l.precio, 0);
  if (totalItems === 0) return null;

  const esDomicilio = negocio.domicilio && datos.entrega === "domicilio";

  const hacerPedido = async (e) => {
    e.preventDefault();
    setError("");
    setEnviando(true);
    try {
      const res = await fetch("/api/fastfoods/pedidos", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          slug: negocio.slug,
          items: lineas.map((l) => ({ id: l.id, cantidad: l.cantidad })),
          nombre: datos.nombre,
          telefono: datos.telefono,
          entrega: esDomicilio ? "domicilio" : "recoger",
          direccion: esDomicilio ? datos.direccion : "",
          nota: datos.nota,
        }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.error || "No se pudo hacer el pedido");

      guardar(CLAVE_CLIENTE, {
        nombre: datos.nombre.trim(),
        telefono: datos.telefono.trim(),
        direccion: datos.direccion.trim(),
      });
      guardar(claveUltimo(negocio.slug), carrito);
      fijar({});
      router.push(`/fastfoods/pedido/${data.token}`);
    } catch (err) {
      setError(err.message);
      setEnviando(false);
    }
  };

  return (
    <>
      {/* Espacio para que la barra no tape el final de la página */}
      <div className="h-36" aria-hidden />

      {/* Va por encima de los botones flotantes del sitio (compartir / chat IA,
          z-index 9998+), que ocupan las esquinas inferiores. */}
      <div className="fixed bottom-[5.5rem] inset-x-0 z-40 px-3">
        <button
          type="button"
          onClick={() => setAbierto(true)}
          className="max-w-3xl mx-auto w-full flex items-center justify-between gap-3 rounded-2xl px-5 py-4 font-semibold shadow-xl bg-[var(--ff-primario)] text-[var(--ff-sobre-primario)] active:scale-[0.98] transition-transform"
        >
          <span className="flex items-center gap-2">
            <ShoppingBag className="w-5 h-5 fill-none" />
            Ver pedido ({totalItems})
          </span>
          <span>{formatoPrecio(total)}</span>
        </button>
      </div>

      {abierto && (
        <div className="fixed inset-0 z-[10000] flex items-end sm:items-center justify-center">
          <button
            type="button"
            aria-label="Cerrar"
            className="absolute inset-0 bg-black/50"
            onClick={() => setAbierto(false)}
          />
          <form
            onSubmit={hacerPedido}
            role="dialog"
            aria-modal="true"
            aria-label="Tu pedido"
            className="relative w-full sm:max-w-md max-h-[90dvh] overflow-y-auto overscroll-contain rounded-t-3xl sm:rounded-3xl bg-[var(--ff-fondo)] text-[var(--ff-texto)] p-5 pb-[max(1.25rem,env(safe-area-inset-bottom))]"
          >
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold">Tu pedido</h2>
              <button
                type="button"
                onClick={() => setAbierto(false)}
                className="p-2 -m-2 rounded-full"
                aria-label="Cerrar"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <ul className="space-y-3 mb-4">
              {lineas.map((l) => (
                <li key={l.id} className="flex items-center gap-3">
                  <div className="flex-1 min-w-0">
                    <p className="font-medium truncate">{l.nombre}</p>
                    <p className="text-sm text-[var(--ff-texto-suave)]">
                      {formatoPrecio(l.precio * l.cantidad)}
                      {l.quedan != null && ` · quedan ${l.quedan}`}
                    </p>
                  </div>
                  <Contador
                    cantidad={l.cantidad}
                    tope={l.cantidad >= maximo(l)}
                    onMas={() => actualizar(l.id, 1)}
                    onMenos={() => actualizar(l.id, -1)}
                    nombre={l.nombre}
                  />
                </li>
              ))}
            </ul>

            <div className="flex justify-between font-bold text-lg border-t border-[var(--ff-borde)] pt-3 mb-4">
              <span>Total</span>
              <span>{formatoPrecio(total)}</span>
            </div>

            <div className="space-y-3 mb-4">
              <input
                required
                value={datos.nombre}
                onChange={(e) => setDatos({ ...datos, nombre: e.target.value })}
                placeholder="Tu nombre"
                autoComplete="name"
                maxLength={60}
                className={inputClase}
              />
              <input
                required
                type="tel"
                inputMode="tel"
                value={datos.telefono}
                onChange={(e) => setDatos({ ...datos, telefono: e.target.value })}
                placeholder="Tu celular (para avisarte)"
                autoComplete="tel"
                className={inputClase}
              />
              {negocio.domicilio && (
                <>
                  <div className="grid grid-cols-2 gap-2">
                    {[
                      ["recoger", "Recojo en el local"],
                      ["domicilio", "Domicilio"],
                    ].map(([valor, texto]) => (
                      <button
                        key={valor}
                        type="button"
                        onClick={() => setDatos({ ...datos, entrega: valor })}
                        className={`rounded-xl px-3 py-3 text-sm font-medium border ${
                          datos.entrega === valor
                            ? "bg-[var(--ff-primario)] text-[var(--ff-sobre-primario)] border-transparent"
                            : "border-[var(--ff-borde)] bg-[var(--ff-tarjeta)]"
                        }`}
                      >
                        {texto}
                      </button>
                    ))}
                  </div>
                  {esDomicilio && (
                    <input
                      required
                      value={datos.direccion}
                      onChange={(e) => setDatos({ ...datos, direccion: e.target.value })}
                      placeholder="Dirección de entrega"
                      autoComplete="street-address"
                      maxLength={160}
                      className={inputClase}
                    />
                  )}
                </>
              )}
              <textarea
                value={datos.nota}
                onChange={(e) => setDatos({ ...datos, nota: e.target.value })}
                placeholder="Nota (sin cebolla, salsas aparte…)"
                rows={2}
                maxLength={200}
                className={inputClase}
              />
            </div>

            {error && (
              <p role="alert" className="mb-3 rounded-xl bg-red-100 text-red-800 px-4 py-3 text-sm">
                {error}
              </p>
            )}

            <button
              type="submit"
              disabled={enviando}
              className="flex items-center justify-center gap-2 w-full rounded-2xl bg-[var(--ff-primario)] text-[var(--ff-sobre-primario)] font-semibold py-4 text-lg disabled:opacity-60"
            >
              {enviando && <Loader2 className="w-5 h-5 animate-spin" />}
              Hacer pedido · {formatoPrecio(total)}
            </button>
            <p className="text-xs text-center text-[var(--ff-texto-suave)] mt-2">
              Pagas al recibir. Verás cómo va tu pedido en la siguiente pantalla.
            </p>
          </form>
        </div>
      )}
    </>
  );
}
