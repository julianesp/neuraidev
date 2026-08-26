"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  Search,
  Eye,
  EyeOff,
  ShoppingBag,
  CheckCircle,
  XCircle,
  Clock,
  Star,
  Trash2,
  MessageSquare,
} from "lucide-react";
import Swal from "sweetalert2";

export default function ClientesVitrinaPage() {
  const [clientes, setClientes] = useState([]);
  const [testimonios, setTestimonios] = useState([]);
  const [loading, setLoading] = useState(true);
  const [busqueda, setBusqueda] = useState("");
  const [tab, setTab] = useState("clientes"); // clientes | testimonios
  const [guardando, setGuardando] = useState(null);
  // Filtro de estado en la pestaña de testimonios: pendiente | aprobado | rechazado | todos
  const [filtroTestimonios, setFiltroTestimonios] = useState("pendiente");
  // Nº de pendientes, para el badge del tab (independiente del filtro activo)
  const [numPendientes, setNumPendientes] = useState(0);

  useEffect(() => {
    cargarTodo();
  }, []);

  // Recargar la lista cuando cambia el filtro de estado
  useEffect(() => {
    cargarTestimonios();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filtroTestimonios]);

  async function cargarTodo() {
    setLoading(true);
    await Promise.all([cargarClientes(), cargarTestimonios(), cargarNumPendientes()]);
    setLoading(false);
  }

  async function cargarNumPendientes() {
    try {
      const res = await fetch("/api/testimonios?estado=pendiente");
      const data = await res.json();
      if (res.ok) setNumPendientes((data.testimonios || []).length);
    } catch (error) {
      console.error("Error contando pendientes:", error);
    }
  }

  async function cargarClientes() {
    try {
      const res = await fetch("/api/admin/clientes-vitrina");
      const data = await res.json();
      if (res.ok) setClientes(data.clientes || []);
      else throw new Error(data.error);
    } catch (error) {
      console.error("Error cargando clientes:", error);
    }
  }

  async function cargarTestimonios() {
    try {
      // "todos" no manda estado; el endpoint admin acepta cualquier estado
      const query =
        filtroTestimonios === "todos"
          ? "/api/testimonios?estado=todos"
          : `/api/testimonios?estado=${filtroTestimonios}`;
      const res = await fetch(query);
      const data = await res.json();
      if (res.ok) setTestimonios(data.testimonios || []);
      else throw new Error(data.error);
    } catch (error) {
      console.error("Error cargando testimonios:", error);
    }
  }

  async function toggleCliente(cliente, campo) {
    const nuevoValor = !cliente[campo];
    setGuardando(cliente.id + campo);
    // Optimista
    setClientes((prev) =>
      prev.map((c) => (c.id === cliente.id ? { ...c, [campo]: nuevoValor } : c))
    );

    try {
      const res = await fetch("/api/admin/clientes-vitrina", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: cliente.id, [campo]: nuevoValor }),
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error);
      }
    } catch (error) {
      console.error("Error actualizando cliente:", error);
      // Revertir
      setClientes((prev) =>
        prev.map((c) =>
          c.id === cliente.id ? { ...c, [campo]: !nuevoValor } : c
        )
      );
      Swal.fire({
        icon: "error",
        title: "Error",
        text: "No se pudo guardar el cambio",
      });
    } finally {
      setGuardando(null);
    }
  }

  const titulosModerar = {
    aprobado: "¡Testimonio publicado!",
    rechazado: "Testimonio rechazado",
    pendiente: "Quitado de la web (vuelve a pendiente)",
  };

  async function moderarTestimonio(id, estado) {
    try {
      const res = await fetch("/api/testimonios", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, estado }),
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error);
      }
      // Recargar la lista según el filtro activo y recontar pendientes
      await Promise.all([cargarTestimonios(), cargarNumPendientes()]);
      Swal.fire({
        icon: "success",
        title: titulosModerar[estado] || "Actualizado",
        timer: 1800,
        showConfirmButton: false,
      });
    } catch (error) {
      console.error("Error moderando testimonio:", error);
      Swal.fire({ icon: "error", title: "Error", text: error.message });
    }
  }

  async function eliminarTestimonio(id) {
    const result = await Swal.fire({
      title: "¿Eliminar testimonio?",
      text: "Esta acción no se puede deshacer",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#ef4444",
      confirmButtonText: "Sí, eliminar",
      cancelButtonText: "Cancelar",
    });
    if (!result.isConfirmed) return;

    try {
      const res = await fetch(`/api/testimonios?id=${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error();
      setTestimonios((prev) => prev.filter((t) => t.id !== id));
      cargarNumPendientes();
    } catch {
      Swal.fire({ icon: "error", title: "Error", text: "No se pudo eliminar" });
    }
  }

  const clientesFiltrados = clientes.filter((c) => {
    const s = busqueda.toLowerCase();
    return (
      c.nombre?.toLowerCase().includes(s) ||
      c.email?.toLowerCase().includes(s)
    );
  });

  const publicados = clientes.filter((c) => c.publicar_como_cliente).length;

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <Link
        href="/admin"
        className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-700 mb-6"
      >
        <ArrowLeft className="w-4 h-4" />
        Volver al panel
      </Link>

      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
          <Star className="w-7 h-7 text-amber-500" />
          Vitrina de Clientes
        </h1>
        <p className="mt-2 text-gray-600 dark:text-gray-400">
          Publica a los clientes que te autorizaron, muestra qué compraron y
          modera los testimonios antes de que aparezcan en la web.
        </p>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 mb-6 border-b border-gray-200 dark:border-gray-700">
        <button
          onClick={() => setTab("clientes")}
          className={`px-4 py-2 font-medium border-b-2 transition-colors ${
            tab === "clientes"
              ? "border-blue-600 text-blue-600"
              : "border-transparent text-gray-500 hover:text-gray-700"
          }`}
        >
          Clientes ({publicados} publicados)
        </button>
        <button
          onClick={() => setTab("testimonios")}
          className={`px-4 py-2 font-medium border-b-2 transition-colors flex items-center gap-2 ${
            tab === "testimonios"
              ? "border-blue-600 text-blue-600"
              : "border-transparent text-gray-500 hover:text-gray-700"
          }`}
        >
          <MessageSquare className="w-4 h-4" />
          Testimonios
          {numPendientes > 0 && (
            <span className="px-2 py-0.5 text-xs font-bold text-white bg-red-500 rounded-full">
              {numPendientes}
            </span>
          )}
        </button>
      </div>

      {tab === "clientes" && (
        <>
          {/* Búsqueda */}
          <div className="relative mb-4">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Buscar cliente por nombre o email..."
              value={busqueda}
              onChange={(e) => setBusqueda(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
            />
          </div>

          {clientesFiltrados.length === 0 ? (
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-12 text-center text-gray-500">
              No hay clientes que coincidan.
            </div>
          ) : (
            <div className="grid gap-3">
              {clientesFiltrados.map((cliente) => (
                <div
                  key={cliente.id}
                  className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-4"
                >
                  <div className="flex flex-col lg:flex-row lg:items-center gap-4">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-bold flex-shrink-0">
                          {cliente.nombre?.charAt(0).toUpperCase() || "?"}
                        </div>
                        <div className="min-w-0">
                          <p className="font-semibold text-gray-900 dark:text-white truncate">
                            {cliente.nombre}
                          </p>
                          <p className="text-sm text-gray-500 truncate">
                            {cliente.email || "Sin email"}
                          </p>
                        </div>
                      </div>
                      {cliente.productos.length > 0 && (
                        <div className="mt-3 flex flex-wrap gap-2">
                          {cliente.productos.slice(0, 6).map((prod, i) => (
                            <span
                              key={i}
                              className="inline-flex items-center gap-1 text-xs bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 px-2 py-1 rounded-full"
                            >
                              <ShoppingBag className="w-3 h-3" />
                              {prod}
                            </span>
                          ))}
                          {cliente.productos.length > 6 && (
                            <span className="text-xs text-gray-400 px-2 py-1">
                              +{cliente.productos.length - 6} más
                            </span>
                          )}
                        </div>
                      )}
                    </div>

                    {/* Toggles */}
                    <div className="flex flex-col sm:flex-row gap-2 lg:flex-shrink-0">
                      <button
                        onClick={() => toggleCliente(cliente, "publicar_como_cliente")}
                        disabled={guardando === cliente.id + "publicar_como_cliente"}
                        className={`inline-flex items-center justify-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors disabled:opacity-60 ${
                          cliente.publicar_como_cliente
                            ? "bg-green-100 text-green-800 hover:bg-green-200"
                            : "bg-gray-100 text-gray-600 hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-300"
                        }`}
                      >
                        {cliente.publicar_como_cliente ? (
                          <><Eye className="w-4 h-4" /> Publicado</>
                        ) : (
                          <><EyeOff className="w-4 h-4" /> Oculto</>
                        )}
                      </button>
                      <button
                        onClick={() => toggleCliente(cliente, "mostrar_productos")}
                        disabled={
                          !cliente.publicar_como_cliente ||
                          guardando === cliente.id + "mostrar_productos"
                        }
                        className={`inline-flex items-center justify-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors disabled:opacity-40 disabled:cursor-not-allowed ${
                          cliente.mostrar_productos
                            ? "bg-blue-100 text-blue-800 hover:bg-blue-200"
                            : "bg-gray-100 text-gray-600 hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-300"
                        }`}
                        title={
                          !cliente.publicar_como_cliente
                            ? "Primero publica al cliente"
                            : ""
                        }
                      >
                        <ShoppingBag className="w-4 h-4" />
                        {cliente.mostrar_productos ? "Muestra compras" : "Oculta compras"}
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </>
      )}

      {tab === "testimonios" && (
        <>
          {/* Filtro por estado */}
          <div className="flex flex-wrap gap-2 mb-4">
            {[
              { valor: "pendiente", label: "Pendientes" },
              { valor: "aprobado", label: "Publicados" },
              { valor: "rechazado", label: "Rechazados" },
              { valor: "todos", label: "Todos" },
            ].map((op) => (
              <button
                key={op.valor}
                onClick={() => setFiltroTestimonios(op.valor)}
                className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                  filtroTestimonios === op.valor
                    ? "bg-blue-600 text-white"
                    : "bg-gray-100 text-gray-600 hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-300"
                }`}
              >
                {op.label}
              </button>
            ))}
          </div>

          {testimonios.length === 0 ? (
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-12 text-center">
              <CheckCircle className="w-12 h-12 text-green-500 mx-auto mb-3" />
              <p className="text-gray-500">
                {filtroTestimonios === "pendiente"
                  ? "No hay testimonios pendientes. ¡Todo al día!"
                  : "No hay testimonios en este estado."}
              </p>
            </div>
          ) : (
            <div className="grid gap-4">
              {testimonios.map((t) => {
                const estilos = {
                  pendiente: { borde: "border-amber-400", badge: "bg-amber-100 text-amber-800", icon: Clock, texto: "Pendiente" },
                  aprobado: { borde: "border-green-400", badge: "bg-green-100 text-green-800", icon: CheckCircle, texto: "Publicado" },
                  rechazado: { borde: "border-gray-300", badge: "bg-gray-100 text-gray-600", icon: XCircle, texto: "Rechazado" },
                }[t.estado] || { borde: "border-gray-300", badge: "bg-gray-100 text-gray-600", icon: Clock, texto: t.estado };
                const BadgeIcon = estilos.icon;
                return (
                  <div
                    key={t.id}
                    className={`bg-white dark:bg-gray-800 rounded-lg shadow-sm p-5 border-l-4 ${estilos.borde}`}
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="font-semibold text-gray-900 dark:text-white">
                            {t.cliente_nombre}
                          </span>
                          {t.calificacion && (
                            <span className="flex items-center text-amber-500 text-sm">
                              {"★".repeat(t.calificacion)}
                              <span className="text-gray-300">
                                {"★".repeat(5 - t.calificacion)}
                              </span>
                            </span>
                          )}
                          <span className={`inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded-full ${estilos.badge}`}>
                            <BadgeIcon className="w-3 h-3" /> {estilos.texto}
                          </span>
                        </div>
                        {t.cliente_email && (
                          <p className="text-xs text-gray-400 mb-2">{t.cliente_email}</p>
                        )}
                        <p className="text-gray-700 dark:text-gray-300 italic">
                          &ldquo;{t.mensaje}&rdquo;
                        </p>
                        {t.producto_relacionado && (
                          <p className="text-xs text-gray-500 mt-2 flex items-center gap-1">
                            <ShoppingBag className="w-3 h-3" />
                            Sobre: {t.producto_relacionado}
                          </p>
                        )}
                        <p className="text-xs text-gray-400 mt-2">
                          Enviado: {new Date(t.created_at).toLocaleString("es-CO")}
                        </p>
                      </div>
                    </div>
                    <div className="flex flex-wrap gap-2 mt-4 pt-3 border-t border-gray-100 dark:border-gray-700">
                      {/* Aprobar/publicar: visible si no está ya aprobado */}
                      {t.estado !== "aprobado" && (
                        <button
                          onClick={() => moderarTestimonio(t.id, "aprobado")}
                          className="inline-flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 text-sm font-medium"
                        >
                          <CheckCircle className="w-4 h-4" /> Aprobar y publicar
                        </button>
                      )}
                      {/* Quitar de la web: solo si está publicado */}
                      {t.estado === "aprobado" && (
                        <button
                          onClick={() => moderarTestimonio(t.id, "pendiente")}
                          className="inline-flex items-center gap-2 px-4 py-2 bg-amber-100 text-amber-800 rounded-lg hover:bg-amber-200 text-sm font-medium"
                        >
                          <EyeOff className="w-4 h-4" /> Quitar de la web
                        </button>
                      )}
                      {/* Rechazar: visible si no está ya rechazado */}
                      {t.estado !== "rechazado" && (
                        <button
                          onClick={() => moderarTestimonio(t.id, "rechazado")}
                          className="inline-flex items-center gap-2 px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-300 text-sm font-medium"
                        >
                          <XCircle className="w-4 h-4" /> Rechazar
                        </button>
                      )}
                      <button
                        onClick={() => eliminarTestimonio(t.id)}
                        className="inline-flex items-center gap-2 px-3 py-2 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg text-sm font-medium ml-auto"
                        title="Eliminar definitivamente"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </>
      )}
    </div>
  );
}
