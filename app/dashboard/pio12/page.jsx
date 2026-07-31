"use client";

import { useEffect, useState } from "react";
import { useUser } from "@clerk/nextjs";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Download, Users, CheckCircle, Clock, RefreshCw } from "lucide-react";

export default function Pio12DashboardPage() {
  const { user, isLoaded } = useUser();
  const router = useRouter();
  const [stats, setStats] = useState(null);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!isLoaded) return;
    cargarStats();
  }, [isLoaded]);

  async function cargarStats() {
    setCargando(true);
    setError("");
    try {
      const res = await fetch("/api/pio12/admin");
      if (res.status === 403) {
        router.replace("/dashboard");
        return;
      }
      if (!res.ok) throw new Error("Error al cargar datos");
      const data = await res.json();
      setStats(data);
    } catch (e) {
      setError(e.message);
    } finally {
      setCargando(false);
    }
  }

  function descargarCSV() {
    window.open("/api/pio12/admin?formato=csv", "_blank");
  }

  const BLOQUES_LABEL = {
    enfermeria: "Enfermería",
    medico: "Médicos",
    administracion: "Administración",
    financiero: "Financiero / Cartera",
    fisioterapia: "Fisioterapia",
    odontologia: "Odontología",
    psicologia: "Psicología",
    fonoaudiologia: "Fonoaudiología",
    farmacia: "Farmacia",
    nutricion: "Nutrición",
    trabajosocial: "Trabajo Social",
    promotor: "Promotor / Gestor",
    sistemas: "Sistemas / TI",
    general: "General",
  };

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-8">
      {/* Header */}
      <div className="max-w-5xl mx-auto">
        <div className="flex items-center gap-3 mb-6">
          <Link
            href="/dashboard"
            className="flex items-center gap-1 text-gray-500 hover:text-gray-800 text-sm transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Dashboard
          </Link>
          <span className="text-gray-300">/</span>
          <span className="text-gray-700 font-medium text-sm">Hospital Pío XII — Encuesta</span>
        </div>

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Respuestas del personal</h1>
            <p className="text-gray-500 text-sm mt-0.5">E.S.E. Hospital Pío XII — Levantamiento de requerimientos</p>
          </div>
          <div className="flex gap-2">
            <button
              onClick={cargarStats}
              className="flex items-center gap-2 px-4 py-2 border border-gray-200 rounded-lg text-sm text-gray-600 hover:bg-gray-100 transition-colors"
            >
              <RefreshCw className="w-4 h-4" />
              Actualizar
            </button>
            <button
              onClick={descargarCSV}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-medium transition-colors"
            >
              <Download className="w-4 h-4" />
              Descargar Excel
            </button>
          </div>
        </div>

        {/* Estado de carga */}
        {cargando && (
          <div className="flex items-center justify-center py-24">
            <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
          </div>
        )}

        {error && (
          <div className="bg-red-50 border border-red-200 rounded-xl p-4 text-red-700 text-sm">
            {error}
          </div>
        )}

        {stats && !cargando && (
          <>
            {/* Tarjetas de resumen */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
              <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center">
                    <Users className="w-5 h-5 text-blue-600" />
                  </div>
                  <span className="text-sm font-medium text-gray-500">Total empleados</span>
                </div>
                <p className="text-3xl font-bold text-gray-900">{stats.total_empleados}</p>
              </div>

              <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-10 h-10 bg-green-100 rounded-xl flex items-center justify-center">
                    <CheckCircle className="w-5 h-5 text-green-600" />
                  </div>
                  <span className="text-sm font-medium text-gray-500">Han respondido</span>
                </div>
                <p className="text-3xl font-bold text-gray-900">{stats.han_respondido}</p>
                <div className="mt-3">
                  <div className="w-full bg-gray-100 rounded-full h-2">
                    <div
                      className="bg-green-500 h-2 rounded-full transition-all duration-700"
                      style={{ width: `${stats.porcentaje}%` }}
                    />
                  </div>
                  <p className="text-xs text-gray-400 mt-1">{stats.porcentaje}% de participación</p>
                </div>
              </div>

              <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-10 h-10 bg-amber-100 rounded-xl flex items-center justify-center">
                    <Clock className="w-5 h-5 text-amber-600" />
                  </div>
                  <span className="text-sm font-medium text-gray-500">Pendientes</span>
                </div>
                <p className="text-3xl font-bold text-gray-900">{stats.pendientes}</p>
              </div>
            </div>

            {/* Tabla de respondidos */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
              <div className="px-6 py-4 border-b border-gray-100">
                <h2 className="font-semibold text-gray-800">
                  Empleados que han respondido ({stats.han_respondido})
                </h2>
              </div>

              {stats.han_respondido === 0 ? (
                <div className="py-16 text-center text-gray-400">
                  <CheckCircle className="w-10 h-10 mx-auto mb-3 opacity-30" />
                  <p className="text-sm">Aún no hay respuestas registradas.</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="bg-gray-50 text-left">
                        <th className="px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Nombre</th>
                        <th className="px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Cargo</th>
                        <th className="px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Área</th>
                        <th className="px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Fecha</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-50">
                      {stats.detalle.map((emp, i) => (
                        <tr key={i} className="hover:bg-gray-50 transition-colors">
                          <td className="px-6 py-4 font-medium text-gray-900 whitespace-nowrap">
                            {emp.nombre}
                          </td>
                          <td className="px-6 py-4 text-gray-500 max-w-[200px] truncate">
                            {emp.cargo || "—"}
                          </td>
                          <td className="px-6 py-4">
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-50 text-blue-700">
                              {BLOQUES_LABEL[emp.bloque] || emp.bloque || "General"}
                            </span>
                          </td>
                          <td className="px-6 py-4 text-gray-400 whitespace-nowrap">
                            {emp.ultima_respuesta
                              ? new Date(emp.ultima_respuesta + "Z").toLocaleString("es-CO", {
                                  dateStyle: "short",
                                  timeStyle: "short",
                                })
                              : "—"}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
