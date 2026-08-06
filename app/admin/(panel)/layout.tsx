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
  if (!isAdmin) redirect("/admin/login");

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
              <Link
                href="/admin/inventars"
                className="text-text/80 hover:text-gold"
              >
                Inventārs
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
