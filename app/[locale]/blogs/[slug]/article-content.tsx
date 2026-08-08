"use client";

import { useCallback, useEffect, useRef, useState } from "react";

export default function ArticleContent({ html }: { html: string }) {
  const ref = useRef<HTMLDivElement>(null);
  const [imgs, setImgs] = useState<string[]>([]);
  const [active, setActive] = useState<number | null>(null);

  const go = useCallback(
    (dir: number) => {
      setActive((i) => (i === null ? i : (i + dir + imgs.length) % imgs.length));
    },
    [imgs.length],
  );

  useEffect(() => {
    if (active === null) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setActive(null);
      else if (e.key === "ArrowRight") go(1);
      else if (e.key === "ArrowLeft") go(-1);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [active, go]);

  function onClick(e: React.MouseEvent) {
    const t = e.target as HTMLElement;
    if (t.tagName !== "IMG") return;
    const all = Array.from(ref.current?.querySelectorAll("img") ?? []);
    const srcs = all.map((im) => (im as HTMLImageElement).src);
    const idx = all.indexOf(t as HTMLImageElement);
    if (idx < 0) return;
    setImgs(srcs);
    setActive(idx);
  }

  return (
    <>
      <div
        ref={ref}
        onClick={onClick}
        className="prose-blog mx-auto mt-10 max-w-[68ch] text-lg leading-relaxed [&_img]:cursor-zoom-in"
        dangerouslySetInnerHTML={{ __html: html }}
      />

      {active !== null && imgs[active] && (
        <div
          className="fixed inset-0 z-[80] flex items-center justify-center bg-black/90 p-4"
          onClick={() => setActive(null)}
          role="dialog"
          aria-modal="true"
        >
          <button onClick={() => setActive(null)} aria-label="Aizvērt" className="absolute right-4 top-4 text-3xl text-text/80 hover:text-gold">✕</button>
          {imgs.length > 1 && (
            <button onClick={(e) => { e.stopPropagation(); go(-1); }} aria-label="Iepriekšējais" className="absolute left-4 text-4xl text-text/80 hover:text-gold">‹</button>
          )}
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={imgs[active]}
            alt=""
            onClick={(e) => e.stopPropagation()}
            className="max-h-[85vh] max-w-[92vw] rounded-lg object-contain"
          />
          {imgs.length > 1 && (
            <button onClick={(e) => { e.stopPropagation(); go(1); }} aria-label="Nākamais" className="absolute right-4 text-4xl text-text/80 hover:text-gold">›</button>
          )}
        </div>
      )}
    </>
  );
}
