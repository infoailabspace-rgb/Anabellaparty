import { createNavigation } from "next-intl/navigation";
import { routing } from "./routing";

// Locale-aware Link, redirect, usePathname, useRouter, getPathname.
// Lieto šos, nevis next/link / next/navigation, publiskajās lapās.
export const { Link, redirect, usePathname, useRouter, getPathname } =
  createNavigation(routing);
