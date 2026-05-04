import { describe, it, expect } from "vitest";
import robotsFn from "../app/robots";

// The five auth-area paths that MUST always be disallowed — load-bearing invariant.
const REQUIRED_DISALLOW_PATHS = [
  "/dashboard",
  "/cases",
  "/settings",
  "/sign-in",
  "/sign-up",
];

describe("robots — crawl policy invariants", () => {
  const robotsConfig = robotsFn();
  const rules = Array.isArray(robotsConfig.rules)
    ? robotsConfig.rules[0]
    : robotsConfig.rules;

  it("userAgent is wildcard (*)", () => {
    expect(rules.userAgent).toBe("*");
  });

  it("allows root path (/)", () => {
    expect(rules.allow).toBe("/");
  });

  it("disallows all five auth-area paths — load-bearing invariant", () => {
    const disallowList = Array.isArray(rules.disallow)
      ? rules.disallow
      : rules.disallow
        ? [rules.disallow]
        : [];

    for (const required of REQUIRED_DISALLOW_PATHS) {
      expect(disallowList).toContain(required);
    }
  });

  it("sitemap URL ends with /sitemap.xml", () => {
    expect(robotsConfig.sitemap).toBeDefined();
    const sitemapUrl = Array.isArray(robotsConfig.sitemap)
      ? robotsConfig.sitemap[0]
      : robotsConfig.sitemap;
    expect(typeof sitemapUrl === "string" && sitemapUrl.endsWith("/sitemap.xml")).toBe(true);
  });

  // Negative case: must NOT allow the dashboard path
  it("does not allow /dashboard (must be disallowed)", () => {
    const allowList = Array.isArray(rules.allow)
      ? rules.allow
      : rules.allow
        ? [rules.allow]
        : [];
    expect(allowList).not.toContain("/dashboard");
  });
});
