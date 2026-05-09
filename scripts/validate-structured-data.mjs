/**
 * validate-structured-data.mjs
 *
 * Reads the rendered HTML from http://localhost:3000/, extracts every
 * <script type="application/ld+json"> block, and validates:
 *   1. JSON parses without error.
 *   2. Each blob has @context and @type.
 *   3. The set of @type values includes Organization, WebSite, and WebPage.
 *   4. Each schema has the minimum required fields per schema.org (including @id).
 *   5. @id values use the expected fragment suffix convention (#organization, #website, #webpage).
 *   6. Cross-references are consistent (WebSite.publisher["@id"] === Organization["@id"],
 *      WebPage.isPartOf["@id"] === WebSite["@id"]).
 *
 * Usage (with server running): npm run validate:structured-data
 * Exit 0 = pass, Exit 1 = failure with human-readable message.
 */

const TARGET_URL = "http://localhost:3000/";
const FETCH_TIMEOUT_MS = 30_000;
const REQUIRED_SCHEMA_TYPES = ["Organization", "WebSite", "WebPage"];

/** Minimum required fields per @type (schema.org MinimalRequiredProperties + @id convention). */
const MINIMUM_REQUIRED_FIELDS = {
  Organization: ["name", "url", "@id"],
  WebSite: ["name", "url", "@id"],
  WebPage: ["name", "url", "@id"],
};

/**
 * Expected @id fragment suffix per @type (convention established in layout-schemas.ts).
 * The validator checks the fragment suffix, not the full URL prefix, so it remains
 * resilient to hostname changes (e.g. staging vs production).
 */
const EXPECTED_ID_SUFFIX = {
  Organization: "#organization",
  WebSite: "#website",
  WebPage: "#webpage",
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
export function extractJsonLdBlocks(html) {
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
export function validateSchemaObject(schema, index) {
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

/**
 * Validates @id field values and cross-reference consistency across all parsed schemas.
 *
 * Checks performed:
 *  1. Each schema with a known @type has an @id string value.
 *  2. @id values end with the expected fragment suffix per EXPECTED_ID_SUFFIX.
 *  3. WebSite.publisher["@id"] === Organization["@id"] (WebSite published by Organization).
 *  4. WebPage.isPartOf["@id"] === WebSite["@id"] (WebPage belongs to WebSite).
 *
 * @param {Record<string, unknown>[]} parsedSchemas
 * @returns {string[]} Array of error messages (empty = valid).
 */
export function validateCrossReferences(parsedSchemas) {
  const errors = [];

  /** @type {Record<string, Record<string, unknown>>} */
  const schemasByType = {};
  for (const schema of parsedSchemas) {
    const schemaType = schema["@type"];
    if (typeof schemaType === "string" && EXPECTED_ID_SUFFIX[schemaType] !== undefined) {
      schemasByType[schemaType] = schema;
    }
  }

  // Check @id presence and fragment suffix for each known type.
  for (const [schemaType, schema] of Object.entries(schemasByType)) {
    const idValue = schema["@id"];
    if (typeof idValue !== "string" || idValue.length === 0) {
      errors.push(`${schemaType}: "@id" must be a non-empty string`);
      continue;
    }
    const expectedSuffix = EXPECTED_ID_SUFFIX[schemaType];
    if (!idValue.endsWith(expectedSuffix)) {
      errors.push(
        `${schemaType}: "@id" value "${idValue}" does not end with expected suffix "${expectedSuffix}"`,
      );
    }
  }

  // Cross-reference: WebSite.publisher["@id"] must equal Organization["@id"].
  const organization = schemasByType["Organization"];
  const webSite = schemasByType["WebSite"];
  const webPage = schemasByType["WebPage"];

  if (organization && webSite) {
    const orgId = organization["@id"];
    const publisher = webSite["publisher"];
    if (
      typeof publisher !== "object" ||
      publisher === null ||
      typeof publisher["@id"] !== "string"
    ) {
      errors.push(
        'WebSite: "publisher" must be an object with an "@id" string field for cross-reference validation',
      );
    } else if (publisher["@id"] !== orgId) {
      errors.push(
        `WebSite.publisher["@id"] ("${publisher["@id"]}") does not match Organization["@id"] ("${orgId}") — cross-reference inconsistent`,
      );
    }
  }

  // Cross-reference: WebPage.isPartOf["@id"] must equal WebSite["@id"].
  if (webSite && webPage) {
    const webSiteId = webSite["@id"];
    const isPartOf = webPage["isPartOf"];
    if (
      typeof isPartOf !== "object" ||
      isPartOf === null ||
      typeof isPartOf["@id"] !== "string"
    ) {
      errors.push(
        'WebPage: "isPartOf" must be an object with an "@id" string field for cross-reference validation',
      );
    } else if (isPartOf["@id"] !== webSiteId) {
      errors.push(
        `WebPage.isPartOf["@id"] ("${isPartOf["@id"]}") does not match WebSite["@id"] ("${webSiteId}") — cross-reference inconsistent`,
      );
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

  // Validate @id field values and cross-reference consistency.
  allErrors.push(...validateCrossReferences(parsedSchemas));

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

// Only run when executed directly (not when imported for testing).
const isDirectRun =
  process.argv[1] &&
  import.meta.url.includes(process.argv[1].replace(/\\/g, "/").split("/").pop());
if (isDirectRun) {
  main();
}
