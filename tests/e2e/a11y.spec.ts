import { test, expect } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";

test.describe("WCAG2AA accessibility (axe-core scan)", () => {
  test("homepage has zero WCAG2AA violations", async ({ page }) => {
    // Emulate reduced-motion preference so the globals.css rule disables animations.
    await page.emulateMedia({ reducedMotion: "reduce" });
    await page.goto("/");

    // Freeze all animations and transitions so axe evaluates final rendered colours.
    // The hero section uses inline-style `animation: fade-in-up … 0.3s both` which
    // starts at opacity 0 during the delay; `!important` in a stylesheet beats a
    // non-!important inline style, so this correctly overrides them.
    // We also force scroll-reveal (reveal-hidden) elements to full opacity.
    await page.addStyleTag({
      content: `
        *, *::before, *::after {
          animation: none !important;
          transition: none !important;
        }
        .reveal-hidden {
          opacity: 1 !important;
          transform: none !important;
        }
      `,
    });
    // Two rAF cycles so Chromium repaints with the injected style before axe samples.
    await page.evaluate(
      () =>
        new Promise<void>((resolve) =>
          requestAnimationFrame(() => requestAnimationFrame(() => resolve())),
        ),
    );

    const results = await new AxeBuilder({ page })
      .withTags(["wcag2a", "wcag2aa"])
      .analyze();

    expect(results.violations).toEqual([]);
  });
});
