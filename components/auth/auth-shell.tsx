"use client";

import * as React from "react";
import Link from "next/link";
import { motion } from "motion/react";
import { Link2 } from "lucide-react";
import { Card } from "@/components/ui/card";

export function AuthShell({
  title,
  subtitle,
  children,
}: {
  title: string;
  subtitle: string;
  children: React.ReactNode;
}) {
  return (
    <main className="noise relative grid min-h-screen place-items-center overflow-hidden px-4">
      <div className="absolute left-1/2 top-0 h-72 w-[640px] -translate-x-1/2 rounded-full bg-radial-fade blur-2xl" />
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ type: "spring", stiffness: 120, damping: 18 }}
        className="relative w-full max-w-sm"
      >
        <Link href="/" className="mb-6 flex items-center justify-center gap-2">
          <span className="grid h-9 w-9 place-items-center rounded-xl bg-gradient-to-br from-brand-blue to-brand-violet text-white shadow-glow">
            <Link2 className="h-4 w-4" />
          </span>
          <span className="text-[15px] font-semibold tracking-tight">
            Rail<span className="text-gradient-brand">Link</span>
          </span>
        </Link>
        <Card className="p-7">
          <h1 className="text-xl font-semibold tracking-tight">{title}</h1>
          <p className="mt-1 text-sm text-ink-muted">{subtitle}</p>
          <div className="mt-6">{children}</div>
        </Card>
      </motion.div>
    </main>
  );
}
