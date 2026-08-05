"use client";

import Link from "next/link";
import { useState } from "react";

const links = [
  { href: "/", label: "Sākums" },
  { href: "/foto-kaste", label: "Foto kastes" },
  { href: "/piepusamas-atrakcijas", label: "Atrakcijas" },
  { href: "/svinibu-inventars", label: "Inventārs" },
  { href: "/kontakti", label: "Kontakti" },
];

export default function Navbar() {
  const [open, setOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 border-b border-gold/30 bg-bg/80 backdrop-blur-md">
      <nav className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
        <Link
          href="/"
          className="font-display text-xl font-bold tracking-tight text-gold"
          onClick={() => setOpen(false)}
        >
          Anabella Party
        </Link>

        {/* Desktop */}
        <div className="hidden items-center gap-8 md:flex">
          {links.map((l) => (
            <Link
              key={l.href}
              href={l.href}
              className="text-sm text-text/80 transition-colors hover:text-gold"
            >
              {l.label}
            </Link>
          ))}
          <Link
            href="/rezervet"
            className="rounded-full bg-gold px-5 py-2 text-sm font-semibold text-black transition-shadow hover:shadow-[0_0_20px_rgba(212,169,96,0.5)]"
          >
            Rezervēt
          </Link>
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
          <div className="flex flex-col gap-4">
            {links.map((l) => (
              <Link
                key={l.href}
                href={l.href}
                onClick={() => setOpen(false)}
                className="text-text/90 transition-colors hover:text-gold"
              >
                {l.label}
              </Link>
            ))}
            <Link
              href="/rezervet"
              onClick={() => setOpen(false)}
              className="rounded-full bg-gold px-5 py-2 text-center font-semibold text-black"
            >
              Rezervēt
            </Link>
          </div>
        </div>
      )}
    </header>
  );
}
