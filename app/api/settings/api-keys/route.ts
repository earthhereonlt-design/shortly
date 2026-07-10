import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";
import { randomSlug } from "@/lib/utils";

export const runtime = "nodejs";

export async function GET() {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const keys = await prisma.apiKey.findMany({
    where: { userId: user.id, revokedAt: null },
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
      name: true,
      prefix: true,
      lastUsedAt: true,
      createdAt: true,
      expiresAt: true,
    },
  });
  return NextResponse.json({ keys });
}

export async function POST(req: NextRequest) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const schema = z.object({
    name: z.string().min(1).max(60),
    scopes: z.array(z.string()).optional(),
  });
  const parsed = schema.safeParse(await req.json().catch(() => null));
  if (!parsed.success)
    return NextResponse.json({ error: "Invalid input" }, { status: 400 });

  const secret = `rl_live_${randomSlug(24)}`;
  const prefix = secret.slice(0, 12);
  const hashedKey = await crypto.subtle
    .digest("SHA-256", new TextEncoder().encode(secret))
    .then((b) =>
      Array.from(new Uint8Array(b))
        .map((x) => x.toString(16).padStart(2, "0"))
        .join(""),
    );

  const key = await prisma.apiKey.create({
    data: {
      name: parsed.data.name,
      prefix,
      hashedKey,
      userId: user.id,
      scopes: parsed.data.scopes ?? ["links:write", "analytics:read"],
    },
  });

  // The plaintext secret is only returned once, at creation time.
  return NextResponse.json({ id: key.id, secret, prefix });
}
