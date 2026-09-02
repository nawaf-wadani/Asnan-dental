# AGENTS.md

Guidance for developers and AI agents working in this repo.

## What this is

Asnan Dental supply-ordering app. Per-user auth, a Postgres-backed catalog and
order history, server-generated order PDFs emailed via SMTP, and an admin
console. Nothing authoritative lives in `localStorage` — only the dark-mode
preference and an in-progress order draft.

## Ground rules

- **Never put secrets in code.** All secrets are Netlify env vars; read them
  through `netlify/lib/env.ts`.
- **Every API endpoint is authenticated.** Handlers call `requireAuth(req)` or
  `requireAdmin(req)` from `netlify/lib/auth.ts` before doing anything.
- **Validate every request body** with a zod schema from
  `netlify/lib/validation.ts` via `readJson(req, schema)`.
- **Multi-row writes go in a transaction** — `withTransaction` in
  `netlify/lib/db.ts`.
- **Shared code** (browser + functions) lives in `shared/` and must not import
  React or touch the DOM. Functions import it with a relative path
  (`../../shared/x`); the browser uses the `@shared/*` alias.
- **State-changing actions call `audit(...)`.**

## Boundaries

| From | Import style |
|---|---|
| `src/**` | `@/…` and `@shared/…` aliases |
| `netlify/**` | relative paths only (the functions bundler does not read tsconfig paths) |

## Commands

```bash
npm run dev         # Netlify-emulated dev server on :3000
npm run typecheck   # tsc --noEmit — run before pushing
npm run build       # vite build (what Netlify runs)
```

## Adding an API endpoint

1. Add the zod schema to `netlify/lib/validation.ts`.
2. Add repo functions to `netlify/lib/repos.ts` (typed row → camelCase DTO).
3. Create `netlify/functions/<name>.ts`: `export default withErrors(async (req, ctx) => …)`
   and `export const config: Config = { path: "/api/<name>" }`.
4. Add a typed method to `src/lib/api.ts`.

## Adding a catalog field

`shared/catalog.ts` (seed) → `netlify/database/migrations/000X_*/migration.sql`
(ALTER TABLE) → `catalog_items` mapping in `netlify/lib/repos.ts` → `CatalogItem`
in `shared/types.ts` → the admin editor in `src/components/admin/AdminApp.tsx`.

## Migrations

Plain SQL under `netlify/database/migrations/<n>_<slug>/migration.sql`, applied
in lexical order automatically on deploy. A failing migration blocks the deploy.
Never edit a migration that has run in production — add a new one.
