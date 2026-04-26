/**
 * smoke.mjs
 *
 * Fast smoke check run by ci.yml after `npm run start &` + wait-on.
 * Asserts:
 *   1. Homepage returns HTTP 200, content-type text/html, body > 1000 bytes.
 *   2. /robots.txt returns HTTP 200, content-type starts with text/plain.
 *   3. /sitemap.xml returns HTTP 200, content-type is application/xml or text/xml.
 *   4. Homepage HTML contains <title> and <meta name="description">.
 *   5. Homepage HTML contains "application/ld+json" (JSON-LD sanity check).
 *
 * Usage (with server running): npm run smoke
 * Exit 0 = pass, Exit 1 = failure with human-readable message.
 */

const BASE_URL = "http://localhost:3000";
const FETCH_TIMEOUT_MS = 30_000;
const MINIMUM_BODY_LENGTH_BYTES = 1_000;

/**
 * Fetches a URL with a timeout and returns the response.
 * @param {string} url
 * @returns {Promise<Response>}
 */
async function fetchWithTimeout(url) {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), FETCH_TIMEOUT_MS);
  try {
    return await fetch(url, { signal: controller.signal });
  } finally {
    clearTimeout(timeoutId);
  }
}

/**
 * Asserts a condition, collecting the error message if it fails.
 * @param {boolean} condition
 * @param {string} message
 * @param {string[]} errors
 */
function assert(condition, message, errors) {
  if (!condition) {
    errors.push(message);
  }
}

async function checkHomepage(errors) {
  const url = `${BASE_URL}/`;
  let response;
  try {
    response = await fetchWithTimeout(url);
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    errors.push(`Homepage fetch failed: ${message}`);
    return;
  }

  assert(response.status === 200, `Homepage: expected HTTP 200, got ${response.status}`, errors);

  const contentType = response.headers.get("content-type") ?? "";
  assert(
    contentType.startsWith("text/html"),
    `Homepage: expected content-type text/html, got "${contentType}"`,
    errors
  );

  const body = await response.text();
  assert(
    body.length > MINIMUM_BODY_LENGTH_BYTES,
    `Homepage: body too short (${body.length} bytes < ${MINIMUM_BODY_LENGTH_BYTES}) — page may have collapsed`,
    errors
  );

  assert(
    /<title>/i.test(body),
    'Homepage: missing <title> tag — Next.js metadata export may be broken',
    errors
  );

  assert(
    /<meta\s[^>]*name=["']description["'][^>]*>/i.test(body),
    'Homepage: missing <meta name="description"> — Next.js metadata export may be broken',
    errors
  );

  assert(
    body.includes("application/ld+json"),
    'Homepage: missing "application/ld+json" — structured data (JSON-LD) not rendered in HTML',
    errors
  );
}

async function checkRobotsTxt(errors) {
  const url = `${BASE_URL}/robots.txt`;
  let response;
  try {
    response = await fetchWithTimeout(url);
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    errors.push(`robots.txt fetch failed: ${message}`);
    return;
  }

  assert(
    response.status === 200,
    `robots.txt: expected HTTP 200, got ${response.status}`,
    errors
  );

  const contentType = response.headers.get("content-type") ?? "";
  assert(
    contentType.startsWith("text/plain"),
    `robots.txt: expected content-type text/plain, got "${contentType}"`,
    errors
  );
}

async function checkSitemapXml(errors) {
  const url = `${BASE_URL}/sitemap.xml`;
  let response;
  try {
    response = await fetchWithTimeout(url);
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    errors.push(`sitemap.xml fetch failed: ${message}`);
    return;
  }

  assert(
    response.status === 200,
    `sitemap.xml: expected HTTP 200, got ${response.status}`,
    errors
  );

  const contentType = response.headers.get("content-type") ?? "";
  const isXmlContentType =
    contentType.startsWith("application/xml") || contentType.startsWith("text/xml");
  assert(
    isXmlContentType,
    `sitemap.xml: expected content-type application/xml or text/xml, got "${contentType}"`,
    errors
  );
}

async function main() {
  console.log(`Running smoke checks against ${BASE_URL}...`);

  const errors = [];

  await Promise.all([
    checkHomepage(errors),
    checkRobotsTxt(errors),
    checkSitemapXml(errors),
  ]);

  if (errors.length > 0) {
    console.error("FAIL: Smoke check errors:");
    for (const error of errors) {
      console.error(`  • ${error}`);
    }
    process.exit(1);
  }

  console.log("PASS: All smoke checks passed.");
  console.log("  ✓ Homepage: HTTP 200, text/html, >1000 bytes, <title>, <meta description>, JSON-LD present");
  console.log("  ✓ /robots.txt: HTTP 200, text/plain");
  console.log("  ✓ /sitemap.xml: HTTP 200, XML content-type");
}

main();
