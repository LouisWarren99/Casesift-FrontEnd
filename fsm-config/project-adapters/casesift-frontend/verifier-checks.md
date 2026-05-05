# Verifier Checks: CaseSift Website (Frontend)

## Probe 1 — Missed Call-Sites

### Metadata API Cohesion
When a page or route is added/renamed/removed, verify:
- `src/app/layout.tsx` metadata hasn't been broken (root metadata still resolves)
- `src/app/sitemap.ts` includes the new route or removes the old one
- `src/app/robots.ts` allow/disallow rules still cover the new route correctly
- Any internal links pointing at the changed route are updated

### Tailwind v4 Class Usage
- Tailwind v4 uses the `@theme` and `@source` directives differently from v3 — when adding new styles, verify they actually compile (run `npm run build` and check the emitted CSS)
- Custom utilities introduced via `@layer` must be declared in `globals.css`

### Workflow References
- If a workflow file references a script or path, that script/path must exist
- If `package.json` adds a script, the workflow that calls it must use the exact name
- If a Lighthouse or axe-core spec references a URL, verify the URL is reachable from CI (localhost:3000 after `npm run start`, or a Vercel preview URL)

---

## Probe 2 — Behaviour Drift

### Next.js 15 App Router Patterns
- `params` and `searchParams` in dynamic routes are `Promise` types in Next 15 — must `await` before destructuring
- Server Components cannot use React hooks; verify `"use client"` is added when hooks appear
- `useRouter` is imported from `next/navigation`, NEVER `next/router`
- `Image` and `Link` come from `next/image` and `next/link` respectively — never use raw `<img>` or `<a>` for internal navigation/images

### React 19 Patterns
- Server Actions: when used, they must be `"use server"` and called from forms/client components correctly
- `use()` hook: only call inside a component or other hook, never at the top level

### Metadata API
- Metadata exports must be `Metadata` typed and either static or `async function generateMetadata()`
- `metadataBase` must be a `URL` object — string values are silently ignored
- `openGraph.images` must reference existing files (relative URLs resolve against `metadataBase`)

### Tailwind v4
- v4 dropped `tailwind.config.js` in favour of CSS-first config — verify nobody added a v3-style config file expecting it to work
- `@apply` still works but is discouraged in v4; prefer composing classes in JSX

---

## Probe 3 — Incomplete Migration

### Adding a New Page Route
A new route under `src/app/` is incomplete unless:
1. The page itself is created at `src/app/{route}/page.tsx` (or appropriate App Router file)
2. `src/app/sitemap.ts` includes it (with `lastModified`, `changeFrequency`, `priority`)
3. `src/app/robots.ts` rules cover it (allow if public, disallow if private)
4. Per-route metadata is exported from the new `page.tsx` (or inherits sensibly from `layout.tsx`)
5. Internal navigation that should reach it (header/footer/CTAs) is updated

### Adding a CI Workflow
A new GitHub Actions workflow is incomplete unless:
1. The `.github/workflows/{name}.yml` file is committed
2. Required secrets are documented in the repo (`README.md` or a `docs/ci.md`)
3. Path filters or branch filters match the intended trigger pattern
4. The workflow has been syntax-validated (e.g., `actionlint` or YAML parse)

### Adding a Lighthouse / axe-core / SEO check
Incomplete unless:
1. Config file or spec is checked in (`lighthouserc.cjs`, `tests/e2e/a11y.spec.ts`, etc.)
2. The check is invoked from at least one CI workflow
3. Budgets / thresholds are set so the check can FAIL — a check that always passes is dead weight
4. The README or a docs page explains what the check does and what to do when it fails

### Removing a Section from page.tsx
If a section is removed from `src/app/page.tsx`:
1. Any related anchor links in the navigation must be removed
2. Any references in `sitemap.ts` (if the section had its own anchor URL) must be removed
3. Lucide icons or imports used only by the removed section must be cleaned up to avoid dead imports

---

## Adversarial Probes 4–7 (code-change tasks only)

### Probe 4 — Shortcut Implementation
- `any` type or `@ts-ignore` is forbidden unless justified inline with a `// reason:` comment
- Hardcoded URLs that should be derived from `metadataBase` or env vars
- Inline styles instead of Tailwind utilities (without justification)

### Probe 5 — Thin Tests / No Tests
This repo uses Vitest (`src/test/**/*.test.{ts,tsx}`) and Playwright (`tests/e2e/**/*.spec.ts`). For every code change:
- Verify tests cover both happy path and at least one negative case
- Verify any new SEO feature has a corresponding Lighthouse budget or assertion
- Verify any new a11y-relevant change is covered by `@axe-core/playwright` (run via `npm run test:a11y`)

### Probe 6 — Missing Test Coverage
- New CI workflow added without an example failure mode being tested → flag
- New page added without Lighthouse budget or axe-core a11y coverage → flag

### Probe 7 — Test Quality Upside (SUGGESTION only)
- Lighthouse budgets are present but lenient (>0.7 thresholds for SEO/A11y) — recommend tightening to ≥0.9
- axe-core tags include `WCAG2A` only instead of also `WCAG2AA` — recommend stricter level
