import type { WithContext, Organization, WebSite, WebPage } from "schema-dts";

export const SITE_URL = "https://casesift.co.uk";
export const SITE_NAME = "CaseSift";
export const ORGANIZATION_ID = `${SITE_URL}#organization`;
export const WEBSITE_ID = `${SITE_URL}#website`;
export const WEBPAGE_ID = `${SITE_URL}#webpage`;

export const organizationSchema: WithContext<Organization> = {
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

export const websiteSchema: WithContext<WebSite> = {
  "@context": "https://schema.org",
  "@type": "WebSite",
  "@id": WEBSITE_ID,
  name: SITE_NAME,
  url: SITE_URL,
  inLanguage: "en-GB",
  publisher: { "@id": ORGANIZATION_ID },
};

export const webpageSchema: WithContext<WebPage> = {
  "@context": "https://schema.org",
  "@type": "WebPage",
  "@id": WEBPAGE_ID,
  name: "CaseSift — AI Case Assessment for UK Solicitors",
  url: SITE_URL,
  description:
    "AI-powered case assessment for UK solicitors. Upload evidence, receive predicted outcomes, estimated damages, and CFA take-on recommendations within hours. Screen cases faster, reduce risk, free up your team.",
  inLanguage: "en-GB",
  isPartOf: { "@id": WEBSITE_ID },
};
