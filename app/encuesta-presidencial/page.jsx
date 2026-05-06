"use client";

import { useEffect, useState, useCallback } from "react";
import { useUser, SignInButton, SignOutButton } from "@clerk/nextjs";

const CANDIDATOS = [
  {
    id: "ivan_cepeda",
    nombre: "Iván Cepeda",
    partido: "Polo Democrático Alternativo",
    color: "bg-red-700",
    colorBarra: "bg-red-600",
  },
  {
    id: "paloma_valencia",
    nombre: "Paloma Valencia",
    partido: "Centro Democrático",
    color: "bg-blue-700",
    colorBarra: "bg-blue-600",
  },
  {
    id: "abelardo_de_la_espriella",
    nombre: "Abelardo de la Espriella",
    partido: "Movimiento Colombia se Mueve",
    color: "bg-orange-600",
    colorBarra: "bg-orange-500",
  },
];

const DEPARTAMENTOS_SUROCCIDENTE = {
  "Valle del Cauca": [
    "Cali", "Buenaventura", "Palmira", "Tuluá", "Cartago", "Buga", "Yumbo",
    "Jamundí", "Candelaria", "Pradera", "Florida", "Dagua", "La Unión",
    "Roldanillo", "Zarzal", "Sevilla", "Caicedonia", "El Cerrito",
  ],
  "Cauca": [
    "Popayán", "Santander de Quilichao", "Puerto Tejada", "Patía", "Bolívar",
    "Timbío", "El Tambo", "Miranda", "Guapi", "López de Micay", "Corinto",
    "Caloto", "Toribío", "Piendamó", "Silvia",
  ],
  "Nariño": [
    "Pasto", "Tumaco", "Ipiales", "Túquerres", "La Unión", "Samaniego",
    "Barbacoas", "Cumbal", "Sandoná", "La Florida", "Ancuyá", "El Charco",
    "Ricaurte", "Mosquera", "Olaya Herrera",
  ],
  "Putumayo": [
    "Mocoa", "Puerto Asís", "Orito", "Valle del Guamuéz", "San Miguel",
    "Villagarzón", "Puerto Caicedo", "Puerto Guzmán", "Leguízamo",
    "Sibundoy", "San Francisco", "Colón",
  ],
  "Huila": [
    "Neiva", "Pitalito", "Garzón", "La Plata", "Campoalegre", "Palermo",
    "Gigante", "Isnos", "Timaná", "Hobo", "Rivera", "Algeciras",
  ],
};

function calcularPorcentajes(votos) {
  const total = Object.values(votos).reduce((s, v) => s + v, 0);
  if (total === 0) return {};
  return Object.fromEntries(
    Object.entries(votos).map(([k, v]) => [k, ((v / total) * 100).toFixed(1)])
  );
}

function ganador(votos) {
  let maxVotos = 0;
  let ganadorId = null;
  for (const [id, v] of Object.entries(votos)) {
    if (v > maxVotos) { maxVotos = v; ganadorId = id; }
  }
  return CANDIDATOS.find((c) => c.id === ganadorId);
}

