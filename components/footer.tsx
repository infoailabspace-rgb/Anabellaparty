import Image from "next/image";
import { getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { SocialLinks } from "@/components/social-icons";
import { COMPANY, legalLineShort, fullAddress } from "@/lib/company";

export default async function Footer() {
  const t = await getTranslations("footer");
  return (
    <footer className="border-t border-gold/30 bg-navy/40">
      <div className="mx-auto grid max-w-6xl gap-8 px-6 py-12 sm:grid-cols-3">
        <div>
          <Image
            src="/logo/logo-full.png"
            alt="Anabella Party — Svētku inventārs"
            width={500}
            height={500}
            className="h-24 w-auto"
          />
          <p className="mt-2 text-sm text-text/70">{t("description")}</p>
        </div>

        <div>
          <h4 className="font-display text-sm font-semibold text-text">
            {t("kontakti")}
          </h4>
          <ul className="mt-3 space-y-2 text-sm text-text/70">
            <li>
              <a
                href={COMPANY.contact.whatsapp}
                className="transition-colors hover:text-gold"
              >
                {COMPANY.contact.phoneDisplay} (WhatsApp)
              </a>
            </li>
            <li>
              <a
                href={`mailto:${COMPANY.contact.email}`}
                className="transition-colors hover:text-gold"
              >
                {COMPANY.contact.email}
              </a>
            </li>
            <li>{fullAddress}</li>
          </ul>
        </div>

        <div>
          <h4 className="font-display text-sm font-semibold text-text">
            {t("informacija")}
          </h4>
          <ul className="mt-3 space-y-2 text-sm text-text/70">
            <li>
              <Link href="/faq" className="transition-colors hover:text-gold">
                {t("faq")}
              </Link>
            </li>
            <li>
              <Link
                href="/musu-draugi"
                className="transition-colors hover:text-gold"
              >
                {t("musuDraugi")}
              </Link>
            </li>
            <li>
              <Link href="/blogs" className="transition-colors hover:text-gold">
                {t("blogs")}
              </Link>
            </li>
            <li>
              <a
                href="https://aiparty-infoailabspace-7279s-projects.vercel.app"
                target="_blank"
                rel="noopener noreferrer"
                className="transition-colors hover:text-gold"
              >
                Pasākumu Stacija
              </a>
            </li>
            <li>
              <Link
                href="/noteikumi"
                className="transition-colors hover:text-gold"
              >
                {t("noteikumi")}
              </Link>
            </li>
            <li>
              <Link
                href="/privatuma-politika"
                className="transition-colors hover:text-gold"
              >
                {t("privatums")}
              </Link>
            </li>
            <li>
              <Link
                href="/sikdatnu-politika"
                className="transition-colors hover:text-gold"
              >
                {t("sikdatnes")}
              </Link>
            </li>
            <li className="pt-2">
              <SocialLinks />
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
