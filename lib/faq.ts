export type FaqCategory = "rezervacija" | "piegade" | "produkti" | "maksajumi";

export type FaqItem = {
  question: string;
  answer: string;
  category: FaqCategory;
};

export const faqCategories: { id: FaqCategory; label: string }[] = [
  { id: "rezervacija", label: "Rezervācija" },
  { id: "piegade", label: "Piegāde" },
  { id: "produkti", label: "Produkti" },
  { id: "maksajumi", label: "Maksājumi" },
];

export const faqItems: FaqItem[] = [
  {
    category: "rezervacija",
    question: "Cik iepriekš jārezervē inventārs?",
    answer:
      "Iesakām rezervēt pēc iespējas ātrāk — populārākie datumi (piektdienas, sestdienas, svētku sezona) tiek izķerti pat vairākus mēnešus uz priekšu. Ja datums ir tuvu, tik un tā sazinies — bieži izdodas atrast risinājumu.",
  },
  {
    category: "rezervacija",
    question: "Vai varu atcelt vai pārcelt rezervāciju?",
    answer:
      "Jā, rezervāciju var pārcelt vai atcelt saskaņā ar nomas noteikumiem. Atcelšanas termiņi un depozīta atgriešanas nosacījumi ir aprakstīti sadaļā “Nomas noteikumi”. Ja plāni mainās, sazinies ar mums pēc iespējas ātrāk.",
  },
  {
    category: "rezervacija",
    question: "Vai foto kastei ir operators?",
    answer:
      "Jā, SPOGULIS un INSTAGRAM foto kastes darbojas kopā ar mūsu operatoru visu nomas laiku. Viņš palīdz viesiem, seko līdzi izdrukām un nodrošina, ka viss norit gludi.",
  },
  {
    category: "rezervacija",
    question: "Vai strādājat arī darbadienās?",
    answer:
      "Jā. Pasākumus apkalpojam visas nedēļas dienas, arī darbadienās un ārpus standarta darba laika pēc iepriekšējas vienošanās.",
  },
  {
    category: "piegade",
    question: "Vai piegādājat ārpus Rīgas? Cik tas maksā?",
    answer:
      "Piegāde Ķekavas novadā ir bez maksas. Tālāk piemērojam 25 € par 100 km (aprēķins turp-atpakaļ). Precīzu piegādes cenu Tavai adresei aprēķinām rezervācijas laikā.",
  },
  {
    category: "piegade",
    question: "Cik ilgi aizņem uzstādīšana?",
    answer:
      "Foto kastes uzstādīšana aizņem apmēram 30–45 minūtes, piepūšamās atrakcijas — līdzīgi. Ierodamies laikus pirms pasākuma sākuma, lai viss būtu gatavs, kad ierodas viesi. Uzstādīšana un demontāža ir iekļauta cenā.",
  },
  {
    category: "piegade",
    question: "Cik daudz vietas un vai vajag elektrību?",
    answer:
      "Foto kastēm nepieciešama pieeja 230V rozetei un aptuveni 2×2 m brīvas vietas. Piepūšamajai pilij vajag ~4×4 m līdzenu laukumu un 230V pieslēgumu gaisa pūtējam. Pagarinātājus un pūtēju nodrošinām mēs.",
  },
  {
    category: "piegade",
    question: "Kas notiek, ja līst lietus (piepūšamās atrakcijas)?",
    answer:
      "Piepūšamās atrakcijas nedrīkst lietot stiprā lietū vai vējā drošības apsvērumu dēļ. Ja laikapstākļi ir slikti, kopā vienojamies par pārcelšanu vai risinājumu. Detalizēti drošības un laikapstākļu noteikumi ir sadaļā “Nomas noteikumi”.",
  },
  {
    category: "produkti",
    question: "Cik fotogrāfijas var uztaisīt? Vai drukā uz vietas?",
    answer:
      "Nomas laikā izdrukas ir neierobežotas — viesi var fotografēties tik reižu, cik vēlas. Fotogrāfijas tiek izdrukātas uz vietas dažu sekunžu laikā, un pēc pasākuma saņemat arī digitālo kopiju.",
  },
  {
    category: "produkti",
    question: "Vai var pielāgot izdruku dizainu vai pievienot logo?",
    answer:
      "Jā. Izdrukas dizainu pielāgojam pasākumam — pievienojam vārdus, datumu vai uzņēmuma logo. Dizainu saskaņojam iepriekš, lai viss atbilst Tavai iecerei.",
  },
  {
    category: "produkti",
    question: "Vai varat ieteikt papildu pakalpojumus?",
    answer:
      "Jā, labprāt. Bieži apvienojam foto kasti ar specefektiem (aukstās dzirksteles) vai audio grāmatu. Pastāsti par savu pasākumu, un ieteiksim piemērotāko komplektu.",
  },
  {
    category: "produkti",
    question: "Kas notiek, ja inventārs tiek sabojāts?",
    answer:
      "Normāls nolietojums ir paredzēts un nav problēma. Par tīšiem vai nolaidības rezultātā radītiem bojājumiem nomnieks atbild saskaņā ar nomas noteikumiem. Konkrētie nosacījumi ir aprakstīti sadaļā “Nomas noteikumi”.",
  },
  {
    category: "produkti",
    question: "Vai piepūšamās atrakcijas ir apdrošinātas un drošas?",
    answer:
      "Mūsu inventārs tiek regulāri pārbaudīts un uzturēts kārtībā. Pirms lietošanas sniedzam drošības instruktāžu. Piepūšamo atrakciju lietošanas laikā obligāta ir pieaugušo uzraudzība; vecuma un noslodzes ierobežojumi ir norādīti nomas noteikumos. [JĀAPSTIPRINA: apdrošināšanas statuss]",
  },
  {
    category: "maksajumi",
    question: "Kā notiek apmaksa?",
    answer:
      "Rezervāciju apstiprina depozīts, atlikušo summu samaksā pirms vai pasākuma dienā. Pieejami bezskaidras naudas norēķini. Precīzus depozīta un apmaksas nosacījumus skaties sadaļā “Nomas noteikumi”.",
  },
  {
    category: "maksajumi",
    question: "Vai izsniedzat rēķinu uzņēmumiem?",
    answer:
      "Jā, uzņēmumiem izsniedzam rēķinu. Rezervācijas laikā norādi uzņēmuma rekvizītus, un sagatavosim visus nepieciešamos grāmatvedības dokumentus. [JĀAPSTIPRINA: PVN maksātāja statuss un rekvizīti]",
  },
  {
    category: "maksajumi",
    question: "Vai depozīts tiek atgriezts?",
    answer:
      "Depozīta atgriešana ir atkarīga no atcelšanas termiņa un inventāra stāvokļa pēc pasākuma. Precīzie nosacījumi ir aprakstīti nomas noteikumos. [JĀAPSTIPRINA: konkrēti atcelšanas termiņi un depozīta apmērs]",
  },
];
