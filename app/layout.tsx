// Caurlaides root izkārtojums (next-intl ieteiktais modelis): <html> renderē
// app/[locale]/layout.tsx (lang no params, statiski) un app/admin/layout.tsx.
// Viens root izkārtojums vajadzīgs, lai notFound() zem [locale] renderē
// app/[locale]/not-found.tsx (ar lang un navigāciju), nevis Next noklusējuma 404.
export default function RootLayout({ children }: { children: React.ReactNode }) {
  return children;
}
