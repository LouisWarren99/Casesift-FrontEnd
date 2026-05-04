import { test, expect } from "@playwright/test";

test.describe("contact CTA — visibility, keyboard accessibility, security", () => {
  test("contact section is visible", async ({ page }) => {
    await page.goto("/");
    const contactSection = page.locator("section#contact");
    await expect(contactSection).toBeVisible();
  });

  test("mailto:info@casesift.co.uk link is keyboard-focusable", async ({
    page,
  }) => {
    await page.goto("/");

    // Locate the email link directly and use focus() — more reliable than Tab-walking
    // the entire page which varies by browser / OS focus policy.
    const emailLink = page
      .locator('a[href^="mailto:info@casesift.co.uk"]')
      .first();
    await expect(emailLink).toBeVisible();

    await emailLink.focus();
    await expect(emailLink).toBeFocused();
  });

  test("Calendly link has target=_blank and rel containing noopener and noreferrer", async ({
    page,
  }) => {
    await page.goto("/");

    const calendlyLinks = page.locator('a[href="https://calendly.com/casesift"]');
    const count = await calendlyLinks.count();
    expect(count).toBeGreaterThanOrEqual(1);

    for (let i = 0; i < count; i++) {
      const link = calendlyLinks.nth(i);
      const target = await link.getAttribute("target");
      const rel = await link.getAttribute("rel");

      // Positive case: must have _blank
      expect(target).toBe("_blank");

      // Positive case: rel must contain both noopener and noreferrer
      expect(rel).toContain("noopener");
      expect(rel).toContain("noreferrer");
    }
  });

  // Negative case: contact section must not be hidden
  test("contact section is not hidden (no display:none or visibility:hidden)", async ({
    page,
  }) => {
    await page.goto("/");
    const contactSection = page.locator("section#contact");
    await expect(contactSection).not.toBeHidden();
  });
});
