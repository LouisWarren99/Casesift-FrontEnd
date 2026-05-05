"use client";

import { useId, useRef, useState, type FormEvent } from "react";
import { toast } from "sonner";
import {
  contactSchema,
  type ContactFieldErrors,
  HONEYPOT_FIELD_NAME,
} from "@/app/contact/schema";

type FormValues = {
  name: string;
  email: string;
  firm: string;
  message: string;
  honeypot: string;
};

const INITIAL_VALUES: FormValues = {
  name: "",
  email: "",
  firm: "",
  message: "",
  honeypot: "",
};

type SubmitStatus =
  | { kind: "idle" }
  | { kind: "submitting" }
  | { kind: "success" }
  | { kind: "rate-limited" }
  | { kind: "error"; message: string };

const RATE_LIMITED_MESSAGE =
  "Too many requests. Please wait a minute and try again.";
const SERVER_ERROR_FALLBACK =
  "Something went wrong sending your message. Please email us directly at info@casesift.co.uk and we will be in touch.";
const NETWORK_ERROR_FALLBACK =
  "We couldn't reach the server. Please check your connection or email us at info@casesift.co.uk.";

export function ContactForm(): React.JSX.Element {
  const formId = useId();
  const [values, setValues] = useState<FormValues>(INITIAL_VALUES);
  const [errors, setErrors] = useState<ContactFieldErrors>({});
  const [status, setStatus] = useState<SubmitStatus>({ kind: "idle" });

  const nameRef = useRef<HTMLInputElement>(null);
  const emailRef = useRef<HTMLInputElement>(null);
  const firmRef = useRef<HTMLInputElement>(null);
  const messageRef = useRef<HTMLTextAreaElement>(null);

  const isSubmitting = status.kind === "submitting";

  function focusFirstError(fieldErrors: ContactFieldErrors): void {
    if (fieldErrors.name) {
      nameRef.current?.focus();
      return;
    }
    if (fieldErrors.email) {
      emailRef.current?.focus();
      return;
    }
    if (fieldErrors.firm) {
      firmRef.current?.focus();
      return;
    }
    if (fieldErrors.message) {
      messageRef.current?.focus();
    }
  }

  function clientSideValidate(input: FormValues): ContactFieldErrors {
    const result = contactSchema.safeParse({
      name: input.name,
      email: input.email,
      firm: input.firm,
      message: input.message,
      [HONEYPOT_FIELD_NAME]: input.honeypot,
    });
    if (result.success) return {};

    const fieldErrors: ContactFieldErrors = {};
    for (const issue of result.error.issues) {
      const fieldName = issue.path[0];
      if (fieldName === "name" && !fieldErrors.name) {
        fieldErrors.name = issue.message;
      } else if (fieldName === "email" && !fieldErrors.email) {
        fieldErrors.email = issue.message;
      } else if (fieldName === "firm" && !fieldErrors.firm) {
        fieldErrors.firm = issue.message;
      } else if (fieldName === "message" && !fieldErrors.message) {
        fieldErrors.message = issue.message;
      }
    }
    return fieldErrors;
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>): Promise<void> {
    event.preventDefault();

    const fieldErrors = clientSideValidate(values);
    if (Object.keys(fieldErrors).length > 0) {
      setErrors(fieldErrors);
      setStatus({ kind: "idle" });
      focusFirstError(fieldErrors);
      return;
    }

    setErrors({});
    setStatus({ kind: "submitting" });

    let response: Response;
    try {
      response = await fetch("/contact", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          name: values.name,
          email: values.email,
          firm: values.firm,
          message: values.message,
          [HONEYPOT_FIELD_NAME]: values.honeypot,
        }),
      });
    } catch {
      setStatus({ kind: "error", message: NETWORK_ERROR_FALLBACK });
      toast.error("Couldn't reach the server.");
      return;
    }

    if (response.status === 200) {
      setValues(INITIAL_VALUES);
      setStatus({ kind: "success" });
      toast.success("Thanks — we'll be in touch within one business day.");
      return;
    }

    if (response.status === 429) {
      setStatus({ kind: "rate-limited" });
      toast.error(RATE_LIMITED_MESSAGE);
      return;
    }

    if (response.status === 400) {
      try {
        const json: unknown = await response.json();
        const serverFields = extractFieldErrors(json);
        if (serverFields && Object.keys(serverFields).length > 0) {
          setErrors(serverFields);
          setStatus({ kind: "idle" });
          focusFirstError(serverFields);
          return;
        }
      } catch {
        // fall through to generic error
      }
    }

    setStatus({ kind: "error", message: SERVER_ERROR_FALLBACK });
    toast.error("Something went wrong sending your message.");
  }

  const fieldIds = {
    name: `${formId}-name`,
    email: `${formId}-email`,
    firm: `${formId}-firm`,
    message: `${formId}-message`,
  };

  return (
    <form
      onSubmit={handleSubmit}
      noValidate
      className="rounded-lg bg-white/95 p-6 shadow-md ring-1 ring-black/5"
      aria-labelledby={`${formId}-heading`}
    >
      <h3
        id={`${formId}-heading`}
        className="text-lg font-semibold text-foreground"
      >
        Send us a message
      </h3>
      <p className="mt-1 text-sm text-foreground">
        Tell us a little about your firm and we&apos;ll be in touch within one
        business day.
      </p>

      <div className="mt-5 space-y-4">
        <FormField
          id={fieldIds.name}
          label="Name"
          required
          error={errors.name}
          render={(describedBy) => (
            <input
              ref={nameRef}
              id={fieldIds.name}
              name="name"
              type="text"
              autoComplete="name"
              required
              aria-required="true"
              aria-invalid={errors.name ? "true" : "false"}
              aria-describedby={describedBy}
              value={values.name}
              onChange={(event) =>
                setValues((prev) => ({ ...prev, name: event.target.value }))
              }
              disabled={isSubmitting}
              className={inputClassName(Boolean(errors.name))}
            />
          )}
        />

        <FormField
          id={fieldIds.email}
          label="Email"
          required
          error={errors.email}
          render={(describedBy) => (
            <input
              ref={emailRef}
              id={fieldIds.email}
              name="email"
              type="email"
              autoComplete="email"
              required
              aria-required="true"
              aria-invalid={errors.email ? "true" : "false"}
              aria-describedby={describedBy}
              value={values.email}
              onChange={(event) =>
                setValues((prev) => ({ ...prev, email: event.target.value }))
              }
              disabled={isSubmitting}
              className={inputClassName(Boolean(errors.email))}
            />
          )}
        />

        <FormField
          id={fieldIds.firm}
          label="Firm or organisation"
          required
          error={errors.firm}
          render={(describedBy) => (
            <input
              ref={firmRef}
              id={fieldIds.firm}
              name="firm"
              type="text"
              autoComplete="organization"
              required
              aria-required="true"
              aria-invalid={errors.firm ? "true" : "false"}
              aria-describedby={describedBy}
              value={values.firm}
              onChange={(event) =>
                setValues((prev) => ({ ...prev, firm: event.target.value }))
              }
              disabled={isSubmitting}
              className={inputClassName(Boolean(errors.firm))}
            />
          )}
        />

        <FormField
          id={fieldIds.message}
          label="Message"
          required
          error={errors.message}
          render={(describedBy) => (
            <textarea
              ref={messageRef}
              id={fieldIds.message}
              name="message"
              rows={5}
              required
              aria-required="true"
              aria-invalid={errors.message ? "true" : "false"}
              aria-describedby={describedBy}
              value={values.message}
              onChange={(event) =>
                setValues((prev) => ({ ...prev, message: event.target.value }))
              }
              disabled={isSubmitting}
              className={inputClassName(Boolean(errors.message))}
            />
          )}
        />

        {/* Honeypot — invisible to humans, filled by naive bots. */}
        <input
          name={HONEYPOT_FIELD_NAME}
          type="text"
          tabIndex={-1}
          autoComplete="off"
          aria-hidden="true"
          style={{ display: "none" }}
          value={values.honeypot}
          onChange={(event) =>
            setValues((prev) => ({ ...prev, honeypot: event.target.value }))
          }
        />
      </div>

      <div className="mt-6 flex items-center gap-4">
        <button
          type="submit"
          disabled={isSubmitting}
          className="rounded-md bg-primary px-6 py-3 text-sm font-semibold text-primary-foreground shadow-sm transition-colors hover:bg-primary/90 disabled:cursor-not-allowed disabled:opacity-70"
        >
          {isSubmitting ? "Sending…" : "Send message"}
        </button>
      </div>

      <div
        role="alert"
        aria-live="polite"
        className="mt-4 min-h-[1.25rem] text-sm"
      >
        {status.kind === "success" && (
          <p className="text-emerald-700">
            Thanks — we&apos;ll be in touch within one business day.
          </p>
        )}
        {status.kind === "rate-limited" && (
          <p className="text-amber-700">{RATE_LIMITED_MESSAGE}</p>
        )}
        {status.kind === "error" && (
          <p className="text-destructive">
            {status.message}{" "}
            <a
              href="mailto:info@casesift.co.uk"
              className="underline underline-offset-2"
            >
              info@casesift.co.uk
            </a>
          </p>
        )}
      </div>
    </form>
  );
}

