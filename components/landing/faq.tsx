"use client";

import * as React from "react";
import { AnimatePresence, motion } from "motion/react";
import { ChevronDown } from "lucide-react";
import { Reveal } from "@/components/ui/reveal";

const faqs = [
  {
    q: "Do I need an account to shorten a link?",
    a: "No. Guest mode lets you create links instantly with no signup. You can claim them later by creating an account.",
  },
  {
    q: "Will my anonymous links expire?",
    a: "Guest links automatically expire after a configurable number of days (default 7) to keep the platform healthy.",
  },
  {
    q: "Can I use my own domain?",
    a: "Yes — Pro adds custom domains with automatic verification and branded short links like yourbrand.co/x.",
  },
  {
    q: "How fast are redirects?",
    a: "Redirects resolve at the edge in under 40ms on average, with Redis caching and a lean lookup path.",
  },
  {
    q: "Is there an API?",
    a: "Yes. Scoped API keys let you create links, read analytics, and receive webhooks programmatically.",
  },
];

export function Faq() {
  const [open, setOpen] = React.useState<number | null>(0);
  return (
    <section id="faq" className="relative px-4 py-28">
      <div className="mx-auto max-w-2xl">
        <Reveal className="text-center">
          <h2 className="text-4xl font-semibold tracking-tight sm:text-5xl">
            Questions, answered
          </h2>
        </Reveal>

        <div className="mt-12 space-y-3">
          {faqs.map((f, i) => {
            const isOpen = open === i;
            return (
              <Reveal key={f.q} delay={i}>
                <div className="glass overflow-hidden rounded-2xl">
                  <button
                    onClick={() => setOpen(isOpen ? null : i)}
                    className="flex w-full items-center justify-between gap-4 px-6 py-5 text-left"
                    aria-expanded={isOpen}
                  >
                    <span className="font-medium tracking-tight">{f.q}</span>
                    <motion.span
                      animate={{ rotate: isOpen ? 180 : 0 }}
                      transition={{ type: "spring", stiffness: 300, damping: 20 }}
                      className="text-ink-muted"
                    >
                      <ChevronDown className="h-4 w-4" />
                    </motion.span>
                  </button>
                  <AnimatePresence initial={false}>
                    {isOpen && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ type: "spring", stiffness: 200, damping: 26 }}
                        className="overflow-hidden"
                      >
                        <p className="px-6 pb-5 text-sm leading-relaxed text-ink-muted">
                          {f.a}
                        </p>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </Reveal>
            );
          })}
        </div>
      </div>
    </section>
  );
}
