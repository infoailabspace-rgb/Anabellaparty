import { createClient } from "@supabase/supabase-js";

// Publiskā (anon) lasīšana bez sesijas. Kešo lasījumus (revalidate 1h), lai
// publiskie maršruti paliek STATISKI/ISR — Next 15 fetch noklusējums ir no-store,
// kas citādi padarītu maršrutu dinamisku (augsts TTFB). Admin satura izmaiņas
// publiskajās lapās parādās ≤1 h laikā (ISR revalidācija).
export function publicClient() {
  const url = process.env.NEXT_PUBLIC_SB_URL;
  const key = process.env.NEXT_PUBLIC_SB_ANON_KEY;
  if (!url || !key) return null;
  return createClient(url, key, {
    auth: { persistSession: false },
    global: {
      // tags → admin saglabāšana izsauc revalidateTag("public-content") tūlītējai
      // atsvaidzināšanai (citādi revalidate 1h).
      fetch: (input: RequestInfo | URL, init?: RequestInit) =>
        fetch(input, {
          ...init,
          next: { revalidate: 3600, tags: ["public-content"] },
        }),
    },
  });
}
