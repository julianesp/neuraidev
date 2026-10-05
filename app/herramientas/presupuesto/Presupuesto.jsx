"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import {
  ChevronLeft,
  ChevronRight,
  Plus,
  Trash2,
  Wallet,
  TrendingUp,
  TrendingDown,
  PiggyBank,
  Download,
  Upload,
  RotateCcw,
  Check,
  Briefcase,
  Repeat,
  ShoppingBag,
  Info,
} from "lucide-react";

// Los datos viven solo en el navegador del usuario: no requieren cuenta y
// nadie más puede verlos.
const STORAGE_KEY = "neurai-presupuesto-v1";

// tipo → regla 50/30/20: necesidad (50%), gusto (30%), ahorro (20%)
const CATEGORIAS = [
  {
    id: "vivienda",
    nombre: "Vivienda / arriendo",
    tipo: "necesidad",
    color: "#3b82f6",
  },
  {
    id: "servicios",
    nombre: "Servicios públicos",
    tipo: "necesidad",
    color: "#06b6d4",
  },
  {
    id: "alimentacion",
    nombre: "Mercado / alimentación",
    tipo: "necesidad",
    color: "#22c55e",
  },
  {
    id: "transporte",
    nombre: "Transporte",
    tipo: "necesidad",
    color: "#f59e0b",
  },
  { id: "salud", nombre: "Salud", tipo: "necesidad", color: "#ef4444" },
  { id: "educacion", nombre: "Educación", tipo: "necesidad", color: "#8b5cf6" },
  {
    id: "deudas",
    nombre: "Deudas / créditos",
    tipo: "necesidad",
    color: "#dc2626",
  },
  {
    id: "internet",
    nombre: "Celular / internet",
    tipo: "necesidad",
    color: "#0ea5e9",
  },
  {
    id: "restaurantes",
    nombre: "Comidas fuera",
    tipo: "gusto",
    color: "#f97316",
  },
  {
    id: "entretenimiento",
    nombre: "Entretenimiento",
    tipo: "gusto",
    color: "#ec4899",
  },
  {
    id: "ropa",
    nombre: "Ropa y cuidado personal",
    tipo: "gusto",
    color: "#a855f7",
  },
  {
    id: "suscripciones",
    nombre: "Suscripciones",
    tipo: "gusto",
    color: "#6366f1",
  },
  {
    id: "ahorro",
    nombre: "Ahorro / inversión",
    tipo: "ahorro",
    color: "#10b981",
  },
  { id: "otros", nombre: "Otros", tipo: "gusto", color: "#6b7280" },
];
const categoriaPorId = Object.fromEntries(CATEGORIAS.map((c) => [c.id, c]));

const ESTADO_INICIAL = {
  sueldo: { activo: false, monto: 0, dia: 30 },
  metaAhorroPct: 20,
  fijos: [],
  meses: {},
};

const MES_VACIO = {
  ingresos: [],
  gastos: [],
  fijosPagados: {},
  sueldoRecibido: false,
};

const fmt = new Intl.NumberFormat("es-CO", {
  style: "currency",
  currency: "COP",
  maximumFractionDigits: 0,
});
const cop = (n) => fmt.format(Math.round(n || 0));

const nuevoId = () =>
  Date.now().toString(36) + Math.random().toString(36).slice(2, 7);

const claveMes = (fecha) =>
  `${fecha.getFullYear()}-${String(fecha.getMonth() + 1).padStart(2, "0")}`;

const nombreMes = (clave) => {
  const [a, m] = clave.split("-").map(Number);
  const txt = new Date(a, m - 1, 1).toLocaleDateString("es-CO", {
    month: "long",
    year: "numeric",
  });
  return txt.charAt(0).toUpperCase() + txt.slice(1);
};

const moverMes = (clave, delta) => {
  const [a, m] = clave.split("-").map(Number);
  return claveMes(new Date(a, m - 1 + delta, 1));
};

const hoyISO = () => new Date().toISOString().slice(0, 10);

// ── Campos ──────────────────────────────────────────────────────────────────

const inputCls =
  "w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-900 px-3 py-2 text-sm text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500";

