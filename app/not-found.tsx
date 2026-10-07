import "./globals.css";
import Link from "next/link";

// 404 ceļiem ārpus publiskajām lokālēm (piem. /api/*, /admin/* nezināms ieraksts).
// Publiskās lapas (/..., /en/..., /ru/...) izmanto app/[locale]/not-found.tsx.
// Root izkārtojums ir caurlaides, tāpēc šeit savs <html>.
export default function GlobalNotFound() {
  return (
    <html lang="lv">
      <body className="flex min-h-screen items-center justify-center bg-bg px-6 text-center text-text">
        <main>
          <p className="font-mono text-6xl font-bold text-gold">404</p>
          <h1 className="mt-4 font-display text-3xl font-semibold">Lapa nav atrasta</h1>
          <p className="mt-3 text-text-muted">Pieprasītā lapa neeksistē vai ir pārvietota.</p>
          <Link
            href="/"
            className="mt-8 inline-flex min-h-11 items-center rounded-full bg-gold px-8 font-semibold text-on-gold"
          >
            Uz sākumlapu
          </Link>
        </main>
      </body>
    </html>
  );
}
