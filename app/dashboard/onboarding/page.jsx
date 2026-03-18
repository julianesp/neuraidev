"use client";

import { useUser } from "@clerk/nextjs";
import { useRouter } from "next/navigation";
import { useState } from "react";
import {
  Store,
  Package,
  CheckCircle,
  ArrowRight,
  ArrowLeft,
  ChevronRight,
} from "lucide-react";

const CATEGORIAS = [
  { value: "tecnologia", label: "Tecnología" },
  { value: "ropa", label: "Ropa y Moda" },
  { value: "alimentos", label: "Alimentos y Bebidas" },
  { value: "belleza", label: "Belleza y Cuidado" },
  { value: "hogar", label: "Hogar y Decoración" },
  { value: "deportes", label: "Deportes" },
  { value: "otros", label: "Otros" },
];

const PASOS = [
  { numero: 1, label: "Tu tienda", icon: Store },
  { numero: 2, label: "Vista previa", icon: Package },
  { numero: 3, label: "¡Todo listo!", icon: CheckCircle },
];

export default function OnboardingPage() {
  const { user } = useUser();
  const router = useRouter();
  const [paso, setPaso] = useState(1);
  const [guardando, setGuardando] = useState(false);
  const [error, setError] = useState("");

  const [form, setForm] = useState({
    nombre: "",
    descripcion: "",
    categoria: "",
    ciudad: "",
    telefono: "",
  });

  function handleChange(e) {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  }

  function validarPaso1() {
    if (!form.nombre.trim()) return "El nombre de la tienda es obligatorio.";
    if (!form.categoria) return "Selecciona una categoría.";
    return null;
  }

  function siguiente() {
    if (paso === 1) {
      const err = validarPaso1();
      if (err) { setError(err); return; }
    }
    setError("");
    setPaso((p) => p + 1);
  }

  function anterior() {
    setError("");
    setPaso((p) => p - 1);
  }

  async function finalizarOnboarding() {
    setGuardando(true);
    setError("");
    try {
      const res = await fetch("/api/tiendas/onboarding", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          nombre: form.nombre,
          descripcion: form.descripcion,
          categoria: form.categoria,
          ciudad: form.ciudad,
          telefono: form.telefono,
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Error al guardar el perfil");
      }

      setPaso(3);
    } catch (e) {
      setError(e.message);
    } finally {
      setGuardando(false);
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <div className="w-full max-w-lg">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-600 rounded-2xl mb-4">
            <Store className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900">Configura tu tienda</h1>
          <p className="text-gray-500 mt-2">Solo toma 2 minutos y empiezas a vender</p>
        </div>

        {/* Indicador de pasos */}
        {paso < 3 && (
          <div className="flex items-center justify-center mb-8 gap-2">
            {PASOS.slice(0, 2).map((p, i) => {
              const activo = paso === p.numero;
              const completado = paso > p.numero;
              return (
                <div key={p.numero} className="flex items-center">
                  <div className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium transition-all ${
                    activo
                      ? "bg-blue-600 text-white"
                      : completado
                      ? "bg-green-100 text-green-700"
                      : "bg-white text-gray-400"
                  }`}>
                    {completado ? (
                      <CheckCircle className="w-4 h-4" />
                    ) : (
                      <span className="w-4 h-4 flex items-center justify-center text-xs font-bold">
                        {p.numero}
                      </span>
                    )}
                    {p.label}
                  </div>
                  {i < 1 && <ChevronRight className="w-4 h-4 text-gray-300 mx-1" />}
                </div>
              );
            })}
          </div>
        )}

        {/* Tarjeta principal */}
        <div className="bg-white rounded-2xl shadow-xl p-8">

          {/* PASO 1: Datos de la tienda */}
          {paso === 1 && (
            <div className="space-y-5">
              <h2 className="text-xl font-semibold text-gray-900">
                Cuéntanos sobre tu tienda
              </h2>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Nombre de la tienda <span className="text-red-500">*</span>
                </label>
                <input
                  name="nombre"
                  value={form.nombre}
                  onChange={handleChange}
                  placeholder="Ej: Tienda Don Pedro"
                  className="w-full border border-gray-300 rounded-lg px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  ¿Qué vendes? <span className="text-red-500">*</span>
                </label>
                <select
                  name="categoria"
                  value={form.categoria}
                  onChange={handleChange}
                  className="w-full border border-gray-300 rounded-lg px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                >
                  <option value="">Selecciona una categoría</option>
                  {CATEGORIAS.map((c) => (
                    <option key={c.value} value={c.value}>{c.label}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Descripción breve
                </label>
                <textarea
                  name="descripcion"
                  value={form.descripcion}
                  onChange={handleChange}
                  placeholder="Describe brevemente tu tienda..."
                  rows={3}
                  className="w-full border border-gray-300 rounded-lg px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Ciudad</label>
                  <input
                    name="ciudad"
                    value={form.ciudad}
                    onChange={handleChange}
                    placeholder="Ej: Medellín"
                    className="w-full border border-gray-300 rounded-lg px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Teléfono</label>
                  <input
                    name="telefono"
                    value={form.telefono}
                    onChange={handleChange}
                    placeholder="3001234567"
                    className="w-full border border-gray-300 rounded-lg px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              {error && (
                <p className="text-red-500 text-sm bg-red-50 border border-red-200 rounded-lg p-3">{error}</p>
              )}

              <button
                onClick={siguiente}
                className="w-full flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 rounded-lg transition-colors"
              >
                Ver mi tienda <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          )}

          {/* PASO 2: Vista previa */}
          {paso === 2 && (
            <div className="space-y-6">
              <h2 className="text-xl font-semibold text-gray-900">
                Así quedará tu perfil
              </h2>

              {/* Preview card */}
              <div className="border-2 border-blue-200 rounded-xl p-5 bg-blue-50">
                <div className="flex items-start gap-4">
                  <div className="w-14 h-14 bg-blue-600 rounded-xl flex items-center justify-center flex-shrink-0">
                    <Store className="w-7 h-7 text-white" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="text-lg font-bold text-gray-900">{form.nombre}</h3>
                    <span className="inline-block text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded-full mt-1">
                      {CATEGORIAS.find((c) => c.value === form.categoria)?.label}
                    </span>
                    {form.descripcion && (
                      <p className="text-sm text-gray-600 mt-2">{form.descripcion}</p>
                    )}
                    <div className="flex flex-wrap gap-3 mt-3 text-xs text-gray-500">
                      {form.ciudad && <span>📍 {form.ciudad}</span>}
                      {form.telefono && <span>📞 {form.telefono}</span>}
                    </div>
                  </div>
                </div>

                <div className="mt-4 pt-4 border-t border-blue-200">
                  <div className="flex items-center gap-2 text-green-700 text-sm font-medium">
                    <CheckCircle className="w-4 h-4" />
                    Tus productos estarán activos y listos para vender inmediatamente
                  </div>
                </div>
              </div>

              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 text-sm text-yellow-800">
                <strong>Nota:</strong> Los pagos en línea son gestionados directamente por Neurai. Tú solo te enfocas en publicar tus productos.
              </div>

              {error && (
                <p className="text-red-500 text-sm bg-red-50 border border-red-200 rounded-lg p-3">{error}</p>
              )}

              <div className="flex gap-3">
                <button
                  onClick={anterior}
                  className="flex items-center gap-2 px-5 py-3 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
                >
                  <ArrowLeft className="w-4 h-4" /> Editar
                </button>
                <button
                  onClick={finalizarOnboarding}
                  disabled={guardando}
                  className="flex-1 flex items-center justify-center gap-2 bg-green-600 hover:bg-green-700 disabled:bg-green-400 text-white font-semibold py-3 rounded-lg transition-colors"
                >
                  {guardando ? (
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white" />
                  ) : (
                    <>
                      Activar mi tienda <CheckCircle className="w-4 h-4" />
                    </>
                  )}
                </button>
              </div>
            </div>
          )}

          {/* PASO 3: ¡Listo! */}
          {paso === 3 && (
            <div className="text-center space-y-6 py-4">
              <div className="inline-flex items-center justify-center w-20 h-20 bg-green-100 rounded-full">
                <CheckCircle className="w-10 h-10 text-green-600" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-gray-900">
                  ¡{form.nombre} está activa!
                </h2>
                <p className="text-gray-500 mt-2">
                  Tu tienda está configurada y lista. Empieza publicando tu primer producto.
                </p>
              </div>

              <div className="bg-green-50 border border-green-200 rounded-xl p-4 text-left space-y-3">
                <p className="text-sm font-semibold text-green-800">Lo que puedes hacer ahora:</p>
                <ul className="space-y-2 text-sm text-green-700">
                  <li className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 flex-shrink-0" />
                    Publicar productos — activos inmediatamente
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 flex-shrink-0" />
                    Ver y gestionar tus pedidos
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 flex-shrink-0" />
                    Crear ofertas y descuentos
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 flex-shrink-0" />
                    Ver tus ganancias en tiempo real
                  </li>
                </ul>
              </div>

              <div className="flex flex-col gap-3">
                <button
                  onClick={() => router.push("/dashboard/productos/nuevo")}
                  className="w-full flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 rounded-lg transition-colors"
                >
                  <Package className="w-5 h-5" />
                  Publicar mi primer producto
                </button>
                <button
                  onClick={() => router.push("/dashboard")}
                  className="w-full py-3 border border-gray-300 rounded-lg text-sm text-gray-600 hover:bg-gray-50 transition-colors"
                >
                  Ir al panel de control
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
