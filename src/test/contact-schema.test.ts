import { describe, it, expect } from "vitest";
import {
  contactSchema,
  NAME_MAX_LENGTH,
  EMAIL_MAX_LENGTH,
  FIRM_MAX_LENGTH,
  MESSAGE_MIN_LENGTH,
  MESSAGE_MAX_LENGTH,
} from "../app/contact/schema";

const validInput = {
  name: "Jane Doe",
  email: "jane@example.com",
  firm: "Doe & Co Solicitors",
  message: "Please get in touch about CaseSift.",
};

function repeatChar(char: string, count: number): string {
  return char.repeat(count);
}

describe("contactSchema — name field", () => {
  it("rejects empty name", () => {
    const result = contactSchema.safeParse({ ...validInput, name: "" });
    expect(result.success).toBe(false);
  });

  it("rejects whitespace-only name (trimmed to empty)", () => {
    const result = contactSchema.safeParse({ ...validInput, name: "   " });
    expect(result.success).toBe(false);
  });

  it("accepts a single character name", () => {
    const result = contactSchema.safeParse({ ...validInput, name: "A" });
    expect(result.success).toBe(true);
  });

  it("accepts a name at the maximum length boundary", () => {
    const result = contactSchema.safeParse({
      ...validInput,
      name: repeatChar("a", NAME_MAX_LENGTH),
    });
    expect(result.success).toBe(true);
  });

  it("rejects a name one character over the maximum length", () => {
    const result = contactSchema.safeParse({
      ...validInput,
      name: repeatChar("a", NAME_MAX_LENGTH + 1),
    });
    expect(result.success).toBe(false);
  });

  it("accepts unicode names", () => {
    const result = contactSchema.safeParse({
      ...validInput,
      name: "José García",
    });
    expect(result.success).toBe(true);
  });
});

describe("contactSchema — email field", () => {
  it("rejects empty email", () => {
    const result = contactSchema.safeParse({ ...validInput, email: "" });
    expect(result.success).toBe(false);
  });

  it("rejects email without TLD", () => {
    const result = contactSchema.safeParse({ ...validInput, email: "a@b" });
    expect(result.success).toBe(false);
  });

  it("rejects email with embedded space", () => {
    const result = contactSchema.safeParse({
      ...validInput,
      email: "bad email@example.com",
    });
    expect(result.success).toBe(false);
  });

  it("accepts valid plus-tagged email", () => {
    const result = contactSchema.safeParse({
      ...validInput,
      email: "valid+tag@example.co.uk",
    });
    expect(result.success).toBe(true);
  });

  it("accepts email with leading and trailing whitespace (trimmed)", () => {
    const result = contactSchema.safeParse({
      ...validInput,
      email: "  jane@example.com  ",
    });
    expect(result.success).toBe(true);
  });

  it("rejects email longer than the maximum length", () => {
    const local = repeatChar("a", EMAIL_MAX_LENGTH - 11);
    const tooLongEmail = `${local}@example.com`;
    const result = contactSchema.safeParse({
      ...validInput,
      email: tooLongEmail,
    });
    expect(result.success).toBe(false);
  });
});

describe("contactSchema — firm field", () => {
  it("rejects empty firm", () => {
    const result = contactSchema.safeParse({ ...validInput, firm: "" });
    expect(result.success).toBe(false);
  });

  it("accepts firm at the maximum length boundary", () => {
    const result = contactSchema.safeParse({
      ...validInput,
      firm: repeatChar("F", FIRM_MAX_LENGTH),
    });
    expect(result.success).toBe(true);
  });

  it("rejects firm one character over the maximum length", () => {
    const result = contactSchema.safeParse({
      ...validInput,
      firm: repeatChar("F", FIRM_MAX_LENGTH + 1),
    });
    expect(result.success).toBe(false);
  });
});

describe("contactSchema — message field", () => {
  it("rejects empty message", () => {
    const result = contactSchema.safeParse({ ...validInput, message: "" });
    expect(result.success).toBe(false);
  });

  it("rejects message shorter than minimum length", () => {
    const result = contactSchema.safeParse({
      ...validInput,
      message: repeatChar("m", MESSAGE_MIN_LENGTH - 1),
    });
    expect(result.success).toBe(false);
  });

  it("accepts message at the minimum length boundary", () => {
    const result = contactSchema.safeParse({
      ...validInput,
      message: repeatChar("m", MESSAGE_MIN_LENGTH),
    });
    expect(result.success).toBe(true);
  });

  it("accepts message at the maximum length boundary", () => {
    const result = contactSchema.safeParse({
      ...validInput,
      message: repeatChar("m", MESSAGE_MAX_LENGTH),
    });
    expect(result.success).toBe(true);
  });

  it("rejects message one character over the maximum length", () => {
    const result = contactSchema.safeParse({
      ...validInput,
      message: repeatChar("m", MESSAGE_MAX_LENGTH + 1),
    });
    expect(result.success).toBe(false);
  });

  it("accepts message with newlines", () => {
    const result = contactSchema.safeParse({
      ...validInput,
      message: "line one\nline two\nline three is long enough",
    });
    expect(result.success).toBe(true);
  });

  it("accepts unicode message body", () => {
    const result = contactSchema.safeParse({
      ...validInput,
      message: "日本語のメッセージをこちらに記述します。",
    });
    expect(result.success).toBe(true);
  });
});

describe("contactSchema — honeypot field passthrough", () => {
  it("accepts undefined honeypot (humans don't fill it)", () => {
    const result = contactSchema.safeParse({ ...validInput });
    expect(result.success).toBe(true);
  });

  it("accepts empty-string honeypot", () => {
    const result = contactSchema.safeParse({ ...validInput, _gotcha: "" });
    expect(result.success).toBe(true);
  });

  it("accepts a non-empty honeypot value at the schema layer (handler branches separately)", () => {
    // The schema must NOT reject a filled honeypot — the route handler is the
    // gate that returns a silent 200 to keep bots from training past it.
    const result = contactSchema.safeParse({
      ...validInput,
      _gotcha: "I am a bot",
    });
    expect(result.success).toBe(true);
  });
});
