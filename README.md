# ~* soapie *~ — an AIM / dial-up era personal site

A personal corner of the internet styled like 2003: saved AIM chat logs, away messages, a buddy list, a guestbook, a draggable pinboard, and desktop gadgets. Underneath the nostalgia it is a full-stack Next.js + Supabase app with a role-based admin CMS.

**Live:** _add your deployed URL here_

<!-- Add a screenshot or GIF: docs/screenshot.png -->

## Features

**For visitors**
- **Chat logs.** Posts are AIM conversations that replay message by message with a typing indicator. Replay respects `prefers-reduced-motion` and only plays once per visitor.
- **Live feed.** Short thoughts with images, plus a calendar and an activity heatmap.
- **Pinboard.** A free-form, draggable board of notes and images.
- **Guestbook, ask box, "i was here" stamps, and post reactions.** Visitor text is profanity-filtered, and submissions are rate-limited by hashed IP.
- **Away message and mood.** The away message comes with an archive, plus a "nudge" button.
- **Live buddy list.** Supabase Realtime Presence shows who is on the site right now, each with a generated screen name that stays the same between visits. Optional AIM sign-on and sign-off sounds play when buddies come and go.
- **Dial-up splash.** A skippable "connecting" screen on the first homepage visit of a session. It's skipped for reduced-motion users.
- **Live guestbook ticker.** New signatures appear without a refresh.
- **RSS feed** at `/feed.xml`, and per-post social images drawn as an AIM window.
- **Desktop gadgets.** Clock, weather, visitor map, dial-up status, now playing (Spotify), and a guestbook ticker.
- **Full-text search** across posts and messages, using Postgres FTS.
- **Three themes** (classic, AIM console, high contrast) and optional synthesized AIM sounds through the Web Audio API.

**For the owner (`/admin`)**
- A chat-log composer that can parse pasted AIM transcripts. It also handles image uploads.
- Editors for the live feed, pinboard, guestbook moderation, ask inbox, stamps, links, about page and status.

## Tech stack

| Layer | Choice |
| --- | --- |
| Framework | Next.js 15 (App Router, React Server Components), React 19, TypeScript |
| Styling | Tailwind CSS v4 with CSS-variable themes |
| Data | Supabase Postgres, Storage and Auth |
| Hosting | Vercel (+ Vercel Analytics) |

## Architecture

```
Browser ──► Next.js App Router
             ├─ Server Components (public pages, ISR revalidate=30s)
             │     └─ Supabase anon client  ──► Postgres (RLS: public read)
             ├─ Route handlers  /api/*
             │     ├─ public writes (guestbook, ask, reactions, stamps…)
             │     │     └─ rate limit + content filter ──► service client
             │     └─ admin writes ── getWorkspaceAccess(role) ──► service client
             └─ middleware: cookie gate for /admin/*
```

### Engineering notes
- **Defense in depth for auth.** The middleware does a fast cookie check on `/admin/*`. The real check happens on the server: `getWorkspaceAccess()` validates the Supabase session and the caller's workspace role (`admin` / `editor` / …) in the admin layout and in every protected API route. Login is restricted to an allowlist (`ADMIN_EMAIL`) and fails closed.
- **Workspace and ownership model.** Content belongs to a workspace, and access is enforced with role-based membership (migrations `004`–`005`).
- **A rate limiter that works on serverless.** Function instances don't share memory, so the limiter stores hashed-IP hits in Postgres (`src/lib/rate-limit.ts`), and the table is pruned hourly with pg_cron (`019`).
- **Upload hardening.** Files are identified by their magic bytes; only JPEG, PNG, GIF and WebP are accepted, and SVG and HTML are rejected. Uploads are capped at 5 MB, and stored names use the detected file extension.
- **Security headers.** A strict CSP (no `unsafe-eval` in production), `frame-ancestors 'none'`, `nosniff`, and a locked-down Permissions-Policy.
- **SEO.** Dynamic `sitemap.xml`, `robots.txt`, and generated OG images.
- **Schema evolution.** Each change is a numbered SQL migration in `supabase/migrations/`.

## Running locally

```bash
npm install
cp .env.example .env.local   # fill in Supabase keys, ADMIN_EMAIL, etc.
npm run dev
```

### Supabase setup
1. Create a project. In the SQL editor, run `supabase/schema.sql`, then each file in `supabase/migrations/` in numeric order.
2. Create a **public** storage bucket named `blog-images`.
3. Create your auth user (Authentication → Users), then run `supabase/bootstrap_first_workspace.sql` with your email filled in.
4. Optional: enable the `pg_cron` extension and re-run `019_rate_limit_cleanup.sql` to schedule cleanup.

### Scripts
| Command | What it does |
| --- | --- |
| `npm run dev` | Dev server |
| `npm run build` | Production build |
| `npm run lint` | ESLint |
| `npm test` | Vitest unit tests |
| `npx tsc --noEmit` | Type-check |

## Roadmap
See [TECHNICAL_ROADMAP.md](TECHNICAL_ROADMAP.md). Still to do: browser (Playwright) smoke tests, live updates for the live feed, and a shared window component.
