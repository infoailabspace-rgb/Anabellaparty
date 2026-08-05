import type { Metadata } from "next";
import SectionHero from "@/components/section-hero";
import BookingForm from "@/components/booking/booking-form";
import { WhatsAppIcon } from "@/components/social-icons";

export const metadata: Metadata = {
  title: "Rezervēt | Anabella Party",
  description:
    "Aizpildi rezervācijas anketu vai sazinies tieši. Foto kastes, atrakcijas un specefekti Tavam pasākumam. Atbildam 24 stundu laikā. Piegāde Pierīgā bez maksas.",
};

function PhoneIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className="h-6 w-6" aria-hidden>
      <path d="M6.6 10.8a15.5 15.5 0 0 0 6.6 6.6l2.2-2.2c.3-.3.7-.4 1-.2 1.1.4 2.3.6 3.5.6.6 0 1 .5 1 1V20c0 .6-.4 1-1 1A17 17 0 0 1 3 4c0-.6.5-1 1-1h3.4c.6 0 1 .4 1 1 0 1.2.2 2.4.6 3.5.1.4 0 .8-.3 1l-2.1 2.3Z" />
    </svg>
  );
}
function MailIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className="h-6 w-6" aria-hidden>
      <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2Zm0 4v10h16V8l-8 5-8-5Zm0-2 8 5 8-5H4Z" />
    </svg>
  );
}

const CONTACTS = [
  { label: "Zvanīt", sub: "+371 29222761", href: "tel:+37129222761", Icon: PhoneIcon },
  { label: "WhatsApp", sub: "Ātrā ziņa", href: "https://wa.me/37129222761", Icon: WhatsAppIcon },
  { label: "Rakstīt e-pastu", sub: "info@anabellaparty.lv", href: "mailto:info@anabellaparty.lv", Icon: MailIcon },
];

export default function RezervetPage() {
  return (
    <>
      <SectionHero
        title="Rezervēt"
        tagline="Sazinies uzreiz vai aizpildi anketu — atbildēsim 24 stundu laikā ar precīzu piedāvājumu."
      />

      <div className="mx-auto max-w-5xl px-6 py-16">
        {/* Tūlītējie kontakti */}
        <div className="grid gap-4 sm:grid-cols-3">
          {CONTACTS.map(({ label, sub, href, Icon }) => (
            <a
              key={label}
              href={href}
              className="flex items-center gap-3 rounded-2xl bg-gold px-5 py-4 font-semibold text-black transition-transform hover:scale-[1.02]"
            >
              <Icon />
              <span className="leading-tight">
                {label}
                <span className="block text-sm font-normal text-black/70">
                  {sub}
                </span>
              </span>
            </a>
          ))}
        </div>

        <div className="my-8 border-t border-gold/20 pt-6 text-center text-sm text-text/60">
          Vai aizpildi anketu — atbildēsim 24 stundu laikā ar precīzu piedāvājumu.
        </div>

        {/* Anketa */}
        <BookingForm />
      </div>
    </>
  );
}
