// Smalka luxury tekstūra pār visu fonu — CSS only, bez ārējiem failiem, bez canvas.
// Lēns zelta radial glow (drift) + statisks grain. Ļoti zema opacity → netraucē
// lasīt tekstu; GPU transform + statisks noise → neietekmē Lighthouse.
// prefers-reduced-motion → glow nekustas (CSS globals.css sargs).

const GRAIN =
  "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='160' height='160'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='2' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E\")";

export default function SiteTexture() {
  return (
    <div className="pointer-events-none fixed inset-0 z-[1] overflow-hidden" aria-hidden>
      {/* Lēns zelta glow — drift, mīksts, ambiental (mix-blend soft-light) */}
      <div
        className="anabella-texture-glow absolute left-1/2 top-[-10%] h-[80vh] w-[80vw] -translate-x-1/2 rounded-full bg-[radial-gradient(circle,rgba(212,169,96,0.10),transparent_62%)] blur-[90px] mix-blend-soft-light"
      />
      {/* Statisks smalks grain */}
      <div
        className="absolute inset-0 opacity-[0.025] mix-blend-overlay"
        style={{ backgroundImage: GRAIN }}
      />
    </div>
  );
}
