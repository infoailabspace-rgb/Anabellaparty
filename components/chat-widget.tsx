"use client";

import { usePathname } from "next/navigation";
import { useEffect, useRef, useState, type ReactNode } from "react";

type Msg = { role: "user" | "assistant"; content: string };

const STORAGE = "anabella-chat";
const GREETING =
  "Sveiki! Es palīdzēšu ar Anabella Party inventāru — cenas, izmēri, piegāde. Kā varu palīdzēt?";
const SUGGESTIONS = [
  "Kādas foto kastes jums ir?",
  "Cik maksā atrakcija bērnu ballītei?",
  "Vai piegādājat uz Jelgavu?",
];

// Padara saites (URL, /rezervet?item=..., telefonu) klikšķināmas.
function linkify(text: string): ReactNode[] {
  const re = /(https?:\/\/[^\s]+|\/[a-z][^\s]*|\+371\s?\d[\d\s]{6,}\d)/gi;
  const parts: ReactNode[] = [];
  let last = 0;
  let m: RegExpExecArray | null;
  let key = 0;
  while ((m = re.exec(text)) !== null) {
    if (m.index > last) parts.push(text.slice(last, m.index));
    const token = m[0];
    let href = token;
    if (token.startsWith("+371")) href = `tel:${token.replace(/\s/g, "")}`;
    parts.push(
      <a
        key={key++}
        href={href}
        target={token.startsWith("http") ? "_blank" : undefined}
        rel={token.startsWith("http") ? "noopener noreferrer" : undefined}
        className="text-gold underline underline-offset-2"
      >
        {token.trim()}
      </a>,
    );
    last = m.index + token.length;
  }
  if (last < text.length) parts.push(text.slice(last));
  return parts;
}

