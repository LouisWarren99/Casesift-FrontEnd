import { describe, it, expect } from "vitest";
import {
  extractJsonLdBlocks,
  validateSchemaObject,
  validateCrossReferences,
} from "../../scripts/validate-structured-data.mjs";

// ---------------------------------------------------------------------------
// extractJsonLdBlocks
// ---------------------------------------------------------------------------

describe("extractJsonLdBlocks", () => {
  it("extracts a single JSON-LD block from HTML", () => {
    const html = `
      <html><head></head><body>
        <script type="application/ld+json">{"@type":"Organization"}</script>
      </body></html>`;
    const blocks = extractJsonLdBlocks(html);
    expect(blocks).toHaveLength(1);
    expect(JSON.parse(blocks[0])).toEqual({ "@type": "Organization" });
  });

  it("extracts multiple JSON-LD blocks", () => {
    const html = `
      <script type="application/ld+json">{"@type":"Organization"}</script>
      <script type="application/ld+json">{"@type":"WebSite"}</script>
      <script type='application/ld+json'>{"@type":"WebPage"}</script>`;
    const blocks = extractJsonLdBlocks(html);
    expect(blocks).toHaveLength(3);
  });

  it("returns empty array when no JSON-LD blocks exist", () => {
    const html = `<html><body><script>console.log("hi")</script></body></html>`;
    expect(extractJsonLdBlocks(html)).toEqual([]);
  });

  it("handles blocks with extra attributes on the script tag", () => {
    const html = `<script id="ld-org" type="application/ld+json" data-x="1">{"@type":"Organization"}</script>`;
    const blocks = extractJsonLdBlocks(html);
    expect(blocks).toHaveLength(1);
  });
});

// ---------------------------------------------------------------------------
// validateSchemaObject
// ---------------------------------------------------------------------------

describe("validateSchemaObject", () => {
  it("returns no errors for a valid Organization schema", () => {
    const schema = {
      "@context": "https://schema.org",
      "@type": "Organization",
      "@id": "https://example.com#organization",
      name: "Acme",
      url: "https://example.com",
    };
    expect(validateSchemaObject(schema, 0)).toEqual([]);
  });

  it("reports missing @context", () => {
    const schema = { "@type": "Organization", name: "Acme", url: "https://example.com", "@id": "x" };
    const errors = validateSchemaObject(schema, 0);
    expect(errors.some((e: string) => e.includes("@context"))).toBe(true);
  });

  it("reports @context that does not reference schema.org", () => {
    const schema = {
      "@context": "https://not-schema.example.com",
      "@type": "Organization",
      name: "Acme",
      url: "https://example.com",
      "@id": "x",
    };
    const errors = validateSchemaObject(schema, 0);
    expect(errors.some((e: string) => e.includes("schema.org"))).toBe(true);
  });

  it("reports missing @type", () => {
    const schema = { "@context": "https://schema.org", name: "Acme" };
    const errors = validateSchemaObject(schema, 0);
    expect(errors.some((e: string) => e.includes("@type"))).toBe(true);
  });

  it("reports missing required fields for Organization", () => {
    const schema = {
      "@context": "https://schema.org",
      "@type": "Organization",
    };
    const errors = validateSchemaObject(schema, 0);
    expect(errors.some((e: string) => e.includes('"name"'))).toBe(true);
    expect(errors.some((e: string) => e.includes('"url"'))).toBe(true);
    expect(errors.some((e: string) => e.includes('"@id"'))).toBe(true);
  });

  it("passes for unknown @type without required-field check", () => {
    const schema = {
      "@context": "https://schema.org",
      "@type": "Product",
      name: "Widget",
    };
    expect(validateSchemaObject(schema, 0)).toEqual([]);
  });
});

// ---------------------------------------------------------------------------
// validateCrossReferences
// ---------------------------------------------------------------------------

function makeValidSchemas() {
  return [
    {
      "@context": "https://schema.org",
      "@type": "Organization",
      "@id": "https://casesift.co.uk#organization",
      name: "CaseSift",
      url: "https://casesift.co.uk",
    },
    {
      "@context": "https://schema.org",
      "@type": "WebSite",
      "@id": "https://casesift.co.uk#website",
      name: "CaseSift",
      url: "https://casesift.co.uk",
      publisher: { "@id": "https://casesift.co.uk#organization" },
    },
    {
      "@context": "https://schema.org",
      "@type": "WebPage",
      "@id": "https://casesift.co.uk#webpage",
      name: "CaseSift Home",
      url: "https://casesift.co.uk",
      isPartOf: { "@id": "https://casesift.co.uk#website" },
    },
  ];
}

