// Supabase Storage attēla transformācija (render endpoint): pareizs platums un
// kvalitāte, lai neielādētu oriģinālu (bloga vākos līdz ~320 KB). Ne-supabase
// URL paliek nemainīts.
export function sbImage(url: string, width: number, quality = 70): string {
  if (!url.includes("/storage/v1/object/public/")) return url;
  const sep = url.includes("?") ? "&" : "?";
  return (
    url.replace("/object/public/", "/render/image/public/") +
    `${sep}width=${width}&quality=${quality}`
  );
}
