# AGENTS.md

This document provides an overview of the project structure for developers and AI agents working on this codebase.

## Project Overview

Asnan Dental is a dental clinic inventory ordering application. Clinic assistants browse a categorized catalog of 200+ dental supplies, manage quantities, add special requests with product photos, and generate branded PDF order documents. All data is persisted client-side via localStorage.

### Tech Stack

| Layer | Technology |
|-------|------------|
| Framework | TanStack Start |
| Frontend | React 19, TanStack Router v1 |
| Build | Vite 7 |
| Styling | Tailwind CSS 4 + inline styles for brand theming |
| Icons | Lucide React |
| Font | Manrope (Google Fonts) |
| Language | TypeScript 5.7 (strict mode) |
| Deployment | Netlify |

## Directory Structure

```
├── public/
│   └── favicon.ico
├── src/
│   ├── components/
│   │   └── AsnanDental.tsx    # Main application: catalog data, UI, storage helpers, PDF generation, all screens
│   ├── routes/
│   │   ├── __root.tsx         # Root HTML shell: charset, viewport, title ("Asnan Dental"), global styles import
│   │   └── index.tsx          # Home route — renders AsnanDental component
│   ├── router.tsx             # TanStack Router setup with scroll restoration
│   └── styles.css             # Tailwind import, Manrope font, utility classes (line-clamp, scrollbar hiding, date picker)
├── .gitignore
├── AGENTS.md                  # This file
├── README.md                  # Project overview and setup instructions
├── netlify.toml               # Netlify build config: vite build, dist/client publish dir
├── package.json               # Dependencies and scripts
├── tsconfig.json              # TypeScript: ES2022 target, strict mode, @/* path alias
└── vite.config.ts             # Vite: TanStack Start, React, Tailwind, Netlify plugins
```

## Architecture

### Single-Component Application

The entire application lives in `src/components/AsnanDental.tsx`. This file contains:

- **Brand theming** — light/dark color palettes (`BRAND_LIGHT`, `BRAND_DARK`)
- **Catalog data** — `CATALOG` object with 7 procedure categories and 200+ items
- **Smart pairings** — `PAIRINGS` map of items frequently ordered together
- **Recommended additions** — `RECOMMENDED_ADDITIONS` for catalog gap analysis
- **Storage helpers** — `safeGet`, `safeSet`, `safeDelete` wrapping `localStorage`
- **Main component** — `AsnanDental` with multi-step flow: intro → category → items → review → done
- **Sub-components** — `QtyControl`, `ItemRow`, `SpecialRequestCard`, modal shells
- **PDF generation** — builds HTML document and opens print dialog via hidden iframe

### Application Flow

1. **Intro screen** — assistant name + order date input, access to history/favorites/settings
2. **Category screen** — global search + procedure category grid + special requests
3. **Items screen** — per-category item list with search, quantity controls, favorites
4. **Review screen** — order summary, notes, photo validation for special requests
5. **Done screen** — PDF save, email, clipboard copy, HTML download options

### Data Persistence

All data stored in `localStorage` under `asnan:` namespace keys:

| Key | Content |
|-----|---------|
| `asnan:current-draft` | Auto-saved draft (quantities, special requests, notes) |
| `asnan:order-history` | Array of last 20 completed orders |
| `asnan:favorites` | Array of starred item IDs |
| `asnan:saved-assistants` | Array of recently used assistant names |
| `asnan:item-frequency` | Object mapping item IDs to order frequency counts |
| `asnan:settings` | User preferences (currently: dark mode toggle) |

Draft auto-saves with 400ms debounce. History is capped at 20 entries. Photos in special requests are compressed via Canvas API before storage.

### File-Based Routing (TanStack Router)

Routes are defined by files in `src/routes/`:

- `__root.tsx` — Root layout wrapping all pages (HTML shell, metadata)
- `index.tsx` — Route for `/` (renders AsnanDental)

## Development Commands

```bash
npm run dev      # Start dev server
npm run build    # Production build
npm run preview  # Preview production build
```

## Conventions

### Naming
- Components: PascalCase
- Utilities/hooks: camelCase
- Routes: kebab-case files

### Styling
- Tailwind CSS utility classes for layout
- Inline `style` props for brand color theming (supports dynamic light/dark switching)
- Manrope font loaded via CSS `@import` in `styles.css`

### TypeScript
- Strict mode enabled
- Import paths use `@/` alias for `src/*`
