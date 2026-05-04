import { describe, it, expect } from "vitest";
import { metadata } from "../app/layout";

// We serialize metadata to a plain object to sidestep Next.js's complex
// union types (Metadata["robots"], Metadata["twitter"], etc.) without
// resorting to `any` casts. The serialised values are what Next.js actually
// uses at runtime — the assertions here guard the runtime-visible state.
interface SerializedMetadata {
  title?: string;
  description?: string;
  metadataBase?: string;
  robots?: { index?: boolean; follow?: boolean };
  openGraph?: { locale?: string; type?: string };
  twitter?: { card?: string };
}

// metadataBase is a URL instance — special-case it before serialisation.
const metadataBase = metadata.metadataBase;
const serialized = JSON.parse(JSON.stringify(metadata)) as SerializedMetadata;

describe("layout metadata — SEO invariants", () => {
  it("metadataBase is a URL instance pointing at the production origin", () => {
    expect(metadataBase).toBeInstanceOf(URL);
    expect(metadataBase?.toString()).toBe("https://casesift.co.uk/");
  });

  it("title is a non-empty string", () => {
    expect(typeof serialized.title).toBe("string");
    expect(serialized.title).not.toBe("");
  });

  it("description is a non-empty string", () => {
    expect(typeof serialized.description).toBe("string");
    expect(serialized.description).not.toBe("");
  });

  it("robots.index is true — never noindex on production", () => {
    expect(serialized.robots).toBeDefined();
    // Positive case: must be true
    expect(serialized.robots?.index).toBe(true);
    // Negative case: must not be false
    expect(serialized.robots?.index).not.toBe(false);
  });

  it("openGraph locale is en_GB", () => {
    expect(serialized.openGraph).toBeDefined();
    expect(serialized.openGraph?.locale).toBe("en_GB");
  });

  it("openGraph type is website", () => {
    expect(serialized.openGraph?.type).toBe("website");
  });

  it("twitter card is summary_large_image", () => {
    expect(serialized.twitter).toBeDefined();
    expect(serialized.twitter?.card).toBe("summary_large_image");
  });

  // Negative cases
  it("metadata.robots is defined (not undefined)", () => {
    expect(serialized.robots).not.toBeUndefined();
  });

  it("title is not undefined", () => {
    expect(serialized.title).not.toBeUndefined();
  });
});
