# Asnan Dental — Inventory Ordering

A dental clinic supply ordering application built with TanStack Start and deployed on Netlify. Assistants browse a categorized catalog of 200+ dental supplies, manage quantities, add special requests with photos, and generate PDF order documents.

## Features

- **Categorized catalog** — 7 procedure categories (Diagnostics, Restorative, Endodontics, Anesthesia, Surgical, Impression, Infection Control) with 200+ items
- **Smart search** — fuzzy, typo-tolerant search across all items and manufacturers
- **Quantity management** — per-item quantity controls with undo support
- **Special requests** — free-text items with required photo uploads (camera or file), auto-compressed to keep storage lean
- **PDF generation** — branded order documents via print dialog or HTML download
- **Order history** — last 20 orders saved locally with one-tap reorder
- **Favorites** — star items for quick access across sessions
- **Frequently ordered** — tracks item frequency and surfaces top picks
- **Smart pairing suggestions** — prompts complementary items when adding common supplies
- **Dark mode** — full light/dark theme with persistent preference
- **Email & clipboard** — plain-text order export for email or paste
- **Gap analysis** — recommended additions not in the current catalog
- **Client-side persistence** — all data stored in localStorage, no server required

## Tech Stack

| Layer | Technology |
|-------|------------|
| Framework | TanStack Start |
| Frontend | React 19, TanStack Router v1 |
| Build | Vite 7 |
| Styling | Tailwind CSS 4 + inline styles for theming |
| Icons | Lucide React |
| Font | Manrope (Google Fonts) |
| Language | TypeScript 5.7 |
| Deployment | Netlify |

## Getting Started

```bash
npm install
npm run dev      # Start dev server
npm run build    # Production build
```

## Project Structure

```
src/
├── components/
│   └── AsnanDental.tsx    # Main application component (catalog, UI, storage, PDF)
├── routes/
│   ├── __root.tsx         # Root HTML shell with metadata
│   └── index.tsx          # Home route rendering AsnanDental
├── router.tsx             # TanStack Router configuration
└── styles.css             # Tailwind + Manrope font + utility styles
```

## Data Storage

All persistence is client-side via `localStorage` under the `asnan:` namespace:

| Key | Purpose |
|-----|---------|
| `asnan:current-draft` | Auto-saved in-progress order |
| `asnan:order-history` | Last 20 completed orders |
| `asnan:favorites` | Starred item IDs |
| `asnan:saved-assistants` | Recent assistant names |
| `asnan:item-frequency` | Per-item order frequency counts |
| `asnan:settings` | User preferences (dark mode) |
