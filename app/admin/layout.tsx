import "../globals.css";
import { RootShell, rootMetadata } from "@/lib/root-shell";

// Admin root izkārtojums (atsevišķs no publiskā [locale]); admin vienmēr latviski.
export const generateMetadata = rootMetadata;

export default function AdminRootLayout({ children }: { children: React.ReactNode }) {
  return <RootShell lang="lv">{children}</RootShell>;
}
