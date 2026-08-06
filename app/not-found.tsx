import Link from "next/link";
import Image from "next/image";

const links = [
  { href: "/", label: "Sākums" },
  { href: "/foto-kaste", label: "Foto kastes" },
  { href: "/piepusamas-atrakcijas", label: "Atrakcijas" },
  { href: "/svinibu-inventars", label: "Inventārs" },
  { href: "/kontakti", label: "Kontakti" },
];

export default function NotFound() {
  return (
    <section className="relative flex min-h-[70vh] items-center justify-center overflow-hidden px-6 text-center">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_40%,rgba(212,169,96,0.12),transparent_60%)]" />
      <div className="relative z-10 mx-auto max-w-xl">
        <Image
          src="/logo/logo-full.png"
          alt="Anabella Party"
          width={500}
          height={500}
          className="mx-auto h-24 w-auto"
        />
        <p className="mt-6 font-mono text-6xl font-bold text-gold">404</p>
        <h1 className="mt-4 font-display text-3xl font-bold tracking-tight">
          Šī lapa aizsvinējusies prom
        </h1>
        <p className="mt-3 text-text/75">
          Meklēto lapu neizdevās atrast. Varbūt tā ir pārcelta vai adresē
          ieviesusies kļūda.
        </p>
        <div className="mt-8 flex flex-wrap justify-center gap-3">
          {links.map((l) => (
            <Link
              key={l.href}
              href={l.href}
              className="rounded-full border-2 border-gold/40 px-5 py-2 text-sm font-semibold text-text/90 transition-colors hover:border-gold hover:text-gold"
            >
              {l.label}
            </Link>
          ))}
        </div>
        <Link
          href="/rezervet"
          className="mt-8 inline-block rounded-full bg-gold px-8 py-3 font-semibold text-black transition-shadow hover:shadow-[0_0_25px_rgba(212,169,96,0.5)]"
        >
          Rezervēt
        </Link>
      </div>
    </section>
  );
}
