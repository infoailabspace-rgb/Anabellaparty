import type { Metadata } from "next";
import SectionHero from "@/components/section-hero";
import Prose from "@/components/prose";

export const metadata: Metadata = {
  title: "Nomas noteikumi | Anabella Party",
  description:
    "Anabella Party inventāra nomas noteikumi: rezervācija, depozīts, atcelšana, piegāde, atbildība un drošība. Pasākumu inventāra noma Latvijā.",
};

export default function NoteikumiPage() {
  return (
    <>
      <SectionHero
        title="Nomas noteikumi"
        tagline="Skaidri noteikumi, lai sadarbība būtu vienkārša un droša abām pusēm."
      />
      <Prose>
        <p className="text-sm text-text/50">
          Pēdējoreiz atjaunināts: 2026. gada augusts. Šie noteikumi ir sagatave un
          var tikt precizēti.
        </p>

        <h2>1. Vispārīgie noteikumi</h2>
        <p>
          Iznomātājs ir Anabella Party (turpmāk — Iznomātājs), kas nodarbojas ar
          pasākumu inventāra nomu Latvijā. Kontakti: tālrunis +371 29222761,
          e-pasts info@anabellaparty.lv, adrese Ķekava, Latvija.{" "}
          [JĀAPSTIPRINA: juridiskā forma, reģistrācijas numurs, juridiskā adrese].
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
          Iznomātājs to ir rakstiski apstiprinājis un saņemts depozīts (skat. 3.
          punktu). Iznomātājs patur tiesības atteikt rezervāciju, ja izvēlētais
          datums nav pieejams.
        </p>

        <h2>3. Depozīts un apmaksa</h2>
        <p>
          Rezervācijas apstiprināšanai tiek piemērots depozīts.{" "}
          [JĀAPSTIPRINA: depozīta apmērs — SOLIS4 plāns paredz 20%]. Atlikusī
          summa jāsamaksā [JĀAPSTIPRINA: apmaksas termiņš — piem., pirms pasākuma
          vai pasākuma dienā]. Pieejami bezskaidras naudas norēķini; uzņēmumiem
          tiek izsniegts rēķins.
        </p>

        <h2>4. Atcelšana un pārcelšana</h2>
        <p>
          Nomnieks var atcelt vai pārcelt rezervāciju, iepriekš par to paziņojot
          Iznomātājam. Depozīta atgriešana ir atkarīga no atcelšanas termiņa.{" "}
          [JĀAPSTIPRINA: konkrēti atcelšanas termiņi un depozīta atgriešanas
          nosacījumi, piem., atcelšana &gt;14 dienas — depozīts atgriežams pilnā
          apmērā].
        </p>

        <h2>5. Piegāde, uzstādīšana un demontāža</h2>
        <p>
          Piegāde Pierīgā ir bez maksas. Ārpus Pierīgas tiek piemērota maksa
          €0.50 par kilometru. Uzstādīšana un demontāža ir iekļauta nomas cenā.
          Nomnieks nodrošina piekļuvi objektam un iepriekš saskaņotu uzstādīšanas
          laiku.
        </p>

        <h2>6. Nomnieka pienākumi</h2>
        <ul>
          <li>Nodrošināt piemērotu, līdzenu un tīru uzstādīšanas vietu.</li>
          <li>Nodrošināt pieeju 230V elektrības pieslēgumam.</li>
          <li>
            Nodrošināt inventāra atbilstošu lietošanu un uzraudzību visa pasākuma
            laikā.
          </li>
          <li>
            Nepieļaut inventāra lietošanu neparedzētiem mērķiem vai bojāšanu.
          </li>
        </ul>

        <h2>7. Atbildība par bojājumiem un zudumiem</h2>
        <p>
          Normāls nolietojums ir paredzēts un netiek atlīdzināts. Par inventāra
          bojājumiem vai zudumiem, kas radušies Nomnieka vai tā viesu nolaidības
          vai tīšas rīcības dēļ, atbild Nomnieks un atlīdzina remonta vai
          aizvietošanas izmaksas.{" "}
          [JĀAPSTIPRINA: atbildības apmēra kārtība un iespējamā drošības nauda].
        </p>

        <h2>8. Drošības noteikumi (piepūšamās atrakcijas)</h2>
        <ul>
          <li>Obligāta pastāvīga pieaugušo uzraudzība lietošanas laikā.</li>
          <li>
            Jāievēro vecuma un noslodzes ierobežojumi.{" "}
            [JĀAPSTIPRINA: maksimālais lietotāju skaits, vecuma/svara
            ierobežojumi].
          </li>
          <li>
            Atrakcijas nedrīkst lietot stiprā lietū, vējā vai citos nedrošos
            laikapstākļos.
          </li>
          <li>Aizliegts lietot apavus, asus priekšmetus, pārtiku un dzērienus atrakcijā.</li>
        </ul>

        <h2>9. Force majeure</h2>
        <p>
          Neviena no pusēm nav atbildīga par saistību neizpildi, ja to izraisījuši
          nepārvaramas varas apstākļi (dabas katastrofas, ārkārtas situācijas,
          valsts noteikti ierobežojumi u.tml.). Šādos gadījumos puses vienojas par
          pasākuma pārcelšanu vai citu risinājumu.
        </p>

        <h2>10. Strīdu risināšana un piemērojamie tiesību akti</h2>
        <p>
          Šiem noteikumiem un nomas attiecībām piemērojami Latvijas Republikas
          tiesību akti. Strīdus puses risina pārrunu ceļā, bet, ja vienošanās nav
          iespējama — Latvijas Republikas tiesā.
        </p>
      </Prose>
    </>
  );
}
