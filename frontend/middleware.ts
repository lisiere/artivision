import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

const AUTH_ROUTES = ["/login", "/signup"];
/** Routes métier artisan : auth + onboarding terminé */
const NEEDS_COMPLETED_ONBOARDING = ["/dashboard", "/clients", "/catalog", "/propositions", "/settings"];

export async function middleware(request: NextRequest) {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!url || !anon) {
    return NextResponse.next({ request });
  }

  let supabaseResponse = NextResponse.next({ request });

  const supabase = createServerClient(url, anon, {
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(cookiesToSet) {
        cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));
        supabaseResponse = NextResponse.next({ request });
        cookiesToSet.forEach(({ name, value, options }) => supabaseResponse.cookies.set(name, value, options));
      },
    },
  });

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const path = request.nextUrl.pathname;
  const isAuthRoute = AUTH_ROUTES.some((r) => path === r || path.startsWith(`${r}/`));
  const isOnboarding = path.startsWith("/onboarding");
  const needsLogin = NEEDS_COMPLETED_ONBOARDING.some((r) => path === r || path.startsWith(`${r}/`)) || isOnboarding;

  async function artisanDone(): Promise<boolean | null> {
    if (!user) return null;
    const { data, error } = await supabase
      .from("artisans")
      .select("onboarding_completed")
      .eq("user_id", user.id)
      .maybeSingle();
    if (error || !data) return false;
    return Boolean(data.onboarding_completed);
  }

  if (user && isAuthRoute) {
    const done = await artisanDone();
    const dest = done ? "/dashboard" : "/onboarding";
    return NextResponse.redirect(new URL(dest, request.url));
  }

  if (!user && needsLogin) {
    const login = new URL("/login", request.url);
    login.searchParams.set("redirect", path);
    return NextResponse.redirect(login);
  }

  if (user && NEEDS_COMPLETED_ONBOARDING.some((r) => path === r || path.startsWith(`${r}/`))) {
    const done = await artisanDone();
    if (!done) {
      return NextResponse.redirect(new URL("/onboarding", request.url));
    }
  }

  if (user && isOnboarding) {
    const done = await artisanDone();
    if (done) {
      return NextResponse.redirect(new URL("/dashboard", request.url));
    }
  }

  return supabaseResponse;
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
