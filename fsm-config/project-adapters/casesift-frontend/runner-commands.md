# Runner Commands: CaseSift Website (Frontend)

## Pre-Test Setup

```bash
# Install dependencies (first run, or after package.json changes)
npm ci
```

---

## Type Checker

```bash
npm run typecheck
# expands to: tsc --noEmit
```

## Linter

```bash
npm run lint
# expands to: eslint .
```

## Build

```bash
npm run build
# expands to: next build
# Verifies the site compiles and emits a production bundle.
# This is the primary "everything works" gate for this repo.
```

## Targeted Tests

```bash
# Run the unit-test suite (Vitest, jsdom).
npm run test:unit
# Or run a single file:
npx vitest run src/test/<file>.test.ts
```

```bash
# Run the Playwright E2E suite (Chromium).
npm run test:e2e
# Or run a single spec:
npx playwright test tests/e2e/<spec>.spec.ts
```

```bash
# Run the WCAG2AA accessibility scan (subset of Playwright).
npm run test:a11y
```

```bash
# Run unit + E2E in sequence.
npm test
```

## Lighthouse CI

```bash
npx lhci autorun
# Reads .lighthouserc.json or lighthouserc.cjs.
# In CI this runs against the built output via lhci's static-dist or a started server.
```

## Notes

- Build, type-check, lint, and the Vitest + Playwright test layers are all functional gates
- Lighthouse is intended to be invoked from CI workflows, not from the Runner state directly (it needs a running server / build artefact)
- Accessibility scanning runs through `@axe-core/playwright` inside the Playwright suite (`npm run test:a11y`)
