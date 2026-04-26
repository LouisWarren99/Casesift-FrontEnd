/**
 * validate-sitemap.mjs
 *
 * Reads http://localhost:3000/sitemap.xml and asserts:
 *   1. The XML contains a <urlset> element with the canonical namespace.
 *   2. At least one <url> entry exists.
 *   3. Every <loc> value is an absolute https://casesift.co.uk URL.
 *   4. None of the disallow paths from src/app/robots.ts appear in any <loc>.
 *
 * Check 4 enforces the invariant from seo.md § Ranking-Critical Rules § 7:
 * disallowed paths must NOT appear in the sitemap.
 *
 * Uses regex-based parsing to avoid a DOM/XML parser dependency.
 *
 * Usage (with server running): npm run validate:sitemap
 * Exit 0 = pass, Exit 1 = failure with human-readable message.
 */

const TARGET_URL = "http://localhost:3000/sitemap.xml";
const FETCH_TIMEOUT_MS = 30_000;
const EXPECTED_SITEMAP_NS = "http://www.sitemaps.org/schemas/sitemap/0.9";
const EXPECTED_HOST = "casesift.co.uk";
const EXPECTED_PROTOCOL = "https://";

/** Paths that MUST NOT appear in any <loc> (sourced from src/app/robots.ts). */
const DISALLOWED_PATHS = [
  "/dashboard",
  "/cases",
  "/settings",
  "/sign-in",
  "/sign-up",
];

/**
 * Fetches sitemap.xml with a timeout.
 * @returns {Promise<string>} The raw XML string.
 */
async function fetchSitemapXml() {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), FETCH_TIMEOUT_MS);

  try {
    const response = await fetch(TARGET_URL, { signal: controller.signal });
    if (!response.ok) {
      throw new Error(`HTTP ${response.status} from ${TARGET_URL}`);
    }
    return await response.text();
  } finally {
    clearTimeout(timeoutId);
  }
}

/**
 * Extracts all <loc> values from an XML string.
 * @param {string} xml
 * @returns {string[]}
 */
function extractLocValues(xml) {
  const pattern = /<loc>([\s\S]*?)<\/loc>/gi;
  const locs = [];
  let match;
  while ((match = pattern.exec(xml)) !== null) {
    locs.push(match[1].trim());
  }
  return locs;
}

async function main() {
  console.log(`Fetching ${TARGET_URL}...`);
  let xml;

  try {
    xml = await fetchSitemapXml();
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    console.error(`FAIL: Could not fetch sitemap.xml — ${message}`);
    console.error("Ensure the server is running: npm run build && npm run start");
    process.exit(1);
  }

  const errors = [];

  // Check 1: <urlset> with the canonical namespace is present.
  if (!xml.includes(EXPECTED_SITEMAP_NS)) {
    errors.push(
      `Missing expected <urlset> namespace "${EXPECTED_SITEMAP_NS}" in sitemap.xml`
    );
  }

  const locs = extractLocValues(xml);

  // Check 2: At least one <url> entry exists.
  if (locs.length === 0) {
    errors.push("No <loc> entries found in sitemap.xml — sitemap appears to be empty");
  }

  for (const loc of locs) {
    // Check 3: Every <loc> is an absolute https://casesift.co.uk URL.
    if (!loc.startsWith(EXPECTED_PROTOCOL)) {
      errors.push(`<loc> is not an https:// URL: "${loc}"`);
    } else {
      try {
        const parsed = new URL(loc);
        if (parsed.hostname !== EXPECTED_HOST) {
          errors.push(
            `<loc> hostname mismatch — expected "${EXPECTED_HOST}", got "${parsed.hostname}": "${loc}"`
          );
        }

        // Check 4: Disallowed paths must not appear in any <loc>.
        for (const disallowedPath of DISALLOWED_PATHS) {
          if (parsed.pathname === disallowedPath || parsed.pathname.startsWith(disallowedPath + "/")) {
            errors.push(
              `<loc> "${loc}" contains a disallowed path "${disallowedPath}" — ` +
              "disallowed paths from robots.ts must not appear in sitemap.xml"
            );
          }
        }
      } catch {
        errors.push(`<loc> is not a valid URL: "${loc}"`);
      }
    }
  }

  if (errors.length > 0) {
    console.error("FAIL: sitemap.xml validation errors:");
    for (const error of errors) {
      console.error(`  • ${error}`);
    }
    process.exit(1);
  }

  console.log(`PASS: sitemap.xml is valid. ${locs.length} <loc> entry/entries found.`);
  for (const loc of locs) {
    console.log(`  ${loc}`);
  }
}

main();
