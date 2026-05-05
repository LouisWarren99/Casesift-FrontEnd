import { test, expect } from "@playwright/test";

// All in-page anchor IDs that must resolve to real DOM elements.
const IN_PAGE_ANCHORS = [
  "features",
  "how-it-works",
  "case-types",
  "report-preview",
  "pricing",
  "testimonials",
  "trust",
  "faq",
  "contact",
];

test.describe("navigation — in-page anchors and external links", () => {
  test("all in-page anchor targets exist in the DOM", async ({ page }) => {
    await page.goto("/");

    for (const anchor of IN_PAGE_ANCHORS) {
      const element = page.locator(`#${anchor}`);
      // Positive case: each anchor target must exist
      await expect(element).toBeAttached();
    }
  });

  test("all external HTTP links use https:// (no insecure http)", async ({
    page,
  }) => {
    await page.goto("/");

    const externalLinks = await page
      .locator("a[href^='http']")
      .evaluateAll((anchors) =>
        anchors.map((a) => (a as HTMLAnchorElement).href)
      );

    const dedupedLinks = [...new Set(externalLinks)];

    // Skip mailto, tel, and calendly (we don't want to network-hit calendly)
    const httpLinks = dedupedLinks.filter(
      (href) =>
        !href.startsWith("mailto:") &&
        !href.startsWith("tel:") &&
        !href.includes("calendly.com")
    );

    for (const href of httpLinks) {
      // Negative case: must not have insecure http:// links
      expect(href).toMatch(/^https:\/\//);
    }
  });
});
