import type { ReactNode } from "react";

/**
 * Konsekventa tipogrāfija juridiskajām / teksta lapām.
 * Lieto standarta HTML (h2, h3, p, ul, table) iekšpusē.
 */
export default function Prose({ children }: { children: ReactNode }) {
  return (
    <div
      className="mx-auto max-w-3xl px-6 py-16
        [&_h2]:mt-10 [&_h2]:font-display [&_h2]:text-2xl [&_h2]:font-bold [&_h2]:text-text
        [&_h3]:mt-6 [&_h3]:font-display [&_h3]:text-lg [&_h3]:font-semibold [&_h3]:text-gold
        [&_p]:mt-3 [&_p]:text-text/80 [&_p]:leading-relaxed
        [&_ul]:mt-3 [&_ul]:list-disc [&_ul]:space-y-1 [&_ul]:pl-6 [&_ul]:text-text/80
        [&_ol]:mt-3 [&_ol]:list-decimal [&_ol]:space-y-1 [&_ol]:pl-6 [&_ol]:text-text/80
        [&_a]:text-gold [&_a]:underline
        [&_table]:mt-4 [&_table]:w-full [&_table]:border-collapse [&_table]:text-sm
        [&_th]:border [&_th]:border-gold/25 [&_th]:bg-navy/40 [&_th]:p-2 [&_th]:text-left
        [&_td]:border [&_td]:border-gold/20 [&_td]:p-2 [&_td]:align-top [&_td]:text-text/80"
    >
      {children}
    </div>
  );
}
