"use client";

import { useEffect, useState } from "react";
import { Wrench, Check, Plus } from "lucide-react";
import { useCart } from "@/context/CartContext";
import { useToast } from "@/contexts/ToastContext";

/**
 * "Producto + servicio técnico": debajo del botón de compra ofrece los
 * servicios (instalación, configuración, migración de datos…) que aplican a la
 * categoría del producto. Cada servicio es un producto de categoría
 * "servicios" en D1, así entra al carrito y al checkout como cualquier otro.
 */
export default function ServiciosCombo({ producto }) {
  const { addToCart, cart } = useCart();
  const toast = useToast();
  const [servicios, setServicios] = useState([]);

  const categoria = producto?.categoria;

  useEffect(() => {
    if (!categoria || categoria === "servicios") return;
    let activo = true;
    fetch(`/api/productos/servicios?categoria=${encodeURIComponent(categoria)}`)
      .then((r) => r.json())
      .then((d) => activo && setServicios(d.servicios || []))
      .catch(() => {});
    return () => {
      activo = false;
    };
  }, [categoria]);

  if (servicios.length === 0) return null;

  const enCarrito = (id) => cart.some((item) => item.id === id);

  const agregar = async (servicio) => {
    const ok = await addToCart(servicio, 1);
    if (ok) {
      toast.success(`${servicio.nombre} agregado al carrito`, {
        title: "¡Servicio agregado!",
        duration: 3000,
      });
    }
  };

  return (
    <div className="mt-6 rounded-xl border border-gray-200 dark:border-gray-700 p-4">
      <p className="flex items-center gap-2 font-semibold text-gray-900 dark:text-white">
        <Wrench className="w-5 h-5 text-blue-600" />
        ¿Te lo dejo listo para usar?
      </p>
      <p className="text-sm text-gray-600 dark:text-gray-400 mt-1 mb-3">
        Agrega el servicio técnico junto con tu compra. Lo hago yo mismo.
      </p>
      <ul className="space-y-2">
        {servicios.map((s) => {
          const agregado = enCarrito(s.id);
          return (
            <li
              key={s.id}
              className="flex items-center justify-between gap-3 rounded-lg bg-gray-50 dark:bg-gray-800 px-3 py-2"
            >
              <div className="min-w-0">
                <p className="text-sm font-medium text-gray-900 dark:text-white">
                  {s.nombre}
                </p>
                {s.descripcion && (
                  <p className="text-xs text-gray-500 dark:text-gray-400 line-clamp-2">
                    {s.descripcion}
                  </p>
                )}
                <p className="text-sm font-bold text-blue-600 dark:text-blue-400">
                  +${Number(s.precio).toLocaleString("es-CO")}
                  {s.precioAnterior && (
                    <span className="ml-2 text-xs font-normal text-gray-400 line-through">
                      ${Number(s.precioAnterior).toLocaleString("es-CO")}
                    </span>
                  )}
                </p>
              </div>
              <button
                type="button"
                onClick={() => !agregado && agregar(s)}
                disabled={agregado}
                className={`shrink-0 inline-flex items-center gap-1 text-sm font-semibold px-3 py-2 rounded-lg transition-colors ${
                  agregado
                    ? "bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-300 cursor-default"
                    : "bg-blue-600 hover:bg-blue-700 text-white"
                }`}
              >
                {agregado ? (
                  <>
                    <Check className="w-4 h-4" /> Agregado
                  </>
                ) : (
                  <>
                    <Plus className="w-4 h-4" /> Agregar
                  </>
                )}
              </button>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
