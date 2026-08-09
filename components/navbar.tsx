"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import { useTranslations } from "next-intl";
import { motion, useReducedMotion } from "framer-motion";
import { Link, usePathname } from "@/i18n/navigation";
import LocaleSwitcher from "@/components/locale-switcher";
import {
  InstagramIcon,
  FacebookIcon,
  WhatsAppIcon,
} from "@/components/social-icons";

type NavLink = { href: string; label: string };
type NavItem = { label: string; href?: string; children?: NavLink[] };

const linkBase =
  "whitespace-nowrap rounded-full border px-4 py-2 text-[13px] xl:text-sm transition-colors duration-200";

const AIPARTY_URL = "https://aiparty-infoailabspace-7279s-projects.vercel.app";

export default function Navbar() {
  const t = useTranslations("nav");
  const pathname = usePathname();
  const reduce = useReducedMotion();
  const [open, setOpen] = useState(false);
  const close = () => setOpen(false);

  // Dropdown: JS kontrole ar aizvēršanas aizturi (150ms), lai neaizvērtos,
  // ejot no pogas uz izvēlni. Tikai viena izvēlne atvērta vienlaikus.
  const [openMenu, setOpenMenu] = useState<string | null>(null);
  const closeTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const navRef = useRef<HTMLElement | null>(null);
  const openDrop = (label: string) => {
    if (closeTimer.current) clearTimeout(closeTimer.current);
    setOpenMenu(label);
  };
  const scheduleClose = () => {
    if (closeTimer.current) clearTimeout(closeTimer.current);
    closeTimer.current = setTimeout(() => setOpenMenu(null), 150);
  };

  // Ceļa maiņa → aizver izvēlnes.
  useEffect(() => {
    setOpenMenu(null);
    setOpen(false);
  }, [pathname]);

  // Esc + klikšķis ārpusē + cleanup.
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpenMenu(null);
    };
    const onDown = (e: MouseEvent) => {
      if (navRef.current && !navRef.current.contains(e.target as Node))
        setOpenMenu(null);
    };
    document.addEventListener("keydown", onKey);
    document.addEventListener("mousedown", onDown);
    return () => {
      document.removeEventListener("keydown", onKey);
      document.removeEventListener("mousedown", onDown);
      if (closeTimer.current) clearTimeout(closeTimer.current);
    };
  }, []);

  // Sākumlapā logo/"Sākums" klikšķis ritina uz augšu, nevis pārlādē.
  const onHomeClick = (e: React.MouseEvent) => {
    close();
    if (pathname === "/") {
      e.preventDefault();
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  const nav: NavItem[] = [
    { label: t("sakums"), href: "/" },
    {
      label: t("fotoKastes"),
      children: [
        { href: "/foto-kaste", label: t("fotoKastes") },
        { href: "/foto-kaste/ai-foto", label: t("aiFoto") },
      ],
    },
    { label: t("atrakcijas"), href: "/piepusamas-atrakcijas" },
    {
      label: t("sviniburInventars"),
      children: [
        { href: "/svinibu-inventars", label: t("vissInventars") },
        {
          href: "/svinibu-inventars/audio-viesu-gramatas",
          label: t("audioVideo"),
        },
        { href: "/svinibu-inventars/specefekti", label: t("specefekti") },
        { href: "/svinibu-inventars/decomebeles", label: t("deco") },
        { href: "/svinibu-inventars/kublsballa", label: t("kubli") },
      ],
    },
    { label: t("musuDraugi"), href: "/musu-draugi" },
    { label: t("blogs"), href: "/blogs" },
    { label: t("kontakti"), href: "/kontakti" },
  ];

  const isActive = (item: NavItem) =>
    item.href
      ? pathname === item.href
      : (item.children?.some((c) => pathname === c.href) ?? false);

  return (
    <header
      ref={navRef}
      className="sticky top-0 z-50 border-b border-gold/30 bg-bg/80 backdrop-blur-md"
    >
      <nav className="mx-auto flex h-20 max-w-[1600px] items-center justify-between px-6 md:h-24 lg:px-10">
        <Link
          href="/"
          aria-label={t("sakumsAria")}
          onClick={onHomeClick}
          className="shrink-0 transition-opacity hover:opacity-90"
        >
          <Image
            src="/logo/logo-full.png"
            alt="Anabella Party — Svētku inventārs"
            width={500}
            height={500}
            priority
            className="h-12 w-auto md:h-16"
          />
        </Link>

        {/* Desktop */}
        <div className="ml-10 hidden items-center gap-1 lg:flex">
          {nav.map((item) => {
            const active = isActive(item);
            return item.children ? (
              <div
                key={item.label}
                className="relative"
                onMouseEnter={() => openDrop(item.label)}
                onMouseLeave={scheduleClose}
              >
                <button
                  type="button"
                  aria-expanded={openMenu === item.label}
                  onClick={() =>
                    setOpenMenu((m) => (m === item.label ? null : item.label))
                  }
                  className={`flex items-center gap-1 ${linkBase} ${
                    active || openMenu === item.label
                      ? "border-gold/40 text-gold/90"
                      : "border-transparent text-text/80 hover:border-gold hover:text-gold"
                  }`}
                >
                  {item.label}
                  <span aria-hidden className="text-xs">
                    ▾
                  </span>
                </button>
                {openMenu === item.label && (
                  <div className="absolute left-0 top-full z-50 min-w-56 pt-3">
                    <div className="anabella-drop rounded-xl border border-gold/25 bg-navy p-2 shadow-2xl shadow-black/50">
                      {item.children.map((c) => (
                        <Link
                          key={c.href}
                          href={c.href}
                          className="block whitespace-nowrap rounded-lg px-5 py-2.5 text-sm text-text/85 transition-colors hover:bg-gold hover:text-black"
                        >
                          {c.label}
                        </Link>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <Link
                key={item.href}
                href={item.href!}
                onClick={item.href === "/" ? onHomeClick : undefined}
                className={`${linkBase} ${
                  active
                    ? "border-gold/40 text-gold/90"
                    : "border-transparent text-text/80 hover:border-gold hover:text-gold"
                }`}
              >
                {item.label}
              </Link>
            );
          })}
          <a
            href={AIPARTY_URL}
            target="_blank"
            rel="noopener noreferrer"
            className={`${linkBase} border-transparent text-text/80 hover:border-gold hover:text-gold`}
          >
            AI Party
          </a>
          <Link
            href="/rezervet"
            className="ml-6 whitespace-nowrap rounded-full bg-gold px-5 py-2 text-[13px] font-semibold text-black transition-transform hover:scale-[1.04] hover:shadow-[0_0_20px_rgba(212,169,96,0.5)] xl:text-sm"
          >
            {t("rezervet")}
          </Link>
          <LocaleSwitcher className="ml-6 border-l border-gold/20 pl-6" />
          <NavSocials
            reduce={!!reduce}
            className="ml-4 hidden border-l border-gold/20 pl-4 xl:flex"
          />
        </div>

        {/* Mobile toggle */}
        <button
          type="button"
          aria-label={t("izvelne")}
          aria-expanded={open}
          onClick={() => setOpen((v) => !v)}
          className="flex flex-col gap-1.5 lg:hidden"
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
        <div className="border-t border-gold/20 bg-bg/95 px-6 py-4 lg:hidden">
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
                  onClick={item.href === "/" ? onHomeClick : close}
                  className="py-2 text-text/90 transition-colors hover:text-gold"
                >
                  {item.label}
                </Link>
              ),
            )}
            <a
              href={AIPARTY_URL}
              target="_blank"
              rel="noopener noreferrer"
              onClick={close}
              className="py-2 text-text/90 transition-colors hover:text-gold"
            >
              AI Party
            </a>
            <Link
              href="/rezervet"
              onClick={close}
              className="mt-3 rounded-full bg-gold px-5 py-2 text-center font-semibold text-black"
            >
              {t("rezervet")}
            </Link>
            <div className="mt-4 flex items-center justify-center gap-4">
              <LocaleSwitcher />
              <NavSocials reduce={!!reduce} />
            </div>
          </div>
        </div>
      )}
    </header>
  );
}

// Sociālās ikonas: Instagram/Facebook statiskas; WhatsApp lēkā ik 4 sekundes.
function NavSocials({
  reduce,
  className = "flex",
}: {
  reduce: boolean;
  className?: string;
}) {
  return (
    <div className={`items-center gap-4 ${className}`}>
      <a
        href="https://www.instagram.com/anabella_svetku_inventars/"
        target="_blank"
        rel="noopener noreferrer"
        aria-label="Instagram"
        className="text-gold transition-colors hover:text-rose-gold"
      >
        <InstagramIcon className="h-5 w-5" />
      </a>
      <a
        href="https://www.facebook.com/anabellaparty.lv"
        target="_blank"
        rel="noopener noreferrer"
        aria-label="Facebook"
        className="text-gold transition-colors hover:text-rose-gold"
      >
        <FacebookIcon className="h-5 w-5" />
      </a>
      <motion.a
        href="https://wa.me/37129222761"
        target="_blank"
        rel="noopener noreferrer"
        aria-label="WhatsApp"
        className="text-gold"
        animate={reduce ? undefined : { y: [0, -6, 0, -3, 0] }}
        transition={
          reduce
            ? undefined
            : {
                duration: 0.6,
                times: [0, 0.25, 0.5, 0.75, 1],
                repeat: Infinity,
                repeatDelay: 3.4,
              }
        }
        whileHover={{ scale: 1.15 }}
      >
        <WhatsAppIcon className="h-5 w-5" />
      </motion.a>
    </div>
  );
}
