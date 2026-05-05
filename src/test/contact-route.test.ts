import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import { NextRequest } from "next/server";

const sendMock = vi.fn();

// Mock the Resend SDK so tests never make real network calls.
vi.mock("resend", () => {
  return {
    Resend: vi.fn().mockImplementation(() => ({
      emails: { send: sendMock },
    })),
  };
});

const validBody = {
  name: "Jane Doe",
  email: "jane@example.com",
  firm: "Doe & Co Solicitors",
  message: "Please get in touch regarding CaseSift onboarding.",
};

function buildRequest(body: unknown, ip = "203.0.113.10"): NextRequest {
  return new NextRequest("http://localhost:3000/contact", {
    method: "POST",
    headers: {
      "content-type": "application/json",
      "x-forwarded-for": ip,
    },
    body: typeof body === "string" ? body : JSON.stringify(body),
  });
}

async function importPostHandler() {
  // Re-import the route module so each test starts with a clean rate-limit map.
  vi.resetModules();
  const mod = await import("../app/contact/route");
  return mod.POST;
}

beforeEach(() => {
  sendMock.mockReset();
  sendMock.mockResolvedValue({ data: { id: "test-id" }, error: null });
  process.env.RESEND_API_KEY = "test-key";
});

afterEach(() => {
  delete process.env.RESEND_API_KEY;
});

describe("POST /contact — happy path", () => {
  it("returns 200 and calls Resend once with the expected payload shape", async () => {
    const POST = await importPostHandler();
    const response = await POST(buildRequest(validBody, "203.0.113.20"));

    expect(response.status).toBe(200);
    const json = await response.json();
    expect(json).toEqual({ ok: true });

    expect(sendMock).toHaveBeenCalledTimes(1);
    const call = sendMock.mock.calls[0]?.[0];
    expect(call).toMatchObject({
      from: expect.stringContaining("noreply@casesift.co.uk"),
      to: ["info@casesift.co.uk"],
      replyTo: validBody.email,
      subject: expect.stringContaining(validBody.firm),
    });
    // Body must be plaintext, not HTML.
    expect(call).toHaveProperty("text");
    expect(call).not.toHaveProperty("html");
    expect(call.text).toContain(validBody.message);
  });
});

describe("POST /contact — validation failures", () => {
  it("returns 400 with field-level errors when email missing", async () => {
    const POST = await importPostHandler();
    const { email: _omitted, ...withoutEmail } = validBody;
    void _omitted;
    const response = await POST(buildRequest(withoutEmail, "203.0.113.21"));

    expect(response.status).toBe(400);
    const json = await response.json();
    expect(json.ok).toBe(false);
    expect(json.error).toBe("validation");
    expect(json.fields?.email).toBeTruthy();
    expect(sendMock).not.toHaveBeenCalled();
  });

  it("returns 400 when message exceeds the maximum length", async () => {
    const POST = await importPostHandler();
    const oversize = "a".repeat(2001);
    const response = await POST(
      buildRequest({ ...validBody, message: oversize }, "203.0.113.22"),
    );

    expect(response.status).toBe(400);
    const json = await response.json();
    expect(json.fields?.message).toBeTruthy();
    expect(sendMock).not.toHaveBeenCalled();
  });

  it("returns 400 when the body is malformed JSON", async () => {
    const POST = await importPostHandler();
    const response = await POST(buildRequest("{not json", "203.0.113.23"));

    expect(response.status).toBe(400);
    const json = await response.json();
    expect(json.error).toBe("invalid-json");
    expect(sendMock).not.toHaveBeenCalled();
  });
});

describe("POST /contact — honeypot", () => {
  it("returns 200 silently and does NOT call Resend when honeypot is filled", async () => {
    const POST = await importPostHandler();
    const response = await POST(
      buildRequest({ ...validBody, _gotcha: "spam-bot-filled" }, "203.0.113.24"),
    );

    expect(response.status).toBe(200);
    const json = await response.json();
    expect(json).toEqual({ ok: true });
    expect(sendMock).not.toHaveBeenCalled();
  });
});

describe("POST /contact — rate limiting", () => {
  it("allows the first 5 requests from the same IP and rejects the 6th with 429", async () => {
    const POST = await importPostHandler();
    const ip = "203.0.113.50";

    for (let attempt = 1; attempt <= 5; attempt++) {
      const response = await POST(buildRequest(validBody, ip));
      expect(response.status).toBe(200);
    }

    const sixth = await POST(buildRequest(validBody, ip));
    expect(sixth.status).toBe(429);
    const json = await sixth.json();
    expect(json.error).toBe("rate-limited");
  });
});

describe("POST /contact — server-side error paths", () => {
  it("returns 500 when RESEND_API_KEY is missing", async () => {
    delete process.env.RESEND_API_KEY;
    const POST = await importPostHandler();

    const response = await POST(buildRequest(validBody, "203.0.113.60"));
    expect(response.status).toBe(500);
    const json = await response.json();
    expect(json.error).toBe("server");
    expect(sendMock).not.toHaveBeenCalled();
  });

  it("returns 500 when the Resend SDK throws", async () => {
    const POST = await importPostHandler();
    sendMock.mockRejectedValueOnce(new Error("upstream failure — must not leak"));

    const response = await POST(buildRequest(validBody, "203.0.113.61"));
    expect(response.status).toBe(500);
    const json = await response.json();
    expect(json.error).toBe("server");
    // Generic error only — never the upstream message.
    expect(JSON.stringify(json)).not.toContain("upstream failure");
  });
});
