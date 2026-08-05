import { createClient, type SupabaseClient } from "@supabase/supabase-js";

/**
 * Servera puses Supabase klients pieteikumu ierakstīšanai.
 * Lieto service_role atslēgu, ja pieejama, citādi anon (RLS atļauj anon insert).
 * Atgriež null, ja env nav konfigurēts — route to apstrādā graceful.
 */
export function getSupabaseServer(): SupabaseClient | null {
  const url = process.env.NEXT_PUBLIC_SB_URL;
  const key =
    process.env.SB_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SB_ANON_KEY;
  if (!url || !key) return null;
  return createClient(url, key, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
}
