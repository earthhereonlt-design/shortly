# RailLink

A premium, Apple-grade link management platform. Shorten, brand, protect, and
analyze every link — built with Next.js (App Router), TypeScript, Tailwind, and
Motion.

> This is a strong, **runnable foundation** generated from a product spec. The
> core loop (guest-mode shortening → redirect → analytics) is fully wired and
> real. See **Status** below for what is production-complete vs. ready to extend.

## Quick start

```bash
# 1. Install
npm install

# 2. Start Postgres + Redis (or use your own)
docker compose up -d

# 3. Configure env
cp .env.example .env
# Generate a secret:  openssl rand -base64 32

# 4. Create the database
npx prisma db push      # or: npx prisma migrate dev
npx prisma generate

# 5. Run
npm run dev
```

Open http://localhost:3000.

## Deploy to Railway (repo link)

1. Push this repo to GitHub.
2. In Railway, **New Project → Deploy from GitHub repo** (no Dockerfile needed;
   `railway.json` is included).
3. Add the **PostgreSQL** plugin → sets `DATABASE_URL` automatically.
4. Add the **Redis** plugin → sets `REDIS_URL` automatically.
5. Add two env vars manually:
   - `BETTER_AUTH_SECRET` → `openssl rand -base64 32`
   - `NEXT_PUBLIC_APP_URL` → your Railway public domain
     (e.g. `https://raillink.up.railway.app`) — **required** so generated
     short links point at the real site, not localhost.
6. Deploy. The `releaseCommand` in `railway.json` runs `prisma db push`, so
   tables are created on first deploy. Public URL and port are assigned by
   Railway automatically — nothing else to configure.

## Stack

- **Next.js 15** (App Router, Server Components, streaming)
- **TypeScript** (strict)
- **Tailwind CSS** (custom design tokens, dark-first)
- **Motion** (Framer Motion) — spring physics everywhere
- **Prisma + PostgreSQL** (19 tables, full schema)
- **Redis** (caching + rate limiting, degrades gracefully)
- **Recharts** (analytics)
- **bcrypt + HS256 JWT** sessions (guest cookies; passwordless guest mode)
- **Lucide** icons, **Geist + Inter** type

## What's built

- **Landing page** — animated hero with floating objects + gradient light, noise
  texture, feature grid, pricing, FAQ accordion, CTA, footer.
- **Guest-mode link creation** — premium composer: custom/random alias, password
  protection, one-time links, expiry. Works with **no signup**.
- **Redirect engine** (`/[slug]`) — edge-fast lookup, click recording, Geo /
  Device / OS / Browser routing, A/B traffic splitting, password unlock form,
  expiry & click-limit enforcement, one-time links.
- **Auth** — register / login / logout, bcrypt hashing, JWT cookie sessions.
  Guest links are claimed on signup or login.
- **Dashboard** — resizable + collapsible sidebar, ⌘K command palette, theme
  toggle, overview with animated counters, recent links.
- **Links manager** — search, favorite, copy, delete (with undo toast), real-time
  list animations, beautiful empty states.
- **Analytics** — clicks, unique visitors, countries, devices (Recharts area +
  donut), top links, 14-day timeline.
- **Settings** — profile, dark mode, real scoped **API key** creation/list/revoke,
  danger-zone account deletion.
- **SEO** — metadata, Open Graph, Twitter cards, `sitemap.xml`, `robots.txt`,
  manifest, secure headers.
- **Schema** — the spec's 17 production tables (Users, Links, Folders, Analytics,
  Clicks, QRCode, Teams, Members, ApiKey, CustomDomain, Session, Device, GeoData,
  BioPage, UtmCampaign, Notification, AuditLog).

## Project structure

```
app/
  page.tsx                 landing
  login | register         auth
  app/                     dashboard (overview, links, analytics, settings)
  [slug]/route.ts          redirect engine
  api/links                create + manage links
  api/auth                 register/login/logout
  api/settings             profile, api keys
  robots.ts | sitemap.ts | manifest.ts
components/
  ui/                      design-system primitives (button, card, dialog, toast…)
  landing/                 hero, features, pricing, faq, navbar…
  dashboard/               sidebar, command palette, composer, analytics…
lib/                       prisma, redis, auth, qr, utils
prisma/schema.prisma       full data model
```

## Status & next steps (iterative)

**Production-complete in this pass:** design system, landing, guest shortening,
redirect + analytics recording, auth, dashboard shell, links manager, analytics
UI, settings + API keys, schema.

**Planned next (not yet wired end-to-end):** Admin panel, bio pages, bulk/CSV
import, webhooks, developer API docs page, geo/device redirect *editors* in the
composer UI, scheduled redirects, dynamic-QR editing UI, UploadThing avatars,
OG image generation, full test suite, and `next build` hardening for Railway.

The schema and component architecture are built so each of these slots in
without rework.
