"use client";

import * as React from "react";
import { Command } from "lucide-react";
import { Sidebar } from "@/components/dashboard/sidebar";
import { CommandPalette } from "@/components/dashboard/command-palette";
import { ThemeToggle } from "@/components/landing/theme-toggle";

export function DashboardShell({
  user,
  children,
}: {
  user: { name?: string | null; email: string } | null;
  children: React.ReactNode;
}) {
  const [collapsed, setCollapsed] = React.useState(false);
  const [width, setWidth] = React.useState(248);

  return (
    <div className="flex min-h-screen bg-canvas">
      <Sidebar
        user={user}
        collapsed={collapsed}
        onToggle={() => setCollapsed((c) => !c)}
        width={width}
        onResize={setWidth}
      />

      <div className="flex min-w-0 flex-1 flex-col">
        {/* Topbar */}
        <header className="sticky top-0 z-20 flex h-16 items-center gap-3 border-b border-line bg-canvas/70 px-4 backdrop-blur-xl sm:px-6">
          <button
            onClick={() =>
              window.dispatchEvent(new KeyboardEvent("keydown", { key: "k", metaKey: true }))
            }
            className="group flex h-10 flex-1 items-center gap-3 rounded-xl border border-line bg-surface-elevated/40 px-3.5 text-sm text-ink-faint transition-colors hover:border-line hover:text-ink-muted sm:max-w-md"
          >
            <Command className="h-4 w-4" />
            <span className="flex-1 text-left">Search or jump to…</span>
            <kbd className="rounded-md border border-line px-1.5 py-0.5 text-[10px]">
              ⌘K
            </kbd>
          </button>
          <div className="ml-auto flex items-center gap-2">
            <ThemeToggle />
          </div>
        </header>

        <main className="flex-1 px-4 py-6 sm:px-6 lg:px-8">{children}</main>
      </div>

      <CommandPalette />
    </div>
  );
}
