import { describe, it, expect } from "vitest";
import {
  organizationSchema,
  websiteSchema,
  webpageSchema,
  ORGANIZATION_ID,
  WEBSITE_ID,
  WEBPAGE_ID,
} from "../app/layout-schemas";

// Type guard helpers — avoid `any` / bracket-index hacks while keeping strict mode.
// We serialize the typed schema objects to plain JSON records for assertion.
interface JsonLdRecord {
  "@context"?: string;
  "@type"?: string;
  "@id"?: string;
  name?: string;
  description?: string;
  publisher?: { "@id"?: string };
  isPartOf?: { "@id"?: string };
}

function toRecord(value: unknown): JsonLdRecord {
  return JSON.parse(JSON.stringify(value)) as JsonLdRecord;
}

describe("JSON-LD schema objects — structure and @id chain invariants", () => {
  describe("organizationSchema", () => {
    const org = toRecord(organizationSchema);

    it("has @type Organization", () => {
      expect(org["@type"]).toBe("Organization");
    });

    it("has @context https://schema.org", () => {
      expect(org["@context"]).toBe("https://schema.org");
    });

    it("@id matches the canonical ORGANIZATION_ID constant", () => {
      expect(org["@id"]).toBe(ORGANIZATION_ID);
    });

    it("has a non-empty name", () => {
      expect(typeof org.name).toBe("string");
      expect(org.name).not.toBe("");
    });

    // Negative case
    it("@id is not empty string", () => {
      expect(org["@id"]).not.toBe("");
    });
  });

  describe("websiteSchema", () => {
    const site = toRecord(websiteSchema);

    it("has @type WebSite", () => {
      expect(site["@type"]).toBe("WebSite");
    });

    it("@id matches the canonical WEBSITE_ID constant", () => {
      expect(site["@id"]).toBe(WEBSITE_ID);
    });

    it("publisher @id cross-references the Organization @id", () => {
      expect(site.publisher?.["@id"]).toBe(ORGANIZATION_ID);
    });

    // Negative case
    it("publisher @id is not the WebSite @id (no self-reference)", () => {
      expect(site.publisher?.["@id"]).not.toBe(WEBSITE_ID);
    });
  });

  describe("webpageSchema", () => {
    const page = toRecord(webpageSchema);

    it("has @type WebPage", () => {
      expect(page["@type"]).toBe("WebPage");
    });

    it("@id matches the canonical WEBPAGE_ID constant", () => {
      expect(page["@id"]).toBe(WEBPAGE_ID);
    });

    it("isPartOf @id cross-references the WebSite @id — @id chain invariant", () => {
      expect(page.isPartOf?.["@id"]).toBe(WEBSITE_ID);
    });

    it("has a non-empty description", () => {
      expect(typeof page.description).toBe("string");
      expect(page.description).not.toBe("");
    });

    // Negative case
    it("isPartOf @id is not the Organization @id (correct chain level)", () => {
      expect(page.isPartOf?.["@id"]).not.toBe(ORGANIZATION_ID);
    });
  });
});
