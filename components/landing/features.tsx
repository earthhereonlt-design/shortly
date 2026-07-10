"use client";

import { motion } from "motion/react";
import {
  BarChart3,
  QrCode,
  ShieldCheck,
  Sparkles,
  Split,
  Globe2,
  FolderTree,
  Zap,
} from "lucide-react";
import { Reveal } from "@/components/ui/reveal";
import { Card } from "@/components/ui/card";

const features = [
  {
    icon: Zap,
    title: "Instant shortening",
    body: "Paste a URL, get a branded link in milliseconds. Guest mode needs zero signup.",
  },
  {
    icon: BarChart3,
    title: "Analytics that sing",
    body: "Clicks, countries, devices, referrers — animated, beautiful, real-time.",
  },
  {
    icon: QrCode,
    title: "Dynamic QR codes",
    body: "Generate editable QR codes. Change the destination without reprinting.",
  },
  {
    icon: Globe2,
    title: "Geo & device routing",
    body: "Send mobile users and desktop users to different places. By country, OS, or browser.",
  },
  {
    icon: Split,
    title: "A/B & traffic splitting",
    body: "Split traffic across destinations by weight and find what converts.",
  },
  {
    icon: FolderTree,
    title: "Folders & teams",
    body: "Organize links, collaborate with your team, control everything from one place.",
  },
  {
    icon: ShieldCheck,
    title: "Secure by default",
    body: "Password protection, one-time links, expiry, and rate-limited redirects.",
  },
  {
    icon: Sparkles,
    title: "AI-assisted",
    body: "Let RailLink suggest a memorable alias and write the description for you.",
  },
];

export function Features() {
  return (
    <section id="features" className="relative px-4 py-28">
      <div className="mx-auto max-w-6xl">
        <Reveal className="mx-auto max-w-2xl text-center">
          <p className="text-sm font-medium uppercase tracking-widest text-brand-violet">
            Everything you need
          </p>
          <h2 className="mt-3 text-4xl font-semibold tracking-tight sm:text-5xl">
            One platform for every link
          </h2>
          <p className="mt-4 text-ink-muted">
            From a single short link to a team-wide analytics suite — crafted
            down to the last pixel.
          </p>
        </Reveal>

        <div className="mt-16 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {features.map((f, i) => (
            <Reveal key={f.title} delay={i % 4}>
              <Card className="group h-full p-6 transition-transform duration-300 hover:-translate-y-1 hover:shadow-glow">
                <div className="grid h-11 w-11 place-items-center rounded-2xl bg-gradient-to-br from-brand-blue/20 to-brand-violet/20 text-brand-violet transition-transform duration-300 group-hover:scale-110">
                  <f.icon className="h-5 w-5" />
                </div>
                <h3 className="mt-4 text-base font-semibold tracking-tight">
                  {f.title}
                </h3>
                <p className="mt-1.5 text-sm leading-relaxed text-ink-muted">
                  {f.body}
                </p>
              </Card>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
