import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { signOut } from "./actions";
import AdminShell from "./admin-shell";

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

  return <AdminShell email={user.email}>{children}</AdminShell>;
}
