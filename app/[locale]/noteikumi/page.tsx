import type { Metadata } from "next";
import { getTranslations, getLocale } from "next-intl/server";
import SectionHero from "@/components/section-hero";
import Prose from "@/components/prose";
import LegalBindingNote from "@/components/legal-binding-note";
import { COMPANY, fullAddress } from "@/lib/company";
import JsonLd from "@/components/seo/json-ld";
import { graph, breadcrumbNode } from "@/lib/schema";

export const metadata: Metadata = {
  title: "Nomas noteikumi | Anabella Party",
  description:
    "Anabella Party inventāra nomas noteikumi: rezervācija, avanss, atcelšana, piegāde, uzstādīšana, drošība un atbildība. Pasākumu inventāra noma Latvijā.",
};

export default async function NoteikumiPage() {
  const [tf, locale] = await Promise.all([
    getTranslations("footer"),
    getLocale(),
  ]);
  return (
    <>
      <JsonLd
        data={graph(
          breadcrumbNode(locale, [
            { name: tf("noteikumi"), path: "/noteikumi" },
          ]),
        )}
      />
      <SectionHero
        title="Nomas noteikumi"
        tagline="Skaidri noteikumi, lai sadarbība būtu vienkārša un droša abām pusēm."
      />
      <Prose>
        <p className="text-sm text-text/50">
          Pēdējoreiz atjaunināts: 2026. gada augusts.
        </p>
        <LegalBindingNote />

        <h2>1. Vispārīgie noteikumi</h2>
        <p>
          Iznomātājs ir {COMPANY.legalName} (zīmols &bdquo;{COMPANY.brandName}
          &rdquo;; turpmāk — Iznomātājs), reģistrācijas nr. {COMPANY.regNr}, PVN
          reģ. nr. {COMPANY.vatNr}, juridiskā adrese {fullAddress}. Kontakti:
          tālrunis {COMPANY.contact.phoneDisplay}, e-pasts{" "}
          {COMPANY.contact.email}.
        </p>
        <p>
          Šie noteikumi attiecas uz visiem inventāra nomas darījumiem starp
          Iznomātāju un Nomnieku. Veicot rezervāciju, Nomnieks apstiprina, ka ir
          iepazinies ar šiem noteikumiem un tiem piekrīt.
        </p>

        <h2>2. Rezervācija un apstiprināšana</h2>
        <p>
          Rezervāciju var veikt telefoniski, e-pastā, WhatsApp vai caur mājaslapas
          kontaktformu. Rezervācija tiek uzskatīta par apstiprinātu pēc tam, kad
          Iznomātājs to ir rakstiski apstiprinājis un saņemts avanss (skat. 3.
          punktu). Iznomātājs patur tiesības atteikt rezervāciju, ja izvēlētais
          datums nav pieejams.
        </p>

        <h2>3. Avanss un apmaksa</h2>
        <p>
          Rezervācija tiek apstiprināta pēc <b>50% avansa</b> iemaksas,
          neatkarīgi no izvēlētās tehnikas vai pakalpojuma. Norēķini — bankas
          pārskaitījums vai skaidra nauda. Visas cenas norādītas bez PVN 21%.
          Uzņēmumiem tiek izsniegts rēķins.
        </p>

        <h2>4. Atcelšana un drošības nauda</h2>
        <p>
          Atceļot rezervāciju, <b>avanss netiek atmaksāts</b>, jo tas nodrošina
          inventāra pieejamību un daļēji sedz zaudētos ienākumus.
        </p>
        <p>
          Atsevišķām iekārtām var tikt pieprasīta <b>drošības nauda (ķīla)</b>,
          kas tiek atgriezta pēc inventāra atgriešanas sākotnējā stāvoklī.
        </p>

        <h2>5. Slikti laikapstākļi</h2>
        <p>
          Ja atrakciju nevar uzstādīt sliktu laikapstākļu dēļ, avanss netiek
          atgriezts, bet Nomnieks var vienoties par vienu no risinājumiem:
        </p>
        <ul>
          <li>datuma pārcelšanu;</li>
          <li>summas izmantošanu cita inventāra nomai;</li>
          <li>dāvanu karti avansa vērtībā.</li>
        </ul>
        <p>
          Ja atrakcija jau ir uzstādīta, bet netiek izmantota, nomas maksa netiek
          atmaksāta.
        </p>

        <h2>6. Piegāde, uzstādīšana un demontāža</h2>
        <p>
          Piegāde Ķekavas novadā ir bez maksas. Ārpus tā tiek piemērota maksa
          25 € par 100 km (aprēķins turp-atpakaļ). Uzstādīšana un demontāža ir
          iekļauta nomas cenā. Nomnieks nodrošina piekļuvi objektam un iepriekš
          saskaņotu uzstādīšanas laiku.
        </p>

        <h2>7. Uzstādīšanas prasības</h2>
        <ul>
          <li>220V elektrības pieslēgums.</li>
          <li>Atrakcija ne tālāk kā 25 m no elektrības pieslēguma.</li>
          <li>Vieta brīvi pieejama, bez šķēršļiem.</li>
          <li>Ārā — līdzena, tīra pamatne (zāliens).</li>
          <li>
            Pamatnē nedrīkst būt akmeņi, čiekuri, būvgruži, asi priekšmeti vai
            melnzeme.
          </li>
        </ul>

        <h2>8. Drošība un atbildība</h2>
        <p>
          No brīža, kad atrakcija ir uzstādīta vai nodota Nomnieka rīcībā,{" "}
          <b>pilna atbildība pāriet Nomniekam</b>. Nomnieks apņemas:
        </p>
        <ul>
          <li>uzraudzīt bērnus visā lietošanas laikā;</li>
          <li>
            nepārsniegt maksimālo cilvēku skaitu un <b>svara limitu 200 kg</b>;
          </li>
          <li>pārtraukt lietošanu nelabvēlīgos laikapstākļos.</li>
        </ul>
        <p>
          Ja notiek traumas vai nelaimes gadījumi, visa atbildība gulstas uz
          Nomnieku.
        </p>

        <h2>9. Aizliegumi</h2>
        <p>Atrasties atrakcijā aizliegts ar:</p>
        <ul>
          <li>
            apzīmētām sejām, flomasteriem, pildspalvām, krāsojošiem līdzekļiem;
          </li>
          <li>plaukšķenēm, konfeti;</li>
          <li>apaviem.</li>
        </ul>
        <p>
          Aizliegts kāpt pāri sānu malām un veikt remontdarbus pašu spēkiem.
          Atrakcijā aizliegts ienest asus priekšmetus, dzīvniekus, ēdienu,
          dzērienus un rakstāmpiederumus.
        </p>

        <h2>10. Laikapstākļi</h2>
        <p>
          Stipra vēja un lietus laikā lietošana ir aizliegta. Pēkšņa lietus
          gadījumā atrakcija jāatvieno no gaisa pūtēja, pūtējs jāatslēdz no
          elektrības un jāsargā no mitruma.
        </p>

        <h2>11. Inventāra (ne atrakciju) noteikumi</h2>
        <p>
          Jānodrošina drošs elektrības pieslēgums. Lietū vai vējā lietošana ir
          aizliegta; pēkšņa lietus gadījumā inventārs jāatvieno un jānovieto zem
          jumta. Bojājumu gadījumā piemēro pieņemšanas-nodošanas aktā un nomas
          līgumā norādīto kārtību.
        </p>

        <h2>12. Force majeure</h2>
        <p>
          Neviena no pusēm nav atbildīga par saistību neizpildi, ja to izraisījuši
          nepārvaramas varas apstākļi (dabas katastrofas, ārkārtas situācijas,
          valsts noteikti ierobežojumi u.tml.). Šādos gadījumos puses vienojas par
          pasākuma pārcelšanu vai citu risinājumu.
        </p>

        <h2>13. Strīdu risināšana un piemērojamie tiesību akti</h2>
        <p>
          Šiem noteikumiem un nomas attiecībām piemērojami Latvijas Republikas
          tiesību akti. Strīdus puses risina pārrunu ceļā, bet, ja vienošanās nav
          iespējama — Latvijas Republikas tiesā.
        </p>
      </Prose>
    </>
  );
}
