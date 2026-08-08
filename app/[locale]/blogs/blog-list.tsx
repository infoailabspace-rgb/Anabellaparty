"use client";

import { useState } from "react";
import { Link } from "@/i18n/navigation";
import { BLOG_CATEGORIES, CATEGORY_LABEL, type BlogListItem } from "@/lib/blog";

function Card({ p }: { p: BlogListItem }) {
  return (
    <Link
      href={`/blogs/${p.slug}`}
      className="group flex flex-col overflow-hidden rounded-2xl border border-gold/20 bg-navy/25 transition-colors hover:border-gold/50"
    >
      <div className="relative aspect-[16/10] overflow-hidden bg-navy">
        {p.cover ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={p.cover}
            alt={p.coverAlt}
            loading="lazy"
            className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
          />
        ) : (
          <div className="flex h-full items-center justify-center text-gold/30">Anabella</div>
        )}
      </div>
      <div className="flex flex-1 flex-col p-5">
        {p.category && (
          <span className="mb-2 text-xs font-semibold uppercase tracking-wide text-gold">
            {CATEGORY_LABEL[p.category] ?? p.category}
          </span>
        )}
        <h2 className="font-display text-lg font-semibold text-text group-hover:text-gold">
          {p.title}
        </h2>
        <p className="mt-2 flex-1 text-sm text-text/70">{p.excerpt}</p>
        <p className="mt-4 text-xs text-text/40">
          {p.publishedAt ? new Date(p.publishedAt).toLocaleDateString("lv") : ""} · {p.readingMin} min lasīšana
        </p>
      </div>
    </Link>
  );
}

function Tab({ id, label, cat, onClick }: { id: string; label: string; cat: string; onClick: (c: string) => void }) {
  return (
    <button
      onClick={() => onClick(id)}
      className={`rounded-full px-4 py-1.5 text-sm font-semibold ${
        cat === id ? "bg-gold text-black" : "border border-gold/30 text-text/60 hover:text-gold"
      }`}
    >
      {label}
    </button>
  );
}

export default function BlogList({ posts }: { posts: BlogListItem[] }) {
  const [cat, setCat] = useState("all");
  const [visible, setVisible] = useState(9);

  if (posts.length === 0)
    return <p className="text-center text-text/60">Vēl nav rakstu. Drīzumā!</p>;

  const present = BLOG_CATEGORIES.filter((c) => posts.some((p) => p.category === c));
  const filtered = cat === "all" ? posts : posts.filter((p) => p.category === cat);
  const shown = filtered.slice(0, visible);
  const pick = (c: string) => {
    setCat(c);
    setVisible(9);
  };

  return (
    <div>
      {present.length > 0 && (
        <div className="mb-10 flex flex-wrap justify-center gap-2">
          <Tab id="all" label="Visi" cat={cat} onClick={pick} />
          {present.map((c) => (
            <Tab key={c} id={c} label={CATEGORY_LABEL[c]} cat={cat} onClick={pick} />
          ))}
        </div>
      )}
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {shown.map((p) => (
          <Card key={p.slug} p={p} />
        ))}
      </div>
      {visible < filtered.length && (
        <div className="mt-10 text-center">
          <button
            onClick={() => setVisible((v) => v + 9)}
            className="rounded-full border-2 border-gold px-8 py-3 font-semibold text-gold transition-colors hover:bg-gold/10"
          >
            Rādīt vairāk
          </button>
        </div>
      )}
    </div>
  );
}
