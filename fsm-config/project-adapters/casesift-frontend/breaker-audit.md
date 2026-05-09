# Breaker Audit: CaseSift Website (Frontend)

> No auth, no DB, no backend code in this repo. The audit surface is much smaller than the backend's: front-end XSS, SEO/SSRF traps, dependency hygiene, security headers, and CI supply-chain.

## 1. XSS

- React escapes by default — verify no `dangerouslySetInnerHTML` is added
- If raw HTML is needed (e.g., for a blog/CMS in future), the source MUST be sanitised (DOMPurify or server-side sanitisation)
- JSON-LD `<script type="application/ld+json">` content MUST come from a typed object passed through `JSON.stringify` — never from raw user input or unsanitised CMS data

## 2. Security Headers (next.config.ts)

The current `next.config.ts` sets:
- `X-Content-Type-Options: nosniff` ✓
- `X-Frame-Options: DENY` ✓
- `X-XSS-Protection: 1; mode=block` ✓ (legacy but harmless)
- `Referrer-Policy: strict-origin-when-cross-origin` ✓
- `Strict-Transport-Security: max-age=63072000; includeSubDomains; preload` ✓
- `Permissions-Policy: camera=(), microphone=(), geolocation=()` ✓

**Present (added run-2):**
- `Content-Security-Policy: default-src 'self'; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline'; img-src 'self' data:; font-src 'self'; connect-src 'self'; frame-ancestors 'none'; base-uri 'self'; form-action 'self'; object-src 'none'` ✓ — pragmatic CSP using `'unsafe-inline'` to accommodate Next.js App Router inline hydration scripts and potential inline styles. Nonce-based strict CSP (which would eliminate `'unsafe-inline'`) requires Next.js middleware + dynamic rendering conversion and is deferred to a future run.

**Audit on every relevant change:**
- If external scripts (analytics, chat widgets), external fonts (Google Fonts), or external image sources are added, the CSP directives (`script-src`, `font-src`, `img-src`, `connect-src`) MUST be updated to include the new origins.
- If forms or third-party embeds are added, the header surface MUST be reviewed (CSP `frame-ancestors`, `form-action`, etc.)

## 3. SEO / Crawl Manipulation Risks

- `robots.ts` allow/disallow rules MUST NOT accidentally allow private routes to be indexed — every change to it requires verifying the disallow list still includes `/dashboard`, `/cases`, `/settings`, `/sign-in`, `/sign-up`
- `sitemap.ts` MUST NOT include private/auth-gated URLs
- `metadata.metadataBase` MUST be the production hostname (`https://casesift.co.uk`) in production — preview/staging deployments may legitimately differ but only if Vercel-managed
- Adding a `noindex` meta tag accidentally to a production page is a cataclysmic SEO failure — verify on every metadata change

## 4. Dependency Hygiene

- `npm audit` results MUST be reviewed; HIGH/CRITICAL vulnerabilities block the run
- Lock file (`package-lock.json`) MUST be committed
- Pinning major versions in `package.json` is acceptable; `^` ranges are fine for minor/patch
- New dependencies MUST be vetted: license, maintainer, install-script presence (no postinstall scripts that fetch arbitrary code)
- `npm ci` (not `npm install`) MUST be used in CI for reproducible installs

## 5. CI / Supply Chain

- GitHub Actions versions MUST be pinned to a major tag (`@v4`) at minimum; SHA-pinning is preferred for security-critical actions
- Secrets in workflows MUST come from `secrets.*` — never hardcoded, never echoed to logs
- Workflow `permissions:` block SHOULD be set to least-privilege (`contents: read` by default; only escalate when needed)
- Third-party actions from outside `actions/`, `vercel/`, `treosh/lighthouse-ci-action` etc. require justification

## 6. Information Disclosure

- Build output (`.next/`) MUST NOT be committed
- Source maps in production: Next.js disables them by default; verify no override enables them in production
- Comments in code MUST NOT contain secrets, internal hostnames, employee emails, or unreleased feature names

## 7. Type Safety

- `tsc --noEmit` MUST pass with strict mode enabled
- New code MUST NOT introduce `any` without a justifying comment
- `@ts-expect-error` is preferred over `@ts-ignore` because it self-disables when the error goes away

## 8. Async / Resource Lifecycle

- React `useEffect` cleanups MUST be present for any subscription or interval (e.g., the scroll-reveal IntersectionObserver in `page.tsx` — verify it disconnects on unmount)
- Event listeners attached to `window` or `document` MUST be removed on cleanup
- Requests fired from client components SHOULD be cancellable (AbortController) when the component might unmount mid-flight
