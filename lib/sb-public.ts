import { createClient } from "@supabase/supabase-js";

// Publiskā (anon) lasīšana bez sesijas — ļauj ISR kešošanu.
export function publicClient() {
  const url = process.env.NEXT_PUBLIC_SB_URL;
  const key = process.env.NEXT_PUBLIC_SB_ANON_KEY;
  if (!url || !key) return null;
  return createClient(url, key, { auth: { persistSession: false } });
}
