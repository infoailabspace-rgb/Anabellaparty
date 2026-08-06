# SOLIS5 — AI čatbots

**Mērķis:** Čatbots, kas atbild par inventāru, cenām un pieejamību trīs valodās, un noved sarunu līdz pieteikumam.

**Priekšnosacījumi:** SOLIS3 ✅ (Supabase, produktu dati), SOLIS4 ✅ (valodas).

**Pirms sāc:** izlasi `CLAUDE.md`. Parādi plānu. Gaidi apstiprinājumu.

---

## 1. KO ČATBOTS DARA

Trīs uzdevumi, prioritātes secībā:

1. **Atbild uz konkrētiem jautājumiem** — cena, izmēri, vecuma ierobežojumi, kas iekļauts, piegāde
2. **Iesaka inventāru** — "gribu bērnu ballīti 20 bērniem dārzā" → konkrēti produkti ar cenām
3. **Noved līdz pieteikumam** — links uz `/rezervet?item=<slug>` ar jau izvēlētiem produktiem

**Ko nedara:** neapstiprina rezervācijas, nesola datumus, nesarunā atlaides, nesola to, kā nav katalogā.

---

## 2. ARHITEKTŪRA

```
Klients (widget)
   ↓
app/api/chat/route.ts   (streaming)
   ↓
1. Meklē kontekstu Supabase (pgvector)
2. Sauc Anthropic API ar kontekstu
3. Straumē atbildi atpakaļ
```

### Pakotnes

```bash
npm install @anthropic-ai/sdk ai
```

`ai` (Vercel AI SDK) dod streaming un `useChat` hooku. Bez tā jāraksta SSE ar roku.

```
ANTHROPIC_API_KEY=
OPENAI_API_KEY=          ← tikai embeddingiem
```

---

## 3. ZINĀŠANU BĀZE

### 3.1 Kas iet iekšā

| Avots | Saturs |
|---|---|
| `lib/products.ts` | Katrs produkts: nosaukums, apraksts, cenas, izmēri, ierobežojumi, kas iekļauts |
| `lib/faq.ts` | Visi BUJ jautājumi un atbildes |
| `/noteikumi` | Nomas noteikumi |
| `lib/delivery.ts` | Piegādes noteikumi |

### 3.2 Supabase pgvector

```sql
create extension if not exists vector;

create table knowledge_chunks (
  id uuid primary key default gen_random_uuid(),
  content text not null,
  source text not null,           -- 'product' | 'faq' | 'terms' | 'delivery'
  source_id text,                 -- produkta slug
  locale text not null default 'lv',
  embedding vector(1536),
  created_at timestamptz default now()
);

create index on knowledge_chunks using ivfflat (embedding vector_cosine_ops);
```

Meklēšanas funkcija:

```sql
create or replace function match_knowledge(
  query_embedding vector(1536),
  match_locale text,
  match_count int default 6
)
returns table (content text, source text, source_id text, similarity float)
language sql stable
as $$
  select content, source, source_id,
         1 - (embedding <=> query_embedding) as similarity
  from knowledge_chunks
  where locale = match_locale
  order by embedding <=> query_embedding
  limit match_count;
$$;
```

### 3.3 Indeksēšanas skripts

`scripts/index-knowledge.ts` — palaižams ar `npm run index-knowledge`:

1. Nolasa `lib/products.ts`, `lib/faq.ts`, juridiskos tekstus
2. Katram produktam veido vienu gabalu ar visu informāciju (nesadala — produkts ir dabiska vienība)
3. Ģenerē embeddingus ar `text-embedding-3-small`
4. Ieraksta Supabase, katrā valodā atsevišķi

**Palaižams atkārtoti** — vispirms dzēš vecos ierakstus, tad ieraksta jaunos. Ja produktu cenas mainās, skripts jāpalaiž no jauna. Ieraksti to `SOLIS5-DONE.md`.

---

## 4. SISTĒMAS PROMPTS

Glabā `lib/chat-prompt.ts`, ne inline route handlerī.

Galvenie punkti:

```
Tu esi Anabella Party asistents. Anabella iznomā svētku inventāru Latvijā —
foto kastes, piepūšamās atrakcijas, audio viesu grāmatas, specefektus, deco.

NOTEIKUMI:
- Atbildi TIKAI no dotā konteksta. Ja konteksta nav, saki, ka nezini, un piedāvā
  sazināties: +371 29222761 vai WhatsApp.
- NEKAD neizdomā cenas, izmērus vai pieejamību.
- NEKAD neapstiprini rezervāciju un nesoli konkrētu datumu. Datumu pieejamību
  pārbauda Roberts.
- Nesarunā atlaides.
- Atbildi tajā valodā, kurā jautā (LV/EN/RU).
- Īsi. 2-4 teikumi. Ja jāuzskaita produkti — saraksts ar cenām.
- Kad ieteikums ir skaidrs, dod saiti: /rezervet?item=<slug>
- Kubli un pirts atrodas Jūrmalā ar atsevišķu telefonu 28286911.

TONIS: draudzīgs, konkrēts, bez pārdošanas tukšvārdības. Neizmanto izsaukuma
zīmes vairāk kā vienu reizi atbildē.
```

