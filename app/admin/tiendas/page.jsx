"use client";

import { useEffect, useState } from "react";
import {
  Store,
  CheckCircle,
  XCircle,
  UserCheck,
  UserX,
  Search,
  RefreshCw,
  Trash2,
} from "lucide-react";

export default function AdminTiendasPage() {
  const [tiendas, setTiendas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [busqueda, setBusqueda] = useState("");
  const [accionando, setAccionando] = useState(null);
  const [mensaje, setMensaje] = useState("");

  async function cargarTiendas() {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/tiendas");
      const data = await res.json();
      setTiendas(data.tiendas || []);
    } catch {
      setMensaje("Error cargando tiendas");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    cargarTiendas();
  }, []);

  async function toggleAcceso(clerkUserId, revocar) {
    setAccionando(clerkUserId);
    setMensaje("");
    try {
      const res = await fetch("/api/admin/tiendas", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          clerkUserId,
          accion: revocar ? "revocar" : "asignar",
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setMensaje(data.mensaje);
      await cargarTiendas();
    } catch (e) {
      setMensaje(e.message || "Error");
    } finally {
      setAccionando(null);
    }
  }

  async function eliminarTienda(clerkUserId, nombre) {
    if (!confirm(`¿Eliminar la tienda "${nombre}" y todos sus productos? Esta acción no se puede deshacer.`)) return;
    setAccionando(clerkUserId);
    setMensaje("");
    try {
      const res = await fetch("/api/admin/tiendas", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ clerkUserId }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setMensaje(data.mensaje);
      await cargarTiendas();
    } catch (e) {
      setMensaje(e.message || "Error");
    } finally {
      setAccionando(null);
    }
  }

  const tiendasFiltradas = tiendas.filter(
    (t) =>
      t.nombre.toLowerCase().includes(busqueda.toLowerCase()) ||
      t.clerk_user_id.toLowerCase().includes(busqueda.toLowerCase())
  );

  return (
    <div className="max-w-5xl mx-auto mt-8 px-4">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <Store className="w-6 h-6 text-blue-600" />
            Gestión de Tiendas
          </h1>
          <p className="text-gray-500 text-sm mt-1">
            Administra los perfiles y accesos de tiendas registradas
          </p>
        </div>
        <button
          onClick={cargarTiendas}
          className="p-2 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
        >
          <RefreshCw className="w-4 h-4 text-gray-500" />
        </button>
      </div>

      {mensaje && (
        <div className="mb-4 bg-blue-50 border border-blue-200 text-blue-700 px-4 py-3 rounded-lg text-sm">
          {mensaje}
        </div>
      )}

      {/* Buscador */}
      <div className="relative mb-6">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
        <input
          value={busqueda}
          onChange={(e) => setBusqueda(e.target.value)}
          placeholder="Buscar por nombre o ID de usuario..."
          className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      {/* Tabla */}
      {loading ? (
        <div className="flex justify-center py-16">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600" />
        </div>
      ) : tiendasFiltradas.length === 0 ? (
        <div className="text-center py-16 text-gray-400">
          <Store className="w-12 h-12 mx-auto mb-3 opacity-30" />
          <p>No hay tiendas registradas aún</p>
        </div>
      ) : (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Tienda</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Categoría</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Ciudad</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Estado</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Acceso</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Acción</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {tiendasFiltradas.map((tienda) => (
                <tr key={tienda.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-4 py-3">
                    <div className="font-medium text-gray-900">{tienda.nombre}</div>
                    <div className="text-xs text-gray-400 mt-0.5 font-mono">{tienda.clerk_user_id.slice(0, 18)}...</div>
                  </td>
                  <td className="px-4 py-3 text-gray-600 capitalize">{tienda.categoria || "—"}</td>
                  <td className="px-4 py-3 text-gray-600">{tienda.ciudad || "—"}</td>
                  <td className="px-4 py-3">
                    {tienda.activa ? (
                      <span className="inline-flex items-center gap-1 text-xs text-green-700 bg-green-50 px-2 py-1 rounded-full">
                        <CheckCircle className="w-3 h-3" /> Activa
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 text-xs text-red-600 bg-red-50 px-2 py-1 rounded-full">
                        <XCircle className="w-3 h-3" /> Inactiva
                      </span>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    {tienda.onboarding_completado ? (
                      <span className="text-xs text-blue-700 bg-blue-50 px-2 py-1 rounded-full">Completado</span>
                    ) : (
                      <span className="text-xs text-yellow-700 bg-yellow-50 px-2 py-1 rounded-full">Pendiente</span>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex gap-2">
                      <button
                        onClick={() => toggleAcceso(tienda.clerk_user_id, false)}
                        disabled={accionando === tienda.clerk_user_id}
                        title="Dar acceso al dashboard"
                        className="p-1.5 bg-green-50 hover:bg-green-100 text-green-700 rounded-lg transition-colors disabled:opacity-50"
                      >
                        <UserCheck className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => toggleAcceso(tienda.clerk_user_id, true)}
                        disabled={accionando === tienda.clerk_user_id}
                        title="Revocar acceso"
                        className="p-1.5 bg-red-50 hover:bg-red-100 text-red-600 rounded-lg transition-colors disabled:opacity-50"
                      >
                        <UserX className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => eliminarTienda(tienda.clerk_user_id, tienda.nombre)}
                        disabled={accionando === tienda.clerk_user_id}
                        title="Eliminar tienda y sus productos"
                        className="p-1.5 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors disabled:opacity-50"
                      >
                        {accionando === tienda.clerk_user_id
                          ? <div className="w-4 h-4 animate-spin rounded-full border-b-2 border-white" />
                          : <Trash2 className="w-4 h-4" />}
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Info */}
      <div className="mt-6 bg-yellow-50 border border-yellow-200 rounded-xl p-4 text-sm text-yellow-800">
        <strong>Nota:</strong> Al hacer clic en <UserCheck className="inline w-3 h-3" /> le asignas el rol{" "}
        <code className="bg-yellow-100 px-1 rounded">tienda</code> al usuario en Clerk, dándole acceso al dashboard.
        Con <UserX className="inline w-3 h-3" /> revocas ese acceso. El procesamiento de pagos ePayco sigue siendo exclusivo tuyo.
      </div>
    </div>
  );
}
