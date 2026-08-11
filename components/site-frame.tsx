"use client";

import { usePathname } from "next/navigation";
import type { ReactNode } from "react";
import ChatWidget from "@/components/chat-widget";

/**
 * Publiskā "chrome" (navbar/footer/čats) tikai publiskajās lapās.
 * /admin lapām — tikai saturs (tām ir savs izkārtojums).
 * Navbar/Footer padoti kā props (servera komponenti), lai tos varētu
 * nosacīti renderēt no klienta komponenta.
 */
export default function SiteFrame({
  navbar,
  footer,
  children,
}: {
  navbar: ReactNode;
  footer: ReactNode;
  children: ReactNode;
}) {
  const pathname = usePathname();
  const isAdmin = pathname?.startsWith("/admin");

  if (isAdmin) {
    return <main className="flex-1">{children}</main>;
  }

  return (
    <>
      {navbar}
      <main className="flex-1 overflow-x-clip">{children}</main>
      {footer}
      <ChatWidget />
    </>
  );
}
