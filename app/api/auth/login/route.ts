import { applySessionCookie, createRedirectResponse, isAuthConfigured, isPasswordValid } from "@/lib/auth";

export const runtime = "nodejs";

export async function POST(request: Request) {
  const formData = await request.formData();
  const password = String(formData.get("password") ?? "");

  if (!isAuthConfigured()) {
    return createRedirectResponse("/login?error=missing-password", 303);
  }

  if (!isPasswordValid(password)) {
    return createRedirectResponse("/login?error=invalid-password", 303);
  }

  const response = createRedirectResponse("/", 303);
  return applySessionCookie(response);
}
