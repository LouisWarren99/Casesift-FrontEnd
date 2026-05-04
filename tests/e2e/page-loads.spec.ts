import { test, expect } from "@playwright/test";

test.describe("page loads — basic availability", () => {
  test("homepage returns HTTP 200", async ({ page }) => {
    const consoleErrors: string[] = [];
    const pageErrors: Error[] = [];

    page.on("console", (msg) => {
      if (msg.type() === "error") {
        consoleErrors.push(msg.text());
      }
    });

    page.on("pageerror", (error) => {
      pageErrors.push(error);
    });

    const response = await page.goto("/");

    expect(response?.status()).toBe(200);

    // Negative case: no console errors during page load
    expect(consoleErrors).toHaveLength(0);

    // Negative case: no uncaught JS errors
    expect(pageErrors).toHaveLength(0);
  });
});
