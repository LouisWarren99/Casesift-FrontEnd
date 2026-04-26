import type { Metadata } from "next";
import { Toaster } from "sonner";
import type { WithContext, Organization, WebSite, WebPage } from "schema-dts";

import "./globals.css";

const SITE_URL = "https://casesift.co.uk";
const SITE_NAME = "CaseSift";
const ORGANIZATION_ID = `${SITE_URL}#organization`;
const WEBSITE_ID = `${SITE_URL}#website`;

const organizationSchema: WithContext<Organization> = {
  "@context": "https://schema.org",
  "@type": "Organization",
  "@id": ORGANIZATION_ID,
  name: SITE_NAME,
  url: SITE_URL,
  legalName: "CaseSift Ltd.",
  email: "info@casesift.co.uk",
  address: {
    "@type": "PostalAddress",
    addressCountry: "GB",
  },
  contactPoint: {
    "@type": "ContactPoint",
    contactType: "customer service",
    email: "info@casesift.co.uk",
    availableLanguage: "en-GB",
  },
};

const websiteSchema: WithContext<WebSite> = {
  "@context": "https://schema.org",
  "@type": "WebSite",
  "@id": WEBSITE_ID,
  name: SITE_NAME,
  url: SITE_URL,
  inLanguage: "en-GB",
  publisher: { "@id": ORGANIZATION_ID },
};

const webpageSchema: WithContext<WebPage> = {
  "@context": "https://schema.org",
  "@type": "WebPage",
  "@id": `${SITE_URL}#webpage`,
  name: "CaseSift — AI Case Assessment for UK Solicitors",
  url: SITE_URL,
  description:
    "AI-powered case assessment for UK solicitors. Upload evidence, receive predicted outcomes, estimated damages, and CFA take-on recommendations within hours. Screen cases faster, reduce risk, free up your team.",
  inLanguage: "en-GB",
  isPartOf: { "@id": WEBSITE_ID },
};

export const metadata: Metadata = {
  title: "CaseSift — AI Case Assessment for UK Solicitors",
  description:
    "AI-powered case assessment for UK solicitors. Upload evidence, receive predicted outcomes, estimated damages, and CFA take-on recommendations within hours. Screen cases faster, reduce risk, free up your team.",
  keywords: [
    "CaseSift",
    "legal case assessment",
    "AI legal tech",
    "UK solicitors",
    "case screening",
    "CFA assessment",
    "no win no fee",
    "conditional fee agreement",
    "personal injury",
    "clinical negligence",
    "case outcome prediction",
    "legal AI",
    "solicitor tools",
  ],
  metadataBase: new URL("https://casesift.co.uk"),
  openGraph: {
    title: "CaseSift — AI Case Assessment for UK Solicitors",
    description:
      "Upload evidence, receive predicted outcomes and CFA recommendations within hours. Screen cases faster and reduce risk.",
    url: "https://casesift.co.uk",
    siteName: "CaseSift",
    locale: "en_GB",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "CaseSift — AI Case Assessment for UK Solicitors",
    description:
      "Upload evidence, receive predicted outcomes and CFA recommendations within hours.",
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="min-h-screen antialiased">
        {/* JSON-LD structured data — plain <script> tags ensure SSR inclusion
            regardless of static vs dynamic rendering mode. Content is constant
            from typed objects — no user input. */}
        {/* JSON-LD content is constant from typed object — no user input */}
        <script
          id="ld-organization"
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationSchema) }}
        />
        {/* JSON-LD content is constant from typed object — no user input */}
        <script
          id="ld-website"
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(websiteSchema) }}
        />
        {/* JSON-LD content is constant from typed object — no user input */}
        <script
          id="ld-webpage"
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(webpageSchema) }}
        />
        {children}
        <Toaster position="bottom-right" richColors />
      </body>
    </html>
  );
}
