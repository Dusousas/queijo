import { createHash, timingSafeEqual } from "node:crypto";
import { cookies } from "next/headers";
import { NextResponse, type NextRequest } from "next/server";

export const AUTH_COOKIE_NAME = "queijo_session";

const SESSION_TTL_IN_SECONDS = 60 * 60 * 24 * 30;

function getConfiguredPassword() {
  return process.env.APP_PASSWORD?.trim() ?? "";
}

function buildSessionToken(password: string) {
  return createHash("sha256").update(`queijo-dashboard:${password}`).digest("hex");
}

function safeCompare(left: string, right: string) {
  const leftBuffer = Buffer.from(left);
  const rightBuffer = Buffer.from(right);

  if (leftBuffer.length !== rightBuffer.length) {
    return false;
  }

  return timingSafeEqual(leftBuffer, rightBuffer);
}

function getSessionCookieOptions() {
  return {
    httpOnly: true,
    sameSite: "lax" as const,
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: SESSION_TTL_IN_SECONDS,
  };
}

export function isAuthConfigured() {
  return getConfiguredPassword().length > 0;
}

export function isPasswordValid(password: string) {
  const configuredPassword = getConfiguredPassword();
  if (!configuredPassword || !password.trim()) {
    return false;
  }

  return safeCompare(
    buildSessionToken(password.trim()),
    buildSessionToken(configuredPassword),
  );
}

export function isSessionTokenValid(token?: string | null) {
  const configuredPassword = getConfiguredPassword();
  if (!configuredPassword || !token) {
    return false;
  }

  return safeCompare(token, buildSessionToken(configuredPassword));
}

export async function hasValidSession() {
  const cookieStore = await cookies();
  return isSessionTokenValid(cookieStore.get(AUTH_COOKIE_NAME)?.value);
}

export function isAuthenticatedRequest(request: NextRequest) {
  return isSessionTokenValid(request.cookies.get(AUTH_COOKIE_NAME)?.value);
}

export function applySessionCookie(response: NextResponse) {
  const configuredPassword = getConfiguredPassword();
  if (!configuredPassword) {
    return response;
  }

  response.cookies.set(
    AUTH_COOKIE_NAME,
    buildSessionToken(configuredPassword),
    getSessionCookieOptions(),
  );

  return response;
}

export function clearSessionCookie(response: NextResponse) {
  response.cookies.set(AUTH_COOKIE_NAME, "", {
    ...getSessionCookieOptions(),
    maxAge: 0,
  });

  return response;
}

export function getLoginErrorMessage(code?: string | string[]) {
  const normalizedCode = Array.isArray(code) ? code[0] : code;

  if (normalizedCode === "missing-password") {
    return "Defina APP_PASSWORD no Easypanel para liberar o acesso ao painel.";
  }

  if (normalizedCode === "invalid-password") {
    return "Senha incorreta. Tente novamente.";
  }

  return "";
}
