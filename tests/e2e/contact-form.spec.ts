import { test, expect } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";

test.describe("Contact form — visibility, validation, submit, a11y", () => {
  test("the form is visible inside the contact section", async ({ page }) => {
    await page.goto("/");
    const form = page.locator("section#contact form");
    await expect(form).toBeVisible();
  });

  test("each field has an associated label", async ({ page }) => {
    await page.goto("/");

    for (const labelText of [
      "Name",
      "Email",
      "Firm or organisation",
      "Message",
    ]) {
      const field = page.getByLabel(labelText, { exact: false }).first();
      await expect(field).toBeVisible();
    }
  });

  test("submitting empty form surfaces inline validation errors", async ({
    page,
  }) => {
    await page.goto("/");

    await page.getByRole("button", { name: /send message/i }).click();

    // Errors are bound via aria-describedby; the messages must appear in the DOM.
    await expect(page.getByText(/name is required/i)).toBeVisible();
  });

  test("submitting valid data with intercepted POST shows success", async ({
    page,
  }) => {
    await page.route("**/contact", async (route) => {
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({ ok: true }),
      });
    });

    await page.goto("/");

    await page.getByLabel(/name/i).first().fill("Jane Doe");
    await page.getByLabel(/email/i).first().fill("jane@example.com");
    await page
      .getByLabel(/firm or organisation/i)
      .first()
      .fill("Doe & Co Solicitors");
    await page
      .getByLabel(/^Message/i)
      .first()
      .fill("We'd like a CaseSift demo for our small firm please.");

    await page.getByRole("button", { name: /send message/i }).click();

    await expect(
      page.locator('form [role="alert"]').getByText(/^Thanks/i),
    ).toBeVisible();
  });

  test("axe-core scan of the contact section returns zero WCAG2AA violations", async ({
    page,
  }) => {
    await page.goto("/");

    const results = await new AxeBuilder({ page })
      .include("section#contact")
      .withTags(["wcag2a", "wcag2aa"])
      .analyze();

    expect(results.violations).toEqual([]);
  });
});
