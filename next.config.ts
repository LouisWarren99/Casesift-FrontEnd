import type { NextConfig } from "next";

// Production runtime requires RESEND_API_KEY for the contact form Route Handler.
// `console.warn` (not `throw`) is intentional: `next.config.ts` is also evaluated
// during local development, where contributors should be able to run `next dev`
// without the secret. The Route Handler returns 500 at request time when the key
// is missing, which is the actual user-facing safety net.
if (process.env.NODE_ENV === "production" && !process.env.RESEND_API_KEY) {
  console.warn(
    "[next.config] RESEND_API_KEY is not set. The /contact route will return 500 in production until the key is configured.",
  );
}

const securityHeaders = [
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "X-Frame-Options", value: "DENY" },
  { key: "X-XSS-Protection", value: "1; mode=block" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  {
    key: "Strict-Transport-Security",
    value: "max-age=63072000; includeSubDomains; preload",
  },
  {
    key: "Permissions-Policy",
    value: "camera=(), microphone=(), geolocation=()",
  },
];

const nextConfig: NextConfig = {
  async headers() {
    return [
      {
        source: "/(.*)",
        headers: securityHeaders,
      },
    ];
  },
};

export default nextConfig;
