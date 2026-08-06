export type Partner = {
  name: string;
  description: string;
  url?: string;
};

// Reālie partneri no Roberta — pagaidām tukšs. Kamēr tukšs, /musu-draugi rāda
// godīgu tukšā stāvokļa paziņojumu (nevis placeholderus).
// [VAJAG NO ROBERTA: partneru saraksts — nosaukums, apraksts, saite]
export const partners: Partner[] = [];
