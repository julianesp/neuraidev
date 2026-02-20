import { createClient } from "./client";

/**
 * Obtener todos los artículos publicados
 */
export async function getPublishedPosts(category = null) {
  const supabase = createClient();

  let query = supabase
    .from("blog_posts")
    .select("*")
    .eq("published", true)
    .order("published_at", { ascending: false });

  if (category && category !== "Todos") {
    query = query.eq("category", category);
  }

  const { data, error } = await query;

  if (error) {
    console.error("Error fetching posts:", error);
    return [];
  }

  return data || [];
}

/**
 * Obtener un artículo por su slug
 */
export async function getPostBySlug(slug) {
  const supabase = createClient();

  const { data, error } = await supabase
    .from("blog_posts")
    .select("*")
    .eq("slug", slug)
    .eq("published", true)
    .single();

  if (error) {
    console.error("Error fetching post:", error);
    return null;
  }

  return data;
}

/**
 * Incrementar el contador de vistas de un artículo
 */
export async function incrementPostViews(slug) {
  const supabase = createClient();

  const { error } = await supabase.rpc("increment_post_views", {
    post_slug: slug,
  });

  if (error) {
    console.error("Error incrementing views:", error);
  }
}

/**
 * Obtener artículos destacados
 */
export async function getFeaturedPosts(limit = 3) {
  const supabase = createClient();

  const { data, error } = await supabase
    .from("blog_posts")
    .select("*")
    .eq("published", true)
    .eq("featured", true)
    .order("published_at", { ascending: false })
    .limit(limit);

  if (error) {
    console.error("Error fetching featured posts:", error);
    return [];
  }

  return data || [];
}

/**
 * Obtener artículos más vistos
 */
export async function getMostViewedPosts(limit = 5) {
  const supabase = createClient();

  const { data, error } = await supabase
    .from("blog_posts")
    .select("*")
    .eq("published", true)
    .order("views", { ascending: false })
    .limit(limit);

  if (error) {
    console.error("Error fetching most viewed posts:", error);
    return [];
  }

  return data || [];
}

/**
 * Buscar artículos por término
 */
export async function searchPosts(searchTerm) {
  const supabase = createClient();

  const { data, error } = await supabase
    .from("blog_posts")
    .select("*")
    .eq("published", true)
    .or(`title.ilike.%${searchTerm}%,excerpt.ilike.%${searchTerm}%,content.ilike.%${searchTerm}%`)
    .order("published_at", { ascending: false });

  if (error) {
    console.error("Error searching posts:", error);
    return [];
  }

  return data || [];
}

/**
 * Obtener todas las categorías únicas
 */
export async function getCategories() {
  const supabase = createClient();

  const { data, error } = await supabase
    .from("blog_posts")
    .select("category")
    .eq("published", true);

  if (error) {
    console.error("Error fetching categories:", error);
    return [];
  }

  const categories = [...new Set(data.map((post) => post.category))];
  return ["Todos", ...categories];
}
