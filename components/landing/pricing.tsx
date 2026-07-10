"use client";

import Link from "next/link";
import { Check } from "lucide-react";
import { motion } from "motion/react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Reveal } from "@/components/ui/reveal";
import { Badge } from "@/components/ui/badge";

const tiers = [
  {
    name: "Free",
    price: "$0",
    cadence: "forever",
    blurb: "Everything you need to start. Unlimited links, no card.",
    features: [
      "Unlimited short links",
      "QR code generator",
      "Basic analytics",
      "Guest mode",
      "Custom aliases",
    ],
    cta: "Start free",
    highlighted: false,
  },
  {
    name: "Pro",
    price: "$12",
    cadence: "per month",
    blurb: "For makers and teams who live in their analytics.",
    features: [
      "Everything in Free",
      "Advanced routing (geo / device / A-B)",
      "Custom domains",
      "API & webhooks",
      "Team workspaces",
      "Priority support",
    ],
    cta: "Upgrade to Pro",
    highlighted: true,
  },
];

export function Pricing() {
  return (
    <section id="pricing" className="relative px-4 py-28">
      <div className="mx-auto max-w-5xl">
        <Reveal className="mx-auto max-w-2xl text-center">
          <h2 className="text-4xl font-semibold tracking-tight sm:text-5xl">
            Simple, honest pricing
          </h2>
          <p className="mt-4 text-ink-muted">
            Start free, forever. Upgrade only when you want the power features.
          </p>
        </Reveal>

        <div className="mt-14 grid gap-6 md:grid-cols-2">
          {tiers.map((t, i) => (
            <Reveal key={t.name} delay={i}>
              <Card
                className={[
                  "relative h-full p-8",
                  t.highlighted
                    ? "shadow-glow ring-1 ring-brand-violet/40"
                    : "",
                ].join(" ")}
              >
                {t.highlighted && (
                  <Badge variant="brand" className="absolute right-6 top-6">
                    Most popular
                  </Badge>
                )}
                <h3 className="text-lg font-semibold">{t.name}</h3>
                <div className="mt-4 flex items-end gap-1">
                  <span className="text-5xl font-semibold tracking-tight">
                    {t.price}
                  </span>
                  <span className="mb-1.5 text-sm text-ink-faint">
                    / {t.cadence}
                  </span>
                </div>
                <p className="mt-3 text-sm text-ink-muted">{t.blurb}</p>
                <ul className="mt-6 space-y-3">
                  {t.features.map((f) => (
                    <li key={f} className="flex items-center gap-3 text-sm">
                      <span className="grid h-5 w-5 place-items-center rounded-full bg-emerald-500/15">
                        <Check className="h-3 w-3 text-emerald-400" />
                      </span>
                      {f}
                    </li>
                  ))}
                </ul>
                <Button
                  asChild
                  variant={t.highlighted ? "primary" : "secondary"}
                  className="mt-8 w-full"
                >
                  <Link href="/app">{t.cta}</Link>
                </Button>
              </Card>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
