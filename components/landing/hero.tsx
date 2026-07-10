"use client";

import Link from "next/link";
import { motion } from "motion/react";
import { ArrowRight, Sparkles, Zap } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Magnetic } from "@/components/ui/magnetic";
import { FloatingObjects } from "@/components/landing/floating-objects";

const stats = [
  { value: "2.4B", label: "links shortened" },
  { value: "99.99%", label: "uptime" },
  { value: "<40ms", label: "median redirect" },
];

export function Hero() {
  return (
    <section className="noise relative flex min-h-screen items-center justify-center overflow-hidden px-4 pt-28">
      <FloatingObjects />

      <div className="relative z-10 mx-auto max-w-3xl text-center">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ type: "spring", stiffness: 120, damping: 18 }}
          className="mx-auto mb-6 inline-flex items-center gap-2 rounded-full border border-line bg-surface-elevated/50 px-4 py-1.5 text-xs text-ink-muted"
        >
          <Sparkles className="h-3.5 w-3.5 text-brand-violet" />
          Link management, beautifully made
        </motion.div>

        <motion.h1
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ type: "spring", stiffness: 110, damping: 18, delay: 0.05 }}
          className="text-balance text-5xl font-semibold leading-[1.05] tracking-tight sm:text-7xl"
        >
          Short links that feel
          <br />
          <span className="text-gradient-brand">handcrafted.</span>
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ type: "spring", stiffness: 110, damping: 18, delay: 0.12 }}
          className="mx-auto mt-6 max-w-xl text-balance text-lg text-ink-muted"
        >
          RailLink turns every long URL into a branded, trackable, premium
          experience — with analytics that actually look good.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ type: "spring", stiffness: 110, damping: 18, delay: 0.18 }}
          className="mt-9 flex flex-col items-center justify-center gap-3 sm:flex-row"
        >
          <Magnetic>
            <Button asChild size="lg">
              <Link href="/app">
                Start for free
                <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
          </Magnetic>
          <Button asChild variant="secondary" size="lg">
            <Link href="#features">
              <Zap className="h-4 w-4" />
              See features
            </Link>
          </Button>
        </motion.div>

        {/* Live preview card */}
        <motion.div
          initial={{ opacity: 0, y: 30, scale: 0.98 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ type: "spring", stiffness: 90, damping: 16, delay: 0.26 }}
          className="glass mx-auto mt-14 max-w-md rounded-3xl p-5 text-left shadow-soft"
        >
          <div className="flex items-center gap-2 text-xs text-ink-faint">
            <span className="h-2 w-2 rounded-full bg-red-400/70" />
            <span className="h-2 w-2 rounded-full bg-amber-400/70" />
            <span className="h-2 w-2 rounded-full bg-emerald-400/70" />
            <span className="ml-2">raillink.app</span>
          </div>
          <div className="mt-4 space-y-3">
            <div className="rounded-xl bg-surface-muted/60 px-4 py-2.5 text-sm text-ink-muted">
              https://a-very-long-url.example.com/promo/summer-sale-2026
            </div>
            <div className="flex items-center justify-between rounded-xl border border-brand-violet/30 bg-brand-violet/5 px-4 py-2.5">
              <span className="text-sm font-medium text-gradient-brand">
                rl.link/summer
              </span>
              <span className="rounded-md bg-emerald-500/15 px-2 py-0.5 text-xs text-emerald-400">
                Copied
              </span>
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="mt-12 flex flex-wrap items-center justify-center gap-x-8 gap-y-3 text-sm text-ink-faint"
        >
          {stats.map((s) => (
            <div key={s.label} className="flex flex-col">
              <span className="text-lg font-semibold text-ink">{s.value}</span>
              <span className="text-xs">{s.label}</span>
            </div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
