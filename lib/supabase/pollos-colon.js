import { getSupabaseClient } from "@/lib/db";

function getServerClient() {
  return getSupabaseClient();
}

function getAdminClient() {
  return getSupabaseClient();
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

export async function crearPublicacion({ titulo, descripcion, imagen_url, imagen_path, imagenes_urls, imagenes_paths }) {
  const supabase = getAdminClient();
  const { data, error } = await supabase
    .from("pollos_colon_publicaciones")
    .insert([{ titulo, descripcion, imagen_url, imagen_path, imagenes_urls: imagenes_urls || [], imagenes_paths: imagenes_paths || [] }])
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function eliminarPublicacion(id, imagen_path, imagenes_paths) {
  const supabase = getAdminClient();

  const pathsToDelete = [];
  if (imagen_path) pathsToDelete.push(imagen_path);
  if (imagenes_paths && Array.isArray(imagenes_paths)) pathsToDelete.push(...imagenes_paths);
  if (pathsToDelete.length > 0) {
    await supabase.storage.from("imagenes").remove(pathsToDelete);
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
