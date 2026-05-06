"use client";

import { useEffect, useState, useCallback } from "react";
import { useUser, SignInButton, SignOutButton } from "@clerk/nextjs";

const DEPARTAMENTOS_COLOMBIA = {
  "Amazonas": ["Leticia", "Puerto Nariño", "El Encanto", "La Chorrera", "La Pedrera", "Mirití-Paraná", "Puerto Alegría", "Puerto Arica", "Puerto Santander", "Tarapacá"],
  "Antioquia": ["Medellín", "Bello", "Itagüí", "Envigado", "Apartadó", "Turbo", "Rionegro", "Caucasia", "Manizales", "Pereira", "Armenia", "Barranquilla", "Bogotá", "Bucaramanga", "Cali", "Cartagena", "Cúcuta", "Ibagué", "Popayán", "Santa Marta", "Villavicencio"],
  "Arauca": ["Arauca", "Arauquita", "Cravo Norte", "Fortul", "Puerto Rondón", "Saravena", "Tame"],
  "Atlántico": ["Barranquilla", "Baranoa", "Campo de la Cruz", "Candelaria", "Galapa", "Juan de Acosta", "Luruaco", "Malambo", "Manatí", "Palmar de Varela", "Piojó", "Polonuevo", "Ponedera", "Puerto Colombia", "Repelón", "Sabanagrande", "Sabanalarga", "Santa Lucía", "Santo Tomás", "Soledad", "Suan", "Tubará", "Usiacurí"],
  "Bogotá D.C.": ["Bogotá"],
  "Bolívar": ["Cartagena", "Achí", "Arjona", "Arroyohondo", "Calamar", "Cantagallo", "El Carmen de Bolívar", "El Guamo", "Magangué", "Mompós", "Morales", "Pinillos", "San Jacinto", "San Juan Nepomuceno", "San Pablo", "Santa Rosa", "Simití", "Turbaco", "Villanueva", "Zambrano"],
  "Boyacá": ["Tunja", "Chiquinquirá", "Duitama", "Sogamoso", "Paipa", "Villa de Leyva", "Moniquirá", "Puerto Boyacá", "Soatá", "Garagoa", "Miraflores", "Ramiriquí", "Aquitania", "Nobsa", "Santa Rosa de Viterbo", "Samacá", "Ventaquemada"],
  "Caldas": ["Manizales", "Chinchiná", "La Dorada", "Riosucio", "Salamina", "Anserma", "Neira", "Villamaría", "Supía", "Manzanares", "Aguadas", "Pácora", "Aranzazu", "Belalcázar", "Marulanda", "Samaná", "Victoria", "Viterbo"],
  "Caquetá": ["Florencia", "Albania", "Belén de los Andaquíes", "Cartagena del Chairá", "Curillo", "El Doncello", "El Paujil", "La Montañita", "Milán", "Morelia", "Puerto Rico", "San José del Fragua", "San Vicente del Caguán", "Solano", "Solita", "Valparaíso"],
  "Casanare": ["Yopal", "Aguazul", "Hato Corozal", "Maní", "Monterrey", "Nunchía", "Orocué", "Paz de Ariporo", "Pore", "Sabanalarga", "Tauramena", "Trinidad", "Villanueva"],
  "Cauca": ["Popayán", "Santander de Quilichao", "Puerto Tejada", "Patía", "Bolívar", "Timbío", "El Tambo", "Miranda", "Guapi", "Corinto", "Caloto", "Toribío", "Piendamó", "Silvia", "Mercaderes", "Cajibío", "Inzá", "Jambaló", "La Vega", "Morales", "Padilla", "Páez", "Puracé", "Villa Rica"],
  "Cesar": ["Valledupar", "Aguachica", "Agustín Codazzi", "Astrea", "Becerril", "Bosconia", "Chimichagua", "Chiriguaná", "Curumaní", "El Copey", "El Paso", "Gamarra", "La Gloria", "La Jagua de Ibirico", "La Paz", "Manaure", "Pailitas", "Pelaya", "Pueblo Bello", "Río de Oro", "San Alberto", "San Diego", "San Martín", "Tamalameque"],
  "Chocó": ["Quibdó", "Acandí", "Alto Baudó", "Bahía Solano", "Bajo Baudó", "Bojayá", "Condoto", "El Carmen de Atrato", "Istmina", "Juradó", "Lloró", "Nóvita", "Nuquí", "Riosucio", "San José del Palmar", "Sipí", "Tadó"],
  "Córdoba": ["Montería", "Ayapel", "Buenavista", "Canalete", "Cereté", "Chimá", "Chinú", "Ciénaga de Oro", "Lorica", "Montelíbano", "Planeta Rica", "Pueblo Nuevo", "Puerto Escondido", "Puerto Libertador", "Sahagún", "San Antero", "San Bernardo del Viento", "San Pelayo", "Tierralta", "Valencia"],
  "Cundinamarca": ["Bogotá", "Soacha", "Facatativá", "Zipaquirá", "Chía", "Fusagasugá", "Girardot", "Mosquera", "Madrid", "Funza", "Cajicá", "La Mesa", "Villeta", "Cota", "Tocancipá", "Sibaté", "Sopó", "Tabio", "Tenjo"],
  "Guainía": ["Inírida", "Barranco Minas", "Cacahual", "La Guadalupe", "Mapiripana", "Puerto Colombia", "San Felipe"],
  "Guaviare": ["San José del Guaviare", "Calamar", "El Retorno", "Miraflores"],
  "Huila": ["Neiva", "Pitalito", "Garzón", "La Plata", "Campoalegre", "Palermo", "Gigante", "Isnos", "Timaná", "Hobo", "Rivera", "Algeciras", "Aipe", "Altamira", "Baraya", "El Agrado", "El Pital", "Guadalupe", "La Argentina", "Oporapa", "San Agustín", "Santa María", "Suaza", "Tarqui", "Tello", "Teruel", "Tesalia", "Villavieja", "Yaguará"],
  "La Guajira": ["Riohacha", "Albania", "Barrancas", "Dibulla", "Distracción", "El Molino", "Fonseca", "Hatonuevo", "La Jagua del Pilar", "Maicao", "Manaure", "San Juan del Cesar", "Uribia", "Urumita", "Villanueva"],
  "Magdalena": ["Santa Marta", "Aracataca", "Ciénaga", "El Banco", "Fundación", "Guamal", "Nueva Granada", "Pivijay", "Plato", "Salamina", "Sitionuevo", "Tenerife", "Zona Bananera"],
  "Meta": ["Villavicencio", "Acacías", "Cumaral", "El Castillo", "Fuente de Oro", "Granada", "Guamal", "La Macarena", "Lejanías", "Mapiripán", "Mesetas", "Puerto Concordia", "Puerto Gaitán", "Puerto Lleras", "Puerto López", "Puerto Rico", "Restrepo", "San Juan de Arama", "San Martín", "Vistahermosa"],
  "Nariño": ["Pasto", "Tumaco", "Ipiales", "Túquerres", "La Unión", "Samaniego", "Barbacoas", "Cumbal", "Sandoná", "La Florida", "El Charco", "Ricaurte", "Mosquera", "Olaya Herrera", "Aldana", "Buesaco", "Contadero", "Cuaspud", "Cumbitara", "El Rosario", "El Tablón de Gómez", "El Tambo", "Guachucal", "Guaitarilla", "Iles", "Linares", "Leiva", "Los Andes", "Mallama", "Ospina", "Francisco Pizarro", "Policarpa", "Potosí", "Puerres", "Pupiales", "San Lorenzo", "San Pablo", "Santa Bárbara", "Sapuyes", "Taminango", "Tangua", "Yacuanquer"],
  "Norte de Santander": ["Cúcuta", "Ocaña", "Pamplona", "Villa del Rosario", "Los Patios", "El Zulia", "Tibú", "Chinácota", "Chitagá", "Convención", "Durania", "El Carmen", "El Tarra", "Gramalote", "Hacarí", "Herrán", "La Esperanza", "La Playa", "Labateca", "Lourdes", "Mutiscua", "Pamplonita", "Puerto Santander", "Ragonvalia", "Salazar", "San Calixto", "San Cayetano", "Santiago", "Sardinata", "Silos", "Teorama", "Toledo", "Villa Caro", "Villanueva"],
  "Putumayo": ["Mocoa", "Puerto Asís", "Orito", "Valle del Guamuéz", "San Miguel", "Villagarzón", "Puerto Caicedo", "Puerto Guzmán", "Leguízamo", "Sibundoy", "San Francisco", "Colón", "Santiago", "San Pedro"],
  "Quindío": ["Armenia", "Buenavista", "Calarcá", "Circasia", "Córdoba", "Filandia", "Génova", "La Tebaida", "Montenegro", "Pijao", "Quimbaya", "Salento"],
  "Risaralda": ["Pereira", "Dosquebradas", "Santa Rosa de Cabal", "La Virginia", "Apía", "Balboa", "Belén de Umbría", "Guática", "La Celia", "Marsella", "Mistrató", "Pueblo Rico", "Quinchía", "Santuario"],
  "San Andrés y Providencia": ["San Andrés", "Providencia", "Santa Catalina"],
  "Santander": ["Bucaramanga", "Floridablanca", "Girón", "Piedecuesta", "Barrancabermeja", "Socorro", "San Gil", "Vélez", "Barbosa", "Lebrija", "Málaga", "Charalá", "Concepción", "Zapatoca", "Oiba", "Rionegro", "Puerto Wilches", "Sabana de Torres", "Curití", "El Playón"],
  "Sucre": ["Sincelejo", "Corozal", "Sampués", "San Marcos", "Tolú", "Tolúviejo", "Ovejas", "Morroa", "Los Palmitos", "Galeras", "Buenavista", "Majagual", "San Luis de Sincé", "Coveñas", "Chalán", "Coloso", "Guaranda", "La Unión", "Palmito", "San Benito Abad", "San Juan de Betulia", "San Onofre", "San Pedro", "Sucre"],
  "Tolima": ["Ibagué", "Espinal", "Honda", "Melgar", "Chaparral", "Líbano", "Mariquita", "Fresno", "Girardot", "Flandes", "Purificación", "Natagaima", "Ataco", "Cunday", "Dolores", "Guamo", "Herveo", "Icononzo", "Lérida", "Murillo", "Ortega", "Planadas", "Prado", "Rioblanco", "Roncesvalles", "Rovira", "Saldaña", "San Antonio", "Venadillo", "Villahermosa", "Villarrica"],
  "Valle del Cauca": ["Cali", "Buenaventura", "Palmira", "Tuluá", "Cartago", "Buga", "Yumbo", "Jamundí", "Candelaria", "Pradera", "Florida", "Dagua", "La Unión", "Roldanillo", "Zarzal", "Sevilla", "Caicedonia", "El Cerrito", "Alcalá", "Andalucía", "Ansermanuevo", "Argelia", "Bolívar", "Calima", "El Águila", "El Cairo", "El Dovio", "Ginebra", "Guacarí", "La Cumbre", "La Victoria", "Obando", "Restrepo", "San Pedro", "Toro", "Trujillo", "Ulloa", "Versalles", "Vijes", "Yotoco"],
  "Vaupés": ["Mitú", "Carurú", "Pacoa", "Taraira", "Yavaraté"],
  "Vichada": ["Puerto Carreño", "Cumaribo", "La Primavera", "Santa Rosalía"],
};

