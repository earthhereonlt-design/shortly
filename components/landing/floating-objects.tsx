"use client";

import { motion } from "motion/react";

/** Ambient floating shapes + gradient light for the hero backdrop. */
export function FloatingObjects() {
  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden>
      {/* gradient lighting */}
      <div className="absolute left-1/2 top-[-10%] h-[520px] w-[820px] -translate-x-1/2 rounded-full bg-radial-fade blur-2xl" />
      <div className="absolute left-[12%] top-[18%] h-72 w-72 rounded-full bg-brand-blue/10 blur-3xl" />
      <div className="absolute right-[10%] top-[28%] h-80 w-80 rounded-full bg-brand-violet/10 blur-3xl" />

      {/* drifting orbs */}
      <motion.div
        className="absolute left-[18%] top-[30%] h-3 w-3 rounded-full bg-brand-blue shadow-[0_0_20px_4px_rgba(59,130,246,0.5)]"
        animate={{ y: [0, -30, 0], x: [0, 14, 0] }}
        transition={{ duration: 9, repeat: Infinity, ease: "easeInOut" }}
      />
      <motion.div
        className="absolute right-[22%] top-[40%] h-2.5 w-2.5 rounded-full bg-brand-violet shadow-[0_0_20px_4px_rgba(168,85,247,0.5)]"
        animate={{ y: [0, 26, 0], x: [0, -12, 0] }}
        transition={{ duration: 11, repeat: Infinity, ease: "easeInOut" }}
      />
      <motion.div
        className="absolute left-[46%] top-[62%] h-2 w-2 rounded-full bg-white/70"
        animate={{ y: [0, -18, 0] }}
        transition={{ duration: 7, repeat: Infinity, ease: "easeInOut" }}
      />
    </div>
  );
}
