"use client";

import { useUser } from "@clerk/nextjs";
import { useEffect, useState } from "react";
import Link from "next/link";
import { Plus, Pencil, Trash2, Search, X, ExternalLink, Share2 } from "lucide-react";

export default function TiendaProductosPage() {
  const { user } = useUser();
  const [productos, setProductos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [busqueda, setBusqueda] = useState("");
  const [tienda, setTienda] = useState(null);

  useEffect(() => {
    if (!user) return;
    cargarDatos();
  }, [user]);

  async function cargarDatos() {
    try {
      setLoading(true);
      const [resP, resT] = await Promise.all([
        fetch("/api/productos"),
        fetch("/api/tiendas/onboarding"),
      ]);
      if (resP.ok) {
        const data = await resP.json();
        setProductos(data.productos || data || []);
      }
      if (resT.ok) {
        const data = await resT.json();
        setTienda(data.tienda);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }

  async function handleEliminar(id) {
    if (!confirm("¿Eliminar este producto?")) return;
    try {
      const res = await fetch(`/api/productos/${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Error eliminando");
      setProductos((prev) => prev.filter((p) => p.id !== id));
    } catch (e) {
      alert(e.message);
    }
  }

  const slug = tienda?.nombre
    ? tienda.nombre.toLowerCase().replace(/\s+/g, "-").replace(/[^a-z0-9-]/g, "")
    : null;

  const urlPublica = slug ? `${window?.location?.origin}/tienda/${slug}` : null;

  const filtrados = productos.filter((p) =>
    !busqueda ||
    p.nombre?.toLowerCase().includes(busqueda.toLowerCase()) ||
    p.categoria?.toLowerCase().includes(busqueda.toLowerCase())
  );

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600" />
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Mis Productos</h1>
          <p className="text-gray-500 text-sm mt-0.5">{productos.length} productos en tu catálogo</p>
        </div>
        <Link href="/tienda/productos/nuevo"
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium">
          <Plus className="w-4 h-4" /> Nuevo producto
        </Link>
      </div>

      {/* Banner URL pública */}
      {urlPublica && (
        <div className="mb-6 bg-blue-50 border border-blue-200 rounded-xl p-4 flex flex-col sm:flex-row sm:items-center gap-3">
          <div className="flex-1">
            <p className="text-sm font-semibold text-blue-800 mb-1">Tu página pública de tienda</p>
            <p className="text-xs text-blue-600 font-mono break-all">{urlPublica}</p>
          </div>
          <div className="flex gap-2 flex-shrink-0">
            <Link href={`/tienda/${slug}`} target="_blank"
              className="flex items-center gap-1 text-xs bg-white border border-blue-300 text-blue-700 px-3 py-2 rounded-lg hover:bg-blue-50 transition-colors">
              <ExternalLink className="w-3 h-3" /> Ver
            </Link>
            <button
              onClick={() => { navigator.clipboard.writeText(urlPublica); alert("¡Enlace copiado!"); }}
              className="flex items-center gap-1 text-xs bg-blue-600 text-white px-3 py-2 rounded-lg hover:bg-blue-700 transition-colors">
              <Share2 className="w-3 h-3" /> Copiar enlace
            </button>
          </div>
        </div>
      )}

      {/* Buscador */}
      <div className="relative mb-4">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
        <input
          value={busqueda} onChange={(e) => setBusqueda(e.target.value)}
          placeholder="Buscar productos..."
          className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        {busqueda && (
          <button onClick={() => setBusqueda("")} className="absolute right-3 top-1/2 -translate-y-1/2">
            <X className="w-4 h-4 text-gray-400" />
          </button>
        )}
      </div>

      {/* Lista */}
      {filtrados.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-xl border border-gray-200">
          <div className="text-4xl mb-3">📦</div>
          <h3 className="text-lg font-semibold text-gray-900 mb-1">Sin productos aún</h3>
          <p className="text-gray-500 text-sm mb-4">Publica tu primer producto — quedará activo de inmediato</p>
          <Link href="/tienda/productos/nuevo"
            className="inline-flex items-center gap-2 bg-blue-600 text-white px-5 py-2.5 rounded-lg text-sm font-medium hover:bg-blue-700">
            <Plus className="w-4 h-4" /> Publicar primer producto
          </Link>
        </div>
      ) : (
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Producto</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Categoría</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Precio</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Stock</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Estado</th>
                <th className="px-4 py-3 text-right text-xs font-semibold text-gray-500 uppercase">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filtrados.map((p) => (
                <tr key={p.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      {p.imagen_principal
                        ? <img src={p.imagen_principal} alt={p.nombre} className="w-10 h-10 rounded-lg object-cover flex-shrink-0" />
                        : <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center flex-shrink-0 text-lg">📦</div>
                      }
                      <span className="font-medium text-gray-900 line-clamp-1">{p.nombre}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <span className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded-full capitalize">{p.categoria}</span>
                  </td>
                  <td className="px-4 py-3 font-medium text-gray-900">
                    ${p.precio?.toLocaleString("es-CO")}
                  </td>
                  <td className="px-4 py-3">
                    <span className={`text-xs px-2 py-1 rounded-full font-medium ${
                      p.stock > 10 ? "bg-green-100 text-green-700"
                      : p.stock > 0 ? "bg-yellow-100 text-yellow-700"
                      : "bg-red-100 text-red-700"
                    }`}>{p.stock}</span>
                  </td>
                  <td className="px-4 py-3">
                    <span className={`text-xs px-2 py-1 rounded-full font-medium ${
                      p.disponible ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-500"
                    }`}>{p.disponible ? "Activo" : "Inactivo"}</span>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <div className="flex justify-end gap-1">
                      <Link href={`/tienda/productos/editar/${p.id}`}
                        className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors" title="Editar">
                        <Pencil className="w-4 h-4" />
                      </Link>
                      <button onClick={() => handleEliminar(p.id)}
                        className="p-1.5 text-red-500 hover:bg-red-50 rounded-lg transition-colors" title="Eliminar">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