function calcularResultados(votos, candidatos) {
  const totales = {};
  candidatos.forEach((c) => { totales[c.id] = 0; });
  votos.forEach((v) => { if (totales[v.candidato_id] !== undefined) totales[v.candidato_id]++; });
  const total = Object.values(totales).reduce((s, v) => s + v, 0);
  return { totales, total };
}

export default function EncuestaPage({ params }) {
  const [slug, setSlug] = useState(null);
  const [encuesta, setEncuesta] = useState(null);
  const [votos, setVotos] = useState([]);
  const [miVoto, setMiVoto] = useState(null);
  const [cargando, setCargando] = useState(true);
  const [cargandoMiVoto, setCargandoMiVoto] = useState(false);
  const [departamento, setDepartamento] = useState("");
  const [municipio, setMunicipio] = useState("");
  const [candidatoId, setCandidatoId] = useState("");
  const [enviando, setEnviando] = useState(false);
  const [error, setError] = useState("");
  const [exito, setExito] = useState(false);

  const { user, isLoaded } = useUser();

  useEffect(() => {
    params.then ? params.then((p) => setSlug(p.slug)) : setSlug(params.slug);
  }, [params]);

  const cargarEncuesta = useCallback(async () => {
    if (!slug) return;
    setCargando(true);
    try {
      const res = await fetch(`/api/encuestas/${slug}/votos`);
      const data = await res.json();
      if (data.error) { setCargando(false); return; }
      setEncuesta(data.encuesta);
      setVotos(data.votos || []);
    } finally {
      setCargando(false);
    }
  }, [slug]);

  useEffect(() => { cargarEncuesta(); }, [cargarEncuesta]);

  useEffect(() => {
    if (!user || !slug) return;
    setCargandoMiVoto(true);
    fetch(`/api/encuestas/${slug}/votos?vista=mi-voto`)
      .then((r) => r.json())
      .then((d) => setMiVoto(d.voto || null))
      .finally(() => setCargandoMiVoto(false));
  }, [user, slug]);

  async function handleVotar(e) {
    e.preventDefault();
    if (!user || !candidatoId || !municipio || !departamento) return;
    setEnviando(true);
    setError("");
    try {
      const res = await fetch(`/api/encuestas/${slug}/votos`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          user_name: user.fullName || user.firstName || "Usuario",
          user_email: user.primaryEmailAddress?.emailAddress || null,
          user_picture: user.imageUrl || null,
          candidato_id: candidatoId,
          municipio,
          departamento,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Error al registrar el voto");
      setExito(true);
      cargarEncuesta();
    } catch (err) {
      setError(err.message);
    } finally {
      setEnviando(false);
    }
  }

  if (cargando) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <div className="w-10 h-10 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!encuesta) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <p className="text-gray-500 dark:text-gray-400">Encuesta no encontrada.</p>
      </div>
    );
  }

  const candidatos = encuesta.candidatos || [];
  const encuestaCerrada = new Date() > new Date(encuesta.fecha_cierre);
  const { totales, total } = calcularResultados(votos, candidatos);
  const ganadorCandidato = candidatos.reduce((prev, c) => (totales[c.id] || 0) > (totales[prev?.id] || 0) ? c : prev, candidatos[0]);
  const municipiosDisponibles = departamento ? DEPARTAMENTOS_COLOMBIA[departamento] || [] : [];

  return (
    <div className="min-h-screen bg-gradient-to-br from-yellow-50 via-white to-red-50 dark:from-gray-900 dark:via-gray-900 dark:to-gray-800 py-10 px-4">
      <div className="max-w-3xl mx-auto">

        {/* Encabezado */}
        <div className="text-center mb-10">
          <div className="inline-flex items-center gap-2 bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-200 px-4 py-1.5 rounded-full text-sm font-medium mb-4">
            Encuesta electoral
          </div>
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-3">{encuesta.titulo}</h1>
          {encuesta.descripcion && (
            <p className="text-gray-600 dark:text-gray-400 text-lg">{encuesta.descripcion}</p>
          )}
          <p className="text-gray-400 dark:text-gray-600 text-xs mt-2">
            {encuestaCerrada ? "Encuesta cerrada" : `Activa hasta el ${new Date(encuesta.fecha_cierre).toLocaleDateString("es-CO", { day: "numeric", month: "long", year: "numeric" })}`}
          </p>
        </div>

        {/* Bloque votación */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-md border border-gray-100 dark:border-gray-700 p-6 mb-8">
          {encuestaCerrada ? (
            <div className="text-center py-10">
              <div className="text-4xl mb-4">🗳️</div>
              <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-2">Encuesta cerrada</h2>
              <p className="text-gray-500 dark:text-gray-400">Consulta los resultados a continuacion.</p>
            </div>
          ) : !isLoaded ? (
            <div className="text-center py-10">
              <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto" />
            </div>
          ) : !user ? (
            <div className="text-center py-6">
              <p className="text-gray-600 dark:text-gray-400 mb-5">Para votar debes iniciar sesion con tu cuenta de Google.</p>
              <SignInButton mode="redirect" forceRedirectUrl={`/encuestas/${slug}`}>
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
          ) : cargandoMiVoto ? (
            <div className="text-center py-8">
              <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto" />
            </div>
          ) : (exito || miVoto) ? (
            <div className="text-center py-8">
              <div className="w-16 h-16 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-green-600 dark:text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-2">Voto registrado</h2>
              <p className="text-gray-600 dark:text-gray-400 mb-1">
                Gracias <strong>{user.fullName || user.firstName}</strong>, tu voto ha sido registrado.
              </p>
              {miVoto && (
                <p className="text-sm text-gray-400 dark:text-gray-500">
                  Votaste por <strong>{candidatos.find(c => c.id === miVoto.candidato_id)?.nombre}</strong> desde <strong>{miVoto.municipio}</strong>, {miVoto.departamento}.
                </p>
              )}
              <SignOutButton redirectUrl={`/encuestas/${slug}`}>
                <button className="mt-4 text-xs text-gray-400 hover:text-red-500 transition-colors">Cerrar sesion</button>
              </SignOutButton>
            </div>
          ) : (
            <>
              {/* Perfil */}
              <div className="flex items-center justify-between mb-6 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-xl">
                <div className="flex items-center gap-3">
                  {user.imageUrl && <img src={user.imageUrl} alt={user.fullName} className="w-10 h-10 rounded-full" />}
                  <div>
                    <p className="font-semibold text-gray-900 dark:text-white text-sm">{user.fullName || user.firstName}</p>
                    {user.primaryEmailAddress?.emailAddress && (
                      <p className="text-xs text-gray-500 dark:text-gray-400">{user.primaryEmailAddress.emailAddress}</p>
                    )}
                  </div>
                </div>
                <SignOutButton redirectUrl={`/encuestas/${slug}`}>
                  <button className="text-xs text-gray-400 hover:text-red-500 transition-colors">Cerrar sesion</button>
                </SignOutButton>
              </div>

              <form onSubmit={handleVotar} className="space-y-5">
                {/* Departamento */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Departamento</label>
                  <select value={departamento} onChange={(e) => { setDepartamento(e.target.value); setMunicipio(""); }} required
                    className="w-full border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2.5 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none appearance-auto cursor-pointer">
                    <option value="">Selecciona tu departamento</option>
                    {Object.keys(DEPARTAMENTOS_COLOMBIA).map((dep) => <option key={dep} value={dep}>{dep}</option>)}
                  </select>
                </div>

                {/* Municipio */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Municipio</label>
                  <select value={municipio} onChange={(e) => setMunicipio(e.target.value)} required disabled={!departamento}
                    className="w-full border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2.5 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none disabled:opacity-50 appearance-auto cursor-pointer">
                    <option value="">Selecciona tu municipio</option>
                    {municipiosDisponibles.map((mun) => <option key={mun} value={mun}>{mun}</option>)}
                  </select>
                </div>

                {/* Candidatos */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">Candidato de tu preferencia</label>
                  <div className="space-y-2.5">
                    {candidatos.map((c) => (
                      <label key={c.id} className={`flex items-center gap-3 p-3.5 rounded-xl border-2 cursor-pointer transition-all ${candidatoId === c.id ? "border-blue-500 bg-blue-50 dark:bg-blue-900/20" : "border-gray-200 dark:border-gray-600 hover:border-gray-300 dark:hover:border-gray-500"}`}>
                        <input type="radio" name="candidato" value={c.id} checked={candidatoId === c.id} onChange={() => setCandidatoId(c.id)} className="sr-only" />
                        <div className="w-3 h-3 rounded-full flex-shrink-0" style={{ backgroundColor: c.color || "#3b82f6" }} />
                        <div className="flex-1 min-w-0">
                          <p className="font-semibold text-gray-900 dark:text-white text-sm">{c.nombre}</p>
                          {c.partido && <p className="text-xs text-gray-500 dark:text-gray-400 truncate">{c.partido}</p>}
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

                {error && <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-400 rounded-lg px-4 py-3 text-sm">{error}</div>}

                <button type="submit" disabled={enviando || !candidatoId || !municipio}
                  className="w-full bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold py-3 rounded-xl transition-colors duration-200">
                  {enviando ? "Registrando voto..." : "Registrar mi voto"}
                </button>
              </form>
            </>
          )}
        </div>

        {/* Resultados */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-md border border-gray-100 dark:border-gray-700 p-6">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-5">Resultados en tiempo real</h2>

          {total === 0 ? (
            <p className="text-center text-gray-400 py-8">Aun no hay votos registrados.</p>
          ) : (
            <>
              {/* Ganador */}
              <div className="flex items-center gap-2 mb-5 p-3 bg-gray-50 dark:bg-gray-700/50 rounded-xl">
                <div className="w-3 h-3 rounded-full flex-shrink-0" style={{ backgroundColor: ganadorCandidato?.color || "#3b82f6" }} />
                <p className="font-bold text-gray-900 dark:text-white text-sm">
                  Va ganando: <span className="text-base">{ganadorCandidato?.nombre}</span>
                  <span className="ml-2 text-gray-500 dark:text-gray-400 font-normal">
                    — {totales[ganadorCandidato?.id]} {totales[ganadorCandidato?.id] === 1 ? "voto" : "votos"} de {total} totales
                  </span>
                </p>
              </div>

              {/* Barras */}
              <div className="space-y-4">
                {candidatos.map((c) => {
                  const v = totales[c.id] || 0;
                  const pct = total ? ((v / total) * 100).toFixed(1) : 0;
                  return (
                    <div key={c.id}>
                      <div className="flex justify-between text-xs mb-1">
                        <span className="font-medium text-gray-700 dark:text-gray-300">{c.nombre}</span>
                        <span className="font-bold text-gray-900 dark:text-white">{v} votos · {pct}%</span>
                      </div>
                      <div className="h-4 bg-gray-100 dark:bg-gray-700 rounded-full overflow-hidden">
                        <div className="h-full rounded-full transition-all duration-700" style={{ width: `${pct}%`, backgroundColor: c.color || "#3b82f6" }} />
                      </div>
                    </div>
                  );
                })}
              </div>

              <p className="text-xs text-gray-400 text-right mt-4">{total} {total === 1 ? "voto" : "votos"} totales</p>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
