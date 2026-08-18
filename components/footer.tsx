import Image from "next/image";
import { getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { SocialLinks } from "@/components/social-icons";
import { COMPANY, fullAddress } from "@/lib/company";

export default async function Footer() {
  const t = await getTranslations("footer");
  const linkCls = "transition-colors hover:text-gold";
  return (
    <footer className="border-t border-gold/30 bg-navy/40">
      {/* 3 satura kolonnas — vienādi izplatītas, virsraksti vienā Y-līnijā */}
      <div className="mx-auto grid max-w-4xl gap-10 px-6 pb-10 pt-12 text-center sm:grid-cols-3 sm:text-left">
        {/* Pakalpojumi */}
        <div>
          <h4 className="font-display text-sm font-semibold text-text">
            {t("pakalpojumi")}
          </h4>
          <ul className="mt-3 space-y-2 text-sm text-text/70">
            <li>
              <Link href="/foto-kaste" className={linkCls}>
                {t("fotoKastes")}
              </Link>
            </li>
            <li>
              <Link href="/piepusamas-atrakcijas" className={linkCls}>
                {t("atrakcijas")}
              </Link>
            </li>
            <li>
              <Link href="/svinibu-inventars" className={linkCls}>
                {t("svinibuInventars")}
              </Link>
            </li>
            <li>
              <Link href="/foto-kaste/ai-foto" className={linkCls}>
                {t("aiFoto")}
              </Link>
            </li>
          </ul>
        </div>

        {/* Uzņēmums */}
        <div>
          <h4 className="font-display text-sm font-semibold text-text">
            {t("uznemums")}
          </h4>
          <ul className="mt-3 space-y-2 text-sm text-text/70">
            <li>
              <Link href="/musu-draugi" className={linkCls}>
                {t("musuDraugi")}
              </Link>
            </li>
            <li>
              <Link href="/blogs" className={linkCls}>
                {t("blogs")}
              </Link>
            </li>
            <li>
              <Link href="/faq" className={linkCls}>
                {t("faq")}
              </Link>
            </li>
            <li>
              <Link href="/kontakti" className={linkCls}>
                {t("kontakti")}
              </Link>
            </li>
          </ul>
        </div>

        {/* Juridiski */}
        <div>
          <h4 className="font-display text-sm font-semibold text-text">
            {t("juridiski")}
          </h4>
          <ul className="mt-3 space-y-2 text-sm text-text/70">
            <li>
              <Link href="/noteikumi" className={linkCls}>
                {t("noteikumi")}
              </Link>
            </li>
            <li>
              <Link href="/privatuma-politika" className={linkCls}>
                {t("privatums")}
              </Link>
            </li>
            <li>
              <Link href="/sikdatnu-politika" className={linkCls}>
                {t("sikdatnes")}
              </Link>
            </li>
          </ul>
        </div>
      </div>

      {/* Kontakti + sociālie — centrēti */}
      <div className="mx-auto max-w-3xl border-t border-gold/10 px-6 py-8 text-center text-sm text-text/70">
        <ul className="flex flex-col items-center gap-2 sm:flex-row sm:justify-center sm:gap-8">
          <li>
            <a href={COMPANY.contact.whatsapp} className={linkCls}>
              {COMPANY.contact.phoneDisplay} (WhatsApp)
            </a>
          </li>
          <li>
            <a href={`mailto:${COMPANY.contact.email}`} className={linkCls}>
              {COMPANY.contact.email}
            </a>
          </li>
          <li>{fullAddress}</li>
        </ul>
        <div className="mt-5 flex justify-center">
          <SocialLinks />
        </div>
      </div>

      {/* Rekvizīti — redzami bez klikšķa (grāmatvedība/iepirkumi meklē pirmajā vizītē) */}
      <div className="mx-auto max-w-3xl border-t border-gold/10 px-6 py-6 text-center">
        <h4 className="font-display text-sm font-semibold text-text">
          {t("rekviziti")}
        </h4>
        <ul className="mt-3 space-y-0.5 text-xs text-text/60">
          <li>{COMPANY.legalName}</li>
          <li>Reģ. nr. {COMPANY.regNr} · PVN reģ. nr. {COMPANY.vatNr}</li>
          <li>{fullAddress}</li>
          <li>
            {COMPANY.bank.name}: {COMPANY.bank.iban} · {COMPANY.bank.swift}
          </li>
        </ul>
      </div>

      {/* Logo — pašā apakšā, virs copyright rindas */}
      <div className="flex flex-col items-center gap-3 px-6 pb-8">
        <Image
          src="/logo/logo-full.png"
          alt="Anabella Party — Svētku inventārs"
          width={500}
          height={500}
          className="h-20 w-auto"
        />
        <p className="max-w-md text-center text-xs text-text/50">
          {t("description")}
        </p>
      </div>

      <div className="border-t border-gold/10 py-4 text-center text-xs text-text/50">
        <p>
          © {new Date().getFullYear()} Anabella Party. {t("visasTiesibas")}
        </p>
        <p className="mt-1 text-[10px] text-text/40">
          {t("izstradaja")}:{" "}
          <a
            href="https://ai-labspace.eu"
            target="_blank"
            rel="noopener noreferrer"
            className="underline-offset-2 transition-colors hover:text-gold hover:underline"
          >
            AI-Lab Space
          </a>
        </p>
      </div>
    </footer>
  );
}
