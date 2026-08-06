export type Client = {
  name: string;
  logo: string; // /images/clients/<slug>.svg vai .png
  url?: string;
};

// Logo lente ("Mums uzticas") — tikai tie klienti, kas devuši atļauju logo
// publiskošanai. Pagaidām tukša; Roberts pievieno vēlāk.
export const clients: Client[] = [];

// Tekstuālā "Mūsu klientu vidū" sadaļa — faktisks apgalvojums par klientiem,
// grupēts pa nozarēm. Nosaukumu minēšana ≠ logo publiskošana (nevajag atļauju).
export type ClientGroup = {
  sector: string;
  companies: string[];
};

export const clientGroups: ClientGroup[] = [
  { sector: "Finanses", companies: ["Swedbank", "SEB", "INDEXO", "Mintos", "iDeal"] },
  {
    sector: "Tirdzniecība",
    companies: ["Mango", "Tupperware", "Via Jurmala Outlet Village", "Teika Plaza"],
  },
  {
    sector: "Pārtika un ražošana",
    companies: ["Lāči", "Santa Maria", "Piana Vyshnia", "Skonto Prefab", "Visendorff"],
  },
  { sector: "Mediji un mārketings", companies: ["TVNET", "McCann Riga", "MOOZ"] },
  {
    sector: "Pašvaldības un sabiedrība",
    companies: ["Mārupes novads", "Ogres novada Jauniešu dome", "Mammām un Tētiem"],
  },
  { sector: "Pakalpojumi", companies: ["Lindström"] },
];
