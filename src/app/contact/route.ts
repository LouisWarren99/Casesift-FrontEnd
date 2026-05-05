import { NextRequest, NextResponse } from "next/server";
import { Resend } from "resend";
import { contactSchema, type ContactFieldErrors } from "./schema";

/**
 * Per-instance in-memory rate limiter.
 *
 * Vercel scales horizontally so each function instance has its own bucket — for a
 * marketing-form's volume profile this is acceptable and avoids adding a Redis dep.
 *
 * The map is bounded by RATE_LIMIT_MAP_MAX_ENTRIES; expired entries are pruned on
 * each call to bound memory growth even under abusive distinct-IP traffic.
 */
const RATE_LIMIT_WINDOW_MS = 60_000;
const RATE_LIMIT_MAX_REQUESTS = 5;
const RATE_LIMIT_MAP_MAX_ENTRIES = 10_000;

const FROM_ADDRESS = "CaseSift <noreply@casesift.co.uk>";
const TO_ADDRESS = "info@casesift.co.uk";

type RateLimitBucket = { count: number; resetAt: number };

const rateLimitBuckets = new Map<string, RateLimitBucket>();

type RateLimitResult = { allowed: boolean };

function pruneExpiredBuckets(now: number): void {
  for (const [key, bucket] of rateLimitBuckets) {
    if (bucket.resetAt <= now) {
      rateLimitBuckets.delete(key);
    }
  }
}

function evictOldestBucketIfNeeded(): void {
  if (rateLimitBuckets.size < RATE_LIMIT_MAP_MAX_ENTRIES) return;

  const oldestKey = rateLimitBuckets.keys().next().value;
  if (oldestKey !== undefined) {
    rateLimitBuckets.delete(oldestKey);
  }
}

function checkRateLimit(ipKey: string): RateLimitResult {
  const now = Date.now();
  pruneExpiredBuckets(now);

  const existing = rateLimitBuckets.get(ipKey);
  if (!existing || existing.resetAt <= now) {
    evictOldestBucketIfNeeded();
    rateLimitBuckets.set(ipKey, {
      count: 1,
      resetAt: now + RATE_LIMIT_WINDOW_MS,
    });
    return { allowed: true };
  }

  if (existing.count >= RATE_LIMIT_MAX_REQUESTS) {
    return { allowed: false };
  }

  existing.count += 1;
  return { allowed: true };
}

function extractClientIp(req: NextRequest): string {
  const forwardedFor = req.headers.get("x-forwarded-for");
  if (!forwardedFor) return "unknown";

  // x-forwarded-for can contain a comma-separated list; first value is the original client.
  const firstHop = forwardedFor.split(",")[0]?.trim();
  return firstHop && firstHop.length > 0 ? firstHop : "unknown";
}

function fieldErrorsFromZod(
  errors: ReadonlyArray<{ path: ReadonlyArray<PropertyKey>; message: string }>,
): ContactFieldErrors {
  const fields: ContactFieldErrors = {};
  for (const issue of errors) {
    const fieldName = issue.path[0];
    if (fieldName === "name" && fields.name === undefined) {
      fields.name = issue.message;
    } else if (fieldName === "email" && fields.email === undefined) {
      fields.email = issue.message;
    } else if (fieldName === "firm" && fields.firm === undefined) {
      fields.firm = issue.message;
    } else if (fieldName === "message" && fields.message === undefined) {
      fields.message = issue.message;
    }
  }
  return fields;
}

export async function POST(req: NextRequest): Promise<NextResponse> {
  // 1. Rate-limit check (per-IP).
  const ipKey = extractClientIp(req);
  const rateLimit = checkRateLimit(ipKey);
  if (!rateLimit.allowed) {
    return NextResponse.json(
      { ok: false, error: "rate-limited" },
      { status: 429 },
    );
  }

  // 2. Parse JSON body — malformed body is a 400.
  let rawBody: unknown;
  try {
    rawBody = await req.json();
  } catch {
    return NextResponse.json(
      { ok: false, error: "invalid-json" },
      { status: 400 },
    );
  }

  // 3. Validate via shared schema.
  const parsed = contactSchema.safeParse(rawBody);
  if (!parsed.success) {
    return NextResponse.json(
      {
        ok: false,
        error: "validation",
        fields: fieldErrorsFromZod(parsed.error.issues),
      },
      { status: 400 },
    );
  }

  const input = parsed.data;

  // 4. Honeypot — silent 200 if tripped (bots think they succeeded; no email sent).
  if (input._gotcha && input._gotcha.length > 0) {
    return NextResponse.json({ ok: true }, { status: 200 });
  }

  // 5. Resend API key check — server-side configuration error, not user error.
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) {
    return NextResponse.json(
      { ok: false, error: "server" },
      { status: 500 },
    );
  }

  // 6. Send email. Use Resend's `text` field (NOT `html`) to neutralise
  //    HTML-injection vectors from user-controlled message content.
  try {
    const resend = new Resend(apiKey);
    const emailBody = [
      `Name: ${input.name}`,
      `Email: ${input.email}`,
      `Firm: ${input.firm}`,
      "",
      "Message:",
      input.message,
    ].join("\n");

    await resend.emails.send({
      from: FROM_ADDRESS,
      to: [TO_ADDRESS],
      replyTo: input.email,
      subject: `New CaseSift contact: ${input.firm}`,
      text: emailBody,
    });
  } catch {
    // Never propagate Resend's internal error message to the client.
    // Do NOT log input.email or input.message — PII / GDPR.
    return NextResponse.json(
      { ok: false, error: "server" },
      { status: 500 },
    );
  }

  return NextResponse.json({ ok: true }, { status: 200 });
}
