"use client";

import { useEffect, useRef, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  updateLead,
  setLeadStatus,
  saveLeadNotes,
  deleteLead,
} from "../actions";
import { LEAD_STATUSES } from "../constants";

export type LeadRow = {
  id: string;
  created_at: string;
  source: string;
  company: string;
  contact_person: string;
  role: string;
  email: string;
  phone: string;
  event_date: string;
  event_location: string;
  guest_count: string;
  interests: string[];
  needs_branding: boolean;
  description: string;
  institution: string;
  procurement_id: string;
  status: string;
  admin_notes: string;
  converted_booking_id: string | null;
};

type Converted = {
  id: string;
  name: string;
  event_date: string;
  status: string;
} | null;

const SOURCES = [
  { id: "b2b", label: "Uzņēmums" },
  { id: "pasvaldibam", label: "Pašvaldība" },
  { id: "b2c", label: "Privātpersona" },
];

const field =
  "w-full rounded-lg border border-gold/25 bg-navy/40 px-3 py-2 text-sm text-text outline-none focus:border-gold disabled:opacity-60";
const label = "block text-xs uppercase tracking-wide text-text/50";
const errBox =
  "mt-2 rounded-lg border border-red-500/40 bg-red-500/10 p-2 text-xs text-red-300";

export default function LeadDetail({
  lead,
  converted,
}: {
  lead: LeadRow;
  converted: Converted;
}) {
  const router = useRouter();

  // Rediģējamie lauki
  const [company, setCompany] = useState(lead.company);
  const [contact, setContact] = useState(lead.contact_person);
  const [role, setRole] = useState(lead.role);
  const [email, setEmail] = useState(lead.email);
  const [phone, setPhone] = useState(lead.phone);
  const [eventDate, setEventDate] = useState(lead.event_date);
  const [eventLocation, setEventLocation] = useState(lead.event_location);
  const [guestCount, setGuestCount] = useState(lead.guest_count);
  const [interests, setInterests] = useState(lead.interests.join(", "));
  const [needsBranding, setNeedsBranding] = useState(lead.needs_branding);
  const [description, setDescription] = useState(lead.description);
  const [institution, setInstitution] = useState(lead.institution);
  const [procurementId, setProcurementId] = useState(lead.procurement_id);
  const [source, setSource] = useState(lead.source);

  const [status, setStatusState] = useState(lead.status);
  const [notes, setNotes] = useState(lead.admin_notes);
  const [notesSaved, setNotesSaved] = useState(true);

  const [saveMsg, setSaveMsg] = useState("");
  const [statusMsg, setStatusMsg] = useState("");
  const [delMsg, setDelMsg] = useState("");
  const [pending, startTransition] = useTransition();
  const notesTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Statuss re-sinhronizējas pēc router.refresh() (dropdown).
  useEffect(() => {
    setStatusState(lead.status);
  }, [lead.status]);

  // Piezīmju autosave (debounce), tā pats paraugs kā booking-detail.
  useEffect(() => {
    if (notesTimer.current) clearTimeout(notesTimer.current);
    if (notes === lead.admin_notes) {
      setNotesSaved(true);
      return;
    }
    setNotesSaved(false);
    notesTimer.current = setTimeout(() => {
      startTransition(async () => {
        const res = await saveLeadNotes(lead.id, notes);
        if (res?.error) {
          setStatusMsg(res.error);
          return;
        }
        setNotesSaved(true);
      });
    }, 800);
    return () => {
      if (notesTimer.current) clearTimeout(notesTimer.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [notes]);

  // Statusa maiņa: optimistiski + GAIDA serveri; kļūdā atritina + ziņojums.
  function onStatus(v: string) {
    const prev = status;
    setStatusMsg("");
    setStatusState(v);
    startTransition(async () => {
      const res = await setLeadStatus(lead.id, v);
      if (res?.error) {
        setStatusState(prev);
        setStatusMsg(res.error);
        return;
      }
      router.refresh();
    });
  }

  // Pilna saglabāšana.
  function save() {
    setSaveMsg("");
    startTransition(async () => {
      const res = await updateLead(lead.id, {
        company,
        contact_person: contact,
        role,
        email,
        phone,
        event_date: eventDate,
        event_location: eventLocation,
        guest_count: guestCount,
        interests: interests
          .split(",")
          .map((s) => s.trim())
          .filter(Boolean),
        needs_branding: needsBranding,
        description,
        institution,
        procurement_id: procurementId,
        source,
      });
      if (res?.error) {
        setSaveMsg(res.error);
        return;
      }
      setSaveMsg("Saglabāts ✓");
      router.refresh();
    });
  }

  function remove() {
    if (
      !confirm(
        `Dzēst B2B pieprasījumu no ${lead.company}? Šo darbību nevar atsaukt.`,
      )
    )
      return;
    setDelMsg("");
    startTransition(async () => {
      const res = await deleteLead(lead.id);
      if (res?.error) {
        setDelMsg(res.error);
        return;
      }
      router.push("/admin/leads");
    });
  }

  const created = new Date(lead.created_at).toLocaleString("lv-LV", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
  const fmtDM = (d: string) =>
    d ? `${d.slice(8, 10)}.${d.slice(5, 7)}.${d.slice(0, 4)}` : "";

  return (
    <div className="mt-4 grid gap-6 lg:grid-cols-[1fr_320px]">
      {/* Kreisā: kontakti + rediģēšana */}
      <div className="space-y-6">
        <section className="rounded-2xl border border-gold/25 bg-navy/30 p-6">
          <h1 className="font-display text-2xl font-bold">{lead.company}</h1>
          <p className="text-sm text-text/60">
            {lead.contact_person}
            {lead.role ? ` · ${lead.role}` : ""} · {created}
          </p>
          <div className="mt-4 flex flex-wrap gap-3">
            <a
              href={`tel:${lead.phone}`}
              className="rounded-full bg-gold px-5 py-2 text-sm font-semibold text-black"
            >
              Zvanīt {lead.phone}
            </a>
            <a
              href={`https://wa.me/${lead.phone.replace(/\D/g, "")}`}
              target="_blank"
              rel="noopener noreferrer"
              className="rounded-full border border-gold px-5 py-2 text-sm font-semibold text-gold"
            >
              WhatsApp
            </a>
            <a
              href={`mailto:${lead.email}`}
              className="rounded-full border border-gold/40 px-5 py-2 text-sm font-semibold text-text/80 hover:border-gold"
            >
              ✉ {lead.email}
            </a>
          </div>
        </section>

        {/* Rediģējamie lauki */}
        <section className="space-y-4 rounded-2xl border border-gold/25 bg-navy/30 p-6">
          <h2 className="font-display text-lg font-semibold text-gold">
            Pieprasījuma dati
          </h2>
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className={label}>Uzņēmums / iestāde *</label>
              <input value={company} onChange={(e) => setCompany(e.target.value)} className={`${field} mt-1`} />
            </div>
            <div>
              <label className={label}>Kontaktpersona *</label>
              <input value={contact} onChange={(e) => setContact(e.target.value)} className={`${field} mt-1`} />
            </div>
            <div>
              <label className={label}>Amats</label>
              <input value={role} onChange={(e) => setRole(e.target.value)} className={`${field} mt-1`} />
            </div>
            <div>
              <label className={label}>Avots</label>
              <select value={source} onChange={(e) => setSource(e.target.value)} className={`${field} mt-1`}>
                {SOURCES.map((s) => (
                  <option key={s.id} value={s.id}>{s.label}</option>
                ))}
              </select>
            </div>
            <div>
              <label className={label}>E-pasts *</label>
              <input value={email} onChange={(e) => setEmail(e.target.value)} className={`${field} mt-1`} />
            </div>
            <div>
              <label className={label}>Tālrunis *</label>
              <input value={phone} onChange={(e) => setPhone(e.target.value)} className={`${field} mt-1`} />
            </div>
            <div>
              <label className={label}>Pasākuma datums (brīvs teksts)</label>
              <input value={eventDate} onChange={(e) => setEventDate(e.target.value)} placeholder="piem. 2026-08-27 vai “decembra vidū”" className={`${field} mt-1`} />
            </div>
            <div>
              <label className={label}>Viesu skaits (brīvs teksts)</label>
              <input value={guestCount} onChange={(e) => setGuestCount(e.target.value)} className={`${field} mt-1`} />
            </div>
            <div className="sm:col-span-2">
              <label className={label}>Vieta / pilsēta</label>
              <input value={eventLocation} onChange={(e) => setEventLocation(e.target.value)} className={`${field} mt-1`} />
            </div>
            <div>
              <label className={label}>Interesē (ar komatu)</label>
              <input value={interests} onChange={(e) => setInterests(e.target.value)} className={`${field} mt-1`} />
            </div>
            <div className="flex items-end">
              <label className="flex items-center gap-2 text-sm text-text/80">
                <input type="checkbox" checked={needsBranding} onChange={(e) => setNeedsBranding(e.target.checked)} className="accent-[#D4A960]" />
                Brendēšana ar logo
              </label>
            </div>
            <div>
              <label className={label}>Iestāde (pašvaldībām)</label>
              <input value={institution} onChange={(e) => setInstitution(e.target.value)} className={`${field} mt-1`} />
            </div>
            <div>
              <label className={label}>Iepirkuma ID</label>
              <input value={procurementId} onChange={(e) => setProcurementId(e.target.value)} className={`${field} mt-1`} />
            </div>
            <div className="sm:col-span-2">
              <label className={label}>Apraksts</label>
              <textarea rows={4} value={description} onChange={(e) => setDescription(e.target.value)} className={`${field} mt-1`} />
            </div>
          </div>
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={save}
              disabled={pending}
              className="rounded-full bg-gold px-6 py-2 text-sm font-semibold text-black disabled:opacity-60"
            >
              {pending ? "Saglabā…" : "Saglabāt izmaiņas"}
            </button>
            {saveMsg && (
              <span className={`text-sm ${saveMsg.includes("✓") ? "text-gold" : "text-red-300"}`}>
                {saveMsg}
              </span>
            )}
          </div>
        </section>
      </div>

      {/* Labā: statuss + konvertēšana + piezīmes + dzēšana */}
      <div className="space-y-5 rounded-2xl border border-gold/25 bg-navy/30 p-6">
        <div>
          <label className={label}>Statuss</label>
          <select
            value={status}
            onChange={(e) => onStatus(e.target.value)}
            disabled={pending}
            className={`mt-1 ${field}`}
          >
            {LEAD_STATUSES.map((s) => (
              <option key={s.id} value={s.id}>{s.label}</option>
            ))}
          </select>
          {statusMsg && <p className={errBox}>{statusMsg}</p>}
        </div>

        {/* Konvertēšana rezervācijā */}
        <div className="border-t border-gold/15 pt-4">
          {lead.converted_booking_id && converted ? (
            <Link
              href={`/admin/${converted.id}`}
              className="block rounded-lg border border-green-500/40 bg-green-500/10 p-3 text-sm text-green-300 hover:border-green-400"
            >
              ✓ Pārvērsts rezervācijā →{" "}
              <span className="font-semibold">
                {converted.name} ({fmtDM(converted.event_date)})
              </span>
            </Link>
          ) : (
            <Link
              href={`/admin/jauns?lead=${lead.id}`}
              className="block rounded-full bg-gold px-5 py-2.5 text-center text-sm font-semibold text-black transition-transform hover:scale-[1.02]"
            >
              Izveidot rezervāciju →
            </Link>
          )}
        </div>

        <div>
          <label className={label}>
            Iekšējās piezīmes{" "}
            <span className="text-text/30">
              {notesSaved ? "· saglabāts" : "· saglabā…"}
            </span>
          </label>
          <textarea
            rows={5}
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            className={`mt-1 ${field}`}
          />
        </div>

        <div className="border-t border-gold/15 pt-4">
          <button
            type="button"
            onClick={remove}
            disabled={pending}
            className="text-sm text-red-300 transition-colors hover:text-red-200 disabled:opacity-60"
          >
            Dzēst pieprasījumu
          </button>
          {delMsg && <p className={errBox}>{delMsg}</p>}
        </div>
      </div>
    </div>
  );
}
