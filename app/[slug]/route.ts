import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { cacheGet, cacheSet, redis } from "@/lib/redis";
import { verifyPassword } from "@/lib/auth";
import { hashIp } from "@/lib/utils";

export const runtime = "nodejs";

type LinkRow = {
  id: string;
  slug: string;
  destination: string;
  password: string | null;
  expiresAt: Date | null;
  maxClicks: number | null;
  clickCount: number;
  isOneTime: boolean;
  oneTimeUsed: boolean;
  isActive: boolean;
  status: string;
  geoRules: unknown;
  deviceRules: unknown;
  osRules: unknown;
  browserRules: unknown;
  timeRules: unknown;
  abEnabled: boolean;
  variants: unknown;
};

async function loadLink(slug: string): Promise<LinkRow | null> {
  const cacheKey = `rl:link:${slug}`;
  const cached = await cacheGet<LinkRow>(cacheKey);
  if (cached) return cached;
  const row = await prisma.link.findFirst({
    where: { slug, domainId: null },
    select: {
      id: true,
      slug: true,
      destination: true,
      password: true,
      expiresAt: true,
      maxClicks: true,
      clickCount: true,
      isOneTime: true,
      oneTimeUsed: true,
      isActive: true,
      status: true,
      geoRules: true,
      deviceRules: true,
      osRules: true,
      browserRules: true,
      timeRules: true,
      abEnabled: true,
      variants: true,
    },
  });
  if (row) await cacheSet(cacheKey, row, 300);
  return row as LinkRow | null;
}

function pickDestination(link: LinkRow, req: NextRequest): string {
  const ua = req.headers.get("user-agent") ?? "";
  const country = req.headers.get("x-vercel-ip-country") ?? "";
  const now = new Date();

  // Geo routing
  if (Array.isArray(link.geoRules)) {
    const rule = (link.geoRules as any[]).find(
      (r) => r.country?.toLowerCase() === country?.toLowerCase(),
    );
    if (rule?.destination) return rule.destination;
  }
  // Device routing
  const isMobile = /mobile|android|iphone|ipad/i.test(ua);
  const isTablet = /tablet|ipad/i.test(ua);
  const deviceType = isTablet ? "TABLET" : isMobile ? "MOBILE" : "DESKTOP";
  if (Array.isArray(link.deviceRules)) {
    const rule = (link.deviceRules as any[]).find((r) => r.type === deviceType);
    if (rule?.destination) return rule.destination;
  }
  // OS routing
  const os = /windows/i.test(ua)
    ? "WINDOWS"
    : /mac/i.test(ua)
      ? "MACOS"
      : /android/i.test(ua)
        ? "ANDROID"
        : /linux/i.test(ua)
          ? "LINUX"
          : "OTHER";
  if (Array.isArray(link.osRules)) {
    const rule = (link.osRules as any[]).find((r) => r.os === os);
    if (rule?.destination) return rule.destination;
  }
  // Browser routing
  const browser = /edg/i.test(ua)
    ? "EDGE"
    : /chrome/i.test(ua)
      ? "CHROME"
      : /firefox/i.test(ua)
        ? "FIREFOX"
        : /safari/i.test(ua)
          ? "SAFARI"
          : "OTHER";
  if (Array.isArray(link.browserRules)) {
    const rule = (link.browserRules as any[]).find((r) => r.browser === browser);
    if (rule?.destination) return rule.destination;
  }
  // A/B traffic splitting
  if (link.abEnabled && Array.isArray(link.variants) && link.variants.length) {
    const variants = link.variants as { destination: string; weight: number }[];
    const total = variants.reduce((s, v) => s + (v.weight ?? 1), 0);
    let roll = Math.random() * total;
    for (const v of variants) {
      roll -= v.weight ?? 1;
      if (roll <= 0) return v.destination;
    }
  }
  return link.destination;
}

async function recordClick(link: LinkRow, req: NextRequest) {
  try {
    const ip = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "0.0.0.0";
    const ipHash = await hashIp(ip);
    const ua = req.headers.get("user-agent") ?? "";
    const referrer = req.headers.get("referer") ?? null;
    const isMobile = /mobile|android|iphone/i.test(ua);
    const type = /tablet|ipad/i.test(ua) ? "TABLET" : isMobile ? "MOBILE" : "DESKTOP";
    const browser = /edg/i.test(ua)
      ? "EDGE"
      : /chrome/i.test(ua)
        ? "CHROME"
        : /firefox/i.test(ua)
          ? "FIREFOX"
          : /safari/i.test(ua)
            ? "SAFARI"
            : "OTHER";
    const os = /windows/i.test(ua)
      ? "WINDOWS"
      : /mac/i.test(ua)
        ? "MACOS"
        : /android/i.test(ua)
          ? "ANDROID"
          : /linux/i.test(ua)
            ? "LINUX"
            : "OTHER";

    const device = await prisma.device.upsert({
      where: { type_browser_os: { type: type as any, browser, os } },
      update: {},
      create: { type: type as any, browser, os },
    });

    await prisma.click.create({
      data: {
        linkId: link.id,
        ipHash,
        deviceId: device.id,
        referrer,
        isUnique: true,
        clickedAt: now(),
      },
    });

    await prisma.link.update({
      where: { id: link.id },
      data: { clickCount: { increment: 1 } },
    });
    await redis.incr(`rl:clicks:${link.id}:today`).catch(() => {});
  } catch {
    /* never block the redirect on analytics failure */
  }
}

