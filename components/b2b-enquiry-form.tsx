"use client";

import { useId, useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useSearchParams } from "next/navigation";
import { useTranslations } from "next-intl";
import { generateLead, LEAD_VALUE } from "@/lib/analytics";

const INTERESTS = [
  "spogulis",
  "ozols",
  "instagram",
  "ai-foto",
  "audio-video",
  "specefekti",
  "deco",
  "atrakcijas",
] as const;

const field =
  "w-full rounded-control border border-gold/25 bg-bg/60 px-4 py-2.5 text-text outline-none focus:border-gold";
const labelCls = "block text-sm text-text/70";

type Tab = "b2b" | "b2c";

export default function B2bEnquiryForm() {
  const t = useTranslations("b2bForm");
  const params = useSearchParams();
  const urlMunicipal = params.get("source") === "pasvaldibam";
  const [tab, setTab] = useState<Tab>("b2b");

  // Viena shēma; obligātie lauki atkarīgi no izvēlētās cilnes (data.tab).
  const schema = useMemo(
    () =>
      z
        .object({
          tab: z.enum(["b2b", "b2c"]),
          name: z.string().trim().optional(),
          company: z.string().trim().optional(),
          contact_person: z.string().trim().optional(),
          role: z.string().trim().optional(),
          email: z.string().trim().email(t("errEmail")),
          phone: z.string().trim().min(5, t("errPhone")),
          date_unknown: z.boolean().optional(),
          event_date: z.string().trim().optional(),
          event_location: z.string().trim().optional(),
          guest_count: z.string().trim().optional(),
          interests: z.array(z.string()).optional(),
          needs_branding: z.boolean().optional(),
          description: z.string().trim().optional(),
        })
        .superRefine((d, ctx) => {
          if (d.tab === "b2b") {
            if (!d.company || d.company.trim().length < 2)
              ctx.addIssue({ path: ["company"], code: z.ZodIssueCode.custom, message: t("errCompany") });
            if (!d.contact_person || d.contact_person.trim().length < 2)
              ctx.addIssue({ path: ["contact_person"], code: z.ZodIssueCode.custom, message: t("errContact") });
          } else if (!d.name || d.name.trim().length < 2) {
            ctx.addIssue({ path: ["name"], code: z.ZodIssueCode.custom, message: t("errName") });
          }
        }),
    [t],
  );
  type FormValues = z.infer<typeof schema>;

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { tab: "b2b", interests: [], needs_branding: false, date_unknown: false },
  });

  const [done, setDone] = useState(false);
  const [serverError, setServerError] = useState("");
  const dateUnknown = watch("date_unknown");

  // Pārslēdzoties saglabājas visas jau ievadītās vērtības (RHF tās nenoņem).
  function switchTab(next: Tab) {
    setTab(next);
    setValue("tab", next);
  }

  async function onSubmit(values: FormValues) {
    setServerError("");
    const isB2c = values.tab === "b2c";
    const source = isB2c ? "b2c" : urlMunicipal ? "pasvaldibam" : "b2b";
    const payload = {
      name: values.name,
      company: values.company,
      contact_person: values.contact_person,
      role: isB2c ? undefined : values.role,
      email: values.email,
      phone: values.phone,
      event_date: values.date_unknown ? t("dateUnknown") : values.event_date,
      event_location: isB2c ? undefined : values.event_location,
      guest_count: isB2c ? undefined : values.guest_count,
      interests: values.interests ?? [],
      needs_branding: isB2c ? false : !!values.needs_branding,
      description: values.description,
      source,
    };
    try {
      const res = await fetch("/api/lead", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (!res.ok) {
        setServerError(data.error ?? t("errSend"));
        return;
      }
      // Fiksēta vērtība pēc avota (b2b/pašvaldība = 400, b2c = 150) - konsekvents
      // ROAS signāls Smart Bidding, nevis mainīga aptuvenā summa.
      generateLead(LEAD_VALUE[source] ?? LEAD_VALUE.b2b, source);
      setDone(true);
    } catch {
      setServerError(t("errSend"));
    }
  }

  // Pieejamība: katram laukam id (label htmlFor), aria-invalid un kļūdas
  // teksts piesaistīts ar aria-describedby (ekrānlasītājs to nolasa).
  const uid = useId();
  const fid = (name: string) => `${uid}-${name}`;
  const errId = (name: string) => `${uid}-${name}-err`;
  const a11y = (name: keyof typeof errors, required = false) => ({
    id: fid(name),
    "aria-invalid": errors[name] ? true : undefined,
    "aria-describedby": errors[name] ? errId(name) : undefined,
    "aria-required": required || undefined,
  });
  const Err = ({ name }: { name: keyof typeof errors }) =>
    errors[name] ? (
      <p id={errId(name)} className="mt-1 text-xs text-rose-gold">
        {String(errors[name]?.message ?? "")}
      </p>
    ) : null;

  if (done) {
    return (
      <div role="status" className="rounded-card border border-gold/30 bg-navy/30 p-8 text-center">
        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-gold text-2xl text-on-gold hover:bg-gold/90">
          ✓
        </div>
        <h3 className="mt-5 font-display text-card font-semibold">{t("thanksTitle")}</h3>
        <p className="mt-2 text-text/80">{t("thanksText")}</p>
      </div>
    );
  }

  const tabBtn = (active: boolean) =>
    `rounded-full px-5 py-2 text-sm font-semibold transition-transform ${
      active ? "bg-gold text-black" : "text-text/70 hover:text-gold"
    }`;

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-5" noValidate>
      {/* Pārslēdzējs */}
      <div role="group" aria-label={t("tabBusiness") + " / " + t("tabPrivate")} className="inline-flex rounded-full border border-gold/30 bg-bg/40 p-1">
        <button type="button" aria-pressed={tab === "b2b"} onClick={() => switchTab("b2b")} className={tabBtn(tab === "b2b")}>
          {t("tabBusiness")}
        </button>
        <button type="button" aria-pressed={tab === "b2c"} onClick={() => switchTab("b2c")} className={tabBtn(tab === "b2c")}>
          {t("tabPrivate")}
        </button>
      </div>
      <input type="hidden" {...register("tab")} />

      <div className="grid gap-4 sm:grid-cols-2">
        {tab === "b2b" ? (
          <>
            <div className="sm:col-span-2">
              <label htmlFor={fid("company")} className={labelCls}>{t("company")} *</label>
              <input {...register("company")} {...a11y("company", true)} autoComplete="organization" className={`mt-1 ${field}`} />
              <Err name="company" />
            </div>
            <div>
              <label htmlFor={fid("contact_person")} className={labelCls}>{t("contactPerson")} *</label>
              <input {...register("contact_person")} {...a11y("contact_person", true)} autoComplete="name" className={`mt-1 ${field}`} />
              <Err name="contact_person" />
            </div>
            <div>
              <label htmlFor={fid("role")} className={labelCls}>{t("role")}</label>
              <input {...register("role")} {...a11y("role")} autoComplete="organization-title" className={`mt-1 ${field}`} />
            </div>
          </>
        ) : (
          <div className="sm:col-span-2">
            <label htmlFor={fid("name")} className={labelCls}>{t("name")} *</label>
            <input {...register("name")} {...a11y("name", true)} autoComplete="name" className={`mt-1 ${field}`} />
            <Err name="name" />
          </div>
        )}

        <div>
          <label htmlFor={fid("email")} className={labelCls}>{t("email")} *</label>
          <input type="email" inputMode="email" autoComplete="email" {...register("email")} {...a11y("email", true)} className={`mt-1 ${field}`} />
          <Err name="email" />
        </div>
        <div>
          <label htmlFor={fid("phone")} className={labelCls}>{t("phone")} *</label>
          <input type="tel" inputMode="tel" autoComplete="tel" {...register("phone")} {...a11y("phone", true)} className={`mt-1 ${field}`} />
          <Err name="phone" />
        </div>

        <div>
          <label htmlFor={fid("event_date")} className={labelCls}>{t("eventDate")}</label>
          <input
            id={fid("event_date")}
            type="date"
            {...register("event_date")}
            disabled={dateUnknown}
            className={`mt-1 ${field} disabled:opacity-40`}
          />
          <label className="mt-2 flex items-center gap-2 text-xs text-text/60">
            <input type="checkbox" {...register("date_unknown")} className="accent-gold" />
            {t("dateUnknown")}
          </label>
        </div>

        {tab === "b2b" && (
          <>
            <div>
              <label htmlFor={fid("event_location")} className={labelCls}>{t("location")}</label>
              <input id={fid("event_location")} {...register("event_location")} className={`mt-1 ${field}`} />
            </div>
            <div>
              <label htmlFor={fid("guest_count")} className={labelCls}>{t("guests")}</label>
              <input id={fid("guest_count")} inputMode="numeric" {...register("guest_count")} className={`mt-1 ${field}`} />
            </div>
          </>
        )}
      </div>

      {/* Interesē (abām cilnēm) */}
      <fieldset>
        <legend className={labelCls}>{t("interests")}</legend>
        <div className="mt-2 grid grid-cols-2 gap-2 sm:grid-cols-3">
          {INTERESTS.map((key) => (
            <label key={key} className="flex min-h-11 items-center gap-2 text-sm text-text/80">
              <input type="checkbox" value={key} {...register("interests")} className="accent-gold" />
              {t(`int_${key}` as never)}
            </label>
          ))}
        </div>
      </fieldset>

      {/* Brendēšana (tikai B2B) */}
      {tab === "b2b" && (
        <label className="flex items-center gap-2 text-sm text-text/80">
          <input type="checkbox" {...register("needs_branding")} className="accent-gold" />
          {t("needsBranding")}
        </label>
      )}

      {/* Apraksts / jautājums */}
      <div>
        <label htmlFor={fid("description")} className={labelCls}>{tab === "b2b" ? t("description") : t("question")}</label>
        <textarea id={fid("description")} rows={5} {...register("description")} placeholder={t("descriptionPh")} className={`mt-1 ${field}`} />
      </div>

      {serverError && (
        <p role="alert" className="rounded-control border border-red-500/40 bg-red-500/10 p-3 text-sm text-red-300">{serverError}</p>
      )}

      <button
        type="submit"
        disabled={isSubmitting}
        className="inline-flex items-center gap-2 rounded-full bg-gold px-8 py-3 font-semibold text-on-gold transition-colors disabled:opacity-60 hover:bg-gold/90"
      >
        {isSubmitting && <span className="h-4 w-4 animate-spin rounded-full border-2 border-black/30 border-t-black" />}
        {isSubmitting ? t("sending") : t("submit")}
      </button>
    </form>
  );
}
