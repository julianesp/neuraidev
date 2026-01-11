"use client";

import { useEffect, useState } from "react";
import { useUser } from "@clerk/nextjs";
import Link from "next/link";
import {
  Plus,
  Search,
  Mail,
  Calendar,
  DollarSign,
  User,
  CheckCircle,
  XCircle,
  Clock,
  AlertTriangle,
  Eye,
  Trash2,
} from "lucide-react";
import Swal from "sweetalert2";

export default function CreditosPage() {
  const { user } = useUser();
  const [creditos, setCreditos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [busqueda, setBusqueda] = useState("");
  const [filtroEstado, setFiltroEstado] = useState("todos");
  const [enviandoRecordatorio, setEnviandoRecordatorio] = useState(null);

  useEffect(() => {
    if (user) {
      cargarCreditos();
    }
  }, [user, filtroEstado]);

  async function cargarCreditos() {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (filtroEstado !== "todos") {
        params.append("estado", filtroEstado);
      }

      const response = await fetch(`/api/creditos?${params}`);
      const data = await response.json();

      if (response.ok) {
        setCreditos(data.creditos || []);
      } else {
        throw new Error(data.error);
      }
    } catch (error) {
      console.error("Error cargando créditos:", error);
      Swal.fire({
        icon: "error",
        title: "Error",
        text: "No se pudieron cargar los créditos",
      });
    } finally {
      setLoading(false);
    }
  }

  async function enviarRecordatorio(credito) {
    try {
      setEnviandoRecordatorio(credito.id);

      const response = await fetch("/api/creditos/recordatorios", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ credito_id: credito.id }),
      });

      const data = await response.json();

      if (response.ok) {
        Swal.fire({
          icon: "success",
          title: "¡Recordatorio enviado!",
          text: `Se envió un email a ${credito.email_cliente}`,
          timer: 3000,
        });
        cargarCreditos();
      } else {
        throw new Error(data.error);
      }
    } catch (error) {
      console.error("Error enviando recordatorio:", error);
      Swal.fire({
        icon: "error",
        title: "Error",
        text: error.message || "No se pudo enviar el recordatorio",
      });
    } finally {
      setEnviandoRecordatorio(null);
    }
  }

  async function eliminarCredito(id) {
    const result = await Swal.fire({
      title: "¿Estás seguro?",
      text: "Esta acción no se puede deshacer",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#ef4444",
      cancelButtonColor: "#6b7280",
      confirmButtonText: "Sí, eliminar",
      cancelButtonText: "Cancelar",
    });

    if (!result.isConfirmed) return;

    try {
      const response = await fetch(`/api/creditos?id=${id}`, {
        method: "DELETE",
      });

      if (response.ok) {
        Swal.fire({
          icon: "success",
          title: "Crédito eliminado",
          timer: 2000,
        });
        cargarCreditos();
      } else {
        const data = await response.json();
        throw new Error(data.error);
      }
    } catch (error) {
      console.error("Error eliminando crédito:", error);
      Swal.fire({
        icon: "error",
        title: "Error",
        text: "No se pudo eliminar el crédito",
      });
    }
  }

  function getEstadoBadge(credito) {
    const fechaLimite = new Date(credito.fecha_limite_pago);
    const ahora = new Date();
    const diasRestantes = Math.ceil((fechaLimite - ahora) / (1000 * 60 * 60 * 24));

    if (credito.estado === "pagado_total") {
      return (
        <span className="inline-flex items-center gap-1 px-2 py-1 text-xs font-medium bg-green-100 text-green-800 rounded-full">
          <CheckCircle className="w-3 h-3" /> Pagado
        </span>
      );
    }

    if (credito.estado === "cancelado") {
      return (
        <span className="inline-flex items-center gap-1 px-2 py-1 text-xs font-medium bg-gray-100 text-gray-800 rounded-full">
          <XCircle className="w-3 h-3" /> Cancelado
        </span>
      );
    }

    if (diasRestantes < 0 || credito.estado === "vencido") {
      return (
        <span className="inline-flex items-center gap-1 px-2 py-1 text-xs font-medium bg-red-100 text-red-800 rounded-full">
          <AlertTriangle className="w-3 h-3" /> Vencido
        </span>
      );
    }

    if (diasRestantes <= 3) {
      return (
        <span className="inline-flex items-center gap-1 px-2 py-1 text-xs font-medium bg-orange-100 text-orange-800 rounded-full">
          <Clock className="w-3 h-3" /> Urgente
        </span>
      );
    }

    if (credito.estado === "pagado_parcial") {
      return (
        <span className="inline-flex items-center gap-1 px-2 py-1 text-xs font-medium bg-blue-100 text-blue-800 rounded-full">
          <Clock className="w-3 h-3" /> Pago Parcial
        </span>
      );
    }

    return (
      <span className="inline-flex items-center gap-1 px-2 py-1 text-xs font-medium bg-yellow-100 text-yellow-800 rounded-full">
        <Clock className="w-3 h-3" /> Pendiente
      </span>
    );
  }

  const creditosFiltrados = creditos.filter((credito) => {
    const searchLower = busqueda.toLowerCase();
    return (
      credito.nombre_cliente.toLowerCase().includes(searchLower) ||
      credito.email_cliente.toLowerCase().includes(searchLower) ||
      credito.producto_nombre.toLowerCase().includes(searchLower)
    );
  });

  // Calcular estadísticas
  const stats = {
    total: creditos.length,
    pendientes: creditos.filter(c => c.estado === 'pendiente' || c.estado === 'pagado_parcial').length,
    vencidos: creditos.filter(c => {
      const fechaLimite = new Date(c.fecha_limite_pago);
      return fechaLimite < new Date() && (c.estado === 'pendiente' || c.estado === 'pagado_parcial');
    }).length,
    montoPendiente: creditos.reduce((sum, c) => sum + parseFloat(c.monto_pendiente || 0), 0),
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto mt-8 px-4">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            Gestión de Créditos
          </h1>
          <p className="mt-2 text-gray-600 dark:text-gray-400">
            Administra los créditos y fiados de tus clientes
          </p>
        </div>
        <Link
          href="/dashboard/creditos/nuevo"
          className="mt-4 md:mt-0 inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          <Plus className="w-5 h-5" />
          Nuevo Crédito
        </Link>
      </div>

      {/* Estadísticas */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-4">
          <p className="text-sm text-gray-600 dark:text-gray-400">Total Créditos</p>
          <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.total}</p>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-4">
          <p className="text-sm text-gray-600 dark:text-gray-400">Pendientes</p>
          <p className="text-2xl font-bold text-yellow-600">{stats.pendientes}</p>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-4">
          <p className="text-sm text-gray-600 dark:text-gray-400">Vencidos</p>
          <p className="text-2xl font-bold text-red-600">{stats.vencidos}</p>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-4">
          <p className="text-sm text-gray-600 dark:text-gray-400">Por Cobrar</p>
          <p className="text-2xl font-bold text-blue-600">
            ${stats.montoPendiente.toLocaleString('es-CO')}
          </p>
        </div>
      </div>

      {/* Filtros y búsqueda */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-4 mb-6">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Buscar por cliente, email o producto..."
              value={busqueda}
              onChange={(e) => setBusqueda(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
            />
          </div>
          <select
            value={filtroEstado}
            onChange={(e) => setFiltroEstado(e.target.value)}
            className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
          >
            <option value="todos">Todos los estados</option>
            <option value="pendiente">Pendientes</option>
            <option value="pagado_parcial">Pago Parcial</option>
            <option value="vencido">Vencidos</option>
            <option value="pagado_total">Pagados</option>
            <option value="cancelado">Cancelados</option>
          </select>
        </div>
      </div>

      {/* Lista de créditos */}
      {creditosFiltrados.length === 0 ? (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-12 text-center">
          <p className="text-gray-500 dark:text-gray-400">
            {busqueda || filtroEstado !== "todos"
              ? "No se encontraron créditos con los filtros aplicados"
              : "No hay créditos registrados"}
          </p>
        </div>
      ) : (
        <div className="grid gap-4">
          {creditosFiltrados.map((credito) => {
            const fechaLimite = new Date(credito.fecha_limite_pago);
            const diasRestantes = Math.ceil((fechaLimite - new Date()) / (1000 * 60 * 60 * 24));

            return (
              <div
                key={credito.id}
                className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6 hover:shadow-md transition-shadow"
              >
                <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-start gap-3 mb-3">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                            {credito.nombre_cliente}
                          </h3>
                          {getEstadoBadge(credito)}
                        </div>
                        <div className="flex flex-wrap gap-4 text-sm text-gray-600 dark:text-gray-400">
                          <span className="flex items-center gap-1">
                            <Mail className="w-4 h-4" />
                            {credito.email_cliente}
                          </span>
                          <span className="flex items-center gap-1">
                            <Calendar className="w-4 h-4" />
                            Vence: {fechaLimite.toLocaleDateString('es-CO')}
                            {diasRestantes >= 0 && (
                              <span className={diasRestantes <= 3 ? "text-orange-600 font-medium" : ""}>
                                ({diasRestantes} {diasRestantes === 1 ? 'día' : 'días'})
                              </span>
                            )}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-3">
                      <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                        <strong>Producto:</strong> {credito.producto_nombre}
                      </p>
                      <div className="grid grid-cols-3 gap-4 text-sm">
                        <div>
                          <p className="text-gray-600 dark:text-gray-400">Total</p>
                          <p className="font-semibold text-gray-900 dark:text-white">
                            ${Number(credito.monto_total).toLocaleString('es-CO')}
                          </p>
                        </div>
                        <div>
                          <p className="text-gray-600 dark:text-gray-400">Pagado</p>
                          <p className="font-semibold text-green-600">
                            ${Number(credito.monto_pagado).toLocaleString('es-CO')}
                          </p>
                        </div>
                        <div>
                          <p className="text-gray-600 dark:text-gray-400">Pendiente</p>
                          <p className="font-semibold text-red-600">
                            ${Number(credito.monto_pendiente).toLocaleString('es-CO')}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="flex lg:flex-col gap-2">
                    <Link
                      href={`/dashboard/creditos/${credito.id}`}
                      className="flex-1 lg:flex-none inline-flex items-center justify-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm"
                    >
                      <Eye className="w-4 h-4" />
                      Ver
                    </Link>
                    <button
                      onClick={() => enviarRecordatorio(credito)}
                      disabled={enviandoRecordatorio === credito.id || credito.estado === 'pagado_total'}
                      className="flex-1 lg:flex-none inline-flex items-center justify-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed text-sm"
                    >
                      {enviandoRecordatorio === credito.id ? (
                        <>Enviando...</>
                      ) : (
                        <>
                          <Mail className="w-4 h-4" />
                          Recordar
                        </>
                      )}
                    </button>
                    <button
                      onClick={() => eliminarCredito(credito.id)}
                      className="flex-1 lg:flex-none inline-flex items-center justify-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors text-sm"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {credito.numero_recordatorios > 0 && (
                  <div className="mt-3 pt-3 border-t border-gray-200 dark:border-gray-700">
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      Recordatorios enviados: {credito.numero_recordatorios} |
                      Último: {credito.fecha_ultimo_recordatorio
                        ? new Date(credito.fecha_ultimo_recordatorio).toLocaleDateString('es-CO')
                        : 'Nunca'}
                    </p>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
