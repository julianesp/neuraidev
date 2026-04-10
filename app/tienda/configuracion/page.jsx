"use client";

import { useUser } from "@clerk/nextjs";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Save, Store, ExternalLink, Share2, Trash2 } from "lucide-react";

const CATEGORIAS = [
  { value: "tecnologia", label: "Tecnología" },
  { value: "ropa", label: "Ropa y Moda" },
  { value: "alimentos", label: "Alimentos y Bebidas" },
  { value: "belleza", label: "Belleza y Cuidado" },
  { value: "hogar", label: "Hogar y Decoración" },
  { value: "deportes", label: "Deportes" },
  { value: "otros", label: "Otros" },
];

export default function TiendaConfiguracionPage() {
  const { user } = useUser();
  const router = useRouter();
  const [form, setForm] = useState({
    nombre: "", descripcion: "", categoria: "", ciudad: "", telefono: "",
    whatsapp: "", facebook: "", instagram: "", tiktok: "",
  });
  const [loading, setLoading] = useState(true);
  const [guardando, setGuardando] = useState(false);
  const [eliminando, setEliminando] = useState(false);
  const [ok, setOk] = useState(false);

  useEffect(() => {
    if (!user) return;
    fetch("/api/tiendas/onboarding")
      .then((r) => r.json())
      .then(({ tienda }) => {
        if (tienda) {
          setForm({
            nombre: tienda.nombre || "",
            descripcion: tienda.descripcion || "",
            categoria: tienda.categoria || "",
            ciudad: tienda.ciudad || "",
            telefono: tienda.telefono || "",
            whatsapp: tienda.whatsapp || "",
            facebook: tienda.facebook || "",
            instagram: tienda.instagram || "",
            tiktok: tienda.tiktok || "",
          });
        }
      })
      .finally(() => setLoading(false));
  }, [user]);

  function handleChange(e) {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setGuardando(true);
    setOk(false);
    try {
      const res = await fetch("/api/tiendas/onboarding", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      if (!res.ok) throw new Error("Error guardando");
      setOk(true);
      setTimeout(() => setOk(false), 3000);
    } catch (e) {
      alert(e.message);
    } finally {
      setGuardando(false);
    }
  }

  async function handleEliminar() {
    const confirmado = window.confirm(
      "⚠️ ¿Estás seguro de que quieres eliminar tu tienda?\n\nSe eliminarán también todos tus productos. Esta acción no se puede deshacer."
    );
    if (!confirmado) return;

    setEliminando(true);
    try {
      const res = await fetch("/api/tiendas/eliminar", { method: "DELETE" });
      if (!res.ok) throw new Error("Error al eliminar");
      router.push("/");
    } catch (e) {
      alert("Error eliminando la tienda: " + e.message);
    } finally {
      setEliminando(false);
    }
  }

  const slug = form.nombre
    ? form.nombre.toLowerCase().replace(/\s+/g, "-").replace(/[^a-z0-9-]/g, "")
    : null;

  if (loading) {
    return (
      <div className="flex justify-center py-16">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600" />
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
          <Store className="w-6 h-6 text-blue-600" /> Mi Tienda
        </h1>
        <p className="text-gray-500 text-sm mt-1">Actualiza la información de tu tienda</p>
      </div>

      {/* URL pública */}
      {slug && (
        <div className="mb-6 bg-blue-50 border border-blue-200 rounded-xl p-4">
          <p className="text-sm font-semibold text-blue-800 mb-1">Tu página pública</p>
          <div className="flex items-center gap-3">
            <code className="text-xs text-blue-600 flex-1 break-all">/tienda/{slug}</code>
            <div className="flex gap-2">
              <a href={`/tiendas/${slug}`} target="_blank"
                className="flex items-center gap-1 text-xs bg-white border border-blue-300 text-blue-700 px-3 py-1.5 rounded-lg hover:bg-blue-50">
                <ExternalLink className="w-3 h-3" /> Ver
              </a>
              <button
                onClick={() => { navigator.clipboard.writeText(`${window.location.origin}/tiendas/${slug}`); alert("¡Enlace copiado!"); }}
                className="flex items-center gap-1 text-xs bg-blue-600 text-white px-3 py-1.5 rounded-lg hover:bg-blue-700">
                <Share2 className="w-3 h-3" /> Copiar
              </button>
            </div>
          </div>
        </div>
      )}

      <form onSubmit={handleSubmit} className="bg-white rounded-xl border border-gray-200 p-6 space-y-4 mb-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Nombre de la tienda <span className="text-red-500">*</span>
          </label>
          <input name="nombre" value={form.nombre} onChange={handleChange} required
            className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Categoría</label>
          <select name="categoria" value={form.categoria} onChange={handleChange}
            className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white">
            <option value="">Selecciona...</option>
            {CATEGORIAS.map((c) => <option key={c.value} value={c.value}>{c.label}</option>)}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Descripción</label>
          <textarea name="descripcion" value={form.descripcion} onChange={handleChange} rows={3}
            placeholder="Describe tu tienda..."
            className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none" />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Ciudad</label>
            <input name="ciudad" value={form.ciudad} onChange={handleChange} placeholder="Ej: Medellín"
              className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Teléfono</label>
            <input name="telefono" value={form.telefono} onChange={handleChange} placeholder="3001234567"
              className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
          </div>
        </div>

        <div>
          <p className="text-sm font-medium text-gray-700 mb-3">Redes sociales <span className="text-gray-400 font-normal">(opcional)</span></p>
          <div className="space-y-3">
            <div className="flex items-center gap-3">
              <span className="text-lg w-6 text-center">💬</span>
              <input name="whatsapp" value={form.whatsapp} onChange={handleChange} placeholder="WhatsApp: 3001234567"
                className="flex-1 border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
            </div>
            <div className="flex items-center gap-3">
              <span className="text-lg w-6 text-center">📘</span>
              <input name="facebook" value={form.facebook} onChange={handleChange} placeholder="Facebook: usuario o URL"
                className="flex-1 border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
            </div>
            <div className="flex items-center gap-3">
              <span className="text-lg w-6 text-center">📸</span>
              <input name="instagram" value={form.instagram} onChange={handleChange} placeholder="Instagram: @usuario"
                className="flex-1 border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
            </div>
            <div className="flex items-center gap-3">
              <span className="text-lg w-6 text-center">🎵</span>
              <input name="tiktok" value={form.tiktok} onChange={handleChange} placeholder="TikTok: @usuario"
                className="flex-1 border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
            </div>
          </div>
        </div>

        {ok && (
          <div className="bg-green-50 border border-green-200 text-green-700 text-sm rounded-lg p-3">
            ✓ Cambios guardados correctamente
          </div>
        )}

        <button type="submit" disabled={guardando}
          className="w-full flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white font-semibold py-3 rounded-lg transition-colors">
          {guardando
            ? <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white" />
            : <><Save className="w-4 h-4" /> Guardar cambios</>}
        </button>
      </form>
      {/* Zona de peligro */}
      <div className="bg-white rounded-xl border border-red-200 p-6">
        <h2 className="text-base font-semibold text-red-700 mb-1 flex items-center gap-2">
          <Trash2 className="w-4 h-4" /> Zona de peligro
        </h2>
        <p className="text-sm text-gray-500 mb-4">
          Al eliminar tu tienda se borrarán todos tus productos permanentemente. Esta acción no se puede deshacer.
        </p>
        <button
          type="button"
          onClick={handleEliminar}
          disabled={eliminando}
          className="flex items-center gap-2 bg-red-600 hover:bg-red-700 disabled:bg-red-400 text-white text-sm font-semibold px-5 py-2.5 rounded-lg transition-colors"
        >
          {eliminando
            ? <><div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white" /> Eliminando...</>
            : <><Trash2 className="w-4 h-4" /> Eliminar mi tienda</>}
        </button>
      </div>
    </div>
  );
}
