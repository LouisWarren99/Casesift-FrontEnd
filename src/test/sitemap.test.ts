import { describe, it, expect } from "vitest";
import sitemapFn from "../app/sitemap";

const ALLOWED_CHANGE_FREQUENCIES = new Set([
  "always",
  "hourly",
  "daily",
  "weekly",
  "monthly",
  "yearly",
  "never",
]);

// Paths that must never appear in the sitemap (mirrors robots.ts disallow list).
// We check path segments, not substrings, to avoid false positives from URLs
// that contain a disallowed word as part of a domain name (e.g. "casesift" contains "cases").
const DISALLOWED_PATHS = [
  "/dashboard",
  "/cases",
  "/settings",
  "/sign-in",
  "/sign-up",
];

function urlContainsDisallowedPath(url: string, disallowedPath: string): boolean {
  try {
    const parsed = new URL(url);
    // Check if the pathname equals or starts with the disallowed path segment.
    // Add trailing slash to avoid partial-segment matches.
    const pathWithSlash =
      disallowedPath.endsWith("/") ? disallowedPath : disallowedPath + "/";
    return (
      parsed.pathname === disallowedPath ||
      parsed.pathname.startsWith(pathWithSlash)
    );
  } catch {
    // Fallback for malformed URLs: plain substring check on the path portion.
    return url.includes(disallowedPath + "/") || url.endsWith(disallowedPath);
  }
}

describe("sitemap — structure and SEO invariants", () => {
  const entries = sitemapFn();

  it("returns at least one entry", () => {
    expect(entries.length).toBeGreaterThanOrEqual(1);
  });

  it("every entry url starts with https://casesift.co.uk", () => {
    for (const entry of entries) {
      expect(entry.url).toMatch(/^https:\/\/casesift\.co\.uk/);
    }
  });

  it("every entry has a valid changeFrequency from the allowed set", () => {
    for (const entry of entries) {
      if (entry.changeFrequency !== undefined) {
        expect(ALLOWED_CHANGE_FREQUENCIES.has(entry.changeFrequency)).toBe(
          true
        );
      }
    }
  });

  it("every entry priority is a number in [0, 1]", () => {
    for (const entry of entries) {
      if (entry.priority !== undefined) {
        expect(typeof entry.priority).toBe("number");
        expect(entry.priority).toBeGreaterThanOrEqual(0);
        expect(entry.priority).toBeLessThanOrEqual(1);
      }
    }
  });

  it("no disallowed auth-area path appears in the sitemap", () => {
    for (const disallowed of DISALLOWED_PATHS) {
      const hasDisallowed = entries.some((entry) =>
        urlContainsDisallowedPath(entry.url, disallowed)
      );
      // Negative case: disallowed paths must not be present
      expect(hasDisallowed).toBe(false);
    }
  });
});
