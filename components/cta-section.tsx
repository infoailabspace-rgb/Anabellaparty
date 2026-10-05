import { getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import Reveal from "@/components/reveal";
import CallButton from "@/components/call-button";

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
  // secondary=true → rāda arī B2B pogu "Aprakstiet savu pasākumu" (uz anketu).
  secondary?: boolean;
}) {
  const t = await getTranslations("cta");
  return (
    <section className="relative overflow-hidden bg-gradient-to-br from-[#E8C079] via-gold to-[#C79A4E] py-24 md:py-32">
      {/* Lēna zelta gaismas pulsācija */}
      <div
        className="absolute left-1/2 top-1/2 h-[120%] w-[70%] -translate-x-1/2 -translate-y-1/2 rounded-full bg-[radial-gradient(circle,rgba(255,255,255,0.35),transparent_60%)] anabella-glow-pulse"
        aria-hidden
      />
      <Reveal className="relative z-10 mx-auto max-w-2xl px-6 text-center">
        <h2 className="font-display text-4xl font-bold tracking-tight text-bg md:text-5xl">
          {title ?? t("title")}
        </h2>
        <p className="mt-4 text-lg leading-relaxed text-bg/80">
          {text ?? t("text")}
        </p>
        <div className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row">
          <Link
            href={href}
            className="inline-flex min-h-14 items-center rounded-full bg-bg px-10 text-lg font-semibold text-gold shadow-depth transition-transform hover:scale-[1.03]"
          >
            {buttonLabel ?? t("button")}
          </Link>
          {secondary && (
            <Link
              href="/kontakti/#pieprasijums"
              className="inline-flex min-h-14 items-center rounded-full border-2 border-bg/70 px-10 text-lg font-semibold text-bg transition-colors hover:border-bg"
            >
              {t("b2bButton")} →
            </Link>
          )}
          {/* Trešā iespēja - zvanīt (uz zelta fona tumša outline). */}
          <CallButton source="cta" variant="dark" size="lg" />
        </div>
      </Reveal>
    </section>
  );
}
