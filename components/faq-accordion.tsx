"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { faqCategories, type FaqCategory, type FaqItem } from "@/lib/faq";

type Filter = "all" | FaqCategory;

export default function FaqAccordion({ items }: { items: FaqItem[] }) {
  const t = useTranslations("faqCat");
  const [filter, setFilter] = useState<Filter>("all");
  const [open, setOpen] = useState<number | null>(null);

  const visible = items.filter(
    (item) => filter === "all" || item.category === filter,
  );

  return (
    <div>
      {/* Kategoriju filtrs */}
      <div className="flex flex-wrap justify-center gap-3">
        <FilterButton active={filter === "all"} onClick={() => setFilter("all")}>
          {t("all")}
        </FilterButton>
        {faqCategories.map((c) => (
          <FilterButton
            key={c.id}
            active={filter === c.id}
            onClick={() => {
              setFilter(c.id);
              setOpen(null);
            }}
          >
            {t(c.id)}
          </FilterButton>
        ))}
      </div>

      {/* Accordion */}
      <div className="mx-auto mt-10 max-w-3xl space-y-3">
        {visible.map((item) => {
          // Stabils indekss pret pilno sarakstu, lai filtrs nesajauc atvērto.
          const idx = items.indexOf(item);
          const isOpen = open === idx;
          return (
            <div
              key={idx}
              className="overflow-hidden rounded-xl border border-gold/25 bg-navy/25"
            >
              <button
                type="button"
                onClick={() => setOpen(isOpen ? null : idx)}
                aria-expanded={isOpen}
                className="flex w-full items-center justify-between gap-4 px-6 py-4 text-left"
              >
                <span className="font-display font-semibold">
                  {item.question}
                </span>
                <span
                  className={`shrink-0 text-gold transition-transform ${
                    isOpen ? "rotate-45" : ""
                  }`}
                  aria-hidden
                >
                  +
                </span>
              </button>
              {isOpen && (
                <div className="px-6 pb-5 text-text/80">{item.answer}</div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

function FilterButton({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`rounded-full border-2 px-4 py-1.5 text-sm font-semibold transition-colors ${
        active
          ? "border-gold bg-gold text-black"
          : "border-gold/30 text-text/80 hover:border-gold/60"
      }`}
    >
      {children}
    </button>
  );
}
