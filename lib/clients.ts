export type Client = {
  name: string;
  logo: string; // /images/clients/<slug>.svg vai .png
  url?: string;
};

// Logo lentes ("Mums uzticas") statiskais fallback — tikai klienti, kas devuši
// atļauju logo publiskošanai. Reāli dati nāk no site_clients (getClients).
export const clients: Client[] = [];
