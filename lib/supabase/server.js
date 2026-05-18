/**
 * lib/supabase/server.js - Redirige al cliente D1 para compatibilidad
 */
import { getSupabaseClient } from '../db';

export async function createClient() {
  return getSupabaseClient();
}
