"use client";

import Link from "next/link";
import { useState, useTransition } from "react";
import { deleteBlogPost } from "../site-actions";

export type BlogRow = {
  id: string;
  slug: string;
  title: string;
  status: string;
  published_at: string | null;
  ai_generated: boolean;
  edited_after_ai: boolean;
};

const STATUS_LABEL: Record<string, string> = {
  draft: "Melnraksts",
  published: "Publicēts",
};

export default function BlogsList({ rows }: { rows: BlogRow[] }) {
  const [list, setList] = useState(rows);
  const [, start] = useTransition();

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <h1 className="font-display text-2xl font-bold">Blogs</h1>
        <Link href="/admin/blogs/jauns" className="rounded-full bg-gold px-5 py-2 text-sm font-semibold text-black">
          + Jauns raksts
        </Link>
      </div>
      {list.length === 0 ? (
        <p className="text-sm text-text/50">Vēl nav rakstu.</p>
      ) : (
        <div className="space-y-2">
          {list.map((r) => (
            <div key={r.id} className="flex items-center gap-3 rounded-xl border border-gold/20 bg-navy/30 p-3">
              <Link href={`/admin/blogs/${r.id}`} className="flex-1 text-sm font-semibold text-text hover:text-gold">
                {r.title || r.slug}
              </Link>
              <span className={`rounded-full px-2 py-0.5 text-[11px] ${r.status === "published" ? "bg-gold/20 text-gold" : "border border-text/20 text-text/50"}`}>
                {STATUS_LABEL[r.status] ?? r.status}
              </span>
              {r.ai_generated && !r.edited_after_ai && (
                <span className="rounded-full bg-red-500/20 px-2 py-0.5 text-[11px] text-red-300">nerediģēts</span>
              )}
              <span className="hidden text-xs text-text/40 sm:inline">
                {r.published_at ? new Date(r.published_at).toLocaleDateString("lv") : "—"}
              </span>
              <button
                onClick={() => {
                  if (confirm("Dzēst rakstu?"))
                    start(async () => {
                      await deleteBlogPost(r.id);
                      setList((l) => l.filter((x) => x.id !== r.id));
                    });
                }}
                className="rounded-full border border-red-500/50 px-3 py-1 text-xs text-red-300"
              >
                Dzēst
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
