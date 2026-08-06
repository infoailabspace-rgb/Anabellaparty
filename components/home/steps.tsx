import { getTranslations } from "next-intl/server";
import Reveal from "@/components/reveal";
import CountUp from "@/components/count-up";
import Shimmer from "@/components/shimmer";
import {
  IconBadge,
  IconBrowse,
  IconCalendarCheck,
  IconTruck,
} from "@/components/icons";

export default async function Steps() {
  const t = await getTranslations("steps");
  const steps = [
    { n: 1, title: t("s1Title"), text: t("s1Text"), Icon: IconBrowse },
    { n: 2, title: t("s2Title"), text: t("s2Text"), Icon: IconCalendarCheck },
    { n: 3, title: t("s3Title"), text: t("s3Text"), Icon: IconTruck },
  ];
  return (
    <section className="bg-bg py-24 md:py-32">
      <div className="mx-auto max-w-6xl px-6">
        <Reveal>
          <h2 className="text-center font-display text-3xl font-bold tracking-tight md:text-4xl">
            {t("heading")}
          </h2>
        </Reveal>
        <div className="mt-16 grid gap-8 md:grid-cols-3">
          {steps.map((s, i) => (
            <Reveal key={s.n} delay={i * 0.08}>
              <div className="group relative isolate h-full overflow-hidden rounded-2xl border border-gold/25 bg-navy/30 p-8 shadow-[0_20px_60px_-30px_rgba(212,169,96,0.25)] transition-all duration-300 hover:-translate-y-1.5 hover:border-gold/60 hover:shadow-[0_28px_70px_-24px_rgba(212,169,96,0.35)]">
                <Shimmer delay={i * 0.6} />
                <div className="flex items-center justify-between">
                  <IconBadge delay={i * 0.4}>
                    <s.Icon className="h-6 w-6" />
                  </IconBadge>
                  <CountUp
                    to={s.n}
                    prefix="0"
                    className="font-mono text-4xl font-bold text-gold/80"
                  />
                </div>
                <h3 className="mt-5 font-display text-xl font-semibold">
                  {s.title}
                </h3>
                <p className="mt-2 leading-relaxed text-text/70">{s.text}</p>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
