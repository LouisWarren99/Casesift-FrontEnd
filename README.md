# CaseSift Website

The public marketing website for CaseSift — AI-powered case assessment for UK solicitors.

Live at: **[casesift.co.uk](https://casesift.co.uk)**

## Tech Stack

- Next.js 15 (App Router)
- TypeScript
- Tailwind CSS v4
- Radix UI primitives
- Lucide icons
- Deployed on Vercel

## Local Development

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## Build

```bash
npm run build
npm run start
```

## Contact form

The contact form on the homepage POSTs to `/contact`, a Next.js Route Handler that emails submissions via Resend.

**Required environment variables (Vercel):**

- `RESEND_API_KEY` — get from [https://resend.com/api-keys](https://resend.com/api-keys). Set this in the Vercel project settings before merging; without it, the route returns 500 in production.

**Required Resend setup:**

- Verify the `casesift.co.uk` domain at [https://resend.com/domains](https://resend.com/domains) so the sender `noreply@casesift.co.uk` is authorised. Without domain verification Resend will reject the send.

**Recipient:** `info@casesift.co.uk`. To change the intake address, edit the `to` field in `src/app/contact/route.ts`.

**Spam mitigation:** A hidden honeypot field deflects naive bots (the server returns a silent 200 when tripped). Per-IP rate limiting (5 submissions per minute) bounds abuse.

## What's Here

- **Landing page** with hero, problem/solution sections, how-it-works, case types, report preview mockup, statistics, pricing, testimonials, trust & security, FAQ, contact
- **SEO**: sitemap.xml, robots.txt, OpenGraph metadata
- **Static export-ready**: no server-side dependencies

## What's NOT Here

The product itself (backend API, FSM engine, AI agents, dashboard) lives in a separate private repository. This repo is only the public marketing website.

## Continuous Integration

Two GitHub Actions workflows run on every push to `main` and on every PR. Both are required for merge.

### Workflows

| Workflow | File | Target time | Purpose |
|---|---|---|---|
| **CI** | `.github/workflows/ci.yml` | < 3 min | Fast functional gates — blocks merge on type/lint/build/smoke failures |
| **Quality** | `.github/workflows/quality.yml` | < 8 min | SEO / a11y / link gates — Lighthouse, axe-core a11y, JSON-LD, robots, sitemap, lychee |

### CI Gates

| Gate | Workflow | Failure means | Local fix command |
|---|---|---|---|
| TypeScript | `ci.yml` | `tsc --noEmit` failed | `npm run typecheck` and read errors |
| ESLint | `ci.yml` | `eslint .` reported errors | `npm run lint -- --fix` |
| Build | `ci.yml` | `next build` failed | `npm run build` |
| Smoke | `ci.yml` | Page returned non-200 / missing metadata / missing JSON-LD | `npm run build && npm run start & npm run smoke` |
| Lighthouse (desktop) | `quality.yml` | A category score dropped below desktop budget | `npm run build && npm run start & npm run lhci` |
| Lighthouse (mobile) | `quality.yml` | A category score dropped below mobile budget (SEO-critical: Google uses mobile-first indexing) | `npm run build && npm run start & npm run lhci:mobile` |
| Axe a11y | `quality.yml` | A WCAG2AA accessibility violation was found | `npm run build && npm run start & npm run test:a11y` |
| Structured data | `quality.yml` | JSON-LD missing or malformed (Organization / WebSite / WebPage) | `npm run build && npm run start & npm run validate:structured-data` |
| Robots | `quality.yml` | A required `Disallow:` path was removed from robots.txt | `npm run build && npm run start & npm run validate:robots` |
| Sitemap | `quality.yml` | A disallowed URL leaked into sitemap.xml | `npm run build && npm run start & npm run validate:sitemap` |
| Broken links | `quality.yml` | A markdown / TSX URL is dead | `lychee` (or click the GH Actions log to see the failing URL) |
| Dependency audit | `quality.yml` | `npm audit` found HIGH-severity advisories — hard gate, fails the run | `npm audit --audit-level=high` to inspect locally |

### Lighthouse Budgets

Budgets are defined in `lighthouserc.cjs` (desktop) and `lighthouserc.mobile.cjs` (mobile), sourced from `fsm-config/project-docs/seo.md`. Both runs enforce identical score thresholds:

| Category | Minimum score |
|---|---|
| Performance | 0.90 |
| Accessibility | 0.95 |
| Best Practices | 0.95 |
| SEO | 0.95 |

**To tighten or relax a budget:** edit `lighthouserc.cjs` — this is a deliberate change requiring a PR and approval. Do not lower budgets to suppress a first-run failure; surface the actual performance issue instead.

Lighthouse runs 3 times per invocation (`numberOfRuns: 3`) and medians the scores to reduce variance. Runs are against `localhost:3000` (not the Vercel production URL) to keep CI independent of Vercel build status. The mobile run (`lighthouserc.mobile.cjs`) uses iPhone 14 Pro emulation (390×844, deviceScaleFactor 3, simulated throttling) and is the SEO-critical run because Google uses mobile-first indexing.

### Accessibility

`@axe-core/playwright` scans at **WCAG2AA** level (per `fsm-config/project-docs/seo.md`). Any WCAG2AA violation fails the run via `npm run test:a11y` (a Playwright spec under `tests/e2e/a11y.spec.ts`).

Lighthouse Accessibility also runs (score-based), using axe-core under the hood. Both gates are kept: Lighthouse for ranking-signal scoring, the dedicated axe spec for hard-fail violation gating.

### Structured Data (JSON-LD)

Three schemas are injected in `src/app/layout.tsx`: `Organization`, `WebSite`, `WebPage`. The `validate:structured-data` script validates all three are present and well-formed in the rendered HTML.

If you add a new JSON-LD schema to the layout, add its `@type` to the required-types list in `scripts/validate-structured-data.mjs`.

### The `links:check` npm script

`npm run links:check` is a local-dev convenience only. It requires `lychee` on your `PATH` (the Rust binary — not an npm package). In CI, lychee is invoked via the official `lycheeverse/lychee-action@v2` GitHub Action, which provides the binary automatically.

### Future-Proofing

- **Static export:** If `next.config.ts` adds `output: "export"`, update `lighthouserc.cjs` to use `staticDistDir: "./out"` instead of `startServerUrl`.

### Tests

This repo has two test layers configured:

| Layer | Tool | When | Command (local) | CI workflow |
|---|---|---|---|---|
| Unit | Vitest + jsdom + @testing-library/react | On every push and PR | `npm run test:unit` | `ci.yml` "Unit tests" step |
| E2E | Playwright (chromium-only) | On every push and PR | `npm run test:e2e` (requires `npm run build && npm run start` running) | `quality.yml` `e2e` job |

Unit tests cover SEO-critical surfaces (layout metadata, robots, sitemap, JSON-LD schemas) plus a homepage render smoke test. E2E tests cover page-load, navigation anchors, contact CTA, responsive layout, OG meta tags in `<head>`, and `<h1>` count.

To run a single test locally: `npx vitest run src/test/sitemap.test.ts` or `npx playwright test tests/e2e/og-meta.spec.ts`.

### Dependency hygiene

`npm audit --audit-level=high` runs as a hard gate in `quality.yml`. As of run-3, all four previously-known HIGH advisories were resolved by replacing `pa11y-ci` (which transitively pulled in vulnerable `lodash`, `semver`, and `pa11y`) with `@axe-core/playwright`, which has a clean dep tree (`axe-core` only). Any new HIGH advisory will fail CI — investigate and remediate before merge.

## Contact

For access to the platform: [info@casesift.co.uk](mailto:info@casesift.co.uk)

---

CaseSift Ltd. Registered in England & Wales.

<!-- deploy-trigger: 2026-04-26 -->

