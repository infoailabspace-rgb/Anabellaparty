// Vienreizēja migrācija: lib/products.ts + lib/faq.ts → Supabase.
// Palaist: npm run migrate-products
// Pārbauda, ka tabula tukša (nedublē). Pieteicas kā admin (RLS atļauj insert).
import { createClient } from "@supabase/supabase-js";
import { products } from "../lib/products.ts";
import { faqItems } from "../lib/faq.ts";

const url = process.env.NEXT_PUBLIC_SB_URL || "https://uewpetpyckpuzqywtcmf.supabase.co";
const anon =
  process.env.NEXT_PUBLIC_SB_ANON_KEY ||
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVld3BldHB5Y2twdXpxeXd0Y21mIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODU5NTQzODQsImV4cCI6MjEwMTUzMDM4NH0.v1QgdReGVJs-3fbGkoEjepnwVvPzKfOaEJ15HlbUesg";

const ADMIN_EMAIL = process.env.MIGRATE_ADMIN_EMAIL || "testadmin@anabellaparty.lv";
const ADMIN_PW = process.env.MIGRATE_ADMIN_PW || "AnabellaTest2026!";

const sb = createClient(url, anon, { auth: { persistSession: false } });

const { error: le } = await sb.auth.signInWithPassword({
  email: ADMIN_EMAIL,
  password: ADMIN_PW,
});
if (le) {
  console.error("Login neizdevās:", le.message);
  process.exit(1);
}

const { count } = await sb
  .from("products")
  .select("*", { count: "exact", head: true });
if ((count ?? 0) > 0) {
  console.log(`products jau satur ${count} ierakstus — izlaižu (nedublēju).`);
  process.exit(0);
}

const productRows = products.map((p, i) => ({
  slug: p.slug,
  category: p.category,
  sort_order: i,
  is_active: true,
  is_featured: Boolean(p.featured),
  name: { lv: p.name },
  tagline: { lv: p.tagline },
  description: { lv: p.description },
  includes: p.includes ? { lv: p.includes } : null,
  tiers: p.tiers,
  hourly_extra: p.hourlyExtra ?? null,
  add_ons: p.addOns ?? null,
  contact_only: Boolean(p.contactOnly),
  specs: p.specs ?? null,
  alt_phone: p.altPhone ?? null,
  cover_image: p.coverImage,
  gallery: p.gallery,
}));

const { error: pe } = await sb.from("products").insert(productRows);
if (pe) {
  console.error("Produktu insert kļūda:", pe.message);
  process.exit(1);
}

const faqRows = faqItems.map((f, i) => ({
  category: f.category,
  question: { lv: f.question },
  answer: { lv: f.answer },
  sort_order: i,
  is_published: true,
}));
const { error: fe } = await sb.from("site_faqs").insert(faqRows);
if (fe) {
  console.error("FAQ insert kļūda:", fe.message);
  process.exit(1);
}

console.log(`OK: ${productRows.length} produkti, ${faqRows.length} BUJ.`);
process.exit(0);