export default function ChatWidget() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const [pulse, setPulse] = useState(true);
  const [messages, setMessages] = useState<Msg[]>([]);
  const [input, setInput] = useState("");
  const [streaming, setStreaming] = useState(false);
  const sessionRef = useRef<string>("");
  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Sesija + vēsture
  useEffect(() => {
    try {
      sessionRef.current =
        sessionStorage.getItem(STORAGE + "-id") ||
        (crypto.randomUUID?.() ?? String(Date.now()));
      sessionStorage.setItem(STORAGE + "-id", sessionRef.current);
      const raw = sessionStorage.getItem(STORAGE);
      if (raw) setMessages(JSON.parse(raw));
    } catch {
      /* ignore */
    }
    const t = setTimeout(() => setPulse(false), 3000);
    return () => clearTimeout(t);
  }, []);

  useEffect(() => {
    try {
      sessionStorage.setItem(STORAGE, JSON.stringify(messages));
    } catch {
      /* ignore */
    }
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight });
  }, [messages, streaming]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    window.addEventListener("keydown", onKey);
    inputRef.current?.focus();
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);

  // Neparādās rezervācijas lapā
  if (pathname?.startsWith("/rezervet")) return null;

  async function send(text: string) {
    const q = text.trim();
    if (!q || streaming) return;
    const next: Msg[] = [...messages, { role: "user", content: q }];
    setMessages(next);
    setInput("");
    setStreaming(true);
    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: next,
          sessionId: sessionRef.current,
          locale:
            (typeof navigator !== "undefined" && navigator.language?.slice(0, 2)) ||
            "lv",
        }),
      });
      if (!res.ok || !res.body) {
        const errText = await res.text();
        setMessages((m) => [...m, { role: "assistant", content: errText }]);
        setStreaming(false);
        return;
      }
      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let acc = "";
      setMessages((m) => [...m, { role: "assistant", content: "" }]);
      for (;;) {
        const { done, value } = await reader.read();
        if (done) break;
        acc += decoder.decode(value, { stream: true });
        setMessages((m) => {
          const copy = [...m];
          copy[copy.length - 1] = { role: "assistant", content: acc };
          return copy;
        });
      }
    } catch {
      setMessages((m) => [
        ...m,
        {
          role: "assistant",
          content:
            "Radās kļūda. Sazinies ar mums tieši: +371 29222761 vai WhatsApp.",
        },
      ]);
    } finally {
      setStreaming(false);
    }
  }

  return (
    <>
      {/* Peldošā poga */}
      <button
        type="button"
        onClick={() => {
          setOpen((v) => !v);
          setPulse(false);
        }}
        aria-label={open ? "Aizvērt čatu" : "Atvērt čatu"}
        className={`fixed bottom-5 right-5 z-[70] flex h-14 w-14 items-center justify-center rounded-full bg-gold text-black shadow-[0_10px_30px_-8px_rgba(212,169,96,0.6)] transition-transform hover:scale-105 ${
          pulse && !open ? "anabella-chat-pulse" : ""
        }`}
      >
        {open ? (
          <span className="text-2xl">✕</span>
        ) : (
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="h-7 w-7">
            <path d="M21 11.5a8.38 8.38 0 0 1-8.5 8.5 8.5 8.5 0 0 1-3.8-.9L3 20l1.4-4.2a8.5 8.5 0 1 1 16.6-4.3Z" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        )}
      </button>

      {/* Panelis */}
      {open && (
        <div
          role="dialog"
          aria-label="Anabella Party čats"
          className="fixed inset-0 z-[69] flex flex-col bg-navy sm:inset-auto sm:bottom-24 sm:right-5 sm:h-[560px] sm:w-[380px] sm:rounded-2xl sm:border sm:border-gold/30 sm:shadow-2xl overflow-hidden"
        >
          {/* Galvene */}
          <div className="flex items-center justify-between border-b border-gold/25 bg-navy/80 px-4 py-3">
            <div>
              <p className="font-display font-semibold text-gold">Anabella Party</p>
              <p className="text-xs text-text/60">Inventāra asistents</p>
            </div>
            <button
              type="button"
              onClick={() => setOpen(false)}
              aria-label="Aizvērt"
              className="text-text/60 hover:text-gold"
            >
              ✕
            </button>
          </div>

          {/* Ziņas */}
          <div
            ref={scrollRef}
            aria-live="polite"
            className="flex-1 space-y-3 overflow-y-auto p-4"
          >
            <Bubble role="assistant">{GREETING}</Bubble>
            {messages.length === 0 && (
              <div className="space-y-2">
                {SUGGESTIONS.map((s) => (
                  <button
                    key={s}
                    type="button"
                    onClick={() => send(s)}
                    className="block w-full rounded-lg border border-gold/25 bg-bg/40 px-3 py-2 text-left text-sm text-text/85 transition-colors hover:border-gold/60"
                  >
                    {s}
                  </button>
                ))}
              </div>
            )}
            {messages.map((m, i) => (
              <Bubble key={i} role={m.role}>
                {m.role === "assistant" ? linkify(m.content) : m.content}
              </Bubble>
            ))}
            {streaming &&
              messages[messages.length - 1]?.role === "user" && (
                <Bubble role="assistant">
                  <span className="inline-flex gap-1">
                    <Dot delay={0} />
                    <Dot delay={150} />
                    <Dot delay={300} />
                  </span>
                </Bubble>
              )}
          </div>

          {/* Ievade */}
          <form
            onSubmit={(e) => {
              e.preventDefault();
              send(input);
            }}
            className="flex items-center gap-2 border-t border-gold/25 p-3"
          >
            <input
              ref={inputRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Uzraksti jautājumu…"
              className="flex-1 rounded-full border border-gold/25 bg-bg/60 px-4 py-2 text-sm text-text outline-none focus:border-gold"
            />
            <button
              type="submit"
              disabled={streaming || !input.trim()}
              aria-label="Sūtīt"
              className="flex h-9 w-9 items-center justify-center rounded-full bg-gold text-black transition-transform hover:scale-105 disabled:opacity-50"
            >
              ↑
            </button>
          </form>
        </div>
      )}
    </>
  );
}

function Bubble({ role, children }: { role: "user" | "assistant"; children: ReactNode }) {
  const isUser = role === "user";
  return (
    <div className={`flex ${isUser ? "justify-end" : "justify-start"}`}>
      <div
        className={`max-w-[85%] whitespace-pre-wrap rounded-2xl px-4 py-2 text-sm leading-relaxed ${
          isUser
            ? "bg-gold text-black"
            : "border border-gold/20 bg-bg/50 text-text/90"
        }`}
      >
        {children}
      </div>
    </div>
  );
}

function Dot({ delay }: { delay: number }) {
  return (
    <span
      className="h-1.5 w-1.5 animate-bounce rounded-full bg-gold"
      style={{ animationDelay: `${delay}ms` }}
    />
  );
}
