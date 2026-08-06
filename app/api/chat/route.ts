import Anthropic from "@anthropic-ai/sdk";
import { getSupabaseServer } from "@/lib/supabase";
import { SYSTEM_RULES, buildKnowledgeBlock } from "@/lib/chat-prompt";

export const runtime = "nodejs";

const MODEL = "claude-sonnet-4-6";
const MAX_TOKENS = 500;
const HISTORY = 10; // pēdējās ziņas
const RATE_LIMIT = 20; // ziņas stundā uz IP

type Msg = { role: "user" | "assistant"; content: string };

function clientIp(req: Request): string {
  const fwd = req.headers.get("x-forwarded-for");
  if (fwd) return fwd.split(",")[0].trim();
  return req.headers.get("x-real-ip") || "unknown";
}

export async function POST(req: Request) {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    return new Response(
      "Čats pagaidām nav pieejams. Sazinies +371 29222761 vai WhatsApp.",
      { status: 503 },
    );
  }

  let body: { messages?: Msg[]; sessionId?: string; locale?: string };
  try {
    body = await req.json();
  } catch {
    return new Response("Nederīgs pieprasījums.", { status: 400 });
  }

  const all = Array.isArray(body.messages) ? body.messages : [];
  // Tikai user/assistant, pēdējās HISTORY, sākas ar user.
  let messages: Msg[] = all
    .filter(
      (m) =>
        (m.role === "user" || m.role === "assistant") &&
        typeof m.content === "string" &&
        m.content.trim().length > 0,
    )
    .slice(-HISTORY)
    .map((m) => ({ role: m.role, content: m.content.slice(0, 2000) }));
  while (messages.length && messages[0].role !== "user") messages.shift();

  if (messages.length === 0 || messages[messages.length - 1].role !== "user") {
    return new Response("Trūkst jautājuma.", { status: 400 });
  }

  const supabase = getSupabaseServer();
  const ip = clientIp(req);

  // Rate limit (drošs RPC, SECURITY DEFINER)
  if (supabase) {
    const { data: allowed, error } = await supabase.rpc("check_chat_rate", {
      p_ip: ip,
      p_limit: RATE_LIMIT,
      p_window: "1 hour",
    });
    if (!error && allowed === false) {
      return new Response(
        "Šodien esi uzdevis daudz jautājumu. Sazinies ar mums tieši: +371 29222761.",
        { status: 429 },
      );
    }
  }

  const anthropic = new Anthropic({ apiKey });
  const stream = anthropic.messages.stream({
    model: MODEL,
    max_tokens: MAX_TOKENS,
    system: [
      { type: "text", text: SYSTEM_RULES },
      {
        type: "text",
        text: buildKnowledgeBlock(),
        cache_control: { type: "ephemeral" },
      },
    ],
    messages,
  });

  const encoder = new TextEncoder();
  let full = "";

  const readable = new ReadableStream<Uint8Array>({
    async start(controller) {
      try {
        for await (const event of stream) {
          if (
            event.type === "content_block_delta" &&
            event.delta.type === "text_delta"
          ) {
            full += event.delta.text;
            controller.enqueue(encoder.encode(event.delta.text));
          }
        }
      } catch {
        controller.enqueue(
          encoder.encode(
            "\n\n(Radās kļūda. Sazinies +371 29222761 vai WhatsApp.)",
          ),
        );
      } finally {
        controller.close();
        // Glabā sarunu (fire-and-forget, insert-only)
        if (supabase && full.trim()) {
          const finalMessages = [...messages, { role: "assistant", content: full }];
          supabase
            .from("chat_conversations")
            .insert({
              session_id: body.sessionId || "anon",
              locale: body.locale || "lv",
              messages: finalMessages,
              ip,
            })
            .then(() => {}, () => {});
        }
      }
    },
  });

  return new Response(readable, {
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
      "Cache-Control": "no-store",
    },
  });
}
