// "Uzņēmumiem" bloks (redizains): kā notiek sadarbība 4 soļos + B2B priekšrocības
// + reāls korporatīva pasākuma foto. Enkurs #uznemumiem saglabāts (saites to lieto).
import Image from "next/image";
import { getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";

const B2B_IMAGE =
  "https://uewpetpyckpuzqywtcmf.supabase.co/storage/v1/object/public/site-images/gallery/27448e72-aae1-4c50-8ed1-a94436e3edef.jpg";

export default async function ForBusiness() {
  const t = await getTranslations("forBusiness");
  const steps = [
    { title: t("p1Title"), text: t("p1Text") },
    { title: t("p2Title"), text: t("p2Text") },
    { title: t("p3Title"), text: t("p3Text") },
    { title: t("p4Title"), text: t("p4Text") },
  ];
  const cards = [
    { title: t("card1Title"), text: t("card1Text") },
    { title: t("card2Title"), text: t("card2Text") },
    { title: t("card3Title"), text: t("card3Text") },
    { title: t("card4Title"), text: t("card4Text") },
  ];

  return (
    <section id="uznemumiem" className="section-y scroll-mt-28 border-y border-gold/15 bg-navy/30">
      <div className="container-site">
        <div className="grid items-start gap-12 lg:grid-cols-[1fr_1.1fr] lg:gap-16">
          <div>
            <p className="eyebrow">{t("eyebrow")}</p>
            <h2 className="mt-3 font-display text-section font-semibold tracking-tight">
              {t("title")}
            </h2>
            <p className="mt-4 text-lead text-text-muted">{t("intro")}</p>
            <div className="relative mt-8 aspect-[4/3] overflow-hidden rounded-panel border border-gold/20">
              <Image
                src={B2B_IMAGE}
                alt={t("imageAlt")}
                fill
                sizes="(min-width: 1024px) 40vw, 100vw"
                quality={70}
                className="object-cover"
              />
            </div>
          </div>

          <div>
            <h3 className="font-display text-block font-semibold tracking-tight">
              {t("processTitle")}
            </h3>
            {/* Sadarbības soļi - sakārtots saraksts (ekrānlasītājs nolasa secību) */}
            <ol className="mt-6 space-y-6">
              {steps.map((s, i) => (
                <li key={s.title} className="flex gap-5">
                  <span
                    aria-hidden
                    className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full border border-gold/50 font-display text-lg font-semibold text-gold"
                  >
                    {i + 1}
                  </span>
                  <div>
                    <h4 className="font-semibold text-text">{s.title}</h4>
                    <p className="mt-1 text-text-muted">{s.text}</p>
                  </div>
                </li>
              ))}
            </ol>

            <dl className="mt-10 grid gap-x-8 gap-y-6 border-t border-gold/15 pt-8 sm:grid-cols-2">
              {cards.map((c) => (
                <div key={c.title}>
                  <dt className="font-semibold text-gold">{c.title}</dt>
                  <dd className="mt-1 text-sm text-text/80">{c.text}</dd>
                </div>
              ))}
            </dl>

            <Link
              href="/kontakti/#pieprasijums"
              className="mt-10 inline-flex min-h-12 items-center rounded-full bg-gold px-8 font-semibold text-on-gold transition-colors hover:bg-gold/90"
            >
              {t("cta")} →
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
