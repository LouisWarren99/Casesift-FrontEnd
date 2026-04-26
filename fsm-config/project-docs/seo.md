# SEO & Search-Engine Compliance

## Why this doc exists

CaseSift's customers are UK solicitors. They find legal-tech vendors via Google search ("AI case assessment", "case screening tool", "CFA decision support", etc.). Being penalised by Google or losing rank to competitors directly costs the business pipeline. This doc captures what we treat as ranking-critical.

## Baseline (already in place as of 2026-04-26)

| Item | Where | Status |
|---|---|---|
| `<title>` and `<meta description>` | `src/app/layout.tsx` `metadata` export | ✓ Set, professional copy, keyword-relevant |
| Keywords list | `src/app/layout.tsx` `metadata.keywords` | ✓ Set (note: Google ignores keywords meta but Bing/Yandex still read it) |
| `metadataBase` | `src/app/layout.tsx` | ✓ Set to `https://casesift.co.uk` |
| Open Graph (Facebook/LinkedIn) | `metadata.openGraph` | ✓ Set with title, description, url, siteName, locale=en_GB, type=website. **OG image not yet referenced — should be added.** |
| Twitter card | `metadata.twitter` | ✓ Set with `summary_large_image` card. **Image not yet referenced.** |
| robots.txt | `src/app/robots.ts` | ✓ Allows `/`, disallows private routes |
| sitemap.xml | `src/app/sitemap.ts` | ✓ Single homepage entry |
| Security headers | `next.config.ts` | ✓ Strict (HSTS, X-Frame-Options DENY, etc.) |
| HTTPS | Vercel | ✓ Enforced |

## Gaps to be addressed by CI / monitoring

| Concern | What's missing | What to add |
|---|---|---|
| Core Web Vitals (LCP / CLS / INP) | No automated monitoring | Lighthouse CI in GitHub Actions with budgets ≥0.9 for Performance |
| Accessibility | No automated check | Pa11y CI or axe-core in CI; budget ≥0.9 Lighthouse a11y, WCAG2AA Pa11y level |
| Best Practices | No automated check | Lighthouse CI Best Practices ≥0.9 |
| SEO score | No automated check | Lighthouse CI SEO ≥0.95 |
| Structured data (JSON-LD) | None on the site | Add Organization, WebSite, ContactPoint, and (optionally) FAQPage schemas. Validate with structured-data-testing-tool or schema.org validator in CI. |
| Broken links | No check | Link checker in CI (e.g., lychee or linkinator) — internal anchors and external references |
| OG image | Referenced but file missing | Add `public/og-image.png` (1200x630, <300KB) and reference in `metadata.openGraph.images` |
| Canonical URLs | Implicit from metadataBase | Set explicit `metadata.alternates.canonical` per page when subpages are added |
| `robots.txt` validation | No check | CI step that fetches `/robots.txt` from the build and asserts its content |
| `sitemap.xml` validation | No check | CI step that fetches `/sitemap.xml` and validates against XSD or sitemap.org schema |

## Ranking-Critical Rules (Verifier MUST flag violations)

1. **Never accidentally `noindex`**: A `<meta name="robots" content="noindex">` or `metadata.robots: { index: false }` on a production-public page is catastrophic. Flag any change touching `metadata.robots` for human review.
2. **Heading hierarchy**: Exactly one `<h1>` per page; `<h2>` children of `<h1>`; never skip levels (`<h1>` → `<h3>` is forbidden).
3. **Image alt text**: Every `<Image>` and `<img>` MUST have a non-empty `alt` (or `alt=""` for purely decorative images, justified inline).
4. **Link text**: Avoid `Click here` / `Read more` — link text MUST describe the destination for both screen readers and search engines.
5. **Mobile-friendliness**: Every page MUST render correctly at 360px viewport width. Lighthouse mobile audit is the gate.
6. **HTTPS only**: All internal and outbound links MUST use `https://`. Mixed content is a Lighthouse Best Practices fail.
7. **Sitemap freshness**: When adding/removing routes, `src/app/sitemap.ts` MUST be updated in the SAME PR. CI should fail if a route exists but isn't in the sitemap (or vice versa).

## Lighthouse CI budget targets (proposed)

```json
{
  "ci": {
    "assert": {
      "assertions": {
        "categories:performance": ["error", { "minScore": 0.9 }],
        "categories:accessibility": ["error", { "minScore": 0.95 }],
        "categories:best-practices": ["error", { "minScore": 0.95 }],
        "categories:seo": ["error", { "minScore": 0.95 }]
      }
    }
  }
}
```

Tighter than the typical 0.9-everywhere because this is a marketing site (no auth-gated complexity, no legitimate reason for perf hits) and SEO is business-critical.
