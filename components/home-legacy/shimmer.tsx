/** Zelta mirdzuma pārklājums, kas pārslīd pāri kartītei. Ievieto kartītē ar
 *  `relative overflow-hidden`. `pointer-events-none` — neietekmē klikšķus. */
export default function Shimmer({ delay = 0 }: { delay?: number }) {
  return (
    <span
      aria-hidden
      style={{ animationDelay: `${delay}s` }}
      className="anabella-shimmer pointer-events-none absolute inset-0 z-10"
    />
  );
}
