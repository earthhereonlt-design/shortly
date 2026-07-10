import { getCurrentUser, getGuestId } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { LinksManager, type LinkItem } from "@/components/dashboard/links-manager";

export const dynamic = "force-dynamic";

export default async function LinksPage() {
  const user = await getCurrentUser();
  const guestId = user ? null : await getGuestId();
  const filter = user ? { userId: user.id } : guestId ? { guestId } : null;

  const rows = filter
    ? await prisma.link.findMany({
        where: filter,
        orderBy: { createdAt: "desc" },
        take: 200,
      })
    : [];

  const initial: LinkItem[] = rows.map((l) => ({
    id: l.id,
    slug: l.slug,
    destination: l.destination,
    title: l.title,
    clickCount: l.clickCount,
    favorite: l.favorite,
    status: l.status,
    isOneTime: l.isOneTime,
    password: l.password,
    createdAt: l.createdAt.toISOString(),
  }));

  return (
    <div className="mx-auto max-w-6xl">
      <div className="mb-6">
        <h1 className="text-2xl font-semibold tracking-tight">Links</h1>
        <p className="text-sm text-ink-muted">
          Search, favorite, and manage every link you&apos;ve created.
        </p>
      </div>
      <LinksManager initial={initial} />
    </div>
  );
}
