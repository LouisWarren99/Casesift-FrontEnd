import type { Metadata } from "next";
import { Toaster } from "sonner";

import "./globals.css";
import {
  organizationSchema,
  websiteSchema,
  webpageSchema,
} from "./layout-schemas";

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
