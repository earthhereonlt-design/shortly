"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { AnimatePresence, motion } from "motion/react";
import {
  Copy,
  Check,
  Search,
  Star,
  Trash2,
  ExternalLink,
  Link2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/components/ui/toast";
import { cn, timeAgo, formatNumber } from "@/lib/utils";

export type LinkItem = {
  id: string;
  slug: string;
  destination: string;
  title: string | null;
  clickCount: number;
  favorite: boolean;
  status: string;
  isOneTime: boolean;
  password: string | null;
  createdAt: string;
};

export function LinksManager({ initial }: { initial: LinkItem[] }) {
  const router = useRouter();
  const toast = useToast();
  const [links, setLinks] = React.useState(initial);
  const [query, setQuery] = React.useState("");
  const [filter, setFilter] = React.useState<"all" | "favorite">("all");
  const [copied, setCopied] = React.useState<string | null>(null);

  const filtered = React.useMemo(() => {
    return links
      .filter((l) => (filter === "favorite" ? l.favorite : true))
      .filter((l) =>
        `${l.slug} ${l.destination} ${l.title ?? ""}`
          .toLowerCase()
          .includes(query.toLowerCase()),
      )
      .sort((a, b) => b.clickCount - a.clickCount);
  }, [links, query, filter]);

  async function copy(l: LinkItem) {
    await navigator.clipboard.writeText(`${location.origin}/${l.slug}`);
    setCopied(l.id);
    toast({ title: "Copied", description: `/${l.slug}` });
    setTimeout(() => setCopied(null), 1500);
  }

  async function toggleFavorite(l: LinkItem) {
    setLinks((prev) =>
      prev.map((x) => (x.id === l.id ? { ...x, favorite: !x.favorite } : x)),
    );
    await fetch(`/api/links/${l.id}`, {
      method: "PATCH",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ favorite: !l.favorite }),
    });
  }

  async function remove(l: LinkItem) {
    const snapshot = links;
    setLinks((prev) => prev.filter((x) => x.id !== l.id));
    toast({
      title: "Link deleted",
      description: "Undo within a few seconds",
      variant: "info",
    });
    const res = await fetch(`/api/links/${l.id}`, { method: "DELETE" });
    if (!res.ok) {
      setLinks(snapshot);
      toast({ title: "Could not delete", variant: "error" });
    } else {
      router.refresh();
    }
  }

  return (
    <div>
      <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-center">
        <div className="flex h-11 flex-1 items-center gap-3 rounded-xl border border-line bg-surface-muted/60 px-4">
          <Search className="h-4 w-4 text-ink-faint" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search links…"
            className="w-full bg-transparent text-sm text-ink outline-none placeholder:text-ink-faint"
          />
        </div>
        <div className="flex gap-1 rounded-xl border border-line bg-surface-muted/40 p-1">
          {(["all", "favorite"] as const).map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={cn(
                "rounded-lg px-3 py-1.5 text-sm capitalize transition-colors",
                filter === f
                  ? "bg-surface-elevated text-ink shadow-soft"
                  : "text-ink-muted hover:text-ink",
              )}
            >
              {f}
            </button>
          ))}
        </div>
      </div>

      {filtered.length === 0 ? (
        <div className="glass flex flex-col items-center justify-center rounded-3xl p-16 text-center">
          <span className="grid h-14 w-14 place-items-center rounded-2xl bg-surface-elevated/70 text-ink-faint">
            <Link2 className="h-6 w-6" />
          </span>
          <p className="mt-4 text-base font-medium">No links found</p>
          <p className="mt-1 max-w-sm text-sm text-ink-faint">
            {links.length === 0
              ? "Create your first link from the Overview tab."
              : "Try a different search or filter."}
          </p>
        </div>
      ) : (
        <div className="overflow-hidden rounded-3xl border border-line">
          <div className="hidden grid-cols-12 gap-4 border-b border-line bg-surface-elevated/40 px-5 py-3 text-xs font-medium text-ink-faint sm:grid">
            <span className="col-span-5">Link</span>
            <span className="col-span-2 text-right">Clicks</span>
            <span className="col-span-3">Created</span>
            <span className="col-span-2 text-right">Actions</span>
          </div>
          <AnimatePresence initial={false}>
            {filtered.map((l) => (
              <motion.div
                key={l.id}
                layout
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0, height: 0 }}
                className="group grid grid-cols-2 items-center gap-4 border-b border-line px-5 py-3.5 transition-colors last:border-0 hover:bg-surface-elevated/30 sm:grid-cols-12"
              >
                <div className="col-span-2 min-w-0 sm:col-span-5">
                  <div className="flex items-center gap-2">
                    <span className="truncate text-sm font-medium">/{l.slug}</span>
                    {l.isOneTime && <Badge variant="warning">1x</Badge>}
                    {l.password && <Badge variant="brand">🔒</Badge>}
                  </div>
                  <p className="truncate text-xs text-ink-faint">{l.destination}</p>
                </div>
                <div className="col-span-1 text-right text-sm font-semibold sm:col-span-2">
                  {formatNumber(l.clickCount)}
                </div>
                <div className="col-span-1 text-xs text-ink-faint sm:col-span-3">
                  {timeAgo(l.createdAt)}
                </div>
                <div className="col-span-2 flex items-center justify-end gap-1 sm:col-span-2">
                  <button
                    onClick={() => toggleFavorite(l)}
                    className={cn(
                      "grid h-8 w-8 place-items-center rounded-lg transition-colors hover:bg-surface-elevated",
                      l.favorite ? "text-amber-400" : "text-ink-faint hover:text-ink",
                    )}
                    aria-label="Favorite"
                  >
                    <Star className="h-4 w-4" fill={l.favorite ? "currentColor" : "none"} />
                  </button>
                  <button
                    onClick={() => copy(l)}
                    className="grid h-8 w-8 place-items-center rounded-lg text-ink-faint transition-colors hover:bg-surface-elevated hover:text-ink"
                    aria-label="Copy"
                  >
                    {copied === l.id ? (
                      <Check className="h-4 w-4 text-emerald-400" />
                    ) : (
                      <Copy className="h-4 w-4" />
                    )}
                  </button>
                  <a
                    href={`/${l.slug}`}
                    target="_blank"
                    className="grid h-8 w-8 place-items-center rounded-lg text-ink-faint transition-colors hover:bg-surface-elevated hover:text-ink"
                    aria-label="Open"
                  >
                    <ExternalLink className="h-4 w-4" />
                  </a>
                  <button
                    onClick={() => remove(l)}
                    className="grid h-8 w-8 place-items-center rounded-lg text-ink-faint transition-colors hover:bg-red-500/10 hover:text-red-400"
                    aria-label="Delete"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      )}
    </div>
  );
}
