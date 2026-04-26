import type { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: ["/dashboard", "/cases", "/settings", "/sign-in", "/sign-up"],
    },
    sitemap: "https://casesift.co.uk/sitemap.xml",
  };
}
