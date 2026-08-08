export type Partner = {
  name: string;
  description: string;
  url?: string;
};

// Statiskais fallback — reālie partneri nāk no site_partners (getPartners).
// Kamēr tukšs, /musu-draugi rāda godīgu tukšā stāvokļa paziņojumu.
export const partners: Partner[] = [];
