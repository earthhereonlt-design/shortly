"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { AnimatePresence, motion } from "motion/react";
import {
  Link2,
  BarChart3,
  Settings,
  Search,
  Plus,
  Moon,
  Sun,
  LogOut,
} from "lucide-react";
import { useTheme } from "@/components/theme-provider";
import { useToast } from "@/components/ui/toast";

type Action = {
  id: string;
  label: string;
  hint?: string;
  icon: React.ReactNode;
  run: () => void;
};

export function CommandPalette() {
  const [open, setOpen] = React.useState(false);
  const [query, setQuery] = React.useState("");
  const router = useRouter();
  const { theme, toggle } = useTheme();
  const toast = useToast();

  const actions: Action[] = [
    {
      id: "create",
      label: "Create a short link",
      hint: "C",
      icon: <Plus className="h-4 w-4" />,
      run: () => router.push("/app?compose=1"),
    },
    {
      id: "links",
      label: "Go to Links",
      icon: <Link2 className="h-4 w-4" />,
      run: () => router.push("/app/links"),
    },
    {
      id: "analytics",
      label: "Go to Analytics",
      icon: <BarChart3 className="h-4 w-4" />,
      run: () => router.push("/app/analytics"),
    },
    {
      id: "settings",
      label: "Open Settings",
      icon: <Settings className="h-4 w-4" />,
      run: () => router.push("/app/settings"),
    },
    {
      id: "theme",
      label: theme === "dark" ? "Switch to light" : "Switch to dark",
      icon: theme === "dark" ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />,
      run: toggle,
    },
    {
      id: "logout",
      label: "Sign out",
      icon: <LogOut className="h-4 w-4" />,
      run: async () => {
        await fetch("/api/auth/logout", { method: "POST" });
        toast({ title: "Signed out", variant: "info" });
        router.push("/");
      },
    },
  ];

  const filtered = actions.filter((a) =>
    a.label.toLowerCase().includes(query.toLowerCase()),
  );

  React.useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setOpen((o) => !o);
      }
      if (e.key === "Escape") setOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="fixed inset-0 z-[80] flex items-start justify-center px-4 pt-[18vh]"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <div
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            onClick={() => setOpen(false)}
          />
          <motion.div
            initial={{ opacity: 0, y: -12, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -12, scale: 0.98 }}
            transition={{ type: "spring", stiffness: 260, damping: 24 }}
            className="glass-strong relative w-full max-w-xl overflow-hidden rounded-3xl shadow-soft"
          >
            <div className="flex items-center gap-3 border-b border-line px-5 py-4">
              <Search className="h-4 w-4 text-ink-faint" />
              <input
                autoFocus
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Type a command or search…"
                className="w-full bg-transparent text-sm text-ink outline-none placeholder:text-ink-faint"
              />
              <kbd className="rounded-md border border-line px-1.5 py-0.5 text-[10px] text-ink-faint">
                ESC
              </kbd>
            </div>
            <div className="max-h-80 overflow-y-auto p-2">
              {filtered.map((a) => (
                <button
                  key={a.id}
                  onClick={() => {
                    a.run();
                    setOpen(false);
                  }}
                  className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left text-sm text-ink-muted transition-colors hover:bg-surface-elevated/70 hover:text-ink"
                >
                  <span className="grid h-7 w-7 place-items-center rounded-lg bg-surface-elevated/70 text-brand-violet">
                    {a.icon}
                  </span>
                  {a.label}
                  {a.hint && (
                    <kbd className="ml-auto rounded border border-line px-1.5 py-0.5 text-[10px] text-ink-faint">
                      {a.hint}
                    </kbd>
                  )}
                </button>
              ))}
              {filtered.length === 0 && (
                <p className="px-3 py-6 text-center text-sm text-ink-faint">
                  No results
                </p>
              )}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
