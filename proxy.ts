import { NextResponse, type NextRequest } from "next/server";
import {
  AUTH_COOKIE_NAME,
  buildAbsoluteRedirectUrl,
  isSessionTokenValid,
} from "@/lib/auth";

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const sessionToken = request.cookies.get(AUTH_COOKIE_NAME)?.value;
  const isAuthenticated = isSessionTokenValid(sessionToken);

  if (pathname === "/login") {
    if (isAuthenticated) {
      return NextResponse.redirect(buildAbsoluteRedirectUrl(request, "/"));
    }

    return NextResponse.next();
  }

  if (pathname.startsWith("/api/auth/") || pathname.startsWith("/api/health/")) {
    return NextResponse.next();
  }

  if (isAuthenticated) {
    return NextResponse.next();
  }

  if (pathname.startsWith("/api/")) {
    return NextResponse.json({ error: "Nao autorizado." }, { status: 401 });
  }

  return NextResponse.redirect(buildAbsoluteRedirectUrl(request, "/login"));
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)"],
};
