import createIntlMiddleware from "next-intl/middleware";
import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";
import { routing } from "./i18n/routing";

const intlMiddleware = createIntlMiddleware(routing);

// Admin (/admin/*) — auth aizsardzība, NAV lokalizēts (tikai LV).
async function adminMiddleware(request: NextRequest) {
  let response = NextResponse.next({ request });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SB_URL!,
    process.env.NEXT_PUBLIC_SB_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value),
          );
          response = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, value, options }) =>
            response.cookies.set(name, value, options),
          );
        },
      },
    },
  );

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const path = request.nextUrl.pathname;
  const isLogin = path.startsWith("/admin/login");

  // Aizsargā /admin/*, izņemot login. Bez sesijas → login.
  if (path.startsWith("/admin") && !isLogin && !user) {
    const url = request.nextUrl.clone();
    url.pathname = "/admin/login";
    return NextResponse.redirect(url);
  }
  // Ja jau ielogojies un atver login — uz paneli.
  if (isLogin && user) {
    const url = request.nextUrl.clone();
    url.pathname = "/admin";
    return NextResponse.redirect(url);
  }

  return response;
}

export async function middleware(request: NextRequest) {
  // Kanoniskā domēna 308: production vercel.app aliasi (stabilais, git-main, hash)
  // → https://www.anabellaparty.lv, lai Google neindeksē dublikātus. Preview deploy
  // strādā ar VERCEL_ENV="preview" → netiek skarts un paliek testējams.
  const host = request.headers.get("host") ?? "";
  if (process.env.VERCEL_ENV === "production" && host.endsWith(".vercel.app")) {
    const url = new URL(
      request.nextUrl.pathname + request.nextUrl.search,
      "https://www.anabellaparty.lv",
    );
    return NextResponse.redirect(url, 308);
  }

  if (request.nextUrl.pathname.startsWith("/admin")) {
    return adminMiddleware(request);
  }
  // Publiskās lapas — next-intl (LV saknē, en/ru prefiksi).
  return intlMiddleware(request);
}

export const config = {
  // Visi ceļi, izņemot api, _next, _vercel un failus ar punktu (statiskie, sitemap.xml, robots.txt).
  matcher: ["/((?!api|_next|_vercel|.*\\..*).*)"],
};
