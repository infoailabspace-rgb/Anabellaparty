// Uzņēmuma rekvizīti — VIENS patiesības avots.
// Juridiskās lapas, footer, kontakti, schema.org, e-pasti lasa no šejienes.
// Zīmola nosaukums lapā = "Anabella Party"; juridiskais nosaukums tikai tur,
// kur likums prasa (footer, juridiskās lapas, rēķini).

export const COMPANY = {
  legalName: 'SIA "AR DIMANTI"',
  brandName: "Anabella Party",
  regNr: "40203276261",
  vatNr: "LV40203276261",
  isVatPayer: true,

  address: {
    street: "Vecozolu iela 14",
    city: "Ķekava",
    region: "Ķekavas novads",
    postalCode: "LV-2123",
    country: "LV",
  },

  contact: {
    phone: "+37129222761",
    phoneDisplay: "+371 29222761",
    whatsapp: "https://wa.me/37129222761",
    email: "info@anabellaparty.lv",
  },

  // Kubli/pirts — atsevišķs kontakts, cita atrašanās vieta
  altContact: {
    phone: "+37128286911",
    phoneDisplay: "+371 28286911",
    location: "Jūrmala",
  },

  social: {
    instagram: "https://www.instagram.com/anabella_svetku_inventars/",
    facebook: "https://www.facebook.com/anabellaparty.lv",
  },

  // [JĀAPSTIPRINA] — bankas rekvizīti (vajadzīgi rēķiniem)
  bank: {
    name: "",
    iban: "",
    swift: "",
  },
} as const;

export const VAT_RATE = 0.21;
export const PRICES_INCLUDE_VAT = false; // cenas norādītas bez PVN [JĀAPSTIPRINA]

// Palīgformāti
export const fullAddress = `${COMPANY.address.street}, ${COMPANY.address.city}, ${COMPANY.address.region}, ${COMPANY.address.postalCode}`;
export const legalLineShort = `${COMPANY.legalName}, reģ. nr. ${COMPANY.regNr}`;
