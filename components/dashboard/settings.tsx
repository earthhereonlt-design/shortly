"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "motion/react";
import { KeyRound, Plus, Trash2, Copy, Check, AlertTriangle } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { useToast } from "@/components/ui/toast";
import { useTheme } from "@/components/theme-provider";

type ApiKey = {
  id: string;
  name: string;
  prefix: string;
  lastUsedAt: string | null;
  createdAt: string;
};

export function Settings({
  user,
  initialKeys,
}: {
  user: { name?: string | null; email: string };
  initialKeys: ApiKey[];
}) {
  const router = useRouter();
  const toast = useToast();
  const { theme, toggle } = useTheme();
  const [name, setName] = React.useState(user.name ?? "");
  const [keys, setKeys] = React.useState(initialKeys);
  const [newKeyName, setNewKeyName] = React.useState("");
  const [revealed, setRevealed] = React.useState<string | null>(null);
  const [copied, setCopied] = React.useState(false);

  async function saveProfile() {
    const res = await fetch("/api/settings", {
      method: "PATCH",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ name }),
    });
    if (res.ok) toast({ title: "Profile saved" });
    else toast({ title: "Could not save", variant: "error" });
  }

  async function createKey() {
    if (!newKeyName) return;
    const res = await fetch("/api/settings/api-keys", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ name: newKeyName }),
    });
    const data = await res.json();
    if (res.ok) {
      setRevealed(data.secret);
      setKeys((k) => [
        { id: data.id, name: newKeyName, prefix: data.prefix, lastUsedAt: null, createdAt: new Date().toISOString() },
        ...k,
      ]);
      setNewKeyName("");
      toast({ title: "API key created" });
    } else toast({ title: data.error ?? "Failed", variant: "error" });
  }

  async function deleteKey(id: string) {
    const res = await fetch(`/api/settings/api-keys/${id}`, { method: "DELETE" });
    if (res.ok) {
      setKeys((k) => k.filter((x) => x.id !== id));
      toast({ title: "Key revoked" });
    }
  }

  async function deleteAccount() {
    if (!confirm("Delete your account and all links? This cannot be undone.")) return;
    const res = await fetch("/api/settings", { method: "DELETE" });
    if (res.ok) {
      toast({ title: "Account deleted" });
      router.push("/");
    }
  }

  async function copySecret() {
    if (!revealed) return;
    await navigator.clipboard.writeText(revealed);
    setCopied(true);
    toast({ title: "Secret copied" });
    setTimeout(() => setCopied(false), 1500);
  }

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Settings</h1>
        <p className="text-sm text-ink-muted">Manage your account and access.</p>
      </div>

      {/* Profile */}
      <Card className="p-6">
        <h3 className="text-sm font-semibold text-ink-muted">Profile</h3>
        <div className="mt-4 space-y-4">
          <div>
            <Label htmlFor="name">Name</Label>
            <Input id="name" value={name} onChange={(e) => setName(e.target.value)} className="mt-1.5" />
          </div>
          <div>
            <Label htmlFor="email">Email</Label>
            <Input id="email" value={user.email} disabled className="mt-1.5 opacity-60" />
          </div>
          <Button onClick={saveProfile}>Save changes</Button>
        </div>
      </Card>

      {/* Appearance */}
      <Card className="flex items-center justify-between p-6">
        <div>
          <h3 className="text-sm font-semibold">Dark mode</h3>
          <p className="text-xs text-ink-faint">Premium dark-first experience.</p>
        </div>
        <Switch checked={theme === "dark"} onCheckedChange={toggle} />
      </Card>

      {/* API keys */}
      <Card className="p-6">
        <div className="flex items-center justify-between">
          <h3 className="flex items-center gap-2 text-sm font-semibold text-ink-muted">
            <KeyRound className="h-4 w-4" /> API keys
          </h3>
        </div>

        <AnimatePresence>
          {revealed && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="mt-4 overflow-hidden"
            >
              <div className="flex items-center gap-2 rounded-xl border border-brand-violet/30 bg-brand-violet/5 p-3">
                <code className="flex-1 truncate text-xs text-ink">{revealed}</code>
                <Button size="sm" variant="secondary" onClick={copySecret}>
                  {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                </Button>
              </div>
              <p className="mt-1 text-[11px] text-ink-faint">
                Copy this now — it won&apos;t be shown again.
              </p>
            </motion.div>
          )}
        </AnimatePresence>

        <div className="mt-4 flex gap-2">
          <Input
            placeholder="Key name (e.g. Production)"
            value={newKeyName}
            onChange={(e) => setNewKeyName(e.target.value)}
          />
          <Button onClick={createKey} variant="secondary">
            <Plus className="h-4 w-4" /> Create
          </Button>
        </div>

        <div className="mt-4 space-y-2">
          {keys.map((k) => (
            <div
              key={k.id}
              className="flex items-center justify-between rounded-xl bg-surface-elevated/40 px-4 py-3"
            >
              <div>
                <p className="text-sm font-medium">{k.name}</p>
                <p className="text-xs text-ink-faint">{k.prefix}…</p>
              </div>
              <button
                onClick={() => deleteKey(k.id)}
                className="grid h-8 w-8 place-items-center rounded-lg text-ink-faint transition-colors hover:bg-red-500/10 hover:text-red-400"
                aria-label="Revoke"
              >
                <Trash2 className="h-4 w-4" />
              </button>
            </div>
          ))}
          {keys.length === 0 && (
            <p className="text-sm text-ink-faint">No API keys yet.</p>
          )}
        </div>
      </Card>

      {/* Danger zone */}
      <Card className="border-red-500/30 p-6">
        <h3 className="flex items-center gap-2 text-sm font-semibold text-red-400">
          <AlertTriangle className="h-4 w-4" /> Danger zone
        </h3>
        <p className="mt-2 text-sm text-ink-muted">
          Deleting your account removes all links, analytics, and API keys.
        </p>
        <Button variant="danger" className="mt-4" onClick={deleteAccount}>
          Delete account
        </Button>
      </Card>
    </div>
  );
}
