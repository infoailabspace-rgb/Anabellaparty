import Link from "next/link";

export default function Footer() {
  return (
    <footer className="border-t border-gold/30 bg-navy/40">
      <div className="mx-auto grid max-w-6xl gap-8 px-6 py-12 sm:grid-cols-3">
        <div>
          <h3 className="font-display text-lg font-bold text-gold">
            Anabella Party
          </h3>
          <p className="mt-2 text-sm text-text/70">
            Pasākumu inventāra noma Latvijā. Foto kastes, piepūšamās atrakcijas,
            specefekti un audio grāmata.
          </p>
        </div>

        <div>
          <h4 className="font-display text-sm font-semibold text-text">
            Kontakti
          </h4>
          <ul className="mt-3 space-y-2 text-sm text-text/70">
            <li>
              <a
                href="https://wa.me/37129222761"
                className="transition-colors hover:text-gold"
              >
                +371 29222761 (WhatsApp)
              </a>
            </li>
            <li>
              <a
                href="mailto:info@anabellaparty.lv"
                className="transition-colors hover:text-gold"
              >
                info@anabellaparty.lv
              </a>
            </li>
            <li>Ķekava, Latvija</li>
          </ul>
        </div>

        <div>
          <h4 className="font-display text-sm font-semibold text-text">
            Informācija
          </h4>
          <ul className="mt-3 space-y-2 text-sm text-text/70">
            <li>
              <Link href="/faq" className="transition-colors hover:text-gold">
                BUJ
              </Link>
            </li>
            <li>
              <Link
                href="/musu-draugi"
                className="transition-colors hover:text-gold"
              >
                Mūsu draugi
              </Link>
            </li>
            <li>
              <Link
                href="/noteikumi"
                className="transition-colors hover:text-gold"
              >
                Nomas noteikumi
              </Link>
            </li>
            <li>
              <Link
                href="/privatuma-politika"
                className="transition-colors hover:text-gold"
              >
                Privātuma politika
              </Link>
            </li>
            <li>
              <Link
                href="/sikdatnu-politika"
                className="transition-colors hover:text-gold"
              >
                Sīkdatņu politika
              </Link>
            </li>
            <li className="flex gap-4 pt-1">
              <a
                href="https://instagram.com"
                target="_blank"
                rel="noopener noreferrer"
                className="transition-colors hover:text-gold"
              >
                Instagram
              </a>
              <a
                href="https://facebook.com"
                target="_blank"
                rel="noopener noreferrer"
                className="transition-colors hover:text-gold"
              >
                Facebook
              </a>
            </li>
          </ul>
        </div>
      </div>

      <div className="border-t border-gold/10 py-4 text-center text-xs text-text/50">
        © {new Date().getFullYear()} Anabella Party. Visas tiesības aizsargātas.
      </div>
    </footer>
  );
}
