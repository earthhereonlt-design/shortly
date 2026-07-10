"use client";

import * as React from "react";
import { motion, AnimatePresence } from "motion/react";
import { Copy, Check, QrCode, Sparkles, Link2, Lock, Clock, Zap } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { useToast } from "@/components/ui/toast";
import { cn } from "@/lib/utils";

type Result = {
  slug: string;
  shortUrl: string;
  destination: string;
  hasPassword: boolean;
  expiresAt: string | null;
};

export function LinkComposer() {
  const [destination, setDestination] = React.useState("");
  const [customAlias, setCustomAlias] = React.useState("");
  const [useAlias, setUseAlias] = React.useState(false);
  const [password, setPassword] = React.useState("");
  const [usePassword, setUsePassword] = React.useState(false);
  const [oneTime, setOneTime] = React.useState(false);
  const [expiry, setExpiry] = React.useState("");
  const [loading, setLoading] = React.useState(false);
  const [result, setResult] = React.useState<Result | null>(null);
  const [copied, setCopied] = React.useState(false);
  const toast = useToast();

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!destination) {
      toast({ title: "Add a destination URL", variant: "error" });
      return;
    }
    setLoading(true);
    try {
      const res = await fetch("/api/links", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          destination,
          slug: useAlias ? customAlias : undefined,
          password: usePassword ? password : undefined,
          isOneTime: oneTime,
          expiresAt: expiry ? new Date(expiry).toISOString() : undefined,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        toast({ title: data.error ?? "Something went wrong", variant: "error" });
        return;
      }
      setResult(data);
      toast({ title: "Link created", description: data.shortUrl });
    } finally {
      setLoading(false);
    }
  }

  async function copy() {
    if (!result) return;
    await navigator.clipboard.writeText(result.shortUrl);
    setCopied(true);
    toast({ title: "Copied to clipboard" });
    setTimeout(() => setCopied(false), 1800);
  }

  return (
    <div className="glass rounded-3xl p-6 shadow-soft sm:p-8">
      <div className="mb-5 flex items-center gap-2">
        <span className="grid h-9 w-9 place-items-center rounded-xl bg-gradient-to-br from-brand-blue to-brand-violet text-white shadow-glow">
          <Link2 className="h-4 w-4" />
        </span>
        <div>
          <h2 className="text-base font-semibold tracking-tight">Create a short link</h2>
          <p className="text-xs text-ink-faint">No account needed — shorten instantly.</p>
        </div>
      </div>

      <form onSubmit={submit} className="space-y-4">
        <div>
          <Label htmlFor="dest">Destination URL</Label>
          <Input
            id="dest"
            placeholder="https://your-long-url.example.com/…"
            value={destination}
            onChange={(e) => setDestination(e.target.value)}
            className="mt-1.5"
          />
        </div>

        <div className="flex items-center justify-between rounded-xl bg-surface-elevated/40 px-4 py-3">
          <div className="flex items-center gap-2 text-sm">
            <Sparkles className="h-4 w-4 text-brand-violet" />
            Custom alias
          </div>
          <Switch checked={useAlias} onCheckedChange={setUseAlias} />
        </div>
        <AnimatePresence>
          {useAlias && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="overflow-hidden"
            >
              <div className="flex items-center rounded-xl border border-line bg-surface-muted/60 focus-within:border-accent/60">
                <span className="pl-4 text-sm text-ink-faint">raillink.app/</span>
                <input
                  value={customAlias}
                  onChange={(e) => setCustomAlias(e.target.value.replace(/\s/g, ""))}
                  placeholder="summer-sale"
                  className="h-11 w-full bg-transparent px-1 text-sm text-ink outline-none"
                />
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <div className="flex items-center justify-between rounded-xl bg-surface-elevated/40 px-4 py-3">
          <div className="flex items-center gap-2 text-sm">
            <Lock className="h-4 w-4 text-brand-violet" />
            Password protection
          </div>
          <Switch checked={usePassword} onCheckedChange={setUsePassword} />
        </div>
        <AnimatePresence>
          {usePassword && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="overflow-hidden"
            >
              <Input
                type="password"
                placeholder="Set a password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </motion.div>
          )}
        </AnimatePresence>

        <div className="grid gap-3 sm:grid-cols-2">
          <div className="flex items-center justify-between rounded-xl bg-surface-elevated/40 px-4 py-3">
            <div className="flex items-center gap-2 text-sm">
              <Zap className="h-4 w-4 text-brand-violet" />
              One-time
            </div>
            <Switch checked={oneTime} onCheckedChange={setOneTime} />
          </div>
          <div>
            <Label htmlFor="exp" className="sr-only">
              Expiry
            </Label>
            <div className="flex items-center gap-2 rounded-xl border border-line bg-surface-muted/60 px-3">
              <Clock className="h-4 w-4 text-ink-faint" />
              <input
                id="exp"
                type="datetime-local"
                value={expiry}
                onChange={(e) => setExpiry(e.target.value)}
                className="h-11 w-full bg-transparent text-sm text-ink outline-none"
              />
            </div>
          </div>
        </div>

        <Button type="submit" size="lg" className="w-full" disabled={loading}>
          {loading ? "Creating…" : "Shorten link"}
        </Button>
      </form>

      <AnimatePresence>
        {result && (
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            transition={{ type: "spring", stiffness: 200, damping: 22 }}
            className="mt-6 overflow-hidden rounded-2xl border border-brand-violet/30 bg-brand-violet/5 p-4"
          >
            <div className="flex items-center justify-between gap-3">
              <div className="min-w-0">
                <p className="truncate text-sm font-semibold text-gradient-brand">
                  {result.shortUrl}
                </p>
                <p className="truncate text-xs text-ink-faint">{result.destination}</p>
              </div>
              <Button size="sm" variant="secondary" onClick={copy}>
                {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                {copied ? "Copied" : "Copy"}
              </Button>
            </div>
            <details className="mt-3 group">
              <summary className="flex cursor-pointer items-center gap-2 text-xs text-ink-muted">
                <QrCode className="h-3.5 w-3.5" /> Show QR code
              </summary>
              <div className="mt-3 flex justify-center">
                <img
                  src={`https://api.qrserver.com/v1/create-qr-code/?size=160x160&data=${encodeURIComponent(result.shortUrl)}`}
                  alt="QR code"
                  className="h-40 w-40 rounded-xl bg-white p-2"
                />
              </div>
            </details>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
