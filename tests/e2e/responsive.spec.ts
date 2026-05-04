import { test, expect } from "@playwright/test";

const VIEWPORTS = [
  { name: "mobile (iPhone SE)", width: 375, height: 667 },
  { name: "laptop", width: 1280, height: 720 },
];

for (const viewport of VIEWPORTS) {
  test.describe(`responsive layout — ${viewport.name} (${viewport.width}×${viewport.height})`, () => {
    test.use({ viewport: { width: viewport.width, height: viewport.height } });

    test("nav is visible", async ({ page }) => {
      await page.goto("/");
      const nav = page.locator("nav").first();
      await expect(nav).toBeVisible();
    });

    test("hero h1 is visible", async ({ page }) => {
      await page.goto("/");
      const heading = page.locator("h1").first();
      await expect(heading).toBeVisible();
    });

    test("contact section is visible", async ({ page }) => {
      await page.goto("/");
      const contactSection = page.locator("section#contact");
      await expect(contactSection).toBeVisible();
    });

    test("no horizontal scroll (scrollWidth <= clientWidth + 1px tolerance)", async ({
      page,
    }) => {
      await page.goto("/");

      const hasHorizontalScroll = await page.evaluate(() => {
        return (
          document.documentElement.scrollWidth >
          document.documentElement.clientWidth + 1
        );
      });

      // Negative case: must not overflow horizontally
      expect(hasHorizontalScroll).toBe(false);
    });
  });
}
