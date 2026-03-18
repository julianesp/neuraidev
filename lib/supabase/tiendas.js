import { createClient } from "@/lib/db";

/**
 * Obtiene el perfil de tienda de un usuario por su clerk_user_id
 */
export async function obtenerTiendaPorUsuario(clerkUserId) {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("tiendas")
    .select("*")
    .eq("clerk_user_id", clerkUserId)
    .single();

  if (error && error.code !== "PGRST116") {
    console.error("Error obteniendo tienda:", error);
    return null;
  }
  return data || null;
}

/**
 * Crea el perfil de tienda para un usuario nuevo
 */
export async function crearTienda({ clerkUserId, nombre, descripcion, logo_url, categoria, ciudad, telefono }) {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("tiendas")
    .insert({
      clerk_user_id: clerkUserId,
      nombre,
      descripcion,
      logo_url: logo_url || null,
      categoria,
      ciudad: ciudad || null,
      telefono: telefono || null,
      onboarding_completado: true,
    })
    .select()
    .single();

  if (error) {
    console.error("Error creando tienda:", error);
    throw new Error("No se pudo crear el perfil de la tienda");
  }
  return data;
}

/**
 * Actualiza el perfil de una tienda
 */
export async function actualizarTienda(clerkUserId, campos) {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("tiendas")
    .update({ ...campos, updated_at: new Date().toISOString() })
    .eq("clerk_user_id", clerkUserId)
    .select()
    .single();

  if (error) {
    console.error("Error actualizando tienda:", error);
    throw new Error("No se pudo actualizar el perfil de la tienda");
  }
  return data;
}

/**
 * Verifica si el usuario ya completó el onboarding
 */
export async function onboardingCompletado(clerkUserId) {
  const tienda = await obtenerTiendaPorUsuario(clerkUserId);
  return tienda?.onboarding_completado === true;
}
