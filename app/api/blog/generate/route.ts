import Anthropic from "@anthropic-ai/sdk";
import { createClient } from "@/lib/supabase/server";
import { getProductBySlug } from "@/lib/catalog";

export const runtime = "nodejs";

const MODEL = "claude-sonnet-4-6";
const RATE_LIMIT = 10; // ģenerēšanas stundā uz admin

const SYSTEM = `Tu raksti Anabella Party blogam. Anabella iznomā svētku inventāru Latvijā.
Īpašnieki — Aiva un Roberts Dimanti, kuri atstāja stabilus darbus, lai darītu to, kas patīk.

TONIS: silts, personisks, konkrēts. Kā stāsts draugam, ne kā reklāma.
Latviešu valoda, nekļūdīga gramatika, pareizi garumzīmes un mīkstinājuma zīmes.

NOTEIKUMI:
- Balsties TIKAI uz dotajām piezīmēm un produktu datiem. Neizdomā detaļas.
- Nekādu tukšu frāžu: "neaizmirstams", "īpašs mirklis", "padarīs jūsu pasākumu neaizmirstamu". Ja teikumu var ielikt jebkurā citā rakstā — izmet.
- Konkrētība pār emocijām. "340 izdrukas līdz pusnaktij" ir vērtīgāk par "viesi bija sajūsmā".
- 400–700 vārdi. Īsi teikumi. Rindkopas 2–4 teikumi.
- Nesola konkrētus datumus vai pieejamību.
- Cenas min tikai tad, ja tās ir dotajos datos.
- Struktūra: ievads (kas notika) → detaļas (kā tas izskatījās) → praktisks padoms lasītājam → maigs aicinājums.
- Aicinājums viens, raksta beigās. Ne katrā rindkopā.

NERAKSTI: "Vai vēlaties, lai jūsu pasākums būtu neaizmirstams?" un tamlīdzīgi.`;

function json(obj: unknown, status: number) {
  return new Response(JSON.stringify(obj), {
    status,
    headers: { "content-type": "application/json" },
  });
}

/* eslint-disable @typescript-eslint/no-explicit-any */
function textOf(msg: any): string {
  return msg.content
    .filter((b: any) => b.type === "text")
    .map((b: any) => b.text)
    .join("");
}

function parseJson(text: string): any | null {
  let t = text.trim();
  const fence = t.match(/```(?:json)?\s*([\s\S]*?)```/i);
  if (fence) t = fence[1].trim();
  else {
    const i = t.indexOf("{");
    const j = t.lastIndexOf("}");
    if (i >= 0 && j > i) t = t.slice(i, j + 1);
  }
  try {
    return JSON.parse(t);
  } catch {
    return null;
  }
}

