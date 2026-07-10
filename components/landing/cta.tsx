"use client";

import Link from "next/link";
import { motion } from "motion/react";
import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Magnetic } from "@/components/ui/magnetic";
import { Reveal } from "@/components/ui/reveal";

export function Cta() {
  return (
    <section className="relative px-4 py-28">
      <div className="mx-auto max-w-5xl">
        <Reveal>
          <div className="noise relative overflow-hidden rounded-5xl border border-line bg-surface-elevated/40 px-8 py-16 text-center shadow-soft">
            <div className="absolute left-1/2 top-0 h-64 w-[640px] -translate-x-1/2 rounded-full bg-radial-fade blur-2xl" />
            <div className="relative">
              <h2 className="mx-auto max-w-xl text-balance text-4xl font-semibold tracking-tight sm:text-5xl">
                Make your links feel{" "}
                <span className="text-gradient-brand">premium.</span>
              </h2>
              <p className="mx-auto mt-4 max-w-md text-ink-muted">
                Join thousands of teams shipping beautiful, trackable links with
                RailLink. Free to start.
              </p>
              <div className="mt-9 flex justify-center">
                <Magnetic>
                  <Button asChild size="lg">
                    <Link href="/app">
                      Get started free
                      <ArrowRight className="h-4 w-4" />
                    </Link>
                  </Button>
                </Magnetic>
              </div>
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
