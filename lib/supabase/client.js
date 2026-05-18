/**
 * lib/supabase/client.js - Redirige al cliente D1 para compatibilidad
 */
import { getSupabaseClient } from '../db';

export function createClient() {
  return getSupabaseClient();
}
