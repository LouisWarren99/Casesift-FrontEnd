import { test, expect } from "@playwright/test";

interface MetaTag {
  property: string | null;
  name: string | null;
  content: string | null;
}

test.describe("OG meta tags and robots meta — SEO invariants", () => {
  test("all required Open Graph and Twitter meta tags are present", async ({
    page,
  }) => {
    await page.goto("/");

    const metaTags = await page.locator("head meta").evaluateAll(
      (metas) =>
        metas.map((m) => ({
          property: m.getAttribute("property"),
          name: m.getAttribute("name"),
          content: m.getAttribute("content"),
        })) as MetaTag[]
    );

    const byProperty = (prop: string): MetaTag | undefined =>
      metaTags.find((m) => m.property === prop);

    const byName = (n: string): MetaTag | undefined =>
      metaTags.find((m) => m.name === n);

    // Open Graph required tags
    expect(byProperty("og:title")).toBeDefined();
    expect(byProperty("og:description")).toBeDefined();
    expect(byProperty("og:url")).toBeDefined();
    expect(byProperty("og:site_name")).toBeDefined();

    const ogLocale = byProperty("og:locale");
    expect(ogLocale).toBeDefined();
    expect(ogLocale?.content).toBe("en_GB");

    const ogType = byProperty("og:type");
    expect(ogType).toBeDefined();
    expect(ogType?.content).toBe("website");

    // Twitter card
    const twitterCard = byName("twitter:card");
    expect(twitterCard).toBeDefined();
    expect(twitterCard?.content).toBe("summary_large_image");

    // Negative case: robots meta must NOT contain noindex — load-bearing
    const robotsMeta = byName("robots");
    if (robotsMeta?.content) {
      expect(robotsMeta.content).not.toContain("noindex");
    }
  });
});