function inputClassName(hasError: boolean): string {
  const base =
    "w-full rounded-md border bg-white px-3 py-2 text-sm text-foreground shadow-sm focus:outline-none focus:ring-2 focus:ring-primary/40 disabled:cursor-not-allowed disabled:opacity-70";
  return hasError
    ? `${base} border-destructive focus:ring-destructive/40`
    : `${base} border-input`;
}

type FormFieldProps = {
  id: string;
  label: string;
  required?: boolean;
  error?: string;
  render: (describedBy: string | undefined) => React.JSX.Element;
};

function FormField({
  id,
  label,
  required,
  error,
  render,
}: FormFieldProps): React.JSX.Element {
  const errorId = error ? `${id}-error` : undefined;

  return (
    <div>
      <label
        htmlFor={id}
        className="mb-1 block text-sm font-medium text-foreground"
      >
        {label}
        {required ? (
          <span aria-hidden="true" className="ml-1 text-destructive">
            *
          </span>
        ) : null}
      </label>
      {render(errorId)}
      {error ? (
        <p id={errorId} className="mt-1 text-sm text-destructive">
          {error}
        </p>
      ) : null}
    </div>
  );
}

function hasFieldsProperty(v: object): v is { fields: unknown } {
  return "fields" in v;
}

function isStringRecord(v: unknown): v is Partial<Record<string, string>> {
  if (!v || typeof v !== "object") return false;
  return Object.values(v).every(
    (val) => val === undefined || typeof val === "string",
  );
}

function extractFieldErrors(value: unknown): ContactFieldErrors | null {
  if (!value || typeof value !== "object") return null;
  if (!hasFieldsProperty(value)) return null;
  if (!isStringRecord(value.fields)) return null;

  const result: ContactFieldErrors = {};
  if (value.fields.name) result.name = value.fields.name;
  if (value.fields.email) result.email = value.fields.email;
  if (value.fields.firm) result.firm = value.fields.firm;
  if (value.fields.message) result.message = value.fields.message;
  return result;
}
