"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut } from "./actions";

type Item = { href: string; label: string; icon: string };
type Group = { title: string; icon: string; items: Item[] };

const GROUPS: Group[] = [
  {
    title: "Bizness",
    icon: "📊",
    items: [
      { href: "/admin/parskats", label: "Pārskats", icon: "📊" },
      { href: "/admin", label: "Pieteikumi", icon: "📥" },
      { href: "/admin/rezervacijas", label: "Rezervācijas", icon: "✅" },
      { href: "/admin/arhivs", label: "Arhīvs", icon: "🗃️" },
      { href: "/admin/kalendars", label: "Kalendārs", icon: "📅" },
      { href: "/admin/crm-klienti", label: "CRM Klienti", icon: "👥" },
      { href: "/admin/rekini", label: "Rēķini", icon: "🧾" },
      { href: "/admin/inventars", label: "Inventārs", icon: "📦" },
      { href: "/admin/tiriba", label: "Tīrība", icon: "🧽" },
      { href: "/admin/noliktava", label: "Noliktava", icon: "🗄️" },
    ],
  },
  {
    title: "Saturs",
    icon: "🎨",
    items: [
      { href: "/admin/saturs", label: "Saturs", icon: "📝" },
      { href: "/admin/lapas", label: "Lapas", icon: "📄" },
      { href: "/admin/ai-foto", label: "AI foto", icon: "🤖" },
      { href: "/admin/atsauksmes", label: "Atsauksmes", icon: "⭐" },
      { href: "/admin/klienti", label: "Klientu logo", icon: "🏷️" },
      { href: "/admin/partneri", label: "Partneri", icon: "🤝" },
      { href: "/admin/galerija", label: "Galerija", icon: "🖼️" },
      { href: "/admin/blogs", label: "Blogs", icon: "✍️" },
      { href: "/admin/faq", label: "BUJ", icon: "❓" },
    ],
  },
];

function isActive(pathname: string, href: string): boolean {
  // "/admin" (Pieteikumi) tikai precīzā sakritībā — citādi tas būtu vienmēr aktīvs.
  if (href === "/admin") return pathname === "/admin";
  return pathname === href || pathname.startsWith(href + "/");
}

export default function AdminShell({
  email,
  children,
}: {
  email: string | undefined;
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  const nav = (
    <nav className="flex-1 space-y-6 overflow-y-auto px-3 py-4">
      {GROUPS.map((g) => (
        <div key={g.title}>
          <p className="px-2 pb-2 text-[11px] font-semibold uppercase tracking-wider text-gold/60">
            <span className="mr-1">{g.icon}</span>
            {g.title}
          </p>
          <ul className="space-y-0.5">
            {g.items.map((it) => {
              const active = isActive(pathname, it.href);
              return (
                <li key={it.href}>
                  <Link
                    href={it.href}
                    onClick={() => setOpen(false)}
                    className={`flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm transition-colors ${
                      active
                        ? "bg-gold/15 font-semibold text-gold"
                        : "text-text/70 hover:bg-gold/10 hover:text-gold"
                    }`}
                  >
                    <span className="w-5 shrink-0 text-center text-base">
                      {it.icon}
                    </span>
                    {it.label}
                  </Link>
                </li>
              );
            })}
          </ul>
        </div>
      ))}
    </nav>
  );

  return (
    <div className="min-h-screen bg-bg text-text">
      {/* Mobilā augšējā josla ar hamburgeru */}
      <div className="sticky top-0 z-30 flex items-center gap-3 border-b border-gold/25 bg-navy/80 px-4 py-3 backdrop-blur md:hidden">
        <button
          onClick={() => setOpen(true)}
          aria-label="Atvērt izvēlni"
          className="text-2xl leading-none text-gold"
        >
          ☰
        </button>
        <span className="font-display font-bold text-gold">Anabella admin</span>
      </div>

      {/* Fona pārklājums (mobilajā) */}
      {open && (
        <div
          onClick={() => setOpen(false)}
          className="fixed inset-0 z-30 bg-black/50 md:hidden"
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed inset-y-0 left-0 z-40 flex w-60 flex-col border-r border-gold/25 bg-navy/95 transition-transform duration-200 md:translate-x-0 ${
          open ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="flex items-center justify-between border-b border-gold/20 px-4 py-4">
          <span className="font-display text-lg font-bold text-gold">
            Anabella admin
          </span>
          <button
            onClick={() => setOpen(false)}
            aria-label="Aizvērt izvēlni"
            className="text-xl leading-none text-text/60 hover:text-gold md:hidden"
          >
            ✕
          </button>
        </div>

        {nav}

        {/* Apakšā: lietotājs + iziet */}
        <div className="border-t border-gold/20 px-4 py-4">
          <p className="mb-2 truncate text-xs text-text/50">{email}</p>
          <form action={signOut}>
            <button
              type="submit"
              className="w-full rounded-full border border-gold/40 px-4 py-1.5 text-sm font-semibold text-text/80 transition-colors hover:border-gold hover:text-gold"
            >
              Iziet
            </button>
          </form>
        </div>
      </aside>

      {/* Saturs */}
      <div className="md:ml-60">
        <main className="mx-auto max-w-6xl px-6 py-8">{children}</main>
      </div>
    </div>
  );
}
