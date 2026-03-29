import { NextResponse } from "next/server";
import { applySessionCookie, isAuthConfigured, isPasswordValid } from "@/lib/auth";

export const runtime = "nodejs";

export async function POST(request: Request) {
  const formData = await request.formData();
  const password = String(formData.get("password") ?? "");
  const loginUrl = new URL("/login", request.url);

  if (!isAuthConfigured()) {
    loginUrl.searchParams.set("error", "missing-password");
    return NextResponse.redirect(loginUrl, { status: 303 });
  }

  if (!isPasswordValid(password)) {
    loginUrl.searchParams.set("error", "invalid-password");
    return NextResponse.redirect(loginUrl, { status: 303 });
  }

  const response = NextResponse.redirect(new URL("/", request.url), { status: 303 });
  return applySessionCookie(response);
}
