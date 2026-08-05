export type Client = {
  name: string;
  logo: string; // /images/clients/<slug>.svg vai .png
  url?: string;
};

// [JĀAPSTIPRINA] — Robertam: reālie klientu logo un vai drīkst tos publiskot.
// Pagaidām 8 placeholderi, lai izkārtojums ir redzams.
export const clients: Client[] = Array.from({ length: 8 }, (_, i) => ({
  name: `Klients ${i + 1}`,
  logo: `/images/clients/klients-${i + 1}.svg`,
}));
