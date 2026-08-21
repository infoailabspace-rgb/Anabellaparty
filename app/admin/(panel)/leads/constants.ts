// Plain modulis (NE "use server") — LEAD_STATUSES ir konstante, ko lieto arī
// klienta komponenti (leads-list, lead-detail). Ja konstanti eksportē no
// "use server" faila un importē klientā, tā kļūst par action-referenci (nav
// masīvs) → .find/.map met "TypeError: e.find is not a function".
export const LEAD_STATUSES: { id: string; label: string }[] = [
  { id: "new", label: "Jauns" },
  { id: "contacted", label: "Sazinājos" },
  { id: "quoted", label: "Piedāvājums nosūtīts" },
  { id: "won", label: "Iegūts" },
  { id: "lost", label: "Zaudēts" },
];
