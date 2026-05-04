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
| **Quality** | `.github/workflows/quality.yml` | < 8 min | SEO / a11y / link gates — Lighthouse, Pa11y, JSON-LD, robots, sitemap, lychee |

### CI Gates

| Gate | Workflow | Failure means | Local fix command |
|---|---|---|---|
| TypeScript | `ci.yml` | `tsc --noEmit` failed | `npm run typecheck` and read errors |
| ESLint | `ci.yml` | `eslint .` reported errors | `npm run lint -- --fix` |
| Build | `ci.yml` | `next build` failed | `npm run build` |
| Smoke | `ci.yml` | Page returned non-200 / missing metadata / missing JSON-LD | `npm run build && npm run start & npm run smoke` |
| Lighthouse (desktop) | `quality.yml` | A category score dropped below desktop budget | `npm run build && npm run start & npm run lhci` |
| Lighthouse (mobile) | `quality.yml` | A category score dropped below mobile budget (SEO-critical: Google uses mobile-first indexing) | `npm run build && npm run start & npm run lhci:mobile` |
| Pa11y | `quality.yml` | A WCAG2AA accessibility violation was found | `npm run build && npm run start & npm run pa11y` |
| Structured data | `quality.yml` | JSON-LD missing or malformed (Organization / WebSite / WebPage) | `npm run build && npm run start & npm run validate:structured-data` |
| Robots | `quality.yml` | A required `Disallow:` path was removed from robots.txt | `npm run build && npm run start & npm run validate:robots` |
| Sitemap | `quality.yml` | A disallowed URL leaked into sitemap.xml | `npm run build && npm run start & npm run validate:sitemap` |
| Broken links | `quality.yml` | A markdown / TSX URL is dead | `lychee` (or click the GH Actions log to see the failing URL) |
| Dependency audit | `quality.yml` | `npm audit` found HIGH-severity advisories (warning only — `continue-on-error: true` while known advisories are unresolved) | `npm audit --audit-level=high` to inspect; see Known Dependency Advisories below |

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

Pa11y scans at **WCAG2AA** level (per `fsm-config/project-docs/seo.md`). Any WCAG2AA violation fails the run.

Lighthouse Accessibility also runs (score-based), using axe-core under the hood. Both gates are kept: Lighthouse for ranking-signal scoring, Pa11y for hard-fail violation gating.

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

### Known Dependency Advisories

The `npm audit --audit-level=high` step in `quality.yml` currently runs with `continue-on-error: true` because four HIGH-severity advisories exist in devDependencies introduced by this run. These are CI-only toolchain packages — they are never shipped to the production browser bundle and are never exposed to user-controlled input.

| Package | Severity | Advisory | Blast-radius justification |
|---|---|---|---|
| `lodash` (≤4.17.23) | HIGH | GHSA-r5fr-rjxr-66jc (code injection via `_.template` keys), GHSA-f23m-r3pf-42rh (prototype pollution in `_.unset`/`_.omit`) | Transitive dep of `pa11y-ci` and `@lhci/cli`. Runs only inside the GitHub Actions CI runner on hardcoded inputs. No user-input surface, no browser exposure. |
| `semver` (7.0.0–7.5.1) | HIGH | GHSA-c2qf-rxjj-qqgw (RegExp DoS) | Transitive dep of `@lhci/cli` (via lighthouse). Parses only the project's own `package-lock.json` version strings — no attacker-controlled input. |
| `pa11y` (6.0.0-alpha–6.2.3) | HIGH | Rolls up `lodash` + related transitive advisories | Transitive dep of `pa11y-ci ^3.1.0`. Runs only in CI, not shipped to production. |
| `pa11y-ci` (≥2.4.0) | HIGH | Rollup of the above transitive advisories reported against the direct dep | Direct devDependency. CI-only, least-privilege runner (`permissions: contents: read`), no user-input exposure. |

**Why these are accepted for now:** All four affected packages are devDependencies that run exclusively inside the GitHub Actions CI runner. Exploitation of the lodash code-injection advisory requires attacker control of a lodash template string; the CI tools use lodash on hardcoded internal inputs only. The workflow uses `permissions: contents: read` (least-privilege), further bounding the realistic blast radius of any CI-runner compromise.

**TODO:** Upgrade or replace `pa11y-ci ^3.1.0` when an upstream fix lands (e.g., upgrade to `pa11y-ci ^4.x` if available, or swap to axe-core CLI). Once all four HIGH advisories are resolved, flip `continue-on-error: true` → `continue-on-error: false` in `quality.yml` to make the audit a hard gate.

## Contact

For access to the platform: [info@casesift.co.uk](mailto:info@casesift.co.uk)

---

CaseSift Ltd. Registered in England & Wales.

<!-- deploy-trigger: 2026-04-26 -->