export default function EncuestaPresidencialPage() {
  const FECHA_CIERRE = new Date("2026-05-30T23:59:59");
  const encuestaCerrada = new Date() > FECHA_CIERRE;

  const { user, isLoaded } = useUser();

  const [departamento, setDepartamento] = useState("");
  const [municipio, setMunicipio] = useState("");
  const [candidatoId, setCandidatoId] = useState("");
  const [cargando, setCargando] = useState(false);
  const [error, setError] = useState("");
  const [exito, setExito] = useState(false);
  const [resultadosMunicipios, setResultadosMunicipios] = useState([]);
  const [resultadosDepartamentos, setResultadosDepartamentos] = useState([]);
  const [vistaResultados, setVistaResultados] = useState("municipios");
  const [cargandoResultados, setCargandoResultados] = useState(false);

  const cargarResultados = useCallback(async () => {
    setCargandoResultados(true);
    try {
      const [resMun, resDep] = await Promise.all([
        fetch("/api/encuesta-presidencial?vista=municipios"),
        fetch("/api/encuesta-presidencial?vista=departamentos"),
      ]);
      const dataMun = await resMun.json();
      const dataDep = await resDep.json();
      setResultadosMunicipios(dataMun.resultados || []);
      setResultadosDepartamentos(dataDep.resultados || []);
    } catch {
      // silencioso
    } finally {
      setCargandoResultados(false);
    }
  }, []);

  useEffect(() => {
    cargarResultados();
  }, [cargarResultados]);

  async function handleVotar(e) {
    e.preventDefault();
    if (!user || !departamento || !municipio || !candidatoId) return;
    setCargando(true);
    setError("");
    try {
      const res = await fetch("/api/encuesta-presidencial", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          user_id: user.id,
          user_name: user.fullName || user.firstName || user.username || "Usuario",
          user_email: user.primaryEmailAddress?.emailAddress || null,
          user_picture: user.imageUrl || null,
          municipio,
          departamento,
          candidato_id: candidatoId,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Error al registrar el voto");
      setExito(true);
      cargarResultados();
    } catch (err) {
      setError(err.message);
    } finally {
      setCargando(false);
    }
  }

  const municipiosDisponibles = departamento ? DEPARTAMENTOS_SUROCCIDENTE[departamento] || [] : [];

  return (
    <div className="min-h-screen bg-gradient-to-br from-yellow-50 via-white to-red-50 dark:from-gray-900 dark:via-gray-900 dark:to-gray-800 py-10 px-4">
      <div className="max-w-3xl mx-auto">

        {/* Encabezado */}
        <div className="text-center mb-10">
          <div className="inline-flex items-center gap-2 bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-200 px-4 py-1.5 rounded-full text-sm font-medium mb-4">
            Encuesta electoral 2026
          </div>
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-3">
            Encuesta Presidencial
          </h1>
          <p className="text-gray-600 dark:text-gray-400 text-lg">
            Sur Occidente Colombiano
          </p>
          <p className="text-gray-500 dark:text-gray-500 text-sm mt-2">
            Participa iniciando sesion con tu cuenta de Google. Solo se permite un voto por persona.
          </p>
          <p className="text-gray-400 dark:text-gray-600 text-xs mt-1">
            Encuesta activa hasta el 30 de mayo de 2026
          </p>
        </div>

        {/* Bloque de votacion */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-md border border-gray-100 dark:border-gray-700 p-6 mb-8">

          {encuestaCerrada ? (
            <div className="text-center py-10">
              <div className="w-16 h-16 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center mx-auto mb-4 text-3xl">
                🗳️
              </div>
              <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-2">Encuesta cerrada</h2>
              <p className="text-gray-500 dark:text-gray-400">
                La encuesta finalizó el 30 de mayo de 2026. Consulta los resultados a continuacion.
              </p>
            </div>
          ) : !isLoaded ? (
            <div className="text-center py-10">
              <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto" />
            </div>
          ) : (
          <>

          {/* Login con Google via Clerk */}
          {!user ? (
            <div className="text-center py-6">
              <p className="text-gray-600 dark:text-gray-400 mb-5">
                Para votar debes iniciar sesion con tu cuenta de Google.
              </p>
              <SignInButton mode="redirect" forceRedirectUrl="/encuesta-presidencial">
                <button className="inline-flex items-center gap-3 bg-white hover:bg-gray-50 border border-gray-300 text-gray-700 font-semibold px-7 py-3 rounded-xl transition-colors duration-200 text-base shadow-sm">
                  <svg className="w-5 h-5" viewBox="0 0 24 24">
                    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                  </svg>
                  Iniciar sesion con Google
                </button>
              </SignInButton>
            </div>
          ) : exito ? (
            <div className="text-center py-8">
              <div className="w-16 h-16 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-green-600 dark:text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-2">Voto registrado</h2>
              <p className="text-gray-600 dark:text-gray-400">
                Gracias <strong>{user.fullName || user.firstName}</strong>, tu voto ha sido registrado exitosamente.
              </p>
            </div>
          ) : (
            <>
              {/* Perfil Google/Clerk */}
              <div className="flex items-center justify-between mb-6 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-xl">
                <div className="flex items-center gap-3">
                  {user.imageUrl && (
                    <img src={user.imageUrl} alt={user.fullName} className="w-10 h-10 rounded-full" />
                  )}
                  <div>
                    <p className="font-semibold text-gray-900 dark:text-white text-sm">{user.fullName || user.firstName}</p>
                    {user.primaryEmailAddress?.emailAddress && (
                      <p className="text-xs text-gray-500 dark:text-gray-400">{user.primaryEmailAddress.emailAddress}</p>
                    )}
                  </div>
                </div>
                <SignOutButton redirectUrl="/encuesta-presidencial">
                  <button className="text-xs text-gray-400 hover:text-red-500 transition-colors">
                    Cerrar sesion
                  </button>
                </SignOutButton>
              </div>

              {/* Formulario de voto */}
              <form onSubmit={handleVotar} className="space-y-5">
                {/* Departamento */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                    Departamento
                  </label>
                  <select
                    value={departamento}
                    onChange={(e) => { setDepartamento(e.target.value); setMunicipio(""); }}
                    required
                    className="w-full border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2.5 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none appearance-auto cursor-pointer"
                  >
                    <option value="">Selecciona tu departamento</option>
                    {Object.keys(DEPARTAMENTOS_SUROCCIDENTE).map((dep) => (
                      <option key={dep} value={dep}>{dep}</option>
                    ))}
                  </select>
                </div>

                {/* Municipio */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                    Municipio
                  </label>
                  <select
                    value={municipio}
                    onChange={(e) => setMunicipio(e.target.value)}
                    required
                    disabled={!departamento}
                    className="w-full border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2.5 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none disabled:opacity-50 appearance-auto cursor-pointer"
                  >
                    <option value="">Selecciona tu municipio</option>
                    {municipiosDisponibles.map((mun) => (
                      <option key={mun} value={mun}>{mun}</option>
                    ))}
                  </select>
                </div>

                {/* Candidatos */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                    Candidato de tu preferencia
                  </label>
                  <div className="space-y-2.5">
                    {CANDIDATOS.map((c) => (
                      <label
                        key={c.id}
                        className={`flex items-center gap-3 p-3.5 rounded-xl border-2 cursor-pointer transition-all ${
                          candidatoId === c.id
                            ? "border-blue-500 bg-blue-50 dark:bg-blue-900/20"
                            : "border-gray-200 dark:border-gray-600 hover:border-gray-300 dark:hover:border-gray-500"
                        }`}
                      >
                        <input
                          type="radio"
                          name="candidato"
                          value={c.id}
                          checked={candidatoId === c.id}
                          onChange={() => setCandidatoId(c.id)}
                          className="sr-only"
                        />
                        <div className={`w-3 h-3 rounded-full flex-shrink-0 ${c.color}`} />
                        <div className="flex-1 min-w-0">
                          <p className="font-semibold text-gray-900 dark:text-white text-sm">{c.nombre}</p>
                          <p className="text-xs text-gray-500 dark:text-gray-400 truncate">{c.partido}</p>
                        </div>
                        {candidatoId === c.id && (
                          <svg className="w-5 h-5 text-blue-500 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                          </svg>
                        )}
                      </label>
                    ))}
                  </div>
                </div>

                {error && (
                  <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-400 rounded-lg px-4 py-3 text-sm">
                    {error}
                  </div>
                )}

                <button
                  type="submit"
                  disabled={cargando || !candidatoId || !municipio}
                  className="w-full bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold py-3 rounded-xl transition-colors duration-200"
                >
                  {cargando ? "Registrando voto..." : "Registrar mi voto"}
                </button>
              </form>
            </>
          )}
          </>
          )}
        </div>

        {/* Resultados */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-md border border-gray-100 dark:border-gray-700 p-6">
          <div className="flex items-center justify-between mb-6 flex-wrap gap-3">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white">Resultados en tiempo real</h2>
            <div className="flex gap-2">
              <button
                onClick={() => setVistaResultados("municipios")}
                className={`px-4 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                  vistaResultados === "municipios"
                    ? "bg-blue-600 text-white"
                    : "bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600"
                }`}
              >
                Por municipio
              </button>
              <button
                onClick={() => setVistaResultados("departamentos")}
                className={`px-4 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                  vistaResultados === "departamentos"
                    ? "bg-blue-600 text-white"
                    : "bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600"
                }`}
              >
                Por departamento
              </button>
            </div>
          </div>

          {cargandoResultados ? (
            <p className="text-center text-gray-400 py-10">Cargando resultados...</p>
          ) : vistaResultados === "municipios" ? (
            resultadosMunicipios.length === 0 ? (
              <p className="text-center text-gray-400 py-10">Aun no hay votos registrados.</p>
            ) : (
              <div className="space-y-6">
                {resultadosMunicipios.map((item) => {
                  const porcentajes = calcularPorcentajes(item.votos);
                  const g = ganador(item.votos);
                  const totalVotos = Object.values(item.votos).reduce((s, v) => s + v, 0);
                  return (
                    <div key={item.municipio} className="border border-gray-100 dark:border-gray-700 rounded-xl p-4">
                      <div className="flex items-center justify-between mb-3">
                        <div>
                          <p className="font-semibold text-gray-900 dark:text-white">{item.municipio}</p>
                          <p className="text-xs text-gray-500 dark:text-gray-400">{item.departamento} — {totalVotos} {totalVotos === 1 ? "voto" : "votos"}</p>
                        </div>
                        {g && (
                          <span className={`text-xs font-medium text-white px-2.5 py-1 rounded-full ${g.color}`}>
                            {g.nombre.split(" ")[0]} gana
                          </span>
                        )}
                      </div>
                      <div className="space-y-2">
                        {CANDIDATOS.filter((c) => item.votos[c.id]).map((c) => (
                          <div key={c.id}>
                            <div className="flex justify-between text-xs mb-1">
                              <span className="text-gray-700 dark:text-gray-300">{c.nombre}</span>
                              <span className="font-semibold text-gray-900 dark:text-white">{porcentajes[c.id] || 0}%</span>
                            </div>
                            <div className="h-2 bg-gray-100 dark:bg-gray-700 rounded-full overflow-hidden">
                              <div
                                className={`h-full rounded-full transition-all duration-500 ${c.colorBarra}`}
                                style={{ width: `${porcentajes[c.id] || 0}%` }}
                              />
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  );
                })}
              </div>
            )
          ) : (
            resultadosDepartamentos.length === 0 ? (
              <p className="text-center text-gray-400 py-10">Aun no hay votos registrados.</p>
            ) : (
              <div className="space-y-6">
                {resultadosDepartamentos.map((item) => {
                  const porcentajes = calcularPorcentajes(item.votos);
                  const g = ganador(item.votos);
                  const totalVotos = Object.values(item.votos).reduce((s, v) => s + v, 0);
                  return (
                    <div key={item.departamento} className="border border-gray-100 dark:border-gray-700 rounded-xl p-4">
                      <div className="flex items-center justify-between mb-3">
                        <div>
                          <p className="font-semibold text-gray-900 dark:text-white">{item.departamento}</p>
                          <p className="text-xs text-gray-500 dark:text-gray-400">{totalVotos} {totalVotos === 1 ? "voto" : "votos"}</p>
                        </div>
                        {g && (
                          <span className={`text-xs font-medium text-white px-2.5 py-1 rounded-full ${g.color}`}>
                            {g.nombre.split(" ")[0]} gana
                          </span>
                        )}
                      </div>
                      <div className="space-y-2">
                        {CANDIDATOS.filter((c) => item.votos[c.id]).map((c) => (
                          <div key={c.id}>
                            <div className="flex justify-between text-xs mb-1">
                              <span className="text-gray-700 dark:text-gray-300">{c.nombre}</span>
                              <span className="font-semibold text-gray-900 dark:text-white">{porcentajes[c.id] || 0}%</span>
                            </div>
                            <div className="h-2 bg-gray-100 dark:bg-gray-700 rounded-full overflow-hidden">
                              <div
                                className={`h-full rounded-full transition-all duration-500 ${c.colorBarra}`}
                                style={{ width: `${porcentajes[c.id] || 0}%` }}
                              />
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  );
                })}
              </div>
            )
          )}

          <div className="mt-6 pt-4 border-t border-gray-100 dark:border-gray-700">
            <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">Candidatos</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {CANDIDATOS.map((c) => (
                <div key={c.id} className="flex items-center gap-2 text-xs text-gray-600 dark:text-gray-400">
                  <div className={`w-2.5 h-2.5 rounded-full flex-shrink-0 ${c.color}`} />
                  <span className="font-medium">{c.nombre}</span>
                  <span className="text-gray-400">— {c.partido}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
