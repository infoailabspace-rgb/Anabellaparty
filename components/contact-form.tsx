"use client";

import { useState, type FormEvent } from "react";
import { useTranslations } from "next-intl";

export default function ContactForm() {
  const t = useTranslations("contactForm");
  const [status, setStatus] = useState<"idle" | "sending" | "sent" | "error">(
    "idle",
  );

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = e.currentTarget; // saglabā pirms await
    const data = Object.fromEntries(new FormData(form).entries());
    setStatus("sending");
    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!res.ok) throw new Error("send failed");
      setStatus("sent");
      form.reset();
    } catch {
      setStatus("error");
    }
  }

  const field =
    "w-full rounded-lg border border-gold/25 bg-bg/60 px-4 py-3 text-text placeholder:text-text/40 outline-none focus:border-gold";

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      <div className="grid gap-4 sm:grid-cols-2">
        <input name="name" required placeholder={t("name")} className={field} />
        <input
          name="email"
          type="email"
          required
          placeholder={t("email")}
          className={field}
        />
      </div>
      <input name="phone" placeholder={t("phone")} className={field} />
      <textarea
        name="message"
        required
        rows={5}
        placeholder={t("messagePh")}
        className={field}
      />
      <button
        type="submit"
        disabled={status === "sending"}
        className="self-start rounded-full bg-gold px-8 py-3 font-semibold text-black transition-shadow hover:shadow-[0_0_25px_rgba(212,169,96,0.5)] disabled:opacity-60"
      >
        {status === "sending" ? t("sending") : t("send")}
      </button>

      {status === "sent" && (
        <p className="text-sm text-gold" role="status">
          {t("sent")}
        </p>
      )}
      {status === "error" && (
        <p className="text-sm text-red-300" role="alert">
          {t("errSend")}
        </p>
      )}
    </form>
  );
}
