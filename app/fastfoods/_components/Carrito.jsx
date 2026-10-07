"use client";

import { createContext, useContext, useEffect, useState } from "react";
import { Minus, Plus, ShoppingBag, X } from "lucide-react";
import { enlaceWhatsapp, formatoPrecio } from "@/lib/fastfoods/utils";

/**
 * Carrito sencillo de un negocio: el cliente elige platos y cantidades, y el
 * pedido se envía armado por WhatsApp. Las secciones de la plantilla son de
 * servidor; solo <BotonAgregar> y <BarraPedido> viven en el cliente.
 *
 * Se recuerda por negocio en localStorage; si el navegador no lo permite,
 * el carrito funciona igual pero no sobrevive a una recarga.
 */
const CarritoContext = createContext(null);

export function CarritoProvider({ negocio, pedibles, children }) {
  // pedibles: { [id]: { id, nombre, precio } } — platos del menú y especiales con precio
  const claveStorage = `fastfood-carrito:${negocio.slug}`;
  const [carrito, setCarrito] = useState({}); // { [id]: cantidad }

  useEffect(() => {
    try {
      const guardado = JSON.parse(localStorage.getItem(claveStorage) || "{}");
      // Descarta platos borrados y especiales que ya vencieron.
      setCarrito(
        Object.fromEntries(Object.entries(guardado).filter(([id, n]) => pedibles[id] && n > 0))
      );
    } catch {}
  }, [claveStorage, pedibles]);

  const actualizar = (id, delta) => {
    setCarrito((prev) => {
      const siguiente = { ...prev, [id]: Math.max(0, (prev[id] || 0) + delta) };
      if (siguiente[id] === 0) delete siguiente[id];
      try {
        localStorage.setItem(claveStorage, JSON.stringify(siguiente));
      } catch {}
      return siguiente;
    });
  };

  const puedePedir = !!enlaceWhatsapp(negocio.whatsapp);

  return (
    <CarritoContext.Provider value={{ negocio, pedibles, carrito, actualizar, puedePedir }}>
      {children}
    </CarritoContext.Provider>
  );
}

function useCarrito() {
  return useContext(CarritoContext);
}

export function BotonAgregar({ id, nombre }) {
  const ctx = useCarrito();
  if (!ctx?.puedePedir || !ctx.pedibles[id]) return null;
  return (
    <Contador
      cantidad={ctx.carrito[id] || 0}
      onMas={() => ctx.actualizar(id, 1)}
      onMenos={() => ctx.actualizar(id, -1)}
      nombre={nombre}
    />
  );
}

function Contador({ cantidad, onMas, onMenos, nombre }) {
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
        aria-label={`Agregar otro ${nombre}`}
        className="w-9 h-9 rounded-full flex items-center justify-center bg-[var(--ff-primario)] text-[var(--ff-sobre-primario)] active:scale-90 transition-transform"
      >
        <Plus className="w-4 h-4" />
      </button>
    </div>
  );
}

const inputClase =
  "w-full rounded-xl border border-[var(--ff-borde)] bg-[var(--ff-tarjeta)] text-[var(--ff-texto)] px-4 py-3 text-base placeholder:text-[var(--ff-texto-suave)]";

/** Barra flotante "Ver pedido" + hoja con el resumen y los datos de entrega. */
export function BarraPedido() {
  const ctx = useCarrito();
  const [abierto, setAbierto] = useState(false);
  const [datos, setDatos] = useState({ nombre: "", entrega: "recoger", direccion: "", nota: "" });

  if (!ctx?.puedePedir) return null;
  const { negocio, pedibles, carrito, actualizar } = ctx;

  const lineas = Object.entries(carrito)
    .filter(([id]) => pedibles[id])
    .map(([id, cantidad]) => ({ ...pedibles[id], cantidad }));
  const totalItems = lineas.reduce((s, l) => s + l.cantidad, 0);
  const total = lineas.reduce((s, l) => s + l.cantidad * l.precio, 0);
  if (totalItems === 0) return null;

  const mensaje = [
    `¡Hola ${negocio.nombre}! Quiero hacer este pedido (lo armé en neurai.dev):`,
    "",
    ...lineas.map((l) => `• ${l.cantidad} x ${l.nombre} — ${formatoPrecio(l.cantidad * l.precio)}`),
    "",
    `*Total: ${formatoPrecio(total)}*`,
    "",
    datos.nombre.trim() && `Nombre: ${datos.nombre.trim()}`,
    negocio.domicilio &&
      (datos.entrega === "domicilio"
        ? `Entrega: domicilio — ${datos.direccion.trim() || "(dirección por confirmar)"}`
        : "Entrega: recojo en el local"),
    datos.nota.trim() && `Nota: ${datos.nota.trim()}`,
  ]
    .filter((l) => typeof l === "string")
    .join("\n")
    .trim();

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
          <div
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
                    </p>
                  </div>
                  <Contador
                    cantidad={l.cantidad}
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

            <div className="space-y-3 mb-5">
              <input
                value={datos.nombre}
                onChange={(e) => setDatos({ ...datos, nombre: e.target.value })}
                placeholder="Tu nombre"
                autoComplete="name"
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
                  {datos.entrega === "domicilio" && (
                    <input
                      value={datos.direccion}
                      onChange={(e) => setDatos({ ...datos, direccion: e.target.value })}
                      placeholder="Dirección de entrega"
                      autoComplete="street-address"
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
                className={inputClase}
              />
            </div>

            <a
              href={enlaceWhatsapp(negocio.whatsapp, mensaje)}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center w-full rounded-2xl bg-[#25D366] text-white font-semibold py-4 text-lg"
            >
              Enviar pedido por WhatsApp
            </a>
            <p className="text-xs text-center text-[var(--ff-texto-suave)] mt-2">
              Se abre WhatsApp con tu pedido listo para enviar.
            </p>
          </div>
        </div>
      )}
    </>
  );
}
