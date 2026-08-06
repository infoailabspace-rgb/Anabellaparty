import type { Metadata } from "next";
import { getTranslations, getLocale } from "next-intl/server";
import SectionHero from "@/components/section-hero";
import Prose from "@/components/prose";
import LegalBindingNote from "@/components/legal-binding-note";
import JsonLd from "@/components/seo/json-ld";
import { graph, breadcrumbNode } from "@/lib/schema";

export const metadata: Metadata = {
  title: "Sīkdatņu politika | Anabella Party",
  description:
    "Kādas sīkdatnes izmanto Anabella Party mājaslapa, to mērķi un glabāšanas termiņi. Kā pārvaldīt un atteikt sīkdatņu izmantošanu.",
};

export default async function SikdatnuPolitikaPage() {
  const [tf, locale] = await Promise.all([
    getTranslations("footer"),
    getLocale(),
  ]);
  return (
    <>
      <JsonLd
        data={graph(
          breadcrumbNode(locale, [
            { name: tf("sikdatnes"), path: "/sikdatnu-politika" },
          ]),
        )}
      />
      <SectionHero
        title="Sīkdatņu politika"
        tagline="Kādas sīkdatnes izmantojam, kādēļ un kā Tu vari tās pārvaldīt."
      />
      <Prose>
        <p className="text-sm text-text/50">
          Pēdējoreiz atjaunināts: 2026. gada augusts.
        </p>
        <LegalBindingNote />

        <h2>Kas ir sīkdatnes</h2>
        <p>
          Sīkdatnes ir nelieli teksta faili, ko mājaslapa saglabā Tavā ierīcē.
          Tās palīdz nodrošināt lapas darbību un, ar Tavu piekrišanu, analizēt
          apmeklējumus un rādīt atbilstošu saturu.
        </p>

        <h2>Piekrišana</h2>
        <p>
          Pirmajā apmeklējumā parādās sīkdatņu paziņojums. Analītiskās un
          mārketinga sīkdatnes (t.sk. Google Tag Manager un Facebook Pixel){" "}
          <strong>netiek ielādētas</strong>, kamēr neesi devis piekrišanu. Izvēli
          jebkurā brīdī vari mainīt, notīrot pārlūka datus mūsu domēnam.
        </p>

        <h2>Izmantotās sīkdatnes</h2>
        <table>
          <thead>
            <tr>
              <th>Nosaukums / avots</th>
              <th>Mērķis</th>
              <th>Veids</th>
              <th>Glabāšanas ilgums</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>anabella-cookie-consent</td>
              <td>Saglabā Tavu sīkdatņu izvēli</td>
              <td>Nepieciešamā</td>
              <td>Līdz 12 mēnešiem (localStorage)</td>
            </tr>
            <tr>
              <td>Google Tag Manager (GTM)</td>
              <td>Analītikas un marķieru pārvaldība</td>
              <td>Analītiskā</td>
              <td>Atbilstoši Google noteikumiem</td>
            </tr>
            <tr>
              <td>Google Analytics (GA4)</td>
              <td>Apmeklējumu statistika</td>
              <td>Analītiskā</td>
              <td>Līdz 24 mēnešiem</td>
            </tr>
            <tr>
              <td>Facebook Pixel</td>
              <td>Reklāmu mērīšana un mērķauditorija</td>
              <td>Mārketinga</td>
              <td>Līdz 90 dienām</td>
            </tr>
            <tr>
              <td>Vercel Analytics</td>
              <td>Anonīma veiktspējas un apmeklējumu statistika</td>
              <td>Analītiskā</td>
              <td>Sesijas / anonīmi apkopoti</td>
            </tr>
          </tbody>
        </table>

        <h2>Kā atteikties</h2>
        <p>
          Sīkdatņu paziņojumā vari izvēlēties “Tikai nepieciešamās”, lai atteiktos
          no analītiskajām un mārketinga sīkdatnēm. Sīkdatnes vari pārvaldīt arī
          sava pārlūka iestatījumos. Ņem vērā, ka nepieciešamās sīkdatnes ir
          būtiskas lapas darbībai un tās nevar atspējot.
        </p>
      </Prose>
    </>
  );
}
