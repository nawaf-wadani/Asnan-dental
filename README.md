# Asnan Dental — Supply Ordering

Internal web app for a dental clinic. Assistants sign in, browse a database-backed
catalog of ~200 supplies, place orders, and manage on-hand inventory. Placing an
order generates a branded PDF that is **emailed to the clinic and downloaded** in
one step. Admins manage users, the catalog, all orders, and an audit log.

## Stack

| Layer | Tech |
|---|---|
| Framework | TanStack Start (React 19, TanStack Router v1) |
| Build | Vite 7 |
| Styling | Tailwind CSS 4 + inline brand theming |
| API | Netlify Functions (v2) |
| Database | Netlify DB (Postgres) via `@netlify/database` |
| Auth | Per-user accounts, scrypt hashes, signed HttpOnly JWT cookie (`jose`) |
| PDF | `pdfkit` (server-side) |
| Email | `nodemailer` over Google Workspace SMTP |
| Hosting | Netlify (Git-connected builds) |

## Layout

```
shared/            code shared by the browser and the functions (no React/DOM)
  brand.ts         brand palette (single source of truth)
  catalog.ts       starter catalog + pairings + gap-analysis list
  rct.ts           WaveOne / endo option lists
  types.ts         API DTOs

netlify/
  database/migrations/   SQL migrations, applied automatically on deploy
  functions/             one file per REST resource (auth, catalog, inventory,
                         orders, endo-orders, users, stats)
  lib/                   db, auth, validation (zod), pdf, email, audit, rate limit

src/
  lib/             api client, auth context, storage, formatting, photo compression
  components/
    ui/            primitives + toast
    order/         the ordering flow (intro -> browse -> review -> done)
    inventory/     stock management
    rct/           WaveOne endo order
    admin/         admin console (dashboard, orders, catalog, users, audit)
  routes/          file-based routes, each gated by <RequireAuth>
```

## Environment variables

See [`.env.example`](.env.example). Required in production:
`AUTH_SECRET`, `ADMIN_EMAIL`, `ADMIN_PASSWORD` (bootstrap only),
`SMTP_USER`, `SMTP_PASS`, `SMTP_FROM`, `ORDER_EMAIL_TO`.

## Local development

Requires Node 20+.

```bash
npm install
cp .env.example .env      # fill in the blanks
npm run dev               # http://localhost:3000
npm run typecheck         # tsc --noEmit
```

`npm run dev` (via `@netlify/vite-plugin-tanstack-start`) emulates Netlify DB and
Functions locally.

## Deploy

Push to the connected GitHub repo. Netlify runs `npm run build`, applies pending
migrations, bundles the functions, and publishes. See `DEPLOY.md`.

## First run

On the first successful login with `ADMIN_EMAIL` / `ADMIN_PASSWORD` the admin
account is created and the catalog is seeded from `shared/catalog.ts`. From then
on the database is the source of truth and the catalog is edited in **Admin →
Catalog**.