/** Input de dinero que muestra separadores de miles mientras se escribe. */
function MontoInput({ value, onChange, placeholder = "0", className = "" }) {
  return (
    <div className={`relative ${className}`}>
      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-gray-500">
        $
      </span>
      <input
        type="text"
        inputMode="numeric"
        className={`${inputCls} pl-7`}
        placeholder={placeholder}
        value={value ? Number(value).toLocaleString("es-CO") : ""}
        onChange={(e) =>
          onChange(Number(e.target.value.replace(/\D/g, "")) || 0)
        }
      />
    </div>
  );
}

function SelectCategoria({ value, onChange }) {
  return (
    <select
      className={inputCls}
      value={value}
      onChange={(e) => onChange(e.target.value)}
    >
      {CATEGORIAS.map((c) => (
        <option key={c.id} value={c.id}>
          {c.nombre}
        </option>
      ))}
    </select>
  );
}

function Tarjeta({ titulo, icono, children, accion }) {
  return (
    <section className="rounded-2xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 p-5 shadow-sm">
      <div className="flex items-center justify-between gap-3 mb-4">
        <h2 className="flex items-center gap-2 text-lg font-bold text-gray-900 dark:text-white">
          {icono}
          {titulo}
        </h2>
        {accion}
      </div>
      {children}
    </section>
  );
}

function Resumen({ titulo, valor, detalle, color, icono }) {
  return (
    <div className="rounded-2xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 p-4 shadow-sm">
      <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
        {icono}
        {titulo}
      </div>
      <p className={`mt-1 text-2xl font-bold ${color}`}>{valor}</p>
      {detalle && (
        <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
          {detalle}
        </p>
      )}
    </div>
  );
}

function Check2({ checked, onChange, label }) {
  return (
    <button
      type="button"
      onClick={() => onChange(!checked)}
      className={`shrink-0 inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-semibold transition-colors ${
        checked
          ? "bg-green-100 text-green-700 dark:bg-green-900/50 dark:text-green-300"
          : "bg-gray-100 text-gray-600 hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-300"
      }`}
      aria-pressed={checked}
    >
      {checked && <Check className="w-3.5 h-3.5" />}
      {label}
    </button>
  );
}

// ── Componente principal ────────────────────────────────────────────────────

