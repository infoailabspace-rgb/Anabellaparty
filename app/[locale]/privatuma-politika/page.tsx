import type { Metadata } from "next";
import SectionHero from "@/components/section-hero";
import Prose from "@/components/prose";
import { Link } from "@/i18n/navigation";
import LegalBindingNote from "@/components/legal-binding-note";
import { COMPANY, fullAddress } from "@/lib/company";

export const metadata: Metadata = {
  title: "Privātuma politika | Anabella Party",
  description:
    "Kā Anabella Party apstrādā personas datus saskaņā ar GDPR: kādus datus vācam, kādēļ, cik ilgi glabājam, kam nododam un kādas ir Tavas tiesības.",
};

export default function PrivatumaPolitikaPage() {
  return (
    <>
      <SectionHero
        title="Privātuma politika"
        tagline="Tavu datu privātums mums ir svarīgs. Šeit skaidrojam, kā tos apstrādājam."
      />
      <Prose>
        <p className="text-sm text-text/50">
          Pēdējoreiz atjaunināts: 2026. gada augusts.
        </p>
        <LegalBindingNote />

        <h2>1. Pārzinis un kontaktinformācija</h2>
        <p>
          Personas datu pārzinis ir {COMPANY.legalName} (zīmols &bdquo;
          {COMPANY.brandName}&rdquo;), reģistrācijas nr. {COMPANY.regNr},
          juridiskā adrese {fullAddress}. Saziņai par datu apstrādi: e-pasts{" "}
          {COMPANY.contact.email}, tālrunis {COMPANY.contact.phoneDisplay}.
        </p>

        <h2>2. Kādus datus vācam</h2>
        <ul>
          <li>Vārds, uzvārds</li>
          <li>E-pasta adrese un tālruņa numurs</li>
          <li>Pasākuma norises adrese un datums</li>
          <li>
            Piegādes adrese (nosūtām OpenRouteService pakalpojumam attāluma
            aprēķinam)
          </li>
          <li>Maksājumu informācija (apstrādā maksājumu pakalpojumu sniedzējs)</li>
          <li>Fotogrāfijas, kas uzņemtas ar foto kastēm (skat. 5. punktu)</li>
          <li>
            Čatbota sarunu saturs, ja izmanto mājaslapas čatu (var saturēt Tavu
            ievadīto informāciju)
          </li>
          <li>Citi saziņas dati, ko brīvprātīgi norādi</li>
        </ul>

        <h2>3. Kādēļ vācam datus</h2>
        <ul>
          <li>Rezervācijas un nomas līguma izpildei</li>
          <li>Komunikācijai par pasākumu un pakalpojuma sniegšanai</li>
          <li>Klientu atbalstam</li>
          <li>Grāmatvedības un normatīvo prasību izpildei</li>
          <li>Tiešajam mārketingam (tikai ar Tavu piekrišanu)</li>
        </ul>

        <h2>4. Tiesiskais pamats</h2>
        <p>
          Datus apstrādājam, pamatojoties uz līguma izpildi (VDAR 6. panta 1.
          punkta b) apakšpunkts), juridisku pienākumu izpildi (piem., grāmatvedība
          — c) apakšpunkts), mūsu leģitīmajām interesēm (piem., pakalpojuma
          uzlabošana — f) apakšpunkts) un atsevišķos gadījumos uz Tavu piekrišanu
          (piem., mārketinga sīkdatnes vai fotogrāfiju publicēšana — a)
          apakšpunkts).
        </p>

        <h2>5. Fotogrāfijas</h2>
        <p>
          Foto kastu pakalpojumā tiek uzņemtas viesu fotogrāfijas. Tās tiek
          izdrukātas uz vietas un nodotas pasākuma organizatoram digitālā formātā.
          Fotogrāfijas glabājam tikai tik ilgi, cik nepieciešams to nodošanai
          klientam. [JĀAPSTIPRINA: precīzs foto kastu fotogrāfiju glabāšanas
          termiņš un vai tās tiek izmantotas mārketingā — tikai ar atsevišķu
          piekrišanu]. Lai lūgtu dzēst savu attēlu, raksti uz{" "}
          {COMPANY.contact.email}.
        </p>

        <h2>6. Datu saņēmēji (apstrādātāji)</h2>
        <p>Datu apstrādei izmantojam uzticamus pakalpojumu sniedzējus:</p>
        <ul>
          <li>Vercel — mājaslapas mitināšana (ES)</li>
          <li>Supabase — datubāze (ES)</li>
          <li>Resend — e-pastu piegāde</li>
          <li>Anthropic — mājaslapas čatbota darbība</li>
          <li>OpenRouteService — piegādes attāluma aprēķins</li>
          <li>Google — mājaslapas analītika (GA4 / Google Tag Manager)</li>
          <li>Meta — reklāmas mērīšana (Meta Pixel)</li>
        </ul>
        <p>
          Ar analītikas un reklāmas rīkiem saistītie dati tiek apstrādāti tikai
          pēc Tavas piekrišanas (skat. 9. punktu).
        </p>

        <h2>7. Glabāšanas termiņi</h2>
        <ul>
          <li>
            Rezervāciju pieteikumi un ar tiem saistītie grāmatvedības dokumenti —
            3 gadi (normatīvo prasību izpildei).
          </li>
          <li>Audio/video viesu grāmatu faili — 30 dienas.</li>
          <li>Mājaslapas čatbota sarunas — 90 dienas.</li>
          <li>
            Sīkdatnes — atbilstoši{" "}
            <Link href="/sikdatnu-politika">sīkdatņu politikai</Link>.
          </li>
        </ul>
        <p>
          Pēc termiņa beigām dati tiek dzēsti vai anonimizēti, ja vien likums
          neparedz ilgāku glabāšanu.
        </p>

        <h2>8. Tavas tiesības</h2>
        <ul>
          <li>Piekļūt saviem datiem</li>
          <li>Labot neprecīzus datus</li>
          <li>Lūgt dzēšanu (&bdquo;tiesības tikt aizmirstam&rdquo;)</li>
          <li>Ierobežot vai iebilst pret apstrādi</li>
          <li>Datu pārnesamība</li>
          <li>Atsaukt piekrišanu jebkurā brīdī</li>
        </ul>

        <h2>9. Sīkdatnes un piekrišana</h2>
        <p>
          Mājaslapā izmantojam sīkdatnes un līdzīgas tehnoloģijas. Analītikas un
          reklāmas sīkdatnes ieslēdzam tikai pēc Tavas piekrišanas (Google Consent
          Mode v2). Piekrišanu vari mainīt vai atsaukt jebkurā brīdī. Sīkāk —{" "}
          <Link href="/sikdatnu-politika">sīkdatņu politikā</Link>.
        </p>

        <h2>10. Sūdzības</h2>
        <p>
          Ja uzskati, ka Tavi dati tiek apstrādāti nepareizi, Tev ir tiesības
          iesniegt sūdzību Datu valsts inspekcijai (
          <a href="https://www.dvi.gov.lv">www.dvi.gov.lv</a>).
        </p>

        <h2>11. Politikas izmaiņas</h2>
        <p>
          Šī politika laiku pa laikam var tikt atjaunināta. Aktuālā versija vienmēr
          ir pieejama šajā lapā ar norādītu pēdējā atjauninājuma datumu.
        </p>
      </Prose>
    </>
  );
}
