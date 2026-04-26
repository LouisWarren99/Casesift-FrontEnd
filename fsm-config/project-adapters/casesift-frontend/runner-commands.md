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

> No test runner is configured yet (no Vitest, no Jest, no Playwright). If a test framework is added during the run, document it here and the Verifier will start gating on it.

When Vitest is added:
```bash
npx vitest run --reporter=verbose [MODIFIED_FILES]
```

When Playwright is added:
```bash
npx playwright test
# Requires `npm run build && npm run start` running, or use Playwright's webServer config
```

## Lighthouse CI (when configured)

```bash
npx lhci autorun
# Reads .lighthouserc.json or lighthouserc.cjs.
# In CI this runs against the built output via lhci's static-dist or a started server.
```

## Pa11y (accessibility, when configured)

```bash
npx pa11y-ci
# Reads .pa11yci.json for URLs and config
```

## Notes

- Build is the strongest functional gate in this repo because there are no runtime tests yet
- The Runner's targeted-test step is a no-op until a test framework lands; treat type-check + lint + build as the trifecta for now
- Lighthouse and Pa11y commands are intended to be invoked from CI workflows, not from the Runner state directly (they need a running server / build artefact)
