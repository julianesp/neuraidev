"use client";

import { useState } from "react";
import { ShieldCheck, Search } from "lucide-react";

const pesos = (n) => `$${Math.round(Number(n) || 0).toLocaleString("es-CO")}`;
const fecha = (f) =>
  f
    ? new Date(f).toLocaleDateString("es-CO", { day: "numeric", month: "short", year: "numeric" })
    : "";

/**
 * Botón "Verificar compras" en cada calificación del panel: muestra si esa
 * persona ha comprado en neurai (pedidos online, ventas registradas y ficha de
 * cliente) antes de publicarla o de activarle el 15%.
 */
export default function VerificarCompras({ testimonioId }) {
  const [estado, setEstado] = useState("inicial"); // inicial | cargando | listo | error
  const [datos, setDatos] = useState(null);

  const verificar = async () => {
    setEstado("cargando");
    try {
      const res = await fetch(`/api/admin/verificar-compras?testimonio=${encodeURIComponent(testimonioId)}`);
      const d = await res.json();
      if (!res.ok) throw new Error(d.error);
      setDatos(d);
      setEstado("listo");
    } catch {
      setEstado("error");
    }
  };

  if (estado === "inicial" || estado === "cargando") {
    return (
      <button
        type="button"
        onClick={verificar}
        disabled={estado === "cargando"}
        className="mt-3 inline-flex items-center gap-2 px-4 py-1.5 text-sm border border-blue-600 text-blue-600 rounded-lg hover:bg-blue-50 dark:hover:bg-blue-950/40 disabled:opacity-60"
      >
        <Search className="w-4 h-4" />
        {estado === "cargando" ? "Verificando…" : "Verificar compras"}
      </button>
    );
  }

  if (estado === "error") {
    return (
      <p className="mt-3 text-sm text-red-600">
        No se pudo verificar.{" "}
        <button type="button" onClick={verificar} className="underline">
          Reintentar
        </button>
      </p>
    );
  }

  const { resumen, pedidos, ventas, cliente, porNombre, cuenta, emails } = datos;
  const pagados = pedidos.filter((p) => p.pagado);

  return (
    <div className="mt-3 rounded-lg border border-gray-200 dark:border-gray-700 p-3 text-sm">
      <p
        className={`flex items-center gap-2 font-semibold ${
          resumen.haComprado ? "text-blue-700 dark:text-blue-300" : "text-gray-700 dark:text-gray-300"
        }`}
      >
        <ShieldCheck className="w-4 h-4" />
        {resumen.haComprado
          ? `Sí ha comprado: ${resumen.pedidosPagados} pedido(s) online y ${resumen.ventasRegistradas} venta(s) registradas · ${pesos(resumen.totalGastado)}`
          : "No encontré compras con su cuenta, correo o teléfono"}
      </p>

      <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
        {cuenta
          ? `Cuenta: ${cuenta.nombre || "sin nombre"} (${cuenta.proveedores.join(", ") || "correo"})`
          : "Calificó sin cuenta"}
        {emails.length > 0 && ` · ${emails.join(", ")}`}
        {cuenta?.descuento && ` · 15%: ${cuenta.descuento.estado}`}
      </p>

      {pagados.length > 0 && (
        <div className="mt-2">
          <p className="text-xs font-semibold text-gray-600 dark:text-gray-400">Pedidos online pagados</p>
          <ul className="mt-1 space-y-0.5">
            {pagados.slice(0, 5).map((p) => (
              <li key={p.numero_orden} className="text-xs text-gray-700 dark:text-gray-300">
                {fecha(p.fecha)} · {pesos(p.total)} · {p.metodo_pago} · {p.numero_orden}
              </li>
            ))}
          </ul>
        </div>
      )}

      {ventas.length > 0 && (
        <div className="mt-2">
          <p className="text-xs font-semibold text-gray-600 dark:text-gray-400">Ventas registradas</p>
          <ul className="mt-1 space-y-0.5">
            {ventas.slice(0, 5).map((v) => (
              <li key={v.numero_venta} className="text-xs text-gray-700 dark:text-gray-300">
                {fecha(v.fecha)} · {v.producto} ×{v.cantidad} · {pesos(v.total)}
              </li>
            ))}
          </ul>
        </div>
      )}

      {cliente && (
        <p className="mt-2 text-xs text-gray-700 dark:text-gray-300">
          Ficha de cliente: {cliente.nombre} · {cliente.total_compras || 0} compras ·{" "}
          {pesos(cliente.total_gastado)}
        </p>
      )}

      {porNombre.length > 0 && (
        <div className="mt-2">
          <p className="text-xs font-semibold text-gray-600 dark:text-gray-400">
            Ventas con un nombre parecido (revisa si es la misma persona)
          </p>
          <ul className="mt-1 space-y-0.5">
            {porNombre.slice(0, 5).map((v) => (
              <li key={v.numero_venta} className="text-xs text-gray-700 dark:text-gray-300">
                {fecha(v.fecha)} · {v.cliente_nombre}
                {v.cliente_telefono && ` (${v.cliente_telefono})`} · {v.producto} · {pesos(v.total)}
              </li>
            ))}
          </ul>
        </div>
      )}

      {!resumen.haComprado && porNombre.length === 0 && (
        <p className="mt-2 text-xs text-gray-500 dark:text-gray-400">
          Si le hiciste un formateo y no lo registraste como venta, no aparecerá aquí.
        </p>
      )}
    </div>
  );
}
