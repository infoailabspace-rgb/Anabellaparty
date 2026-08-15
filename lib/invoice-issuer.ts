import { COMPANY } from "@/lib/company";

// Rēķina izsniedzējs. Izvēle atkarīga no klienta tipa:
//  - uzņēmums  → SIA "AR DIMANTI"
//  - privātpersona → Roberts Dimants (pašnodarbinātais)
export type Issuer = {
  legalName: string;
  regLabel: string; // "Reģ. Nr." vai "PVN reģ. Nr." u.tml.
  regNr: string;
  vatNr: string | null;
  address: string;
  email: string;
  phone: string;
  bankName: string;
  iban: string;
  swift: string;
  complete: boolean; // vai visi rēķinam nepieciešamie rekvizīti ir aizpildīti
};

const ADDRESS = `${COMPANY.address.street}, ${COMPANY.address.city}, ${COMPANY.address.region}, ${COMPANY.address.postalCode}`;

const companyIssuer: Issuer = {
  legalName: COMPANY.legalName,
  regLabel: "Reģ. Nr.",
  regNr: COMPANY.regNr,
  vatNr: COMPANY.isVatPayer ? COMPANY.vatNr : null,
  address: ADDRESS,
  email: COMPANY.contact.email,
  phone: COMPANY.contact.phoneDisplay,
  bankName: COMPANY.bank.name,
  iban: COMPANY.bank.iban,
  swift: COMPANY.bank.swift,
  complete: Boolean(COMPANY.bank.iban),
};

// Privātpersonu izsniedzējs — Roberts Dimants (pašnodarbinātais).
// [GAIDA precizējumu] — reģ. nr. + IBAN vēl nav zināmi; kamēr tukši,
// complete=false → PDF ģenerēšana person-rēķiniem tiek bloķēta.
const personIssuer: Issuer = {
  legalName: "Roberts Dimants",
  regLabel: "Saimnieciskās darbības reģ. Nr.",
  regNr: "",
  vatNr: null,
  address: ADDRESS,
  email: COMPANY.contact.email,
  phone: COMPANY.contact.phoneDisplay,
  bankName: "",
  iban: "",
  swift: "",
  complete: false,
};

export function pickIssuer(
  customerType: "person" | "company" | null | undefined,
): Issuer {
  return customerType === "person" ? personIssuer : companyIssuer;
}
