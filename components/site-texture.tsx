// Smalka luxury tekstūra pār visu fonu — CSS only, bez ārējiem failiem, bez canvas.
// Divi lēni kustīgi zelta radial-gradienti (16s + 20s cikli, pretējos virzienos) +
// statisks grain slānis. mix-blend soft-light → paceļ toni, bet nesabojā teksta
// lasāmību; animē tikai transform/opacity (GPU) → neietekmē Lighthouse.
// prefers-reduced-motion → kustība apstājas (CSS globals.css sargs).

const GRAIN =
  "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='160' height='160'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='2' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E\")";

export default function SiteTexture() {
  return (
    <div
      className="pointer-events-none fixed inset-0 z-[1] overflow-hidden mix-blend-soft-light"
      aria-hidden
    >
      {/* Zelta glow A — augšā pa kreisi, lēns drift (16s) */}
      <div className="anabella-tex-a absolute left-[-15%] top-[-20%] h-[85vh] w-[85vw] rounded-full bg-[radial-gradient(circle,rgba(212,169,96,0.20),transparent_60%)] blur-[100px]" />
      {/* Zelta glow B — apakšā pa labi, pretējs drift (20s) */}
      <div className="anabella-tex-b absolute bottom-[-20%] right-[-15%] h-[75vh] w-[75vw] rounded-full bg-[radial-gradient(circle,rgba(212,169,96,0.14),transparent_62%)] blur-[120px]" />
      {/* Statisks smalks grain */}
      <div
        className="absolute inset-0 opacity-[0.05]"
        style={{ backgroundImage: GRAIN }}
      />
    </div>
  );
}
