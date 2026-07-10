"use client";

import {
  Area,
  AreaChart,
  ResponsiveContainer,
  Tooltip as RTooltip,
  XAxis,
  YAxis,
  Pie,
  PieChart,
  Cell,
} from "recharts";
import { motion } from "motion/react";
import { MousePointerClick, Users, Globe2, Smartphone } from "lucide-react";
import { Card } from "@/components/ui/card";
import { AnimatedNumber } from "@/components/dashboard/animated-number";

const PALETTE = ["#3B82F6", "#6366F1", "#8B5CF6", "#A855F7", "#22D3EE", "#F472B6"];

export type AnalyticsData = {
  totals: { clicks: number; unique: number; countries: number; devices: number };
  timeline: { date: string; clicks: number }[];
  devices: { name: string; value: number }[];
  countries: { name: string; value: number }[];
  topLinks: { slug: string; clicks: number }[];
};

export function Analytics({ data }: { data: AnalyticsData }) {
  const cards = [
    { label: "Clicks", value: data.totals.clicks, icon: MousePointerClick },
    { label: "Unique visitors", value: data.totals.unique, icon: Users },
    { label: "Countries", value: data.totals.countries, icon: Globe2 },
    { label: "Devices", value: data.totals.devices, icon: Smartphone },
  ];

  return (
    <div className="space-y-6">
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {cards.map((c) => (
          <Card key={c.label} className="p-5">
            <div className="flex items-center justify-between">
              <span className="text-sm text-ink-muted">{c.label}</span>
              <span className="grid h-8 w-8 place-items-center rounded-lg bg-surface-elevated/70 text-brand-violet">
                <c.icon className="h-4 w-4" />
              </span>
            </div>
            <p className="mt-3 text-3xl font-semibold tracking-tight">
              <AnimatedNumber value={c.value} />
            </p>
          </Card>
        ))}
      </div>

      <Card className="p-6">
        <h3 className="mb-4 text-sm font-semibold text-ink-muted">
          Clicks · last 14 days
        </h3>
        <div className="h-64 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={data.timeline} margin={{ left: -20, right: 8, top: 8 }}>
              <defs>
                <linearGradient id="g" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#6366F1" stopOpacity={0.5} />
                  <stop offset="100%" stopColor="#6366F1" stopOpacity={0} />
                </linearGradient>
              </defs>
              <XAxis
                dataKey="date"
                tick={{ fill: "#71717A", fontSize: 11 }}
                axisLine={false}
                tickLine={false}
              />
              <YAxis
                tick={{ fill: "#71717A", fontSize: 11 }}
                axisLine={false}
                tickLine={false}
                width={36}
              />
              <RTooltip
                contentStyle={{
                  background: "rgba(28,28,35,0.9)",
                  border: "1px solid rgba(255,255,255,0.08)",
                  borderRadius: 12,
                  fontSize: 12,
                }}
                labelStyle={{ color: "#A1A1AA" }}
              />
              <Area
                type="monotone"
                dataKey="clicks"
                stroke="#818CF8"
                strokeWidth={2}
                fill="url(#g)"
                animationDuration={900}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </Card>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card className="p-6">
          <h3 className="mb-4 text-sm font-semibold text-ink-muted">Devices</h3>
          <div className="flex items-center gap-6">
            <div className="h-44 w-44">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={data.devices}
                    dataKey="value"
                    innerRadius={45}
                    outerRadius={70}
                    paddingAngle={3}
                    animationDuration={800}
                  >
                    {data.devices.map((_, i) => (
                      <Cell key={i} fill={PALETTE[i % PALETTE.length]} />
                    ))}
                  </Pie>
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="flex-1 space-y-2">
              {data.devices.map((d, i) => (
                <div key={d.name} className="flex items-center gap-2 text-sm">
                  <span
                    className="h-2.5 w-2.5 rounded-full"
                    style={{ background: PALETTE[i % PALETTE.length] }}
                  />
                  <span className="text-ink-muted">{d.name}</span>
                  <span className="ml-auto font-medium">{d.value}</span>
                </div>
              ))}
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <h3 className="mb-4 text-sm font-semibold text-ink-muted">
            Top countries
          </h3>
          <div className="space-y-3">
            {data.countries.slice(0, 6).map((c, i) => {
              const pct = data.totals.clicks
                ? Math.round((c.value / data.totals.clicks) * 100)
                : 0;
              return (
                <div key={c.name}>
                  <div className="mb-1 flex items-center justify-between text-sm">
                    <span className="text-ink-muted">{c.name}</span>
                    <span className="font-medium">{c.value}</span>
                  </div>
                  <div className="h-1.5 overflow-hidden rounded-full bg-surface-elevated">
                    <motion.div
                      className="h-full rounded-full bg-gradient-to-r from-brand-blue to-brand-violet"
                      initial={{ width: 0 }}
                      animate={{ width: `${pct}%` }}
                      transition={{ type: "spring", stiffness: 120, damping: 20, delay: i * 0.05 }}
                    />
                  </div>
                </div>
              );
            })}
            {data.countries.length === 0 && (
              <p className="text-sm text-ink-faint">No geo data yet.</p>
            )}
          </div>
        </Card>
      </div>

      <Card className="p-6">
        <h3 className="mb-4 text-sm font-semibold text-ink-muted">Top links</h3>
        <div className="space-y-2">
          {data.topLinks.map((l) => (
            <div
              key={l.slug}
              className="flex items-center justify-between rounded-xl bg-surface-elevated/40 px-4 py-3"
            >
              <span className="text-sm font-medium">/{l.slug}</span>
              <span className="text-sm text-ink-muted">
                {l.clicks.toLocaleString("en-US")} clicks
              </span>
            </div>
          ))}
          {data.topLinks.length === 0 && (
            <p className="text-sm text-ink-faint">No clicks recorded yet.</p>
          )}
        </div>
      </Card>
    </div>
  );
}
