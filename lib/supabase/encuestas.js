import { createClient } from "@supabase/supabase-js";

function getClient() {
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

export async function getEncuestasActivas() {
  const supabase = getClient();
  const { data } = await supabase
    .from("encuestas")
    .select("*")
    .eq("activa", true)
    .order("created_at", { ascending: false });
  return data || [];
}

export async function getEncuestaBySlug(slug) {
  const supabase = getClient();
  const { data } = await supabase
    .from("encuestas")
    .select("*")
    .eq("slug", slug)
    .single();
  return data || null;
}

export async function crearEncuesta({ slug, titulo, descripcion, candidatos, fecha_cierre }) {
  const supabase = getAdminClient();
  const { data, error } = await supabase
    .from("encuestas")
    .insert([{ slug, titulo, descripcion, candidatos, fecha_cierre }])
    .select()
    .single();
  if (error) throw error;
  return data;
}

export async function getResultadosEncuesta(encuesta_id) {
  const supabase = getClient();
  const { data } = await supabase
    .from("encuesta_votos_gen")
    .select("candidato_id, municipio, departamento")
    .eq("encuesta_id", encuesta_id);
  return data || [];
}

export async function getVotoUsuarioEncuesta(encuesta_id, user_id) {
  const supabase = getAdminClient();
  const { data } = await supabase
    .from("encuesta_votos_gen")
    .select("*")
    .eq("encuesta_id", encuesta_id)
    .eq("user_id", user_id)
    .single();
  return data || null;
}

export async function registrarVotoEncuesta({ encuesta_id, user_id, user_name, user_email, user_picture, candidato_id, municipio, departamento }) {
  const supabase = getAdminClient();

  const existente = await getVotoUsuarioEncuesta(encuesta_id, user_id);
  if (existente) throw new Error("Ya has registrado tu voto en esta encuesta.");

  const { data, error } = await supabase
    .from("encuesta_votos_gen")
    .insert([{ encuesta_id, user_id, user_name, user_email, user_picture, candidato_id, municipio, departamento }])
    .select()
    .single();
  if (error) throw error;
  return data;
}

export async function getTodosVotosEncuesta(encuesta_id) {
  const supabase = getAdminClient();
  const { data, error } = await supabase
    .from("encuesta_votos_gen")
    .select("*")
    .eq("encuesta_id", encuesta_id)
    .order("created_at", { ascending: false });
  if (error) throw error;
  return data || [];
}

export async function borrarVotosEncuesta(encuesta_id) {
  const supabase = getAdminClient();
  const { error } = await supabase
    .from("encuesta_votos_gen")
    .delete()
    .eq("encuesta_id", encuesta_id);
  if (error) throw error;
}
