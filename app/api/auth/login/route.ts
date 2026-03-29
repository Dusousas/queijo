import {
  applySessionCookie,
  buildAbsoluteRedirectUrl,
  isAuthConfigured,
  isPasswordValid,
} from "@/lib/auth";
import { NextResponse } from "next/server";

export const runtime = "nodejs";

export async function POST(request: Request) {
  const formData = await request.formData();
  const password = String(formData.get("password") ?? "");

  if (!isAuthConfigured()) {
    return NextResponse.redirect(
      buildAbsoluteRedirectUrl(request, "/login", "?error=missing-password"),
      { status: 303 },
    );
  }

  if (!isPasswordValid(password)) {
    return NextResponse.redirect(
      buildAbsoluteRedirectUrl(request, "/login", "?error=invalid-password"),
      { status: 303 },
    );
  }

  const response = NextResponse.redirect(buildAbsoluteRedirectUrl(request, "/"), {
    status: 303,
  });
  return applySessionCookie(response);
}
