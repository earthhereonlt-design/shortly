import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { getCurrentUser, SESSION_COOKIE } from "@/lib/auth";

export const runtime = "nodejs";

export async function PATCH(req: NextRequest) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const schema = z.object({
    name: z.string().min(1).max(80).optional(),
    currentPassword: z.string().optional(),
    newPassword: z.string().min(8).max(200).optional(),
  });
  const parsed = schema.safeParse(await req.json().catch(() => null));
  if (!parsed.success)
    return NextResponse.json({ error: "Invalid input" }, { status: 400 });

  const data: Record<string, unknown> = {};
  if (parsed.data.name) data.name = parsed.data.name;
  if (parsed.data.newPassword && parsed.data.currentPassword) {
    const { verifyPassword, hashPassword } = await import("@/lib/auth");
    const full = await prisma.user.findUnique({ where: { id: user.id } });
    if (!full?.passwordHash || !(await verifyPassword(parsed.data.currentPassword, full.passwordHash))) {
      return NextResponse.json({ error: "Current password is wrong" }, { status: 401 });
    }
    data.passwordHash = await hashPassword(parsed.data.newPassword);
  }

  await prisma.user.update({ where: { id: user.id }, data });
  return NextResponse.json({ ok: true });
}

export async function DELETE() {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  await prisma.user.delete({ where: { id: user.id } });
  const res = NextResponse.json({ ok: true });
  res.cookies.delete(SESSION_COOKIE);
  return res;
}
