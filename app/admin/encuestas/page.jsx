"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

import { ArrowLeft, Download, Users, BarChart2, MapPin, Trash2, Plus, ExternalLink } from "lucide-react";

const CANDIDATOS = {
  ivan_cepeda: { nombre: "Iván Cepeda", partido: "Polo Democrático Alternativo", color: "bg-red-600" },
  paloma_valencia: { nombre: "Paloma Valencia", partido: "Centro Democrático", color: "bg-blue-600" },
  abelardo_de_la_espriella: { nombre: "Abelardo de la Espriella", partido: "Colombia se Mueve", color: "bg-orange-500" },
};

export default function AdminEncuestasPage() {
  const [votos, setVotos] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState("");
  const [busqueda, setBusqueda] = useState("");
  const [filtroCandidato, setFiltroCandidato] = useState("");
  const [filtroDep, setFiltroDep] = useState("");
  const [borrando, setBorrando] = useState(false);

  function cargarVotos() {
    setCargando(true);
    fetch("/api/encuesta-presidencial?vista=admin")
      .then((r) => r.json())
      .then((d) => {
        if (d.error) setError(d.error);
        else setVotos(d.votos || []);
      })
      .catch(() => setError("Error al cargar los votos"))
      .finally(() => setCargando(false));
  }

  useEffect(() => { cargarVotos(); }, []);

  async function handleBorrarTodo() {
    if (!confirm("¿Seguro que quieres borrar TODOS los votos? Esta acción no se puede deshacer.")) return;
    setBorrando(true);
    try {
      const res = await fetch("/api/encuesta-presidencial", { method: "DELETE" });
      const d = await res.json();
      if (!res.ok) throw new Error(d.error);
      setVotos([]);
    } catch (e) {
      alert("Error al borrar: " + e.message);
    } finally {
      setBorrando(false);
    }
  }

  const departamentos = [...new Set(votos.map((v) => v.departamento))].sort();

  const votosFiltrados = votos.filter((v) => {
    const texto = busqueda.toLowerCase();
    const coincideTexto =
      !busqueda ||
      v.user_name?.toLowerCase().includes(texto) ||
      v.municipio?.toLowerCase().includes(texto) ||
      v.departamento?.toLowerCase().includes(texto);
    const coincideCandidato = !filtroCandidato || v.candidato_id === filtroCandidato;
    const coincideDep = !filtroDep || v.departamento === filtroDep;
    return coincideTexto && coincideCandidato && coincideDep;
  });

  // Totales por candidato
  const totales = votos.reduce((acc, v) => {
    acc[v.candidato_id] = (acc[v.candidato_id] || 0) + 1;
    return acc;
  }, {});

  function exportarCSV() {
    const headers = ["Nombre", "Email", "Municipio", "Departamento", "Candidato", "Fecha"];
    const filas = votosFiltrados.map((v) => [
      v.user_name || "",
      v.user_email || "",
      v.municipio,
      v.departamento,
      CANDIDATOS[v.candidato_id]?.nombre || v.candidato_id,
      new Date(v.created_at).toLocaleString("es-CO"),
    ]);
    const csv = [headers, ...filas].map((r) => r.map((c) => `"${c}"`).join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "votos-encuesta-presidencial.csv";
    a.click();
    URL.revokeObjectURL(url);
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8 px-4">
      <div className="max-w-7xl mx-auto">

        {/* Header */}
        <div className="flex items-center justify-between gap-4 mb-8 mt-10 flex-wrap">
          <div className="flex items-center gap-4">
            <Link href="/admin" className="p-2 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors">
              <ArrowLeft size={20} className="text-gray-600 dark:text-gray-400" />
            </Link>
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white flex items-center gap-3">
                <BarChart2 size={32} />
                Encuesta Presidencial 2026
              </h1>
              <p className="text-gray-500 dark:text-gray-400 mt-1">Panel de administración de votos</p>
            </div>
          </div>
          <div className="flex gap-3">
            <Link href="/encuesta-presidencial" target="_blank"
              className="flex items-center gap-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 text-sm font-medium px-4 py-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors">
              <ExternalLink size={16} /> Ver encuesta
            </Link>
            <Link href="/admin/encuestas/nueva"
              className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium px-4 py-2 rounded-lg transition-colors">
              <Plus size={16} /> Nueva encuesta
            </Link>
          </div>
        </div>

        {cargando ? (
          <div className="flex justify-center py-20">
            <div className="w-10 h-10 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
          </div>
        ) : error ? (
          <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-400 rounded-xl p-6 text-center">
            {error}
          </div>
        ) : (
          <>
            {/* Tarjetas de resumen */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
              <div className="bg-white dark:bg-gray-800 rounded-xl p-5 shadow-sm border border-gray-100 dark:border-gray-700">
                <div className="flex items-center gap-3 mb-1">
                  <Users size={18} className="text-blue-500" />
                  <span className="text-sm text-gray-500 dark:text-gray-400">Total votos</span>
                </div>
                <p className="text-3xl font-bold text-gray-900 dark:text-white">{votos.length}</p>
              </div>
              {Object.entries(CANDIDATOS).map(([id, c]) => (
                <div key={id} className="bg-white dark:bg-gray-800 rounded-xl p-5 shadow-sm border border-gray-100 dark:border-gray-700">
                  <div className="flex items-center gap-2 mb-1">
                    <div className={`w-3 h-3 rounded-full ${c.color}`} />
                    <span className="text-sm text-gray-500 dark:text-gray-400 truncate">{c.nombre.split(" ")[0]}</span>
                  </div>
                  <p className="text-3xl font-bold text-gray-900 dark:text-white">{totales[id] || 0}</p>
                  <p className="text-xs text-gray-400 mt-1">
                    {votos.length ? (((totales[id] || 0) / votos.length) * 100).toFixed(1) : 0}%
                  </p>
                </div>
              ))}
            </div>

            {/* Filtros */}
            <div className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow-sm border border-gray-100 dark:border-gray-700 mb-4 flex flex-wrap gap-3 items-center justify-between">
              <div className="flex flex-wrap gap-3 flex-1">
                <input
                  type="text"
                  placeholder="Buscar por nombre, municipio..."
                  value={busqueda}
                  onChange={(e) => setBusqueda(e.target.value)}
                  className="border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-white outline-none focus:ring-2 focus:ring-blue-500 min-w-[200px]"
                />
                <select
                  value={filtroCandidato}
                  onChange={(e) => setFiltroCandidato(e.target.value)}
                  className="border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-white outline-none"
                >
                  <option value="">Todos los candidatos</option>
                  {Object.entries(CANDIDATOS).map(([id, c]) => (
                    <option key={id} value={id}>{c.nombre}</option>
                  ))}
                </select>
                <select
                  value={filtroDep}
                  onChange={(e) => setFiltroDep(e.target.value)}
                  className="border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-white outline-none"
                >
                  <option value="">Todos los departamentos</option>
                  {departamentos.map((d) => (
                    <option key={d} value={d}>{d}</option>
                  ))}
                </select>
              </div>
              <button
                onClick={exportarCSV}
                className="flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white text-sm font-medium px-4 py-2 rounded-lg transition-colors"
              >
                <Download size={16} />
                Exportar CSV
              </button>
              <button
                onClick={handleBorrarTodo}
                disabled={borrando || votos.length === 0}
                className="flex items-center gap-2 bg-red-600 hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed text-white text-sm font-medium px-4 py-2 rounded-lg transition-colors"
              >
                <Trash2 size={16} />
                {borrando ? "Borrando..." : "Borrar todos los votos"}
              </button>
            </div>

            {/* Tabla */}
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="bg-gray-50 dark:bg-gray-700 text-gray-600 dark:text-gray-300 text-xs uppercase">
                    <tr>
                      <th className="px-4 py-3 text-left">Usuario</th>
                      <th className="px-4 py-3 text-left">
                        <span className="flex items-center gap-1"><MapPin size={12} /> Municipio</span>
                      </th>
                      <th className="px-4 py-3 text-left">Departamento</th>
                      <th className="px-4 py-3 text-left">Candidato</th>
                      <th className="px-4 py-3 text-left">Fecha</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
                    {votosFiltrados.length === 0 ? (
                      <tr>
                        <td colSpan={5} className="text-center py-10 text-gray-400">No hay votos que coincidan con los filtros</td>
                      </tr>
                    ) : (
                      votosFiltrados.map((v) => {
                        const candidato = CANDIDATOS[v.candidato_id];
                        return (
                          <tr key={v.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
                            <td className="px-4 py-3">
                              <div className="flex items-center gap-2">
                                {v.user_picture && (
                                  <img src={v.user_picture} alt={v.user_name} className="w-7 h-7 rounded-full flex-shrink-0" />
                                )}
                                <div>
                                  <p className="font-medium text-gray-900 dark:text-white">{v.user_name}</p>
                                  {v.user_email && <p className="text-xs text-gray-400">{v.user_email}</p>}
                                </div>
                              </div>
                            </td>
                            <td className="px-4 py-3 text-gray-700 dark:text-gray-300">{v.municipio}</td>
                            <td className="px-4 py-3 text-gray-700 dark:text-gray-300">{v.departamento}</td>
                            <td className="px-4 py-3">
                              {candidato ? (
                                <span className={`inline-flex items-center gap-1.5 text-xs font-medium text-white px-2.5 py-1 rounded-full ${candidato.color}`}>
                                  {candidato.nombre.split(" ")[0]}
                                </span>
                              ) : (
                                <span className="text-gray-400">{v.candidato_id}</span>
                              )}
                            </td>
                            <td className="px-4 py-3 text-gray-500 dark:text-gray-400 text-xs whitespace-nowrap">
                              {new Date(v.created_at).toLocaleString("es-CO", { dateStyle: "short", timeStyle: "short" })}
                            </td>
                          </tr>
                        );
                      })
                    )}
                  </tbody>
                </table>
              </div>
              <div className="px-4 py-3 border-t border-gray-100 dark:border-gray-700 text-xs text-gray-400">
                Mostrando {votosFiltrados.length} de {votos.length} votos
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
