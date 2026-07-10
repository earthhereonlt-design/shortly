import { getCurrentUser, getGuestId } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { Analytics, type AnalyticsData } from "@/components/dashboard/analytics";

export const dynamic = "force-dynamic";

const DAYS = 14;

export default async function AnalyticsPage() {
  const user = await getCurrentUser();
  const guestId = user ? null : await getGuestId();
  const filter = user ? { userId: user.id } : guestId ? { guestId } : null;

  if (!filter) {
    return (
      <div className="mx-auto max-w-6xl">
        <h1 className="text-2xl font-semibold tracking-tight">Analytics</h1>
        <p className="mt-2 text-sm text-ink-muted">
          Sign in to see analytics for your links.
        </p>
      </div>
    );
  }

  const links = await prisma.link.findMany({
    where: filter,
    select: { id: true, slug: true, clickCount: true },
  });
  const linkIds = links.map((l) => l.id);

  const since = new Date(Date.now() - DAYS * 86400_000);
  const clicks = await prisma.click.findMany({
    where: { linkId: { in: linkIds }, clickedAt: { gte: since } },
    include: { device: true, geo: true },
    take: 20_000,
  });

  // Timeline
  const buckets = new Map<string, number>();
  for (let i = DAYS - 1; i >= 0; i--) {
    const d = new Date(Date.now() - i * 86400_000);
    buckets.set(d.toISOString().slice(0, 10), 0);
  }
  const deviceCount = new Map<string, number>();
  const countryCount = new Map<string, number>();
  const uniqueIps = new Set<string>();

  for (const c of clicks) {
    const day = c.clickedAt.toISOString().slice(0, 10);
    if (buckets.has(day)) buckets.set(day, (buckets.get(day) ?? 0) + 1);
    if (c.ipHash) uniqueIps.add(c.ipHash);
    const dev = c.device?.type ?? "OTHER";
    deviceCount.set(dev, (deviceCount.get(dev) ?? 0) + 1);
    const ctry = c.geo?.country ?? "Unknown";
    countryCount.set(ctry, (countryCount.get(ctry) ?? 0) + 1);
  }

  const data: AnalyticsData = {
    totals: {
      clicks: clicks.length,
      unique: uniqueIps.size,
      countries: countryCount.size,
      devices: deviceCount.size,
    },
    timeline: Array.from(buckets.entries()).map(([date, clicks]) => ({
      date: new Date(date).toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
      }),
      clicks,
    })),
    devices: Array.from(deviceCount.entries())
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value),
    countries: Array.from(countryCount.entries())
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value),
    topLinks: [...links]
      .sort((a, b) => b.clickCount - a.clickCount)
      .slice(0, 5)
      .map((l) => ({ slug: l.slug, clicks: l.clickCount })),
  };

  return (
    <div className="mx-auto max-w-6xl">
      <div className="mb-6">
        <h1 className="text-2xl font-semibold tracking-tight">Analytics</h1>
        <p className="text-sm text-ink-muted">
          Beautiful, real-time insight into every click.
        </p>
      </div>
      <Analytics data={data} />
    </div>
  );
}
