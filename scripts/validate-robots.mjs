/**
 * validate-robots.mjs
 *
 * Reads http://localhost:3000/robots.txt and asserts:
 *   1. "Allow: /" is present.
 *   2. Each of /dashboard, /cases, /settings, /sign-in, /sign-up appears
 *      in a Disallow: rule (matches src/app/robots.ts).
 *   3. A "Sitemap:" directive is present pointing at the canonical sitemap URL.
 *
 * These five disallow paths are the exact set in src/app/robots.ts.
 * This test fails loudly if a future change drops one of them.
 *
 * Usage (with server running): npm run validate:robots
 * Exit 0 = pass, Exit 1 = failure with human-readable message.
 */

const TARGET_URL = "http://localhost:3000/robots.txt";
const FETCH_TIMEOUT_MS = 30_000;
const EXPECTED_SITEMAP_URL = "https://casesift.co.uk/sitemap.xml";

/** Paths that MUST appear in a Disallow: rule (sourced from src/app/robots.ts). */
const REQUIRED_DISALLOW_PATHS = [
  "/dashboard",
  "/cases",
  "/settings",
  "/sign-in",
  "/sign-up",
];

/**
 * Fetches robots.txt with a timeout.
 * @returns {Promise<string>} The robots.txt text content.
 */
async function fetchRobotsTxt() {
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

async function main() {
  console.log(`Fetching ${TARGET_URL}...`);
  let content;

  try {
    content = await fetchRobotsTxt();
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    console.error(`FAIL: Could not fetch robots.txt — ${message}`);
    console.error("Ensure the server is running: npm run build && npm run start");
    process.exit(1);
  }

  const lines = content.split("\n").map((l) => l.trim());
  const errors = [];

  // Check 1: Allow: / is present.
  const hasAllowRoot = lines.some((l) => l === "Allow: /");
  if (!hasAllowRoot) {
    errors.push('Missing "Allow: /" directive in robots.txt');
  }

  // Check 2: Each required disallow path is present.
  const disallowLines = lines
    .filter((l) => l.startsWith("Disallow:"))
    .map((l) => l.slice("Disallow:".length).trim());

  for (const path of REQUIRED_DISALLOW_PATHS) {
    if (!disallowLines.includes(path)) {
      errors.push(`Missing required "Disallow: ${path}" rule in robots.txt`);
    }
  }

  // Check 3: Sitemap directive is present and correct.
  const sitemapLines = lines
    .filter((l) => l.startsWith("Sitemap:"))
    .map((l) => l.slice("Sitemap:".length).trim());

  if (sitemapLines.length === 0) {
    errors.push('Missing "Sitemap:" directive in robots.txt');
  } else if (!sitemapLines.includes(EXPECTED_SITEMAP_URL)) {
    errors.push(
      `Sitemap URL mismatch. Expected "${EXPECTED_SITEMAP_URL}", got: ${sitemapLines.join(", ")}`
    );
  }

  if (errors.length > 0) {
    console.error("FAIL: robots.txt validation errors:");
    for (const error of errors) {
      console.error(`  • ${error}`);
    }
    process.exit(1);
  }

  console.log("PASS: robots.txt is valid.");
  console.log(`  Disallow paths confirmed: ${REQUIRED_DISALLOW_PATHS.join(", ")}`);
  console.log(`  Sitemap confirmed: ${EXPECTED_SITEMAP_URL}`);
}

main();
