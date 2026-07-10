import Link from "next/link";
import { ArrowUpRight, Link2, MousePointerClick, TrendingUp } from "lucide-react";
import { getCurrentUser, getGuestId } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { LinkComposer } from "@/components/dashboard/link-composer";
import { AnimatedNumber } from "@/components/dashboard/animated-number";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { timeAgo, formatNumber } from "@/lib/utils";

export const dynamic = "force-dynamic";

async function getOwnerFilter() {
  const user = await getCurrentUser();
  if (user) return { userId: user.id };
  const guestId = await getGuestId();
  if (guestId) return { guestId };
  return null;
}

export default async function OverviewPage() {
  const filter = await getOwnerFilter();

  const [links, total] = filter
    ? await Promise.all([
        prisma.link.findMany({
          where: filter,
          orderBy: { createdAt: "desc" },
          take: 6,
        }),
        prisma.link.count({ where: filter }),
      ])
    : [[], 0];

  const totalClicks = links.reduce((s, l) => s + l.clickCount, 0);

  const stats = [
    { label: "Total links", value: total, icon: Link2 },
    { label: "Total clicks", value: totalClicks, icon: MousePointerClick },
    {
      label: "Avg. CTR",
      value: total ? Math.round((totalClicks / total) * 10) / 10 : 0,
      icon: TrendingUp,
      suffix: "",
    },
  ];

  return (
    <div className="mx-auto max-w-6xl">
      <div className="mb-8">
        <h1 className="text-2xl font-semibold tracking-tight">Overview</h1>
        <p className="text-sm text-ink-muted">
          Your links and performance at a glance.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        {stats.map((s) => (
          <Card key={s.label} className="p-5">
            <div className="flex items-center justify-between">
              <span className="text-sm text-ink-muted">{s.label}</span>
              <span className="grid h-8 w-8 place-items-center rounded-lg bg-surface-elevated/70 text-brand-violet">
                <s.icon className="h-4 w-4" />
              </span>
            </div>
            <p className="mt-3 text-3xl font-semibold tracking-tight">
              <AnimatedNumber value={s.value} />
            </p>
          </Card>
        ))}
      </div>

      <div className="mt-8 grid gap-6 lg:grid-cols-2">
        <LinkComposer />

        <div>
          <div className="mb-3 flex items-center justify-between">
            <h2 className="text-sm font-semibold text-ink-muted">Recent links</h2>
            <Link
              href="/app/links"
              className="flex items-center gap-1 text-xs text-brand-violet transition-opacity hover:opacity-80"
            >
              View all <ArrowUpRight className="h-3.5 w-3.5" />
            </Link>
          </div>

          {links.length === 0 ? (
            <Card className="flex h-full min-h-[280px] flex-col items-center justify-center p-8 text-center">
              <span className="grid h-12 w-12 place-items-center rounded-2xl bg-surface-elevated/70 text-ink-faint">
                <Link2 className="h-5 w-5" />
              </span>
              <p className="mt-3 text-sm font-medium">No links yet</p>
              <p className="mt-1 max-w-xs text-xs text-ink-faint">
                Create your first short link with the composer. It works
                instantly — no sign up required.
              </p>
            </Card>
          ) : (
            <div className="space-y-2">
              {links.map((l) => (
                <Card key={l.id} className="flex items-center gap-3 p-4">
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium">/{l.slug}</p>
                    <p className="truncate text-xs text-ink-faint">
                      {l.destination}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-semibold">
                      {formatNumber(l.clickCount)}
                    </p>
                    <p className="text-[11px] text-ink-faint">{timeAgo(l.createdAt)}</p>
                  </div>
                  {l.isOneTime && <Badge variant="warning">1x</Badge>}
                  {l.password && <Badge variant="brand">🔒</Badge>}
                </Card>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
