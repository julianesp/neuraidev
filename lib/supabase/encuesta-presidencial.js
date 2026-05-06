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

export async function registrarVoto({ user_id, user_name, user_email, user_picture, municipio, departamento, candidato_id }) {
  const supabase = getAdminClient();

  // Verificar si ya votó
  const { data: existente } = await supabase
    .from("encuesta_votos")
    .select("id")
    .eq("user_id", user_id)
    .single();

  if (existente) {
    throw new Error("Ya has registrado tu voto anteriormente.");
  }

  const { data, error } = await supabase
    .from("encuesta_votos")
    .insert([{
      user_id,
      user_name,
      user_email: user_email || null,
      user_picture: user_picture || null,
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

  // Tabla no creada aún
  if (error) return [];

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

  if (error) return [];

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

export async function getVotoDeUsuario(user_id) {
  const supabase = getAdminClient();
  const { data } = await supabase
    .from("encuesta_votos")
    .select("*")
    .eq("user_id", user_id)
    .single();
  return data || null;
}

export async function borrarTodosLosVotos() {
  const supabase = getAdminClient();
  const { error } = await supabase
    .from("encuesta_votos")
    .delete()
    .neq("id", "00000000-0000-0000-0000-000000000000");
  if (error) throw error;
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
