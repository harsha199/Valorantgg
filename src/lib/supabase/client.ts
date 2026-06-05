import { createBrowserClient } from '@supabase/ssr';

export function createClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

  return createBrowserClient(supabaseUrl, supabaseAnonKey);
}

// For legacy code compatibility (where it was used as a singleton), but creating per request is safer.
// If needed globally:
export const supabase = createClient();

export function getSupabaseClient() {
  return supabase;
}
