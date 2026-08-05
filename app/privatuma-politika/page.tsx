import type { Metadata } from "next";
import SectionHero from "@/components/section-hero";
import Prose from "@/components/prose";

export const metadata: Metadata = {
  title: "Privātuma politika | Anabella Party",
  description:
    "Kā Anabella Party apstrādā personas datus saskaņā ar GDPR: kādus datus vācam, kādēļ, cik ilgi glabājam un kādas ir Tavas tiesības.",
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

        <h2>1. Pārzinis un kontaktinformācija</h2>
        <p>
          Personas datu pārzinis ir Anabella Party. Saziņai par datu apstrādi:
          e-pasts info@anabellaparty.lv, tālrunis +371 29222761, adrese Ķekava,
          Vecozolu iela 14. [JĀAPSTIPRINA: juridiskais nosaukums un reģistrācijas numurs].
        </p>

        <h2>2. Kādus datus vācam</h2>
        <ul>
          <li>Vārds, uzvārds</li>
          <li>E-pasta adrese un tālruņa numurs</li>
          <li>Pasākuma norises adrese un datums</li>
          <li>Maksājumu informācija (apstrādā maksājumu pakalpojumu sniedzējs)</li>
          <li>Fotogrāfijas, kas uzņemtas ar foto kastēm (skat. 5. punktu)</li>
        </ul>

        <h2>3. Kādēļ vācam datus</h2>
        <ul>
          <li>Rezervācijas un nomas līguma izpildei</li>
          <li>Komunikācijai par pasākumu un pakalpojuma sniegšanai</li>
          <li>Grāmatvedības un normatīvo prasību izpildei</li>
        </ul>

        <h2>4. Tiesiskais pamats</h2>
        <p>
          Datus apstrādājam, pamatojoties uz līguma izpildi (VDAR 6. panta 1.
          punkta b) apakšpunkts), juridisku pienākumu izpildi (piem., grāmatvedība
          — c) apakšpunkts) un atsevišķos gadījumos uz Tavu piekrišanu (piem.,
          mārketinga sīkdatnes vai fotogrāfiju publicēšana — a) apakšpunkts).
        </p>

        <h2>5. Fotogrāfijas</h2>
        <p>
          Foto kastu pakalpojumā tiek uzņemtas viesu fotogrāfijas. Tās tiek
          izdrukātas uz vietas un nodotas pasākuma organizatoram digitālā formātā.
          Fotogrāfijas glabājam tikai tik ilgi, cik nepieciešams to nodošanai
          klientam. [JĀAPSTIPRINA: precīzs fotogrāfiju glabāšanas termiņš un vai
          tās tiek izmantotas mārketingā — tikai ar atsevišķu piekrišanu]. Lai
          lūgtu dzēst savu attēlu, raksti uz info@anabellaparty.lv.
        </p>

        <h2>6. Datu saņēmēji</h2>
        <p>
          Datu apstrādei izmantojam uzticamus pakalpojumu sniedzējus:
        </p>
        <ul>
          <li>Vercel — mājaslapas mitināšana (ES/ASV, atbilstoši datu pārsūtīšanas mehānismi)</li>
          <li>Supabase — datubāze (tiks ieviesta nākotnē)</li>
          <li>Stripe — maksājumu apstrāde (tiks ieviesta nākotnē)</li>
          <li>Resend — e-pastu piegāde (tiks ieviesta nākotnē)</li>
        </ul>

        <h2>7. Glabāšanas termiņi</h2>
        <p>
          Datus glabājam tik ilgi, cik nepieciešams pakalpojuma sniegšanai un
          normatīvo prasību izpildei (piem., grāmatvedības dokumentus — atbilstoši
          likumā noteiktajam termiņam). [JĀAPSTIPRINA: konkrēti glabāšanas
          termiņi].
        </p>

        <h2>8. Tavas tiesības</h2>
        <ul>
          <li>Piekļūt saviem datiem</li>
          <li>Labot neprecīzus datus</li>
          <li>Lūgt dzēšanu (“tiesības tikt aizmirstam”)</li>
          <li>Ierobežot vai iebilst pret apstrādi</li>
          <li>Datu pārnesamība</li>
          <li>Atsaukt piekrišanu jebkurā brīdī</li>
        </ul>

        <h2>9. Sūdzības</h2>
        <p>
          Ja uzskati, ka Tavi dati tiek apstrādāti nepareizi, Tev ir tiesības
          iesniegt sūdzību Datu valsts inspekcijai (
          <a href="https://www.dvi.gov.lv">www.dvi.gov.lv</a>).
        </p>

        <h2>10. Politikas izmaiņas</h2>
        <p>
          Šī politika laiku pa laikam var tikt atjaunināta. Aktuālā versija vienmēr
          ir pieejama šajā lapā ar norādītu pēdējā atjauninājuma datumu.
        </p>
      </Prose>
    </>
  );
}
