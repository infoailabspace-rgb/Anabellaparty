import { existsSync, readdirSync } from "node:fs";
import { join } from "node:path";

// Servera puses (build/ISR) skenēšana — public/images/... mapēs meklē attēlus.
const EXTS = [".jpg", ".jpeg", ".png", ".webp"];

export function isHttpUrl(s: unknown): s is string {
  return typeof s === "string" && /^https?:\/\//i.test(s);
}

/** Vai relatīvs web ceļš (/images/...) fiziski eksistē public/ mapē. */
export function publicFileExists(webPath: unknown): boolean {
  if (typeof webPath !== "string") return false;
  if (!webPath || /^https?:\/\//i.test(webPath)) return false;
  try {
    const rel = decodeURIComponent(webPath.replace(/^\/+/, ""));
    return existsSync(join(process.cwd(), "public", rel));
  } catch {
    return false;
  }
}

function isImage(file: string): boolean {
  const lower = file.toLowerCase();
  return EXTS.some((e) => lower.endsWith(e));
}

// Web ceļš ar drošu kodējumu (faili satur atstarpes/diakritiku).
function webPath(dir: string, file: string): string {
  return `/${dir}/${encodeURIComponent(file)}`;
}

/** Skenē public mapi; atgriež {cover, gallery}. Nekritē, ja mapes nav. */
export function scanImages(relDir: string): { cover: string; gallery: string[] } {
  let files: string[] = [];
  try {
    files = readdirSync(join(process.cwd(), "public", relDir))
      .filter(isImage)
      .sort((a, b) => a.localeCompare(b));
  } catch {
    return { cover: "", gallery: [] };
  }
  if (files.length === 0) return { cover: "", gallery: [] };
  // cover.* ir vāks, ja tāds ir; citādi pirmais fails pēc nosaukuma.
  const coverFile =
    files.find((f) => /^cover\.[^.]+$/i.test(f)) ?? files[0];
  const rest = files.filter((f) => f !== coverFile);
  return {
    cover: webPath(relDir, coverFile),
    gallery: rest.map((f) => webPath(relDir, f)),
  };
}

/** Produkta attēli no public/images/products/<slug>/. */
export function scanProductImages(slug: string): {
  cover: string;
  gallery: string[];
} {
  return scanImages(`images/products/${slug}`);
}