describe("validateCrossReferences", () => {
  it("returns no errors for valid cross-references", () => {
    expect(validateCrossReferences(makeValidSchemas())).toEqual([]);
  });

  it("reports wrong @id fragment suffix on Organization", () => {
    const schemas = makeValidSchemas();
    schemas[0]["@id"] = "https://casesift.co.uk#org"; // wrong suffix
    const errors = validateCrossReferences(schemas);
    expect(errors.some((e: string) => e.includes("#organization"))).toBe(true);
  });

  it("reports wrong @id fragment suffix on WebSite", () => {
    const schemas = makeValidSchemas();
    schemas[1]["@id"] = "https://casesift.co.uk#site";
    const errors = validateCrossReferences(schemas);
    expect(errors.some((e: string) => e.includes("#website"))).toBe(true);
  });

  it("reports wrong @id fragment suffix on WebPage", () => {
    const schemas = makeValidSchemas();
    schemas[2]["@id"] = "https://casesift.co.uk#page";
    const errors = validateCrossReferences(schemas);
    expect(errors.some((e: string) => e.includes("#webpage"))).toBe(true);
  });

  it("reports missing @id as non-empty string error", () => {
    const schemas = makeValidSchemas();
    delete schemas[0]["@id"];
    const errors = validateCrossReferences(schemas);
    expect(errors.some((e: string) => e.includes("non-empty string"))).toBe(true);
  });

  it("reports empty @id string", () => {
    const schemas = makeValidSchemas();
    schemas[0]["@id"] = "";
    const errors = validateCrossReferences(schemas);
    expect(errors.some((e: string) => e.includes("non-empty string"))).toBe(true);
  });

  // Cross-reference: WebSite.publisher["@id"] must match Organization["@id"]
  it("reports mismatched WebSite.publisher @id", () => {
    const schemas = makeValidSchemas();
    (schemas[1] as Record<string, unknown>).publisher = {
      "@id": "https://casesift.co.uk#wrong",
    };
    const errors = validateCrossReferences(schemas);
    expect(errors.some((e: string) => e.includes("cross-reference inconsistent"))).toBe(true);
    expect(errors.some((e: string) => e.includes("publisher"))).toBe(true);
  });

  it("reports missing publisher object on WebSite", () => {
    const schemas = makeValidSchemas();
    delete (schemas[1] as Record<string, unknown>).publisher;
    const errors = validateCrossReferences(schemas);
    expect(errors.some((e: string) => e.includes("publisher"))).toBe(true);
  });

  // Cross-reference: WebPage.isPartOf["@id"] must match WebSite["@id"]
  it("reports mismatched WebPage.isPartOf @id", () => {
    const schemas = makeValidSchemas();
    (schemas[2] as Record<string, unknown>).isPartOf = {
      "@id": "https://casesift.co.uk#wrong",
    };
    const errors = validateCrossReferences(schemas);
    expect(errors.some((e: string) => e.includes("cross-reference inconsistent"))).toBe(true);
    expect(errors.some((e: string) => e.includes("isPartOf"))).toBe(true);
  });

  it("reports missing isPartOf object on WebPage", () => {
    const schemas = makeValidSchemas();
    delete (schemas[2] as Record<string, unknown>).isPartOf;
    const errors = validateCrossReferences(schemas);
    expect(errors.some((e: string) => e.includes("isPartOf"))).toBe(true);
  });

  // Edge case: schemas array with unknown types only — should return no errors
  it("returns no errors when only unknown types are present", () => {
    const schemas = [
      { "@type": "Product", "@id": "https://example.com#product" },
    ];
    expect(validateCrossReferences(schemas)).toEqual([]);
  });

  // Edge case: partial set (only Organization, no WebSite/WebPage)
  it("skips cross-reference checks when WebSite is missing", () => {
    const schemas = [makeValidSchemas()[0]]; // Organization only
    expect(validateCrossReferences(schemas)).toEqual([]);
  });
});
