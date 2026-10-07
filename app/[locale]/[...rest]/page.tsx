import { notFound } from "next/navigation";

// Jebkurš neeksistējošs publiskais ceļš (/neeksiste/, /en/neeksiste/, ...) nonāk šeit
// un izsauc notFound() → renderējas app/[locale]/not-found.tsx lokāles izkārtojumā
// (pareizs <html lang>, navigācija, kājene) ar HTTP 404. Bez šī Next rādīja
// noklusējuma 404 bez izkārtojuma.
export default function CatchAllNotFound() {
  notFound();
}
