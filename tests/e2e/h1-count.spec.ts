import { test, expect } from "@playwright/test";

test.describe("h1 count — heading hierarchy invariant", () => {
  test("homepage has exactly one h1", async ({ page }) => {
    await page.goto("/");
    const h1Count = await page.locator("h1").count();
    expect(h1Count).toBe(1);
  });

  test("404 route has exactly one h1 (not-found.tsx regression guard)", async ({
    page,
  }) => {
    await page.goto("/not-found-route-12345");
    const h1Count = await page.locator("h1").count();
    // Positive case: not-found.tsx must render exactly one h1
    expect(h1Count).toBe(1);
  });

  // Negative case: homepage must not have zero h1 elements
  test("homepage does not have zero h1 elements", async ({ page }) => {
    await page.goto("/");
    const h1Count = await page.locator("h1").count();
    expect(h1Count).not.toBe(0);
  });
});
