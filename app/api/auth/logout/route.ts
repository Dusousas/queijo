import { buildAbsoluteRedirectUrl, clearSessionCookie } from "@/lib/auth";
import { NextResponse } from "next/server";

export const runtime = "nodejs";

export async function POST(request: Request) {
  const response = NextResponse.redirect(buildAbsoluteRedirectUrl(request, "/login"), {
    status: 303,
  });
  return clearSessionCookie(response);
}
