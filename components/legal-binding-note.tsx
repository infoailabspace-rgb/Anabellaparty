import { getLocale, getTranslations } from "next-intl/server";

// EN/RU juridiskajās lapās — piezīme, ka saistošā ir latviešu versija.
export default async function LegalBindingNote() {
  const locale = await getLocale();
  if (locale === "lv") return null;
  const t = await getTranslations("legal");
  return (
    <p className="not-prose my-4 rounded-lg border border-gold/30 bg-navy/30 p-3 text-sm text-text/75">
      {t("bindingNote")}
    </p>
  );
}