export async function POST(req: Request) {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) return json({ error: "AI pagaidām nav pieejams." }, 503);

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return json({ error: "Nav autorizēts." }, 401);
  const { data: isAdmin } = await supabase.rpc("is_admin");
  if (!isAdmin) return json({ error: "Nav piekļuves." }, 403);

  let body: any;
  try {
    body = await req.json();
  } catch {
    return json({ error: "Nederīgs pieprasījums." }, 400);
  }

  // Rate limit (abiem režīmiem)
  const since = new Date(Date.now() - 3600_000).toISOString();
  const { count } = await supabase
    .from("blog_gen_log")
    .select("id", { count: "exact", head: true })
    .eq("admin_email", user.email ?? "?")
    .gte("created_at", since);
  if ((count ?? 0) >= RATE_LIMIT)
    return json({ error: "Sasniegts ģenerēšanas limits (10/h). Pamēģini vēlāk." }, 429);

  const anthropic = new Anthropic({ apiKey });
  const logGen = () => supabase.from("blog_gen_log").insert({ admin_email: user.email ?? "?" });

  /* ── Režīms: pārģenerēt fragmentu ── */
  if (body.mode === "section") {
    const sectionText = String(body.sectionText ?? "").trim();
    const instruction = String(body.instruction ?? "").trim();
    if (sectionText.length < 3) return json({ error: "Nav teksta fragmenta." }, 400);
    let out = "";
    try {
      const msg = await anthropic.messages.create({
        model: MODEL,
        max_tokens: 1500,
        temperature: 0.8,
        system: SYSTEM,
        messages: [
          {
            role: "user",
            content: `Pārraksti šo raksta fragmentu latviski. Norāde: ${
              instruction || "uzlabo skaidrību un konkrētību"
            }. Saglabā toni un faktus, neizdomā jaunus. Atgriez TIKAI pārrakstīto tekstu markdown formātā, bez komentāriem un bez pēdiņām apkārt.\n\nFragments:\n${sectionText}`,
          },
        ],
      });
      out = textOf(msg).trim();
    } catch {
      return json({ error: "Pārģenerēšana neizdevās." }, 502);
    }
    if (!out) return json({ error: "Tukša atbilde." }, 502);
    await logGen();
    return json({ text: out }, 200);
  }

  /* ── Režīms: pilnā ģenerēšana ── */
  const notes = String(body.notes ?? "").trim();
  const products: string[] = Array.isArray(body.products)
    ? body.products.filter((s: any) => typeof s === "string")
    : [];
  const eventType = String(body.eventType ?? "").trim();
  const articleType = String(body.articleType ?? "").trim();
  const place = String(body.place ?? "").trim();
  const guests = String(body.guests ?? "").trim();

  if (notes.length < 20)
    return json({ error: "Piezīmes ir obligātas — vismaz 20 zīmes." }, 400);
  if (products.length === 0)
    return json({ error: "Izvēlies vismaz vienu inventāra vienību." }, 400);
  if (!eventType || !articleType)
    return json({ error: "Trūkst pasākuma veida vai raksta tipa." }, 400);

  const resolved = await Promise.all(products.map((s) => getProductBySlug(s)));
  const productBlock = resolved
    .filter(Boolean)
    .map((p: any) => {
      const tiers = (p.tiers ?? [])
        .map((t: any) =>
          t.price ? `${t.duration}: €${t.price}` : `${t.duration}: ${t.note ?? "vienojoties"}`,
        )
        .join("; ");
      return `- ${p.name}: ${p.tagline}. ${p.description} Cenas: ${tiers || "vienojoties"}.`;
    })
    .join("\n");

  const userPrompt = `Pasākuma veids: ${eventType}
Raksta tips: ${articleType}
${place ? `Vieta: ${place}\n` : ""}${guests ? `Viesu skaits: ${guests}\n` : ""}Izmantotais inventārs:
${productBlock}

Roberta piezīmes (balsties TIKAI uz šīm un produktu datiem):
${notes}

Atgriez STINGRI derīgu JSON (bez koda blokiem, bez teksta apkārt) ar laukiem:
{
  "title": ["3 virsraksta varianti latviski"],
  "excerpt": "1-2 teikumi sarakstam un OG",
  "content": "raksts markdown formātā (## apakšvirsraksti, rindkopas), BEZ HTML",
  "metaDescription": "150-160 zīmes",
  "suggestedTags": ["3-6 tagi mazajiem burtiem"],
  "social": { "facebook": "2-3 teikumi + aicinājums", "instagram": "īsāks, ar 5-8 tagiem", "whatsapp": "viens teikums" }
}`;

  let text = "";
  try {
    const msg = await anthropic.messages.create({
      model: MODEL,
      max_tokens: 4000,
      temperature: 0.85,
      system: SYSTEM,
      messages: [{ role: "user", content: userPrompt }],
    });
    text = textOf(msg);
  } catch {
    return json({ error: "AI ģenerēšana neizdevās. Pamēģini vēlreiz." }, 502);
  }

  const parsed = parseJson(text);
  if (!parsed || !parsed.content)
    return json({ error: "AI atbilde nebija derīga. Pamēģini vēlreiz." }, 502);

  await logGen();
  return json(parsed, 200);
}
