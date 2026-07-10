import Link from "next/link";
import { Link2 } from "lucide-react";

const groups = [
  {
    title: "Product",
    links: [
      { label: "Features", href: "#features" },
      { label: "Pricing", href: "#pricing" },
      { label: "Analytics", href: "/app/analytics" },
      { label: "API", href: "/app/settings/api" },
    ],
  },
  {
    title: "Company",
    links: [
      { label: "About", href: "#" },
      { label: "Blog", href: "#" },
      { label: "Careers", href: "#" },
    ],
  },
  {
    title: "Legal",
    links: [
      { label: "Privacy", href: "#" },
      { label: "Terms", href: "#" },
      { label: "Security", href: "#" },
    ],
  },
];

export function Footer() {
  return (
    <footer className="border-t border-line px-4 py-14">
      <div className="mx-auto grid max-w-6xl gap-10 sm:grid-cols-2 lg:grid-cols-4">
        <div>
          <Link href="/" className="flex items-center gap-2">
            <span className="grid h-8 w-8 place-items-center rounded-xl bg-gradient-to-br from-brand-blue to-brand-violet text-white">
              <Link2 className="h-4 w-4" />
            </span>
            <span className="text-[15px] font-semibold tracking-tight">
              Rail<span className="text-gradient-brand">Link</span>
            </span>
          </Link>
          <p className="mt-3 max-w-xs text-sm text-ink-faint">
            Beautiful link management for teams that care about craft.
          </p>
        </div>
        {groups.map((g) => (
          <div key={g.title}>
            <h4 className="text-sm font-semibold">{g.title}</h4>
            <ul className="mt-3 space-y-2">
              {g.links.map((l) => (
                <li key={l.label}>
                  <a
                    href={l.href}
                    className="text-sm text-ink-faint transition-colors hover:text-ink"
                  >
                    {l.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
      <div className="mx-auto mt-10 max-w-6xl border-t border-line pt-6 text-xs text-ink-faint">
        © {new Date().getFullYear()} RailLink. Crafted with care.
      </div>
    </footer>
  );
}