function now(): Date {
  return new Date();
}

function unlockForm(slug: string, error?: string): Response {
  const html = `<!doctype html><html lang="en" class="dark"><head><meta charset="utf-8"/>
<meta name="viewport" content="width=device-width,initial-scale=1"/>
<title>Protected link · RailLink</title>
<style>
  :root{color-scheme:dark}
  body{margin:0;min-height:100vh;display:grid;place-items:center;background:#09090b;
    font-family:ui-sans-serif,system-ui,-apple-system,Segoe UI,Roboto,sans-serif;color:#fafafc}
  .card{width:min(92vw,380px);background:rgba(28,28,35,.7);backdrop-filter:blur(20px);
    border:1px solid rgba(255,255,255,.08);border-radius:24px;padding:32px;box-shadow:0 8px 30px rgba(0,0,0,.35)}
  h1{font-size:18px;margin:0 0 4px;font-weight:600}
  p{color:#a1a1aa;font-size:14px;margin:0 0 20px}
  input{width:100%;height:44px;border-radius:12px;border:1px solid rgba(255,255,255,.1);
    background:rgba(24,24,30,.6);color:#fafafc;padding:0 14px;font-size:14px;outline:none}
  input:focus{border-color:rgba(129,140,248,.6)}
  button{margin-top:14px;width:100%;height:44px;border:0;border-radius:12px;cursor:pointer;
    background:linear-gradient(120deg,#3b82f6,#8b5cf6);color:#fff;font-weight:600;font-size:14px}
  .err{color:#f87171;font-size:13px;margin:0 0 12px}
</style></head>
<body><form class="card" method="post" action="/${slug}">
  <h1>This link is protected</h1>
  <p>Enter the password to continue.</p>
  ${error ? `<p class="err">${error}</p>` : ""}
  <input name="password" type="password" placeholder="Password" autofocus required/>
  <button type="submit">Unlock</button>
</form></body></html>`;
  return new Response(html, {
    status: error ? 401 : 200,
    headers: { "content-type": "text/html; charset=utf-8" },
  });
}

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ slug: string }> },
) {
  const { slug } = await params;
  const link = await loadLink(slug);
  if (!link) {
    return NextResponse.json({ error: "Link not found" }, { status: 404 });
  }
  if (!link.isActive || link.status !== "ACTIVE") {
    return NextResponse.json({ error: "Link is inactive" }, { status: 410 });
  }
  if (link.expiresAt && link.expiresAt.getTime() < Date.now()) {
    return NextResponse.json({ error: "Link expired" }, { status: 410 });
  }
  if (link.maxClicks && link.clickCount >= link.maxClicks) {
    return NextResponse.json({ error: "Link reached click limit" }, { status: 410 });
  }
  if (link.isOneTime && link.oneTimeUsed) {
    return NextResponse.json({ error: "Link already used" }, { status: 410 });
  }

  // Password gate
  if (link.password) {
    const cookie = req.cookies.get(`rl_pw_${slug}`)?.value;
    if (cookie !== "1") return unlockForm(slug);
  }

  const destination = pickDestination(link, req);
  await recordClick(link, req);

  if (link.isOneTime) {
    await prisma.link.update({
      where: { id: link.id },
      data: { oneTimeUsed: true },
    });
  }
  return NextResponse.redirect(destination, { status: 307 });
}

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ slug: string }> },
) {
  const { slug } = await params;
  const link = await loadLink(slug);
  if (!link?.password) {
    return NextResponse.json({ error: "Not protected" }, { status: 400 });
  }
  const form = await req.formData().catch(() => null);
  const password = form?.get("password")?.toString() ?? "";
  const ok = await verifyPassword(password, link.password);
  if (!ok) return unlockForm(slug, "Incorrect password.");
  const res = NextResponse.redirect(new URL(`/${slug}`, req.url), { status: 307 });
  res.cookies.set(`rl_pw_${slug}`, "1", {
    httpOnly: true,
    sameSite: "lax",
    maxAge: 60 * 60 * 24,
    path: "/",
  });
  return res;
}
