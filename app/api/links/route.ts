import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma, isDatabaseUnavailable } from "@/lib/prisma";
import { cacheDel, cacheGet, cacheSet, cacheIncr } from "@/lib/redis";
import { hashPassword, getSession, GUEST_COOKIE } from "@/lib/auth";
import { randomSlug, isValidAlias } from "@/lib/utils";
import { renderQrSvg } from "@/lib/qr";

export const runtime = "nodejs";

const createSchema = z.object({
  destination: z
    .string()
    .url("Enter a valid URL")
    .refine((u) => /^https?:\/\//.test(u), "URL must start with http(s)://"),
  slug: z.string().optional(),
  title: z.string().max(120).optional(),
  note: z.string().max(280).optional(),
  password: z.string().min(3).optional(),
  expiresAt: z.string().datetime().optional(),
  maxClicks: z.number().int().positive().max(1_000_000).optional(),
  isOneTime: z.boolean().optional(),
  folderId: z.string().optional(),
});

async function uniqueSlug(desired?: string): Promise<string> {
  if (desired && isValidAlias(desired)) {
    const exists = await prisma.link.findFirst({
      where: { slug: desired, domainId: null },
    });
    if (!exists) return desired;
  }
  // Random with collision retry
  for (let i = 0; i < 5; i++) {
    const candidate = randomSlug(7);
    const exists = await prisma.link.findFirst({
      where: { slug: candidate, domainId: null },
    });
    if (!exists) return candidate;
  }
  return randomSlug(10);
}

async function rateLimited(ip: string): Promise<boolean> {
  try {
    const key = `rl:ratelimit:links:${ip}`;
    const count = await cacheGet<number>(key);
    if (count && count >= 30) return true;
    await cacheIncr(key, 60);
  } catch {
    /* fail open */
  }
  return false;
}

export async function POST(req: NextRequest) {
  const ip =
    req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    req.headers.get("x-real-ip") ||
    "unknown";

  if (await rateLimited(ip)) {
    return NextResponse.json(
      { error: "Too many requests. Slow down a moment." },
      { status: 429 },
    );
  }

  const json = await req.json().catch(() => null);
  const parsed = createSchema.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message ?? "Invalid input" },
      { status: 400 },
    );
  }

  try {
    const data = parsed.data;
    const session = await getSession();
    const guestId = req.cookies.get(GUEST_COOKIE)?.value ?? undefined;

  const slug = await uniqueSlug(data.slug);

  // Guests get a configurable auto-expiry if none supplied.
  let expiresAt: Date | undefined;
  if (data.expiresAt) {
    expiresAt = new Date(data.expiresAt);
  } else if (!session) {
    const days = Number(process.env.GUEST_LINK_EXPIRY_DAYS ?? "7");
    expiresAt = new Date(Date.now() + days * 86400_000);
  }

  const link = await prisma.link.create({
    data: {
      slug,
      destination: data.destination,
      title: data.title,
      note: data.note,
      password: data.password ? await hashPassword(data.password) : null,
      expiresAt,
      maxClicks: data.maxClicks,
      isOneTime: data.isOneTime ?? false,
      userId: session?.sub ?? null,
      guestId: session ? null : guestId ?? `guest_${randomSlug(12)}`,
      folderId: data.folderId,
    },
  });

  // Generate + persist a dynamic QR code for the short URL.
  const base = process.env.NEXT_PUBLIC_APP_URL ?? new URL(req.url).origin;
  const shortUrl = `${base}/${slug}`;
  const qrSvg = await renderQrSvg(shortUrl);
  await prisma.qRCode.create({
    data: { linkId: link.id, data: qrSvg },
  });

  const res = NextResponse.json({
    id: link.id,
    slug: link.slug,
    shortUrl,
    destination: link.destination,
    expiresAt: link.expiresAt,
    isOneTime: link.isOneTime,
    hasPassword: Boolean(link.password),
  });

  // Ensure anonymous users keep their guest id so they can revisit links.
  if (!session && link.guestId) {
    res.cookies.set(GUEST_COOKIE, link.guestId, {
      httpOnly: true,
      sameSite: "lax",
      maxAge: 60 * 86400 * 365,
      path: "/",
    });
  }
  await cacheDel(`rl:link:*`);
  return res;
  } catch (err) {
    if (isDatabaseUnavailable(err)) {
      return NextResponse.json(
        { error: "Service temporarily unavailable" },
        { status: 503 },
      );
    }
    throw err;
  }
}
