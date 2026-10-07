// Sākumlapas FAQ (redizains): pirmie jautājumi no site_faqs ar dabiskiem
// <details> elementiem - strādā bez JS, pieejami ar tastatūru. JSON-LD šeit NAV
// (FAQPage shēma paliek /faq lapā, kā līdz šim).
import { getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import type { FaqItem } from "@/lib/faq";

export default async function HomeFaq({ items }: { items: FaqItem[] }) {
  const t = await getTranslations("home");
  const list = items.slice(0, 5);
  if (!list.length) return null;
  return (
    <section className="section-y">
      <div className="container-site grid gap-10 lg:grid-cols-[1fr_1.6fr] lg:gap-16">
        <div>
          <p className="eyebrow">{t("faqEyebrow")}</p>
          <h2 className="mt-3 font-display text-section font-semibold tracking-tight">
            {t("faqTitle")}
          </h2>
          <Link
            href="/faq"
            className="mt-6 inline-flex min-h-11 items-center font-semibold text-gold underline decoration-gold/40 underline-offset-4 hover:decoration-gold"
          >
            {t("faqAll")} →
          </Link>
        </div>
        <div className="divide-y divide-gold/15 border-y border-gold/15">
          {list.map((f) => (
            <details key={f.question} className="group">
              <summary className="flex min-h-14 cursor-pointer list-none items-center justify-between gap-6 py-4 font-semibold text-text transition-colors hover:text-gold [&::-webkit-details-marker]:hidden">
                <span>{f.question}</span>
                <span
                  aria-hidden
                  className="text-xl text-gold transition-transform duration-(--duration-fast) group-open:rotate-45"
                >
                  +
                </span>
              </summary>
              <p className="max-w-[68ch] pb-6 text-text/80">{f.answer}</p>
            </details>
          ))}
        </div>
      </div>
    </section>
  );
}
