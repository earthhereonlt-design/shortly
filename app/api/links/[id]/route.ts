import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { getCurrentUser, getGuestId } from "@/lib/auth";

export const runtime = "nodejs";

async function ownedWhere(id: string) {
  const user = await getCurrentUser();
  if (user) return { id, userId: user.id };
  const guestId = await getGuestId();
  if (guestId) return { id, guestId };
  return null;
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const where = await ownedWhere(id);
  if (!where) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const existing = await prisma.link.findFirst({ where });
  if (!existing) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const schema = z.object({
    favorite: z.boolean().optional(),
    status: z.enum(["ACTIVE", "ARCHIVED", "TRASHED"]).optional(),
    title: z.string().max(120).optional(),
    destination: z.string().url().optional(),
  });
  const parsed = schema.safeParse(await req.json().catch(() => null));
  if (!parsed.success)
    return NextResponse.json({ error: "Invalid input" }, { status: 400 });

  const link = await prisma.link.update({ where: { id }, data: parsed.data });
  return NextResponse.json({ ok: true, link });
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const where = await ownedWhere(id);
  if (!where) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const existing = await prisma.link.findFirst({ where });
  if (!existing) return NextResponse.json({ error: "Not found" }, { status: 404 });

  await prisma.link.delete({ where: { id } });
  return NextResponse.json({ ok: true });
}