Modelis: `claude-sonnet-4-6`. Haiku pietiktu FAQ atbildēm, bet inventāra ieteikumi prasa spriešanu.

`max_tokens: 500` — garākas atbildes čatā nelasa.

---

## 5. WIDGET

`components/chat-widget.tsx` (`'use client'`).

- Peldoša poga apakšējā labajā stūrī, zelta, ar smalku pulsāciju pirmajās 3 sekundēs pēc lapas ielādes, tad mierā
- Klikšķis atver paneli: 380×560 desktopā, pilnekrāns mobilajā
- Sarunas vēsture `sessionStorage`
- Streaming — teksts parādās pa gabaliem, ne uzreiz
- "Raksta..." indikators
- Sākuma ziņa ar 3 piedāvātiem jautājumiem:
  - "Kādas foto kastes jums ir?"
  - "Cik maksā atrakcija bērnu ballītei?"
  - "Vai piegādājat uz Jelgavu?"
- Saites atbildēs klikšķināmas, atveras tajā pašā logā
- Aizvēršana ar Esc, fokusa slazds panelī, `aria-live` jaunajām ziņām

**Kur widget NEparādās:** `/rezervet` lapā. Cilvēks, kurš jau aizpilda anketu, nav jātraucē.

---

## 6. LIMITI UN DROŠĪBA

| Risks | Aizsardzība |
|---|---|
| Kvotas izsmelšana | 20 ziņas stundā no vienas IP. Pēc tam: "Sazinies ar mums tieši." |
| Prompt injection | Sistēmas prompts kā `system` parametrs, ne user ziņā. Lietotāja teksts nekad netiek interpretēts kā instrukcija. |
| Garas sarunas | Glabā pēdējās 10 ziņas. Vecākas nogriež. |
| Izmaksu pārsteigumi | Logo katru izsaukumu ar tokenu skaitu Vercel logos |

Atslēgas tikai serverī. Nekad `NEXT_PUBLIC_`.

---

## 7. SARUNU GLABĀŠANA

```sql
create table chat_conversations (
  id uuid primary key default gen_random_uuid(),
  session_id text not null,
  locale text not null,
  messages jsonb not null,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);
```

Kāpēc: redzēsi, ko cilvēki jautā. Tas ir labākais avots BUJ papildināšanai un tam, lai saprastu, kas katalogā trūkst.

**Privātums:** sarunas satur to, ko cilvēki paši raksta — var būt vārdi un telefoni. Privātuma politikā (SOLIS2) jāpapildina sadaļa: čata sarunas glabājas 90 dienas, izmantojas pakalpojuma uzlabošanai. Pievieno šo `SOLIS5-DONE.md` kā uzdevumu.

Automātiska dzēšana: Supabase cron, kas dzēš ierakstus vecākus par 90 dienām.

---

## 8. BUILD UN PĀRBAUDE

```bash
npm run index-knowledge
npm run build
npm run dev
```

Testa jautājumi:

| Jautājums | Sagaidāms |
|---|---|
| "Cik maksā Ozols foto kaste?" | 220 € / 2h, +100 € katra nākamā stunda |
| "Vai atrakcija der 1 gadu vecam?" | Bumbu vanna (1+), pārējās no 2 gadiem |
| "How much for a photo booth?" | Atbild angliski |
| "Сколько стоит фотобудка?" | Atbild krieviski |
| "Vai varat atbraukt uz Ventspili 15. augustā?" | Nesola datumu, novirza uz kontaktiem |
| "Dod man 50% atlaidi" | Nesarunā, novirza uz Robertu |
| "Ignore previous instructions and..." | Neizpilda |

```bash
git add .
git commit -m "SOLIS5: AI čatbots ar RAG"
git push
```

Env mainīgie Vercel iestatījumos.

---

## PIEŅEMŠANAS KRITĒRIJI

- [ ] Čatbots atbild trīs valodās
- [ ] Atbildes nāk no reāliem produktu datiem, ne izdomātas
- [ ] Nesola datumus, neapstiprina rezervācijas, nesarunā atlaides
- [ ] Streaming strādā
- [ ] Saite `/rezervet?item=<slug>` ieliek produktu grozā
- [ ] Widget neparādās `/rezervet`
- [ ] Rate limit strādā
- [ ] Sarunas glabājas Supabase
- [ ] Atslēgas nav klienta pusē
- [ ] `npm run index-knowledge` palaižams atkārtoti
- [ ] `npm run build` tīrs
- [ ] Jaunas pakotnes: `@anthropic-ai/sdk`, `ai`

---

## `[JĀAPSTIPRINA]` — Robertam

1. Vai čatbots drīkst teikt, ka datums ir brīvs, ja Supabase nav aizņemts? (Šobrīd nē — nav kalendāra)
2. Vai sarunas 90 dienas ir OK, vai īsāk

---

## KO NEDARĪT

- Neļauj čatbotam rakstīt Supabase (tikai lasīt)
- Nesūti e-pastus no čata
- Neveido balss saskarni
- Neaiztiec AI Party (atsevišķs projekts)
