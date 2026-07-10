import { cookies } from "next/headers";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";

export const SESSION_COOKIE = "rl_session";
export const GUEST_COOKIE = "rl_guest";
const SESSION_TTL_DAYS = 30;

export type SessionPayload = {
  sub: string; // user id
  role: "USER" | "ADMIN";
  iat: number;
  exp: number;
};

// ── Password hashing ──────────────────────────────────────────────
export function hashPassword(plain: string): Promise<string> {
  return bcrypt.hash(plain, 12);
}

export function verifyPassword(plain: string, hash: string): Promise<boolean> {
  return bcrypt.compare(plain, hash);
}

// ── Minimal HS256 JWT (Web Crypto, no extra deps) ──────────────────
function b64url(input: ArrayBuffer | Uint8Array | string): string {
  const bytes =
    typeof input === "string" ? new TextEncoder().encode(input) : new Uint8Array(input);
  let bin = "";
  bytes.forEach((b) => (bin += String.fromCharCode(b)));
  return btoa(bin).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

function b64urlDecode(input: string): Uint8Array {
  const pad = input.length % 4 === 0 ? "" : "=".repeat(4 - (input.length % 4));
  const bin = atob(input.replace(/-/g, "+").replace(/_/g, "/") + pad);
  const out = new Uint8Array(bin.length);
  for (let i = 0; i < bin.length; i++) out[i] = bin.charCodeAt(i);
  return out;
}

async function hmac(secret: string, data: string): Promise<ArrayBuffer> {
  const key = await crypto.subtle.importKey(
    "raw",
    new TextEncoder().encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"],
  );
  return crypto.subtle.sign("HMAC", key, new TextEncoder().encode(data));
}

export async function signSession(payload: Omit<SessionPayload, "iat" | "exp">): Promise<string> {
  const secret = process.env.BETTER_AUTH_SECRET ?? "dev-insecure-secret-change-me";
  const now = Math.floor(Date.now() / 1000);
  const body = { ...payload, iat: now, exp: now + SESSION_TTL_DAYS * 86400 };
  const header = b64url(JSON.stringify({ alg: "HS256", typ: "JWT" }));
  const enc = b64url(JSON.stringify(body));
  const sig = b64url(await hmac(secret, `${header}.${enc}`));
  return `${header}.${enc}.${sig}`;
}

export async function verifySession(token: string): Promise<SessionPayload | null> {
  try {
    const secret = process.env.BETTER_AUTH_SECRET ?? "dev-insecure-secret-change-me";
    const [header, enc, sig] = token.split(".");
    const expected = b64url(await hmac(secret, `${header}.${enc}`));
    if (expected !== sig) return null;
    const json = JSON.parse(new TextDecoder().decode(b64urlDecode(enc)));
    if (json.exp * 1000 < Date.now()) return null;
    return json as SessionPayload;
  } catch {
    return null;
  }
}

// ── Cookie / session helpers ──────────────────────────────────────
export async function getSession(): Promise<SessionPayload | null> {
  const store = await cookies();
  const token = store.get(SESSION_COOKIE)?.value;
  if (!token) return null;
  return verifySession(token);
}

export async function getCurrentUser() {
  const session = await getSession();
  if (!session) return null;
  return prisma.user.findUnique({ where: { id: session.sub } });
}

/** Resolve or mint an anonymous guest id (stored in a long-lived cookie). */
export async function getOrCreateGuestId(): Promise<string> {
  const store = await cookies();
  const existing = store.get(GUEST_COOKIE)?.value;
  if (existing) return existing;
  // Caller persists + sets the cookie. Return a fresh id.
  return `guest_${b64url(crypto.getRandomValues(new Uint8Array(12)))}`;
}

/** Return the existing guest id from the cookie, or null. */
export async function getGuestId(): Promise<string | null> {
  const store = await cookies();
  return store.get(GUEST_COOKIE)?.value ?? null;
}
