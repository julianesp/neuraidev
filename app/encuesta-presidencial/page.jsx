"use client";

import { useEffect, useState, useCallback } from "react";

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

  const [fbUser, setFbUser] = useState(null);
  const [fbSdkReady, setFbSdkReady] = useState(false);
  const [fbEnWebview, setFbEnWebview] = useState(false);
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

  // Detectar si se abre desde el navegador interno de Facebook
  useEffect(() => {
    const ua = navigator.userAgent || "";
    if (ua.includes("FBAN") || ua.includes("FBAV") || ua.includes("FB_IAB")) {
      setFbEnWebview(true);
    }
  }, []);

  // Cargar SDK de Facebook
  useEffect(() => {
    function initFB() {
      if (!window.FB) return;
      // Si ya fue inicializado por otro componente, solo marcamos listo
      try {
        window.FB.getLoginStatus(() => {});
        setFbSdkReady(true);
        return;
      } catch {
        // no estaba inicializado aún, inicializar
      }
      window.FB.init({
        appId: process.env.NEXT_PUBLIC_FACEBOOK_APP_ID || "",
        cookie: true,
        xfbml: true,
        version: "v19.0",
      });
      setFbSdkReady(true);
    }

    // Si el SDK ya está cargado y disponible
    if (window.FB) {
      initFB();
      return;
    }

    // Si el script ya existe pero FB aún no está disponible (cargando)
    if (document.getElementById("facebook-jssdk")) {
      // Esperar a que fbAsyncInit sea llamado
      const originalInit = window.fbAsyncInit;
      window.fbAsyncInit = function () {
        if (originalInit) originalInit();
        initFB();
      };
      return;
    }

    // Cargar el script por primera vez
    window.fbAsyncInit = function () {
      window.FB.init({
        appId: process.env.NEXT_PUBLIC_FACEBOOK_APP_ID || "",
        cookie: true,
        xfbml: true,
        version: "v19.0",
      });
      setFbSdkReady(true);
    };

    const script = document.createElement("script");
    script.id = "facebook-jssdk";
    script.src = "https://connect.facebook.net/es_LA/sdk.js";
    script.async = true;
    script.defer = true;
    script.crossOrigin = "anonymous";
    document.body.appendChild(script);
  }, []);

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

  function loginFacebook() {
    if (!window.FB) return;
    window.FB.login(
      (response) => {
        if (response.authResponse) {
          window.FB.api(
            "/me",
            { fields: "id,name,email,picture.type(large)" },
            (perfil) => {
              setFbUser({
                id: perfil.id,
                name: perfil.name,
                email: perfil.email || null,
                picture: perfil.picture?.data?.url || null,
              });
            }
          );
        }
      },
      { scope: "public_profile,email" }
    );
  }

  function logoutFacebook() {
    if (!window.FB) return;
    window.FB.logout(() => setFbUser(null));
  }

  async function handleVotar(e) {
    e.preventDefault();
    if (!fbUser || !departamento || !municipio || !candidatoId) return;
    setCargando(true);
    setError("");
    try {
      const res = await fetch("/api/encuesta-presidencial", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          facebook_id: fbUser.id,
          facebook_name: fbUser.name,
          facebook_email: fbUser.email,
          facebook_picture: fbUser.picture,
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
      <div id="fb-root" />
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
            Participa iniciando sesion con tu cuenta de Facebook. Solo se permite un voto por persona.
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
          ) : fbEnWebview ? (
            <div className="text-center py-8 px-4">
              <div className="w-16 h-16 bg-yellow-100 dark:bg-yellow-900/30 rounded-full flex items-center justify-center mx-auto mb-4 text-3xl">
                ⚠️
              </div>
              <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-2">Abre esta pagina en tu navegador</h2>
              <p className="text-gray-600 dark:text-gray-400 text-sm mb-4">
                El navegador interno de Facebook no permite el inicio de sesion con Facebook por razones de seguridad.
                <br /><br />
                Abre esta pagina en <strong>Chrome, Safari o tu navegador preferido</strong> para poder votar.
              </p>
              <div className="bg-gray-50 dark:bg-gray-700 rounded-lg px-4 py-2 inline-block text-xs text-gray-500 dark:text-gray-400 font-mono break-all">
                neurai.dev/encuesta-presidencial
              </div>
            </div>
          ) : (
          <>

          {/* Login Facebook */}
          {!fbUser ? (
            <div className="text-center py-6">
              <p className="text-gray-600 dark:text-gray-400 mb-5">
                Para votar debes iniciar sesion con tu cuenta de Facebook.
              </p>
              <button
                onClick={loginFacebook}
                disabled={!fbSdkReady}
                className="inline-flex items-center gap-3 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold px-7 py-3 rounded-xl transition-colors duration-200 text-base"
              >
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
                </svg>
                Iniciar sesion con Facebook
              </button>
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
                Gracias <strong>{fbUser.name}</strong>, tu voto ha sido registrado exitosamente.
              </p>
            </div>
          ) : (
            <>
              {/* Perfil Facebook */}
              <div className="flex items-center justify-between mb-6 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-xl">
                <div className="flex items-center gap-3">
                  {fbUser.picture && (
                    <img src={fbUser.picture} alt={fbUser.name} className="w-10 h-10 rounded-full" />
                  )}
                  <div>
                    <p className="font-semibold text-gray-900 dark:text-white text-sm">{fbUser.name}</p>
                    {fbUser.email && <p className="text-xs text-gray-500 dark:text-gray-400">{fbUser.email}</p>}
                  </div>
                </div>
                <button onClick={logoutFacebook} className="text-xs text-gray-400 hover:text-red-500 transition-colors">
                  Cerrar sesion
                </button>
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
                    className="w-full border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2.5 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none"
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
                    className="w-full border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2.5 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none disabled:opacity-50"
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
