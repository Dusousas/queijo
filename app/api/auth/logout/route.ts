import { clearSessionCookie, createRedirectResponse } from "@/lib/auth";

export const runtime = "nodejs";

export async function POST() {
  const response = createRedirectResponse("/login", 303);
  return clearSessionCookie(response);
}