export default function Presupuesto() {
  const [datos, setDatos] = useState(ESTADO_INICIAL);
  const [cargado, setCargado] = useState(false);
  const [mes, setMes] = useState(() => claveMes(new Date()));
  const archivoRef = useRef(null);

  // Formularios
  const [nuevoIngreso, setNuevoIngreso] = useState({ concepto: "", monto: 0 });
  const [nuevoFijo, setNuevoFijo] = useState({
    concepto: "",
    monto: 0,
    categoria: "vivienda",
  });
  const [nuevoGasto, setNuevoGasto] = useState({
    concepto: "",
    monto: 0,
    categoria: "alimentacion",
    fecha: hoyISO(),
  });

  useEffect(() => {
    try {
      const guardado = localStorage.getItem(STORAGE_KEY);
      if (guardado) setDatos({ ...ESTADO_INICIAL, ...JSON.parse(guardado) });
    } catch {}
    setCargado(true);
  }, []);

  useEffect(() => {
    if (!cargado) return;
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(datos));
    } catch {}
  }, [datos, cargado]);

  const datosMes = { ...MES_VACIO, ...(datos.meses[mes] || {}) };

  const actualizarMes = (cambio) =>
    setDatos((d) => {
      const actual = { ...MES_VACIO, ...(d.meses[mes] || {}) };
      return {
        ...d,
        meses: { ...d.meses, [mes]: { ...actual, ...cambio(actual) } },
      };
    });

  // ── Cálculos del mes ──
  const calc = useMemo(() => {
    const sueldo = datos.sueldo.activo ? datos.sueldo.monto : 0;
    const extras = datosMes.ingresos.reduce((s, i) => s + i.monto, 0);
    const extrasRecibidos = datosMes.ingresos
      .filter((i) => i.recibido)
      .reduce((s, i) => s + i.monto, 0);
    const ingresosPrevistos = sueldo + extras;
    const ingresosRecibidos =
      (datosMes.sueldoRecibido ? sueldo : 0) + extrasRecibidos;

    const totalFijos = datos.fijos.reduce((s, f) => s + f.monto, 0);
    const fijosPagados = datos.fijos
      .filter((f) => datosMes.fijosPagados[f.id])
      .reduce((s, f) => s + f.monto, 0);
    const totalVariables = datosMes.gastos.reduce((s, g) => s + g.monto, 0);
    const gastosTotales = totalFijos + totalVariables;
    const gastado = fijosPagados + totalVariables;

    const porCategoria = {};
    [...datos.fijos, ...datosMes.gastos].forEach((g) => {
      porCategoria[g.categoria] = (porCategoria[g.categoria] || 0) + g.monto;
    });

    const porTipo = { necesidad: 0, gusto: 0, ahorro: 0 };
    Object.entries(porCategoria).forEach(([cat, monto]) => {
      porTipo[categoriaPorId[cat]?.tipo || "gusto"] += monto;
    });

    const metaAhorro = (ingresosPrevistos * datos.metaAhorroPct) / 100;
    const disponible = ingresosPrevistos - gastosTotales;
    // Lo que sobra + lo que el usuario ya destina explícitamente a ahorro
    const ahorroReal = Math.max(disponible, 0) + porTipo.ahorro;

    return {
      sueldo,
      ingresosPrevistos,
      ingresosRecibidos,
      totalFijos,
      totalVariables,
      gastosTotales,
      gastado,
      disponible,
      saldoActual: ingresosRecibidos - gastado,
      porCategoria,
      porTipo,
      metaAhorro,
      ahorroReal,
    };
  }, [datos, datosMes]);

  const pctGastado =
    calc.ingresosPrevistos > 0
      ? Math.min((calc.gastosTotales / calc.ingresosPrevistos) * 100, 100)
      : 0;

  // ── Acciones ──
  const agregarIngreso = (e) => {
    e.preventDefault();
    if (!nuevoIngreso.monto) return;
    actualizarMes((m) => ({
      ingresos: [
        ...m.ingresos,
        {
          id: nuevoId(),
          concepto: nuevoIngreso.concepto.trim() || "Ingreso",
          monto: nuevoIngreso.monto,
          recibido: false,
        },
      ],
    }));
    setNuevoIngreso({ concepto: "", monto: 0 });
  };

  const agregarFijo = (e) => {
    e.preventDefault();
    if (!nuevoFijo.monto) return;
    setDatos((d) => ({
      ...d,
      fijos: [
        ...d.fijos,
        {
          id: nuevoId(),
          concepto:
            nuevoFijo.concepto.trim() ||
            categoriaPorId[nuevoFijo.categoria].nombre,
          monto: nuevoFijo.monto,
          categoria: nuevoFijo.categoria,
        },
      ],
    }));
    setNuevoFijo((f) => ({ ...f, concepto: "", monto: 0 }));
  };

  const agregarGasto = (e) => {
    e.preventDefault();
    if (!nuevoGasto.monto) return;
    actualizarMes((m) => ({
      gastos: [
        {
          id: nuevoId(),
          concepto:
            nuevoGasto.concepto.trim() ||
            categoriaPorId[nuevoGasto.categoria].nombre,
          monto: nuevoGasto.monto,
          categoria: nuevoGasto.categoria,
          fecha: nuevoGasto.fecha,
        },
        ...m.gastos,
      ],
    }));
    setNuevoGasto((g) => ({ ...g, concepto: "", monto: 0 }));
  };

  const exportar = () => {
    const blob = new Blob([JSON.stringify(datos, null, 2)], {
      type: "application/json",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `presupuesto-neurai-${claveMes(new Date())}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const importar = (e) => {
    const archivo = e.target.files?.[0];
    if (!archivo) return;
    const lector = new FileReader();
    lector.onload = () => {
      try {
        const json = JSON.parse(lector.result);
        if (typeof json !== "object" || !json.meses) throw new Error();
        setDatos({ ...ESTADO_INICIAL, ...json });
      } catch {
        window.alert("El archivo no es una copia válida del presupuesto.");
      }
    };
    lector.readAsText(archivo);
    e.target.value = "";
  };

  const reiniciar = () => {
    if (
      window.confirm(
        "¿Borrar todo el presupuesto? Esta acción no se puede deshacer. Te recomendamos exportar una copia antes.",
      )
    ) {
      setDatos(ESTADO_INICIAL);
    }
  };

  const copiarMesAnterior = () => {
    const anterior = datos.meses[moverMes(mes, -1)];
    if (!anterior?.ingresos?.length) return;
    actualizarMes((m) => ({
      ingresos: [
        ...m.ingresos,
        ...anterior.ingresos.map((i) => ({
          ...i,
          id: nuevoId(),
          recibido: false,
        })),
      ],
    }));
  };

  const categoriasOrdenadas = Object.entries(calc.porCategoria).sort(
    (a, b) => b[1] - a[1],
  );
  const maxCategoria = categoriasOrdenadas[0]?.[1] || 1;

  if (!cargado) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center text-gray-500">
        Cargando presupuesto…
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 pt-24 pb-16 px-4">
      <div className="max-w-6xl mx-auto">
        {/* Encabezado */}
        <header className="mb-6">
          <p className="text-sm font-semibold text-blue-600 dark:text-blue-400">
            Herramientas · Neurai
          </p>
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white">
            Presupuesto personal
          </h1>
          <p className="mt-2 text-gray-600 dark:text-gray-300 max-w-2xl">
            Registra lo que ganas y lo que gastas cada mes para saber cuánto te
            queda disponible y cuánto puedes ahorrar.
          </p>
          <p className="mt-2 inline-flex items-center gap-1.5 text-xs text-gray-500 dark:text-gray-400">
            <Info className="w-3.5 h-3.5" />
            Tus datos se guardan solo en este navegador. Usa “Exportar” para
            tener una copia o pasarlos a otro dispositivo.
          </p>
        </header>

        {/* Selector de mes */}
        <div className="flex items-center justify-between gap-3 mb-6 rounded-2xl bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 p-2 shadow-sm">
          <button
            onClick={() => setMes((m) => moverMes(m, -1))}
            className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-200"
            aria-label="Mes anterior"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          <div className="text-center">
            <p className="text-lg font-bold text-gray-900 dark:text-white">
              {nombreMes(mes)}
            </p>
            {mes !== claveMes(new Date()) && (
              <button
                onClick={() => setMes(claveMes(new Date()))}
                className="text-xs text-blue-600 dark:text-blue-400 hover:underline"
              >
                Volver al mes actual
              </button>
            )}
          </div>
          <button
            onClick={() => setMes((m) => moverMes(m, 1))}
            className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-200"
            aria-label="Mes siguiente"
          >
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>

        {/* Resumen */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-4">
          <Resumen
            titulo="Ingresos del mes"
            icono={<TrendingUp className="w-4 h-4" />}
            valor={cop(calc.ingresosPrevistos)}
            detalle={`Recibido: ${cop(calc.ingresosRecibidos)}`}
            color="text-green-600 dark:text-green-400"
          />
          <Resumen
            titulo="Gastos del mes"
            icono={<TrendingDown className="w-4 h-4" />}
            valor={cop(calc.gastosTotales)}
            detalle={`Fijos ${cop(calc.totalFijos)} · Variables ${cop(calc.totalVariables)}`}
            color="text-red-600 dark:text-red-400"
          />
          <Resumen
            titulo="Disponible"
            icono={<Wallet className="w-4 h-4" />}
            valor={cop(calc.disponible)}
            detalle={
              calc.disponible < 0
                ? "Estás gastando más de lo que ganas"
                : `Saldo real hoy: ${cop(calc.saldoActual)} (recibido − pagado)`
            }
            color={
              calc.disponible < 0
                ? "text-red-600 dark:text-red-400"
                : "text-blue-600 dark:text-blue-400"
            }
          />
          <Resumen
            titulo={`Meta de ahorro (${datos.metaAhorroPct}%)`}
            icono={<PiggyBank className="w-4 h-4" />}
            valor={cop(calc.metaAhorro)}
            detalle={
              calc.ingresosPrevistos === 0
                ? "Agrega tus ingresos para calcularla"
                : calc.ahorroReal >= calc.metaAhorro
                  ? "¡Vas a cumplir tu meta!"
                  : `Te faltan ${cop(calc.metaAhorro - calc.ahorroReal)}`
            }
            color="text-emerald-600 dark:text-emerald-400"
          />
        </div>

        {/* Barra de uso */}
        <div className="mb-8 rounded-2xl bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 p-4 shadow-sm">
          <div className="flex justify-between text-sm mb-2 text-gray-700 dark:text-gray-300">
            <span>
              Has comprometido el {pctGastado.toFixed(0)}% de tus ingresos
            </span>
            <span className="font-semibold">
              {cop(calc.gastosTotales)} / {cop(calc.ingresosPrevistos)}
            </span>
          </div>
          <div className="h-3 rounded-full bg-gray-200 dark:bg-gray-700 overflow-hidden">
            <div
              className={`h-full rounded-full transition-all ${
                pctGastado >= 100
                  ? "bg-red-500"
                  : pctGastado >= 80
                    ? "bg-amber-500"
                    : "bg-green-500"
              }`}
              style={{ width: `${pctGastado}%` }}
            />
          </div>
        </div>

        <div className="grid lg:grid-cols-2 gap-6">
          {/* ── Columna ingresos ── */}
          <div className="space-y-6">
            <Tarjeta
              titulo="Sueldo fijo"
              icono={<Briefcase className="w-5 h-5 text-green-600" />}
            >
              <button
                type="button"
                role="switch"
                aria-checked={datos.sueldo.activo}
                onClick={() =>
                  setDatos((d) => ({
                    ...d,
                    sueldo: { ...d.sueldo, activo: !d.sueldo.activo },
                  }))
                }
                className="flex items-center gap-3 mb-3 text-sm text-gray-700 dark:text-gray-300"
              >
                <span
                  className={`relative inline-block w-10 h-6 rounded-full transition-colors ${
                    datos.sueldo.activo
                      ? "bg-green-600"
                      : "bg-gray-300 dark:bg-gray-600"
                  }`}
                >
                  <span
                    className={`absolute top-0.5 left-0.5 w-5 h-5 rounded-full bg-white shadow transition-transform ${
                      datos.sueldo.activo ? "translate-x-4" : ""
                    }`}
                  />
                </span>
                Tengo un sueldo fijo mensual
              </button>
              {datos.sueldo.activo && (
                <>
                  <div className="grid grid-cols-[1fr_auto] gap-3">
                    <MontoInput
                      value={datos.sueldo.monto}
                      onChange={(monto) =>
                        setDatos((d) => ({
                          ...d,
                          sueldo: { ...d.sueldo, monto },
                        }))
                      }
                      placeholder="Ej: 1.750.000"
                    />
                    <label className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-300">
                      Día de pago
                      <input
                        type="number"
                        min={1}
                        max={31}
                        className={`${inputCls} w-16`}
                        value={datos.sueldo.dia}
                        onChange={(e) =>
                          setDatos((d) => ({
                            ...d,
                            sueldo: {
                              ...d.sueldo,
                              dia: Math.min(
                                Math.max(Number(e.target.value) || 1, 1),
                                31,
                              ),
                            },
                          }))
                        }
                      />
                    </label>
                  </div>
                  <div className="mt-3 flex items-center justify-between gap-3 text-sm text-gray-600 dark:text-gray-300">
                    <span>Se suma automáticamente a cada mes.</span>
                    <Check2
                      checked={datosMes.sueldoRecibido}
                      onChange={(v) =>
                        actualizarMes(() => ({ sueldoRecibido: v }))
                      }
                      label={
                        datosMes.sueldoRecibido ? "Recibido" : "Marcar recibido"
                      }
                    />
                  </div>
                </>
              )}
            </Tarjeta>

            <Tarjeta
              titulo="Lo que ganaré este mes"
              icono={<TrendingUp className="w-5 h-5 text-green-600" />}
              accion={
                datos.meses[moverMes(mes, -1)]?.ingresos?.length > 0 && (
                  <button
                    onClick={copiarMesAnterior}
                    className="text-xs text-blue-600 dark:text-blue-400 hover:underline"
                  >
                    Copiar del mes anterior
                  </button>
                )
              }
            >
              <p className="text-sm text-gray-500 dark:text-gray-400 mb-3">
                Trabajos, ventas, comisiones, primas… Anota lo que esperas
                recibir y márcalo cuando te paguen.
              </p>
              <form
                onSubmit={agregarIngreso}
                className="grid grid-cols-[1fr_1fr_auto] gap-2 mb-4"
              >
                <input
                  className={inputCls}
                  placeholder="Concepto"
                  value={nuevoIngreso.concepto}
                  onChange={(e) =>
                    setNuevoIngreso((i) => ({ ...i, concepto: e.target.value }))
                  }
                />
                <MontoInput
                  value={nuevoIngreso.monto}
                  onChange={(monto) =>
                    setNuevoIngreso((i) => ({ ...i, monto }))
                  }
                />
                <button
                  type="submit"
                  className="rounded-lg bg-green-600 hover:bg-green-700 text-white px-3"
                  aria-label="Agregar ingreso"
                >
                  <Plus className="w-5 h-5" />
                </button>
              </form>
              {datosMes.ingresos.length === 0 ? (
                <p className="text-sm text-gray-400 text-center py-3">
                  Aún no hay ingresos extra este mes.
                </p>
              ) : (
                <ul className="divide-y divide-gray-100 dark:divide-gray-700">
                  {datosMes.ingresos.map((i) => (
                    <li key={i.id} className="flex items-center gap-3 py-2">
                      <span className="flex-1 min-w-0 truncate text-sm text-gray-800 dark:text-gray-200">
                        {i.concepto}
                      </span>
                      <span className="text-sm font-semibold text-green-600 dark:text-green-400">
                        {cop(i.monto)}
                      </span>
                      <Check2
                        checked={i.recibido}
                        onChange={(v) =>
                          actualizarMes((m) => ({
                            ingresos: m.ingresos.map((x) =>
                              x.id === i.id ? { ...x, recibido: v } : x,
                            ),
                          }))
                        }
                        label={i.recibido ? "Recibido" : "Pendiente"}
                      />
                      <button
                        onClick={() =>
                          actualizarMes((m) => ({
                            ingresos: m.ingresos.filter((x) => x.id !== i.id),
                          }))
                        }
                        className="text-gray-400 hover:text-red-500"
                        aria-label={`Eliminar ${i.concepto}`}
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </li>
                  ))}
                </ul>
              )}
            </Tarjeta>

            {/* Distribución */}
            <Tarjeta
              titulo="¿En qué se va mi dinero?"
              icono={<PiggyBank className="w-5 h-5 text-emerald-600" />}
            >
              {categoriasOrdenadas.length === 0 ? (
                <p className="text-sm text-gray-400 text-center py-3">
                  Agrega gastos para ver la distribución.
                </p>
              ) : (
                <ul className="space-y-2 mb-6">
                  {categoriasOrdenadas.map(([cat, monto]) => (
                    <li key={cat}>
                      <div className="flex justify-between text-sm mb-1 text-gray-700 dark:text-gray-300">
                        <span>{categoriaPorId[cat]?.nombre || cat}</span>
                        <span className="font-semibold">{cop(monto)}</span>
                      </div>
                      <div className="h-2 rounded-full bg-gray-100 dark:bg-gray-700 overflow-hidden">
                        <div
                          className="h-full rounded-full"
                          style={{
                            width: `${(monto / maxCategoria) * 100}%`,
                            background: categoriaPorId[cat]?.color || "#6b7280",
                          }}
                        />
                      </div>
                    </li>
                  ))}
                </ul>
              )}

              {/* Regla 50/30/20 */}
              <div className="rounded-xl bg-gray-50 dark:bg-gray-900/60 p-4">
                <p className="text-sm font-semibold text-gray-800 dark:text-gray-200 mb-1">
                  Regla 50/30/20
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400 mb-3">
                  Una guía sencilla: 50% para necesidades, 30% para gustos y 20%
                  para ahorro.
                </p>
                {calc.ingresosPrevistos === 0 ? (
                  <p className="text-xs text-gray-400">
                    Agrega tus ingresos para comparar.
                  </p>
                ) : (
                  <div className="grid grid-cols-3 gap-2 text-center">
                    {[
                      ["necesidad", "Necesidades", 50],
                      ["gusto", "Gustos", 30],
                      ["ahorro", "Ahorro", 20],
                    ].map(([tipo, nombre, ideal]) => {
                      const real =
                        tipo === "ahorro"
                          ? calc.ahorroReal
                          : calc.porTipo[tipo];
                      const pct = (real / calc.ingresosPrevistos) * 100;
                      const bien =
                        tipo === "ahorro" ? pct >= ideal : pct <= ideal;
                      return (
                        <div
                          key={tipo}
                          className="rounded-lg bg-white dark:bg-gray-800 p-2"
                        >
                          <p className="text-xs text-gray-500 dark:text-gray-400">
                            {nombre}
                          </p>
                          <p
                            className={`text-lg font-bold ${
                              bien
                                ? "text-green-600 dark:text-green-400"
                                : "text-amber-600 dark:text-amber-400"
                            }`}
                          >
                            {pct.toFixed(0)}%
                          </p>
                          <p className="text-[11px] text-gray-400">
                            ideal {ideal}%
                          </p>
                        </div>
                      );
                    })}
                  </div>
                )}
                <label className="mt-4 flex items-center gap-2 text-xs text-gray-600 dark:text-gray-300">
                  Mi meta de ahorro:
                  <input
                    type="number"
                    min={0}
                    max={100}
                    className={`${inputCls} w-20 py-1`}
                    value={datos.metaAhorroPct}
                    onChange={(e) =>
                      setDatos((d) => ({
                        ...d,
                        metaAhorroPct: Math.min(
                          Math.max(Number(e.target.value) || 0, 0),
                          100,
                        ),
                      }))
                    }
                  />
                  % de mis ingresos
                </label>
              </div>
            </Tarjeta>
          </div>

          {/* ── Columna gastos ── */}
          <div className="space-y-6">
            <Tarjeta
              titulo="Gastos fijos mensuales"
              icono={<Repeat className="w-5 h-5 text-red-500" />}
            >
              <p className="text-sm text-gray-500 dark:text-gray-400 mb-3">
                Arriendo, servicios, créditos… Se repiten cada mes; márcalos
                cuando los pagues.
              </p>
              <form onSubmit={agregarFijo} className="grid gap-2 mb-4">
                <div className="grid grid-cols-2 gap-2">
                  <input
                    className={inputCls}
                    placeholder="Concepto"
                    value={nuevoFijo.concepto}
                    onChange={(e) =>
                      setNuevoFijo((f) => ({ ...f, concepto: e.target.value }))
                    }
                  />
                  <MontoInput
                    value={nuevoFijo.monto}
                    onChange={(monto) => setNuevoFijo((f) => ({ ...f, monto }))}
                  />
                </div>
                <div className="grid grid-cols-[1fr_auto] gap-2">
                  <SelectCategoria
                    value={nuevoFijo.categoria}
                    onChange={(categoria) =>
                      setNuevoFijo((f) => ({ ...f, categoria }))
                    }
                  />
                  <button
                    type="submit"
                    className="inline-flex items-center gap-1 rounded-lg bg-red-500 hover:bg-red-600 text-white px-3 text-sm font-semibold"
                  >
                    <Plus className="w-4 h-4" /> Agregar
                  </button>
                </div>
              </form>
              {datos.fijos.length === 0 ? (
                <p className="text-sm text-gray-400 text-center py-3">
                  Aún no tienes gastos fijos.
                </p>
              ) : (
                <ul className="divide-y divide-gray-100 dark:divide-gray-700">
                  {datos.fijos.map((f) => (
                    <li key={f.id} className="flex items-center gap-3 py-2">
                      <span
                        className="w-2.5 h-2.5 rounded-full shrink-0"
                        style={{
                          background: categoriaPorId[f.categoria]?.color,
                        }}
                      />
                      <span className="flex-1 min-w-0 truncate text-sm text-gray-800 dark:text-gray-200">
                        {f.concepto}
                      </span>
                      <span className="text-sm font-semibold text-red-600 dark:text-red-400">
                        {cop(f.monto)}
                      </span>
                      <Check2
                        checked={!!datosMes.fijosPagados[f.id]}
                        onChange={(v) =>
                          actualizarMes((m) => ({
                            fijosPagados: { ...m.fijosPagados, [f.id]: v },
                          }))
                        }
                        label={
                          datosMes.fijosPagados[f.id] ? "Pagado" : "Pendiente"
                        }
                      />
                      <button
                        onClick={() =>
                          setDatos((d) => ({
                            ...d,
                            fijos: d.fijos.filter((x) => x.id !== f.id),
                          }))
                        }
                        className="text-gray-400 hover:text-red-500"
                        aria-label={`Eliminar ${f.concepto}`}
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </li>
                  ))}
                </ul>
              )}
            </Tarjeta>

            <Tarjeta
              titulo="Gastos del mes"
              icono={<ShoppingBag className="w-5 h-5 text-red-500" />}
            >
              <form onSubmit={agregarGasto} className="grid gap-2 mb-4">
                <div className="grid grid-cols-2 gap-2">
                  <input
                    className={inputCls}
                    placeholder="¿En qué gastaste?"
                    value={nuevoGasto.concepto}
                    onChange={(e) =>
                      setNuevoGasto((g) => ({ ...g, concepto: e.target.value }))
                    }
                  />
                  <MontoInput
                    value={nuevoGasto.monto}
                    onChange={(monto) =>
                      setNuevoGasto((g) => ({ ...g, monto }))
                    }
                  />
                </div>
                <div className="grid grid-cols-[1fr_auto_auto] gap-2">
                  <SelectCategoria
                    value={nuevoGasto.categoria}
                    onChange={(categoria) =>
                      setNuevoGasto((g) => ({ ...g, categoria }))
                    }
                  />
                  <input
                    type="date"
                    className={`${inputCls} w-auto`}
                    value={nuevoGasto.fecha}
                    onChange={(e) =>
                      setNuevoGasto((g) => ({ ...g, fecha: e.target.value }))
                    }
                  />
                  <button
                    type="submit"
                    className="rounded-lg bg-red-500 hover:bg-red-600 text-white px-3"
                    aria-label="Agregar gasto"
                  >
                    <Plus className="w-5 h-5" />
                  </button>
                </div>
              </form>
              {datosMes.gastos.length === 0 ? (
                <p className="text-sm text-gray-400 text-center py-3">
                  Sin gastos registrados en {nombreMes(mes).toLowerCase()}.
                </p>
              ) : (
                <ul className="divide-y divide-gray-100 dark:divide-gray-700 max-h-96 overflow-y-auto">
                  {datosMes.gastos.map((g) => (
                    <li key={g.id} className="flex items-center gap-3 py-2">
                      <span
                        className="w-2.5 h-2.5 rounded-full shrink-0"
                        style={{
                          background: categoriaPorId[g.categoria]?.color,
                        }}
                      />
                      <div className="flex-1 min-w-0">
                        <p className="truncate text-sm text-gray-800 dark:text-gray-200">
                          {g.concepto}
                        </p>
                        <p className="text-xs text-gray-400">
                          {categoriaPorId[g.categoria]?.nombre} ·{" "}
                          {g.fecha
                            ? new Date(
                                `${g.fecha}T12:00:00`,
                              ).toLocaleDateString("es-CO", {
                                day: "numeric",
                                month: "short",
                              })
                            : ""}
                        </p>
                      </div>
                      <span className="text-sm font-semibold text-red-600 dark:text-red-400">
                        {cop(g.monto)}
                      </span>
                      <button
                        onClick={() =>
                          actualizarMes((m) => ({
                            gastos: m.gastos.filter((x) => x.id !== g.id),
                          }))
                        }
                        className="text-gray-400 hover:text-red-500"
                        aria-label={`Eliminar ${g.concepto}`}
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </li>
                  ))}
                </ul>
              )}
            </Tarjeta>

            {/* Copias de seguridad */}
            <div className="flex flex-wrap gap-2">
              <button
                onClick={exportar}
                className="inline-flex items-center gap-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 px-4 py-2 text-sm font-semibold text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700"
              >
                <Download className="w-4 h-4" /> Exportar copia
              </button>
              <button
                onClick={() => archivoRef.current?.click()}
                className="inline-flex items-center gap-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 px-4 py-2 text-sm font-semibold text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700"
              >
                <Upload className="w-4 h-4" /> Importar copia
              </button>
              <input
                ref={archivoRef}
                type="file"
                accept="application/json,.json"
                className="hidden"
                onChange={importar}
              />
              <button
                onClick={reiniciar}
                className="inline-flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-semibold text-red-600 hover:bg-red-50 dark:hover:bg-red-900/30"
              >
                <RotateCcw className="w-4 h-4" /> Borrar todo
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
