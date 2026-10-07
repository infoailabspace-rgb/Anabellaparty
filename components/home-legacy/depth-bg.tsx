/** Dziļuma fons — mīksts zelta gaismas avots + vinjete tumšākām malām.
 *  Ievieto sekcijā ar `relative overflow-hidden`; saturs virs tā ar `z-10`. */
export default function DepthBg() {
  return (
    <div aria-hidden className="pointer-events-none absolute inset-0 overflow-hidden">
      <div className="absolute left-1/2 top-[38%] h-[55vh] w-[85vw] -translate-x-1/2 -translate-y-1/2 rounded-full bg-[radial-gradient(ellipse,rgba(212,169,96,0.12),transparent_65%)] blur-3xl" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_48%,rgba(0,0,0,0.45))]" />
    </div>
  );
}
