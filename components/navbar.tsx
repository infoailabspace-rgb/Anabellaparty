"use client";

import Link from "next/link";
import Image from "next/image";
import { useState } from "react";
import { SocialLinks } from "@/components/social-icons";

type NavLink = { href: string; label: string };
type NavItem = { label: string; href?: string; children?: NavLink[] };

const nav: NavItem[] = [
  { label: "Sākums", href: "/" },
  {
    label: "Foto kastes",
    children: [
      { href: "/foto-kaste", label: "Foto kastes" },
      { href: "/foto-kaste/ai-foto", label: "AI foto" },
    ],
  },
  { label: "Atrakcijas", href: "/piepusamas-atrakcijas" },
  {
    label: "Svinību inventārs",
    children: [
      { href: "/svinibu-inventars", label: "Viss inventārs" },
      {
        href: "/svinibu-inventars/audio-viesu-gramatas",
        label: "Audio/video viesu grāmatas",
      },
      { href: "/svinibu-inventars/specefekti", label: "Specefekti" },
      { href: "/svinibu-inventars/decomebeles", label: "Deco / mēbeles" },
      { href: "/svinibu-inventars/kublsballa", label: "Kubli / pirts" },
    ],
  },
  { label: "Kontakti", href: "/kontakti" },
];

export default function Navbar() {
  const [open, setOpen] = useState(false);
  const close = () => setOpen(false);

  return (
    <header className="sticky top-0 z-50 border-b border-gold/30 bg-bg/80 backdrop-blur-md">
      <nav className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
        <Link
          href="/"
          aria-label="Anabella Party — sākums"
          onClick={close}
          className="transition-opacity hover:opacity-90"
        >
          <Image
            src="/logo/logo-full.png"
            alt="Anabella Party — Svētku inventārs"
            width={500}
            height={500}
            priority
            className="h-12 w-auto md:h-14"
          />
        </Link>

        {/* Desktop */}
        <div className="hidden items-center gap-7 md:flex">
          {nav.map((item) =>
            item.children ? (
              <div key={item.label} className="group relative">
                <button
                  type="button"
                  className="flex items-center gap-1 text-sm text-text/80 transition-colors hover:text-gold group-focus-within:text-gold"
                >
                  {item.label}
                  <span aria-hidden className="text-xs">
                    ▾
                  </span>
                </button>
                <div className="invisible absolute left-0 top-full z-50 min-w-56 pt-3 opacity-0 transition-all group-hover:visible group-hover:opacity-100 group-focus-within:visible group-focus-within:opacity-100">
                  <div className="rounded-xl border border-gold/25 bg-navy/95 p-2 shadow-2xl backdrop-blur">
                    {item.children.map((c) => (
                      <Link
                        key={c.href}
                        href={c.href}
                        className="block rounded-lg px-4 py-2 text-sm text-text/85 transition-colors hover:bg-gold/10 hover:text-gold"
                      >
                        {c.label}
                      </Link>
                    ))}
                  </div>
                </div>
              </div>
            ) : (
              <Link
                key={item.href}
                href={item.href!}
                className="text-sm text-text/80 transition-colors hover:text-gold"
              >
                {item.label}
              </Link>
            ),
          )}
          <Link
            href="/rezervet"
            className="rounded-full bg-gold px-5 py-2 text-sm font-semibold text-black transition-shadow hover:shadow-[0_0_20px_rgba(212,169,96,0.5)]"
          >
            Rezervēt
          </Link>
          <SocialLinks className="border-l border-gold/20 pl-4" iconClassName="h-5 w-5" />
        </div>

        {/* Mobile toggle */}
        <button
          type="button"
          aria-label="Izvēlne"
          aria-expanded={open}
          onClick={() => setOpen((v) => !v)}
          className="flex flex-col gap-1.5 md:hidden"
        >
          <span
            className={`h-0.5 w-6 bg-gold transition-transform ${
              open ? "translate-y-2 rotate-45" : ""
            }`}
          />
          <span
            className={`h-0.5 w-6 bg-gold transition-opacity ${
              open ? "opacity-0" : ""
            }`}
          />
          <span
            className={`h-0.5 w-6 bg-gold transition-transform ${
              open ? "-translate-y-2 -rotate-45" : ""
            }`}
          />
        </button>
      </nav>

      {/* Mobile menu */}
      {open && (
        <div className="border-t border-gold/20 bg-bg/95 px-6 py-4 md:hidden">
          <div className="flex flex-col gap-1">
            {nav.map((item) =>
              item.children ? (
                <div key={item.label} className="py-2">
                  <p className="text-xs uppercase tracking-wide text-text/50">
                    {item.label}
                  </p>
                  <div className="mt-2 flex flex-col gap-2 pl-3">
                    {item.children.map((c) => (
                      <Link
                        key={c.href}
                        href={c.href}
                        onClick={close}
                        className="text-text/90 transition-colors hover:text-gold"
                      >
                        {c.label}
                      </Link>
                    ))}
                  </div>
                </div>
              ) : (
                <Link
                  key={item.href}
                  href={item.href!}
                  onClick={close}
                  className="py-2 text-text/90 transition-colors hover:text-gold"
                >
                  {item.label}
                </Link>
              ),
            )}
            <Link
              href="/rezervet"
              onClick={close}
              className="mt-3 rounded-full bg-gold px-5 py-2 text-center font-semibold text-black"
            >
              Rezervēt
            </Link>
            <SocialLinks className="mt-4 justify-center" iconClassName="h-6 w-6" />
          </div>
        </div>
      )}
    </header>
  );
}
