import Image from "next/image";
import { getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { SocialLinks } from "@/components/social-icons";
import { COMPANY, legalLineShort, fullAddress } from "@/lib/company";

export default async function Footer() {
  const t = await getTranslations("footer");
  const linkCls = "transition-colors hover:text-gold";
  return (
    <footer className="border-t border-gold/30 bg-navy/40">
      <div className="mx-auto grid max-w-6xl gap-8 px-6 py-12 sm:grid-cols-2 lg:grid-cols-4">
        {/* Zīmols + kontakti */}
        <div>
          <Image
            src="/logo/logo-full.png"
            alt="Anabella Party — Svētku inventārs"
            width={500}
            height={500}
            className="h-24 w-auto"
          />
          <p className="mt-2 text-sm text-text/70">{t("description")}</p>
          <ul className="mt-4 space-y-2 text-sm text-text/70">
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
          <div className="mt-4">
            <SocialLinks />
          </div>
        </div>

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
            <li className="cursor-default text-text/50">
              {t("pasakumuStacija")}{" "}
              <span className="text-text/40">({t("drizuma")})</span>
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

      <div className="border-t border-gold/10 py-4 text-center text-xs text-text/50">
        <p>{legalLineShort}</p>
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
