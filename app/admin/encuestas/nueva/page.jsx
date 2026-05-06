"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Plus, Trash2, Save } from "lucide-react";

const COLORES = ["#ef4444", "#3b82f6", "#f97316", "#22c55e", "#a855f7", "#ec4899", "#14b8a6", "#f59e0b"];

export default function NuevaEncuestaPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [form, setForm] = useState({
    titulo: "",
    slug: "",
    descripcion: "",
    fecha_cierre: "",
  });
  const [candidatos, setCandidatos] = useState([
    { id: "candidato_1", nombre: "", partido: "", color: "#ef4444" },
    { id: "candidato_2", nombre: "", partido: "", color: "#3b82f6" },
  ]);

  function generarSlug(titulo) {
    return titulo.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "");
  }

  function handleTitulo(e) {
    const titulo = e.target.value;
    setForm({ ...form, titulo, slug: generarSlug(titulo) });
  }

  function agregarCandidato() {
    const id = `candidato_${Date.now()}`;
    const color = COLORES[candidatos.length % COLORES.length];
    setCandidatos([...candidatos, { id, nombre: "", partido: "", color }]);
  }

  function eliminarCandidato(id) {
    if (candidatos.length <= 2) return;
    setCandidatos(candidatos.filter((c) => c.id !== id));
  }

  function actualizarCandidato(id, field, value) {
    setCandidatos(candidatos.map((c) => c.id === id ? { ...c, [field]: value } : c));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");

    if (candidatos.some((c) => !c.nombre.trim())) {
      setError("Todos los candidatos deben tener un nombre.");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("/api/encuestas", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...form,
          candidatos,
          fecha_cierre: new Date(form.fecha_cierre).toISOString(),
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Error al crear la encuesta");
      router.push("/admin/encuestas");
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8 px-4">
      <div className="max-w-3xl mx-auto">
        <div className="flex items-center gap-4 mb-8 mt-10">
          <Link href="/admin/encuestas" className="p-2 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors">
            <ArrowLeft size={20} className="text-gray-600 dark:text-gray-400" />
          </Link>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Nueva Encuesta</h1>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">

          {/* Info básica */}
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 p-6 space-y-4">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Información básica</h2>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Título *</label>
              <input type="text" value={form.titulo} onChange={handleTitulo} required
                className="w-full border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2.5 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none"
                placeholder="Ej: Elecciones Presidenciales 2026" />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Slug (URL) *</label>
              <input type="text" value={form.slug} onChange={(e) => setForm({ ...form, slug: e.target.value })} required
                className="w-full border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2.5 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none font-mono text-sm"
                placeholder="elecciones-presidenciales-2026" />
              <p className="text-xs text-gray-400 mt-1">URL pública: /encuestas/{form.slug || "..."}</p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Descripción</label>
              <textarea value={form.descripcion} onChange={(e) => setForm({ ...form, descripcion: e.target.value })} rows={2}
                className="w-full border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2.5 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none"
                placeholder="Descripción breve de la encuesta" />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Fecha de cierre *</label>
              <input type="datetime-local" value={form.fecha_cierre} onChange={(e) => setForm({ ...form, fecha_cierre: e.target.value })} required
                className="w-full border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2.5 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none" />
            </div>
          </div>

          {/* Candidatos */}
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Candidatos / Opciones *</h2>
              <button type="button" onClick={agregarCandidato}
                className="flex items-center gap-1.5 text-sm text-blue-600 hover:text-blue-700 font-medium">
                <Plus size={16} /> Agregar
              </button>
            </div>
            <div className="space-y-3">
              {candidatos.map((c, i) => (
                <div key={c.id} className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                  <input type="color" value={c.color} onChange={(e) => actualizarCandidato(c.id, "color", e.target.value)}
                    className="w-9 h-9 rounded cursor-pointer border-0 bg-transparent" title="Color" />
                  <input type="text" value={c.nombre} onChange={(e) => actualizarCandidato(c.id, "nombre", e.target.value)}
                    placeholder={`Candidato ${i + 1} *`} required
                    className="flex-1 border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none text-sm" />
                  <input type="text" value={c.partido} onChange={(e) => actualizarCandidato(c.id, "partido", e.target.value)}
                    placeholder="Partido (opcional)"
                    className="flex-1 border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none text-sm" />
                  <button type="button" onClick={() => eliminarCandidato(c.id)} disabled={candidatos.length <= 2}
                    className="text-gray-400 hover:text-red-500 disabled:opacity-30 transition-colors">
                    <Trash2 size={16} />
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Info vinculación blog */}
          <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-xl p-4 text-sm text-blue-700 dark:text-blue-300">
            <strong>Tip:</strong> Una vez creada la encuesta, puedes vincularla a un artículo del blog al crear o editar ese artículo. Selecciona el slug <strong>{form.slug || "..."}</strong> en el campo "Encuesta vinculada".
          </div>

          {error && <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-400 rounded-xl px-4 py-3 text-sm">{error}</div>}

          <div className="flex justify-end">
            <button type="submit" disabled={loading}
              className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white font-semibold px-6 py-3 rounded-xl transition-colors">
              <Save size={18} />
              {loading ? "Creando..." : "Crear encuesta"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
