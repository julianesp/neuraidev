import { createClient } from "@supabase/supabase-js";

function getServerClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  );
}

function getAdminClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
  );
}

export async function registrarVoto({ facebook_id, facebook_name, facebook_email, facebook_picture, municipio, departamento, candidato_id }) {
  const supabase = getAdminClient();

  // Verificar si ya votó
  const { data: existente } = await supabase
    .from("encuesta_votos")
    .select("id")
    .eq("facebook_id", facebook_id)
    .single();

  if (existente) {
    throw new Error("Ya has registrado tu voto anteriormente.");
  }

  const { data, error } = await supabase
    .from("encuesta_votos")
    .insert([{
      facebook_id,
      facebook_name,
      facebook_email: facebook_email || null,
      facebook_picture: facebook_picture || null,
      municipio,
      departamento,
      candidato_id,
    }])
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function getResultadosPorMunicipio() {
  const supabase = getServerClient();
  const { data, error } = await supabase
    .from("encuesta_votos")
    .select("municipio, departamento, candidato_id");

  if (error) throw error;

  // Agrupar por municipio y candidato
  const resultados = {};
  for (const voto of data || []) {
    const key = voto.municipio;
    if (!resultados[key]) {
      resultados[key] = { municipio: voto.municipio, departamento: voto.departamento, votos: {} };
    }
    resultados[key].votos[voto.candidato_id] = (resultados[key].votos[voto.candidato_id] || 0) + 1;
  }

  return Object.values(resultados);
}

export async function getResultadosPorDepartamento() {
  const supabase = getServerClient();
  const { data, error } = await supabase
    .from("encuesta_votos")
    .select("departamento, candidato_id");

  if (error) throw error;

  const resultados = {};
  for (const voto of data || []) {
    const key = voto.departamento;
    if (!resultados[key]) {
      resultados[key] = { departamento: voto.departamento, votos: {} };
    }
    resultados[key].votos[voto.candidato_id] = (resultados[key].votos[voto.candidato_id] || 0) + 1;
  }

  return Object.values(resultados);
}

// Solo para admin: obtener todos los perfiles que votaron
export async function getTodosLosVotos() {
  const supabase = getAdminClient();
  const { data, error } = await supabase
    .from("encuesta_votos")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) throw error;
  return data || [];
}
