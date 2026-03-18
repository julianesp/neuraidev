"use client";

import { useUser } from "@clerk/nextjs";
import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import {
  Store, Package, CheckCircle, ArrowRight, ArrowLeft, ChevronRight,
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

export default function TiendaOnboardingPage() {
  const { user, isLoaded } = useUser();
  const router = useRouter();
  const [paso, setPaso] = useState(1);
  const [guardando, setGuardando] = useState(false);
  const [error, setError] = useState("");
  const [yaEnviado, setYaEnviado] = useState(false);

  const [form, setForm] = useState({
    nombre: "",
    descripcion: "",
    categoria: "",
    ciudad: "",
    telefono: "",
  });

  useEffect(() => {
    if (!isLoaded) return;
    if (!user) {
      router.push("/sign-in?redirect_url=/tienda/onboarding");
      return;
    }
    // Si ya tiene rol tienda, ir directo al dashboard
    if (user.publicMetadata?.role === "tienda") {
      router.push("/tienda/dashboard");
    }
  }, [isLoaded, user, router]);

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

  async function activarTienda() {
    setGuardando(true);
    setError("");
    try {
      const res = await fetch("/api/tiendas/onboarding", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Error al guardar");
      }
      setPaso(3);
      // Redirigir al dashboard tras 2 segundos para que Clerk refresque el token
      setTimeout(() => router.push("/tienda/dashboard"), 2000);
    } catch (e) {
      setError(e.message);
    } finally {
      setGuardando(false);
    }
  }

  if (!isLoaded || !user) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600" />
      </div>
    );
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
          <p className="text-gray-500 mt-2">Solo toma 2 minutos</p>
        </div>

        {/* Indicador pasos */}
        {paso < 3 && (
          <div className="flex items-center justify-center mb-8 gap-2">
            {[{ n: 1, label: "Tu tienda" }, { n: 2, label: "Confirmar" }].map((p, i) => (
              <div key={p.n} className="flex items-center">
                <div className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium transition-all ${
                  paso === p.n ? "bg-blue-600 text-white"
                  : paso > p.n ? "bg-green-100 text-green-700"
                  : "bg-white text-gray-400"
                }`}>
                  {paso > p.n ? <CheckCircle className="w-4 h-4" /> : <span className="w-4 h-4 flex items-center justify-center text-xs font-bold">{p.n}</span>}
                  {p.label}
                </div>
                {i < 1 && <ChevronRight className="w-4 h-4 text-gray-300 mx-1" />}
              </div>
            ))}
          </div>
        )}

        <div className="bg-white rounded-2xl shadow-xl p-8">

          {/* PASO 1: Datos */}
          {paso === 1 && (
            <div className="space-y-5">
              <h2 className="text-xl font-semibold text-gray-900">Cuéntanos sobre tu tienda</h2>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Nombre de la tienda <span className="text-red-500">*</span>
                </label>
                <input
                  name="nombre" value={form.nombre} onChange={handleChange}
                  placeholder="Ej: Tienda Don Pedro"
                  className="w-full border border-gray-300 rounded-lg px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  ¿Qué vendes? <span className="text-red-500">*</span>
                </label>
                <select
                  name="categoria" value={form.categoria} onChange={handleChange}
                  className="w-full border border-gray-300 rounded-lg px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                >
                  <option value="">Selecciona una categoría</option>
                  {CATEGORIAS.map((c) => <option key={c.value} value={c.value}>{c.label}</option>)}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Descripción breve</label>
                <textarea
                  name="descripcion" value={form.descripcion} onChange={handleChange}
                  placeholder="Describe brevemente tu tienda..."
                  rows={3}
                  className="w-full border border-gray-300 rounded-lg px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Ciudad</label>
                  <input name="ciudad" value={form.ciudad} onChange={handleChange} placeholder="Ej: Medellín"
                    className="w-full border border-gray-300 rounded-lg px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Teléfono</label>
                  <input name="telefono" value={form.telefono} onChange={handleChange} placeholder="3001234567"
                    className="w-full border border-gray-300 rounded-lg px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
                </div>
              </div>

              {error && <p className="text-red-500 text-sm bg-red-50 border border-red-200 rounded-lg p-3">{error}</p>}

              <button onClick={siguiente}
                className="w-full flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 rounded-lg transition-colors">
                Continuar <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          )}

          {/* PASO 2: Confirmación */}
          {paso === 2 && (
            <div className="space-y-6">
              <h2 className="text-xl font-semibold text-gray-900">Así quedará tu perfil</h2>

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
                    {form.descripcion && <p className="text-sm text-gray-600 mt-2">{form.descripcion}</p>}
                    <div className="flex flex-wrap gap-3 mt-2 text-xs text-gray-500">
                      {form.ciudad && <span>📍 {form.ciudad}</span>}
                      {form.telefono && <span>📞 {form.telefono}</span>}
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-green-50 border border-green-200 rounded-lg p-4 text-sm text-green-800">
                Todo listo — al confirmar, tu tienda queda activa de inmediato y puedes empezar a publicar productos.
              </div>

              {error && <p className="text-red-500 text-sm bg-red-50 border border-red-200 rounded-lg p-3">{error}</p>}

              <div className="flex gap-3">
                <button onClick={() => { setError(""); setPaso(1); }}
                  className="flex items-center gap-2 px-5 py-3 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors">
                  <ArrowLeft className="w-4 h-4" /> Editar
                </button>
                <button onClick={activarTienda} disabled={guardando}
                  className="flex-1 flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white font-semibold py-3 rounded-lg transition-colors">
                  {guardando
                    ? <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white" />
                    : <><CheckCircle className="w-4 h-4" /> Activar mi tienda</>}
                </button>
              </div>
            </div>
          )}

          {/* PASO 3: Tienda activa */}
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
                  Tu tienda ya está lista. En un momento te llevamos a tu panel para que empieces a publicar.
                </p>
              </div>

              <div className="bg-green-50 border border-green-200 rounded-xl p-5 text-left space-y-2">
                <p className="text-sm font-semibold text-green-800">Lo que puedes hacer ahora:</p>
                <ul className="space-y-2 text-sm text-green-700">
                  {[
                    "Publicar productos — activos inmediatamente",
                    "Ver y gestionar tus pedidos",
                    "Crear ofertas y descuentos",
                  ].map((item) => (
                    <li key={item} className="flex items-center gap-2">
                      <CheckCircle className="w-4 h-4 flex-shrink-0" /> {item}
                    </li>
                  ))}
                </ul>
              </div>

              <div className="flex items-center justify-center gap-2 text-blue-600 text-sm">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600" />
                Preparando tu panel...
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
