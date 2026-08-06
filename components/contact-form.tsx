"use client";

import { useState, type FormEvent } from "react";
import { useTranslations } from "next-intl";

export default function ContactForm() {
  const t = useTranslations("contactForm");
  const [sent, setSent] = useState(false);

  function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const data = Object.fromEntries(new FormData(e.currentTarget).entries());
    // SOLIS4: reālā sūtīšana caur Resend. Pagaidām tikai UI.
    console.log("Kontaktforma (vēl nesūta):", data);
    setSent(true);
    e.currentTarget.reset();
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
        className="self-start rounded-full bg-gold px-8 py-3 font-semibold text-black transition-shadow hover:shadow-[0_0_25px_rgba(212,169,96,0.5)]"
      >
        {t("send")}
      </button>

      {sent && (
        <p className="text-sm text-gold" role="status">
          {t("sent")}
        </p>
      )}
    </form>
  );
}
