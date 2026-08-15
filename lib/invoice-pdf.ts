// Klienta-puses PDF ģenerēšana no HTML elementa (jspdf + html2canvas).
// Tāda pati pieeja kā ROItool — latviešu diakritikas nāk no pārlūka fontiem
// (renderē kā attēlu), tāpēc nav vajadzīgs iegults DejaVu fonts.
export async function renderElementToPdfBlob(elementId: string): Promise<Blob> {
  const el = document.getElementById(elementId);
  if (!el) throw new Error("PDF veidne nav atrasta.");

  const [{ default: jsPDF }, { default: html2canvas }] = await Promise.all([
    import("jspdf"),
    import("html2canvas"),
  ]);

  const canvas = await html2canvas(el, {
    scale: 2,
    backgroundColor: "#ffffff",
    logging: false,
  });

  const pdf = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" });
  const pageW = pdf.internal.pageSize.getWidth();
  const pageH = pdf.internal.pageSize.getHeight();
  const ratio = canvas.width / canvas.height;
  const imgH = pageW / ratio;

  if (imgH <= pageH) {
    pdf.addImage(canvas.toDataURL("image/jpeg", 0.95), "JPEG", 0, 0, pageW, imgH);
  } else {
    // Vairāklapu rēķins (gara piezīme u.tml.).
    const pxPerPage = Math.floor((canvas.width * pageH) / pageW);
    let yOff = 0;
    while (yOff < canvas.height) {
      if (yOff > 0) pdf.addPage();
      const sliceH = Math.min(pxPerPage, canvas.height - yOff);
      const page = document.createElement("canvas");
      page.width = canvas.width;
      page.height = pxPerPage;
      const ctx = page.getContext("2d")!;
      ctx.fillStyle = "#ffffff";
      ctx.fillRect(0, 0, page.width, page.height);
      ctx.drawImage(canvas, 0, yOff, canvas.width, sliceH, 0, 0, canvas.width, sliceH);
      pdf.addImage(page.toDataURL("image/jpeg", 0.95), "JPEG", 0, 0, pageW, pageH);
      yOff += pxPerPage;
    }
  }

  return pdf.output("blob");
}
