# CaseSift Website Architecture

## Purpose

Public marketing website for CaseSift (live at https://casesift.co.uk). Single-page marketing site that drives interested UK solicitors to contact the team for platform access. The product itself (backend, AI agents, dashboard) lives in a separate private repository and is NOT linked from this site beyond a `mailto:` contact.

## Tech Stack

| Layer | Choice | Why |
|---|---|---|
| Framework | Next.js 15 (App Router) | SSG/ISR, Metadata API, image optimisation, Vercel-native |
| UI runtime | React 19 | Latest stable, RSC-ready |
| Language | TypeScript (strict) | Type safety, IDE support |
| Styling | Tailwind CSS v4 | Utility-first, fast dev, small CSS output |
| Primitives | Radix UI | Accessible, headless, drop-in for accordions/dialogs/etc. |
| Icons | Lucide React | Consistent, tree-shakeable, MIT-licensed |
| Notifications | Sonner | Lightweight toast library |
| Hosting | Vercel | Zero-config Next.js, edge CDN, preview deploys |

## Repo Layout

```
.
├── src/
│   └── app/
│       ├── layout.tsx           # Root layout — Metadata API source of truth
│       ├── page.tsx             # The single landing page (long, multi-section)
│       ├── globals.css          # Tailwind v4 directives + custom layers
│       ├── error.tsx            # Client-side error boundary
│       ├── loading.tsx          # Suspense fallback
│       ├── not-found.tsx        # 404 page
│       ├── robots.ts            # robots.txt generator
│       └── sitemap.ts           # sitemap.xml generator
├── next.config.ts               # Security headers, Next.js config
├── tsconfig.json                # TypeScript strict config, @/* path alias
├── postcss.config.mjs           # Tailwind PostCSS plugin
├── package.json                 # dev / build / start / lint / typecheck scripts
└── README.md
```

## What's NOT Here

- No backend (lives in separate private CaseSift repo)
- No auth (no Clerk, no OAuth — purely public marketing)
- No database
- No customer dashboard / app routes (`/dashboard`, `/cases`, `/settings` are explicitly disallowed in robots.ts because they live in the OTHER frontend / dashboard app)
- No tests (Vitest/Playwright not configured yet)
- No CI workflows yet (`.github/workflows/` doesn't exist as of 2026-04-26)

## Deployment

- Push to `main` → Vercel auto-deploys to production (`https://casesift.co.uk`)
- PR opens → Vercel creates a preview deployment with its own URL
- No manual build steps — Vercel runs `npm run build`

## Constraints

- Static-export-friendly: avoid server-side dependencies, dynamic API routes, or environment-specific build steps unless they degrade gracefully
- Marketing copy / claims about the product MUST match what the platform actually does (no aspirational lies — reputation risk for a legal-tech company is severe)
- The site is the first impression for solicitor partners — visual polish and accessibility are first-tier requirements, not nice-to-haves
