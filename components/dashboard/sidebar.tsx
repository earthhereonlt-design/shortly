"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion } from "motion/react";
import {
  Link2,
  BarChart3,
  Settings,
  PanelLeftClose,
  PanelLeft,
  Sparkles,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";

type NavItem = {
  href: string;
  label: string;
  icon: React.ReactNode;
};

const nav: NavItem[] = [
  { href: "/app", label: "Overview", icon: <Sparkles className="h-4 w-4" /> },
  { href: "/app/links", label: "Links", icon: <Link2 className="h-4 w-4" /> },
  { href: "/app/analytics", label: "Analytics", icon: <BarChart3 className="h-4 w-4" /> },
  { href: "/app/settings", label: "Settings", icon: <Settings className="h-4 w-4" /> },
];

export function Sidebar({
  user,
  collapsed,
  onToggle,
  width,
  onResize,
}: {
  user: { name?: string | null; email: string } | null;
  collapsed: boolean;
  onToggle: () => void;
  width: number;
  onResize: (w: number) => void;
}) {
  const pathname = usePathname();
  const dragging = React.useRef(false);

  function onPointerDown(e: React.PointerEvent) {
    dragging.current = true;
    (e.target as HTMLElement).setPointerCapture(e.pointerId);
  }
  function onPointerMove(e: React.PointerEvent) {
    if (!dragging.current) return;
    const next = Math.min(320, Math.max(68, e.clientX));
    onResize(next);
  }
  function onPointerUp() {
    dragging.current = false;
  }

  return (
    <aside
      style={{ width: collapsed ? 68 : width }}
      className="relative z-30 flex h-screen flex-col border-r border-line bg-surface/40 py-4 transition-[width] duration-200"
    >
      <div className="flex items-center gap-2.5 px-4">
        <span className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-gradient-to-br from-brand-blue to-brand-violet text-white shadow-glow">
          <Link2 className="h-4 w-4" />
        </span>
        {!collapsed && (
          <span className="text-[15px] font-semibold tracking-tight">
            Rail<span className="text-gradient-brand">Link</span>
          </span>
        )}
      </div>

      <nav className="mt-6 flex-1 space-y-1 px-3">
        {nav.map((item) => {
          const active =
            item.href === "/app"
              ? pathname === "/app"
              : pathname.startsWith(item.href);
          const link = (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "group flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm transition-colors",
                active
                  ? "bg-surface-elevated/80 text-ink shadow-soft"
                  : "text-ink-muted hover:bg-surface-elevated/50 hover:text-ink",
                collapsed && "justify-center px-0",
              )}
            >
              <span
                className={cn(
                  "grid h-7 w-7 place-items-center rounded-lg",
                  active ? "text-brand-violet" : "text-ink-faint group-hover:text-ink",
                )}
              >
                {item.icon}
              </span>
              {!collapsed && <span className="font-medium">{item.label}</span>}
              {active && !collapsed && (
                <motion.span
                  layoutId="nav-active"
                  className="ml-auto h-1.5 w-1.5 rounded-full bg-brand-violet"
                />
              )}
            </Link>
          );
          return collapsed ? (
            <Tooltip key={item.href}>
              <TooltipTrigger asChild>{link}</TooltipTrigger>
              <TooltipContent side="right">{item.label}</TooltipContent>
            </Tooltip>
          ) : (
            link
          );
        })}
      </nav>

      <div className="px-3">
        <button
          onClick={onToggle}
          className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm text-ink-muted transition-colors hover:bg-surface-elevated/50 hover:text-ink"
        >
          {collapsed ? (
            <PanelLeft className="h-4 w-4" />
          ) : (
            <>
              <PanelLeftClose className="h-4 w-4" />
              <span>Collapse</span>
            </>
          )}
        </button>
      </div>

      {!collapsed && user && (
        <div className="mx-3 mt-2 flex items-center gap-3 rounded-xl border border-line bg-surface-elevated/40 px-3 py-2.5">
          <span className="grid h-8 w-8 place-items-center rounded-full bg-gradient-to-br from-brand-blue to-brand-violet text-xs font-semibold text-white">
            {(user.name?.[0] ?? user.email[0]).toUpperCase()}
          </span>
          <div className="min-w-0">
            <p className="truncate text-sm font-medium">{user.name ?? "Guest"}</p>
            <p className="truncate text-xs text-ink-faint">{user.email}</p>
          </div>
        </div>
      )}

      {/* resize handle */}
      {!collapsed && (
        <div
          onPointerDown={onPointerDown}
          onPointerMove={onPointerMove}
          onPointerUp={onPointerUp}
          className="absolute right-0 top-0 h-full w-1 cursor-col-resize hover:bg-brand-violet/40"
        />
      )}
    </aside>
  );
}
