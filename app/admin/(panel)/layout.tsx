import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { signOut } from "./actions";

export const metadata: Metadata = {
  title: "Admin — Anabella Party",
  robots: { index: false, follow: false },
};

export default async function PanelLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/admin/login");

  const { data: isAdmin } = await supabase.rpc("is_admin");
  // Pieslēdzies, bet nav administrators → "Nav piekļuves" lapa (NE redirect,
  // citādi rastos bezgalīga pāradresācija ar middleware).
  if (!isAdmin) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-bg px-6 text-center">
        <div className="w-full max-w-md rounded-2xl border border-gold/25 bg-navy/40 p-8">
          <h1 className="font-display text-2xl font-bold text-gold">
            Nav piekļuves
          </h1>
          <p className="mt-3 text-sm text-text/70">
            Šis konts ({user.email}) nav pievienots administratoriem. Ja tā ir
            kļūda, sazinies ar lapas administratoru.
          </p>
          <form action={signOut} className="mt-6">
            <button
              type="submit"
              className="rounded-full border border-gold/40 px-6 py-2.5 text-sm font-semibold text-text/80 transition-colors hover:border-gold hover:text-gold"
            >
              Izrakstīties
            </button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-bg text-text">
      <header className="sticky top-0 z-10 border-b border-gold/25 bg-navy/80 backdrop-blur">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-3">
          <div className="flex items-center gap-6">
            <span className="font-display font-bold text-gold">Anabella admin</span>
            <nav className="flex gap-4 text-sm">
              <Link href="/admin" className="text-text/80 hover:text-gold">
                Pieteikumi
              </Link>
              <Link
                href="/admin/kalendars"
                className="text-text/80 hover:text-gold"
              >
                Kalendārs
              </Link>
              <Link href="/admin/rekini" className="text-text/80 hover:text-gold">
                Rēķini
              </Link>
              <Link
                href="/admin/inventars"
                className="text-text/80 hover:text-gold"
              >
                Inventārs
              </Link>
              <Link href="/admin/tiriba" className="text-text/80 hover:text-gold">
                Tīrība
              </Link>
              <Link href="/admin/noliktava" className="text-text/80 hover:text-gold">
                Noliktava
              </Link>
              <Link href="/admin/saturs" className="text-text/80 hover:text-gold">
                Saturs
              </Link>
              <Link href="/admin/lapas" className="text-text/80 hover:text-gold">
                Lapas
              </Link>
              <Link href="/admin/ai-foto" className="text-text/80 hover:text-gold">
                AI foto
              </Link>
              <Link href="/admin/atsauksmes" className="text-text/80 hover:text-gold">
                Atsauksmes
              </Link>
              <Link
                href="/admin/crm-klienti"
                className="text-text/80 hover:text-gold"
              >
                CRM Klienti
              </Link>
              <Link href="/admin/klienti" className="text-text/80 hover:text-gold">
                Klientu logo
              </Link>
              <Link href="/admin/partneri" className="text-text/80 hover:text-gold">
                Partneri
              </Link>
              <Link href="/admin/galerija" className="text-text/80 hover:text-gold">
                Galerija
              </Link>
              <Link href="/admin/blogs" className="text-text/80 hover:text-gold">
                Blogs
              </Link>
              <Link href="/admin/faq" className="text-text/80 hover:text-gold">
                BUJ
              </Link>
            </nav>
          </div>
          <div className="flex items-center gap-4 text-sm">
            <span className="hidden text-text/50 sm:inline">{user.email}</span>
            <form action={signOut}>
              <button
                type="submit"
                className="rounded-full border border-gold/40 px-4 py-1.5 font-semibold text-text/80 transition-colors hover:border-gold hover:text-gold"
              >
                Iziet
              </button>
            </form>
          </div>
        </div>
      </header>
      <main className="mx-auto max-w-6xl px-6 py-8">{children}</main>
    </div>
  );
}
