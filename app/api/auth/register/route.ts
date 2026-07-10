import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { hashPassword, signSession, SESSION_COOKIE, getOrCreateGuestId } from "@/lib/auth";

export const runtime = "nodejs";

const schema = z.object({
  name: z.string().min(1).max(80),
  email: z.string().email(),
  password: z.string().min(8).max(200),
});

export async function POST(req: NextRequest) {
  const json = await req.json().catch(() => null);
  const parsed = schema.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message ?? "Invalid input" },
      { status: 400 },
    );
  }
  const { name, email, password } = parsed.data;
  const normalized = email.toLowerCase().trim();

  const existing = await prisma.user.findUnique({ where: { email: normalized } });
  if (existing) {
    return NextResponse.json(
      { error: "An account with that email already exists." },
      { status: 409 },
    );
  }

  const user = await prisma.user.create({
    data: {
      name,
      email: normalized,
      passwordHash: await hashPassword(password),
    },
  });

  // Claim any guest links created before signup.
  const guestId = req.cookies.get("rl_guest")?.value;
  if (guestId) {
    await prisma.link
      .updateMany({ where: { guestId }, data: { userId: user.id, guestId: null } })
      .catch(() => {});
  }

  const token = await signSession({ sub: user.id, role: user.role });
  const res = NextResponse.json({ ok: true, userId: user.id });
  res.cookies.set(SESSION_COOKIE, token, {
    httpOnly: true,
    sameSite: "lax",
    path: "/",
    maxAge: 30 * 86400,
  });
  return res;
}
