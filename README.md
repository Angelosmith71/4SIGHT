# 4Sight Guardian AI

Cyber-security dashboard built with **Next.js 15**, **Supabase**, and **Stripe**.

## Requirements

- **Node.js 22+** and npm
- **Supabase** project (database + auth)
- **Stripe** (optional — only needed for paid billing)

## Quick start

```bash
npm install --legacy-peer-deps
cp .env.example .env.local   # Windows: copy .env.example .env.local
```

Edit `.env.local`:

- For **local demo** (no Supabase): set `NEXT_PUBLIC_DEMO_MODE=true` and leave Supabase keys empty.
- For **production**: set `NEXT_PUBLIC_DEMO_MODE=false` and add real Supabase keys.

### Supabase database setup

1. Open [supabase.com](https://supabase.com) → your project → **SQL Editor**
2. Copy **all** of `supabase/setup-all.sql` and paste into a new query
3. Click **Run**
4. Confirm tables exist: run `supabase/check-tables.sql`

Get API keys from **Project Settings → API → Legacy anon, service_role keys**.

### Run locally

```bash
npm run dev
```

Open http://localhost:3000

- **Demo mode:** login with any email/password at `/login`
- **Real auth:** sign up at `/signup`, then log in

Keep the terminal open while using the app — closing it stops the server.

## Project structure

```
src/
  app/           # Pages and API routes (Next.js App Router)
  components/    # UI (dashboard, threats, layout)
  hooks/         # Data hooks (threats, metrics, auth)
  lib/           # Supabase, Stripe, demo mode
supabase/        # SQL schemas and setup scripts
```

## Key pages

| Route | Description |
|-------|-------------|
| `/` | Landing page |
| `/login`, `/signup` | Authentication |
| `/dashboard` | Overview |
| `/dashboard/threats` | Threat registry |
| `/dashboard/live-feed` | Live event stream |
| `/dashboard/bot-monitor` | AI bot monitoring (Pro) |
| `/dashboard/analytics` | Analytics (Pro) |
| `/billing` | Stripe subscription management |

## Deploy (Vercel)

```bash
npm run build          # verify build passes first
vercel --prod
```

Add all `.env.local` variables in Vercel → **Settings → Environment Variables**.

Update Supabase **Authentication → URL Configuration** with your production URL.

## Current status / notes for developers

- Demo mode works without Supabase; real auth requires Supabase keys + SQL setup.
- Icons use `@tabler/icons-webfont` (bundled locally, not CDN).
- Some pages (Logs, Reports, Agents, Config) are lighter placeholder UIs.
- Stripe billing is wired but optional until keys and webhooks are configured.

## Scripts

| Command | Purpose |
|---------|---------|
| `npm run dev` | Start dev server (port 3000) |
| `npm run build` | Production build |
| `npm run lint` | ESLint |
| `npm run stripe:setup` | Create Stripe products/prices |
| `npm run deploy` | Deploy to Vercel |

See also `QUICKSTART.md` for step-by-step setup in Cursor.
