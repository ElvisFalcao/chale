# Chale

Encontre o quarto ou chalé **disponível agora**, mais perto de si — por hora ou por noite. Angola.

## The problem

In Angola you walk or drive past a *hospedaria* and there is no way to know whether it has a
room free right now, or at what rate. There is no listing, no notification, nothing. Availability
is invisible. Chale makes it visible, and lets the owner run the whole operation from a phone.

## Two sides

**Guest** — find the nearest room that is actually free right now, see the hourly and nightly
rate, book a fractional slot (1–12h) or a full night, check in by walking through the door.

**Owner** — a real operations tool, not a listing page. How many bookings today, who is arriving,
which rooms are free, which are being cleaned, what has been paid. From a laptop or a phone.

## Stack

| Layer | Choice |
|---|---|
| Frontend | Vite + React + TypeScript + Tailwind |
| Data / auth / storage | Supabase (`ktyomfgowtdjoxysvays`, eu-west-3) |
| Server logic | Cloudflare Pages Functions (`functions/api/*`) — only where server trust is required |
| Hosting | Cloudflare Pages → `chale.pages.dev` |
| Scheduled jobs | Supabase `pg_cron` (no-show sweep, cleaning timers) |

## Getting started

```bash
npm install
cp .env.example .env
npm run dev
```

`src/App.tsx` is an unstyled connection smoke test. It calls `search_available_rooms` and prints
what comes back. The real UI is built after the Claude Design direction is chosen — see
`docs/` and `../../Downloads/Chale/claude-design-brief.md`.

## Database

Schema lives in Supabase and is mirrored in `supabase/migrations/`.

```bash
npx supabase login
npx supabase link --project-ref ktyomfgowtdjoxysvays
npm run db:pull    # materialise the applied migrations locally
npm run db:types   # regenerate src/types/database.ts
```

The design decisions worth knowing before you touch it are in `docs/data-model.md`.

## Docs

- `docs/data-model.md` — why the schema is shaped the way it is
- `docs/payments-angola.md` — payment options for the Angolan market, and the escrow plan
