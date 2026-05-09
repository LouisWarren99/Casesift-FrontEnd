# Worker Conventions: CaseSift Website (Frontend)

## Stack & Constraints

- Next.js 15 (App Router, React Server Components by default)
- React 19
- TypeScript with `strict: true`
- Tailwind CSS v4 (PostCSS plugin)
- Radix UI primitives, Lucide icons, Sonner for toasts
- Vercel deploy target — static-export-friendly, no server-side dependencies
- No auth, no database, no backend calls — purely a static marketing site

## File Locations

| Artifact Type | Path Pattern | Notes |
|---|---|---|
| Page route | `src/app/{route}/page.tsx` | Marketing pages; current site is a single homepage at `src/app/page.tsx` |
| Root layout | `src/app/layout.tsx` | Holds the global Metadata API config — every SEO change touches this |
| Global styles | `src/app/globals.css` | Tailwind v4 directives + custom CSS layers |
| Error boundary | `src/app/error.tsx` | Client-side error UI |
| Loading UI | `src/app/loading.tsx` | Suspense fallback |
| 404 | `src/app/not-found.tsx` | |
| Robots | `src/app/robots.ts` | Next.js MetadataRoute.Robots — single source of truth |
| Sitemap | `src/app/sitemap.ts` | Next.js MetadataRoute.Sitemap — add new URLs here |
| Components | `src/components/{kebab-name}.tsx` | (none exist yet — page.tsx is monolithic) |
| Reusable utilities | `src/lib/{name}.ts` | (none exist yet) |
| CI workflows | `.github/workflows/{name}.yml` | GitHub Actions |
| Lighthouse config | `.lighthouserc.json` or `lighthouserc.cjs` | Lighthouse CI budgets |
| Axe a11y spec | `tests/e2e/a11y.spec.ts` | WCAG2AA scan via `@axe-core/playwright` |
| Playwright (if added) | `playwright.config.ts` + `tests/e2e/` | E2E browser tests |
| Vitest (if added) | `vitest.config.ts` + `src/**/*.test.{ts,tsx}` | Unit tests |

## Naming Conventions

- **Files**: kebab-case for components (`pricing-table.tsx`), camelCase for hook/util files (`useScrollReveal.ts` only if extracted)
- **Components**: PascalCase exports (`PricingTable`, `HeroSection`)
- **Functions**: camelCase (`useScrollReveal`, `formatCurrency`)
- **Types / interfaces**: PascalCase (`Testimonial`, `CaseType`)
- **Constants**: UPPER_SNAKE_CASE for module-level constants

## Patterns

### Server vs Client Components
- Default to Server Components (no `"use client"` directive)
- Add `"use client"` only when React hooks (`useState`, `useEffect`, `useRef`) or browser APIs are needed
- The current `src/app/page.tsx` is a client component because of scroll-reveal animations — that's fine; keep client boundaries as small as practical

### SEO (CRITICAL — search ranking)
- ALL page-level metadata flows through the App Router Metadata API in `layout.tsx` and per-route `page.tsx` `metadata` exports
- Never inject `<meta>` tags via `<head>` — use the Metadata API
- New routes added to `src/app/` MUST be added to `src/app/sitemap.ts`
- Routes that should NOT be crawled MUST be added to the `disallow` list in `src/app/robots.ts`
- Open Graph image (`og-image.png`) should live at `public/og-image.png` and be referenced in `metadata.openGraph.images` — verify it's set when adding new pages
- Use `<Image>` from `next/image` for non-SVG images so Next can optimise them and emit width/height (avoids CLS penalty)
- Heading hierarchy: exactly one `<h1>` per page; subsequent sections use `<h2>` then `<h3>` — never skip levels (Lighthouse SEO + a11y)
- Add structured data (JSON-LD) for `Organization`, `WebSite`, and `WebPage` at minimum; define typed schema objects (using `schema-dts` types with `@id` cross-references) in `src/app/layout-schemas.ts` and render them as plain `<script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }} />` tags in the root Server Component (`src/app/layout.tsx`). Do NOT use `Script` from `next/script` -- the `afterInteractive` strategy is fragile with JSON-LD data blocks.

### Accessibility (ranking factor + legal compliance)
- Every interactive element MUST have an accessible name (text content, `aria-label`, or `aria-labelledby`)
- Form inputs MUST have associated `<label>` elements
- Color contrast MUST meet WCAG AA (≥4.5:1 for body text, ≥3:1 for large text)
- Keyboard navigation MUST work — all clickable elements must be `<button>` or `<a>`, never `<div onClick>`
- Use Radix primitives for accordions, dialogs, dropdowns — they handle ARIA correctly out of the box
- `prefers-reduced-motion` MUST be respected for any scroll animations or transitions

### Performance (Core Web Vitals)
- LCP target < 2.5s — preload hero images, avoid render-blocking JS
- CLS target < 0.1 — always reserve space for images/embeds, use `next/font` for fonts
- INP target < 200ms — avoid heavy synchronous work in event handlers
- Bundle size: keep `page.tsx` reasonable; if it grows past ~600 lines, split into section components under `src/components/sections/`

### TypeScript
- `strict: true` is enforced — no `any`, no `@ts-ignore` without a justifying comment
- Path alias `@/*` resolves to `src/*` (configured in `tsconfig.json`)
- Prefer `type` over `interface` for component prop types unless you need declaration merging
