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

export async function getPublicaciones() {
  const supabase = getServerClient();
  const { data, error } = await supabase
    .from("pollos_colon_publicaciones")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Error fetching publicaciones:", error);
    return [];
  }
  return data || [];
}

export async function crearPublicacion({ titulo, descripcion, imagen_url, imagen_path }) {
  const supabase = getAdminClient();
  const { data, error } = await supabase
    .from("pollos_colon_publicaciones")
    .insert([{ titulo, descripcion, imagen_url, imagen_path }])
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function eliminarPublicacion(id, imagen_path) {
  const supabase = getAdminClient();

  if (imagen_path) {
    await supabase.storage.from("imagenes").remove([imagen_path]);
  }

  const { error } = await supabase
    .from("pollos_colon_publicaciones")
    .delete()
    .eq("id", id);

  if (error) throw error;
}

export async function actualizarPublicacion(id, { titulo, descripcion }) {
  const supabase = getAdminClient();
  const { data, error } = await supabase
    .from("pollos_colon_publicaciones")
    .update({ titulo, descripcion })
    .eq("id", id)
    .select()
    .single();

  if (error) throw error;
  return data;
}
