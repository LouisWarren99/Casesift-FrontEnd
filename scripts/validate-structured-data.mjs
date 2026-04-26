/**
 * validate-structured-data.mjs
 *
 * Reads the rendered HTML from http://localhost:3000/, extracts every
 * <script type="application/ld+json"> block, and validates:
 *   1. JSON parses without error.
 *   2. Each blob has @context and @type.
 *   3. The set of @type values includes Organization, WebSite, and WebPage.
 *   4. Each schema has the minimum required fields per schema.org.
 *
 * Usage (with server running): npm run validate:structured-data
 * Exit 0 = pass, Exit 1 = failure with human-readable message.
 */

const TARGET_URL = "http://localhost:3000/";
const FETCH_TIMEOUT_MS = 30_000;
const REQUIRED_SCHEMA_TYPES = ["Organization", "WebSite", "WebPage"];

/** Minimum required fields per @type (schema.org MinimalRequiredProperties). */
const MINIMUM_REQUIRED_FIELDS = {
  Organization: ["name", "url"],
  WebSite: ["name", "url"],
  WebPage: ["name", "url"],
};

/**
 * Fetches the page HTML with a timeout.
 * @returns {Promise<string>} The raw HTML body.
 */
async function fetchPageHtml() {
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
 * Extracts JSON-LD blobs from HTML by finding all
 * <script type="application/ld+json"> blocks.
 * @param {string} html
 * @returns {string[]} Array of raw JSON strings.
 */
function extractJsonLdBlocks(html) {
  const pattern = /<script[^>]+type=["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/gi;
  const blocks = [];
  let match;
  while ((match = pattern.exec(html)) !== null) {
    blocks.push(match[1].trim());
  }
  return blocks;
}

/**
 * Validates a single parsed JSON-LD object for presence of required fields.
 * @param {Record<string, unknown>} schema
 * @param {number} index
 * @returns {string[]} Array of error messages (empty = valid).
 */
function validateSchemaObject(schema, index) {
  const errors = [];
  const label = `Schema[${index}]`;

  if (typeof schema["@context"] !== "string") {
    errors.push(`${label}: missing "@context" string`);
  } else if (!schema["@context"].includes("schema.org")) {
    errors.push(`${label}: "@context" should reference schema.org, got "${schema["@context"]}"`);
  }

  const schemaType = schema["@type"];
  if (typeof schemaType !== "string") {
    errors.push(`${label}: missing "@type" string`);
    return errors;
  }

  const requiredFields = MINIMUM_REQUIRED_FIELDS[schemaType];
  if (requiredFields) {
    for (const field of requiredFields) {
      if (!schema[field]) {
        errors.push(`${label} (@type: ${schemaType}): missing required field "${field}"`);
      }
    }
  }

  return errors;
}

async function main() {
  console.log(`Fetching ${TARGET_URL}...`);
  let html;

  try {
    html = await fetchPageHtml();
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    console.error(`FAIL: Could not fetch page — ${message}`);
    console.error("Ensure the server is running: npm run build && npm run start");
    process.exit(1);
  }

  const rawBlocks = extractJsonLdBlocks(html);

  if (rawBlocks.length === 0) {
    console.error("FAIL: No <script type=\"application/ld+json\"> blocks found in the page HTML.");
    process.exit(1);
  }

  console.log(`Found ${rawBlocks.length} JSON-LD block(s). Validating...`);

  const parsedSchemas = [];
  const allErrors = [];

  for (let i = 0; i < rawBlocks.length; i++) {
    let parsed;
    try {
      parsed = JSON.parse(rawBlocks[i]);
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      allErrors.push(`Schema[${i}]: JSON parse error — ${message}`);
      continue;
    }
    parsedSchemas.push(parsed);
    allErrors.push(...validateSchemaObject(parsed, i));
  }

  const foundTypes = parsedSchemas
    .map((s) => s["@type"])
    .filter((t) => typeof t === "string");

  for (const requiredType of REQUIRED_SCHEMA_TYPES) {
    if (!foundTypes.includes(requiredType)) {
      allErrors.push(`Missing required @type "${requiredType}" — expected Organization, WebSite, and WebPage`);
    }
  }

  if (allErrors.length > 0) {
    console.error("FAIL: Structured data validation errors:");
    for (const error of allErrors) {
      console.error(`  • ${error}`);
    }
    process.exit(1);
  }

  console.log(`PASS: All ${parsedSchemas.length} JSON-LD schema(s) valid.`);
  console.log(`  @types found: ${foundTypes.join(", ")}`);
}

main();
