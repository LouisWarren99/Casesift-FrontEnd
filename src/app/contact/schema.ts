import { z } from "zod";

/**
 * Contact form schema — single source of truth for client-side and server-side validation.
 *
 * Constants are exported so tests can pin against the same boundary values.
 */
export const NAME_MIN_LENGTH = 1;
export const NAME_MAX_LENGTH = 100;
export const EMAIL_MAX_LENGTH = 254;
export const FIRM_MIN_LENGTH = 1;
export const FIRM_MAX_LENGTH = 200;
export const MESSAGE_MIN_LENGTH = 10;
export const MESSAGE_MAX_LENGTH = 2000;
export const HONEYPOT_FIELD_NAME = "_gotcha";

export const contactSchema = z.object({
  name: z
    .string()
    .trim()
    .min(NAME_MIN_LENGTH, "Name is required")
    .max(NAME_MAX_LENGTH, "Name must be 100 characters or fewer"),
  email: z
    .string()
    .trim()
    .email("Please enter a valid email address")
    .max(EMAIL_MAX_LENGTH, "Email must be 254 characters or fewer"),
  firm: z
    .string()
    .trim()
    .min(FIRM_MIN_LENGTH, "Firm or organisation is required")
    .max(FIRM_MAX_LENGTH, "Firm name must be 200 characters or fewer"),
  message: z
    .string()
    .trim()
    .min(MESSAGE_MIN_LENGTH, "Message must be at least 10 characters")
    .max(MESSAGE_MAX_LENGTH, "Message must be 2000 characters or fewer"),
  // Honeypot — passed through schema so the server handler can branch on it
  // (Decision 6: bots that fill it get a silent 200, not a 400). The schema
  // does NOT reject a non-empty value here; the handler checks the field
  // length and short-circuits with success before any email is sent.
  [HONEYPOT_FIELD_NAME]: z.string().optional(),
});

export type ContactInput = z.infer<typeof contactSchema>;

/**
 * Field-level error mapping returned by the server when validation fails.
 * Keyed by the same field names the client uses, so the form can surface them inline.
 */
export type ContactFieldErrors = {
  name?: string;
  email?: string;
  firm?: string;
  message?: string;
};
