import { getContent } from "@/lib/site-content";

const FALLBACK =
  "Piegāde Ķekavas novadā — bez maksas. Tālāk 25 € / 100 km (aprēķins turp-atpakaļ). Uzstādīšana un savākšana iekļauta cenā. Visas cenas norādītas bez PVN 21%.";

export default async function DeliveryNote() {
  const note = await getContent("delivery.note", FALLBACK);
  return (
    <div className="mx-auto max-w-3xl rounded-2xl border border-gold/20 bg-navy/20 p-6 text-center text-sm text-text/70">
      <p>{note}</p>
    </div>
  );
}
