import { getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import Reveal from "@/components/reveal";
import CallButton from "@/components/call-button";

// Noslēguma CTA (redizains): tumšs panelis ar zelta līniju - zelts tikai kā akcents
// (viena zelta poga), nevis pilns zelta fons. Viens primārais CTA + sekundārie.
export default async function CtaSection({
  title,
  text,
  buttonLabel,
  href = "/rezervet",
  secondary = false,
}: {
  title?: string;
  text?: string;
  buttonLabel?: string;
  href?: string;
  // secondary=true → rāda arī B2B saiti "Aprakstiet savu pasākumu" (uz anketu).
  secondary?: boolean;
}) {
  const t = await getTranslations("cta");
  return (
    <section className="section-y">
      <div className="container-site">
        <Reveal className="relative overflow-hidden rounded-panel border border-gold/30 bg-navy/40 px-6 py-14 text-center sm:px-12 sm:py-20">
          <div aria-hidden className="mx-auto mb-8 h-px w-16 bg-gold" />
          <h2 className="mx-auto max-w-2xl font-display text-section font-semibold tracking-tight text-text">
            {title ?? t("title")}
          </h2>
          <p className="mx-auto mt-4 max-w-xl text-lead text-text/80">{text ?? t("text")}</p>
          <div className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row sm:gap-6">
            <Link
              href={href}
              className="inline-flex min-h-12 items-center rounded-full bg-gold px-9 font-semibold text-on-gold transition-colors hover:bg-gold/90"
            >
              {buttonLabel ?? t("button")}
            </Link>
            {secondary && (
              <Link
                href="/kontakti/#pieprasijums"
                className="inline-flex min-h-12 items-center rounded-full border border-gold/60 px-8 font-semibold text-gold transition-colors hover:border-gold hover:bg-gold/10"
              >
                {t("b2bButton")} →
              </Link>
            )}
            <CallButton source="cta" variant="ghost" />
          </div>
        </Reveal>
      </div>
    </section>
  );
}
