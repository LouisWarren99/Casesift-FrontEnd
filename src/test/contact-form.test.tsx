import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import { render, screen, cleanup, fireEvent, waitFor } from "@testing-library/react";
import { ContactForm } from "../app/components/ContactForm";

// Mock sonner so toast calls don't blow up the test renderer.
vi.mock("sonner", () => ({
  toast: {
    success: vi.fn(),
    error: vi.fn(),
  },
}));

const validInput = {
  name: "Jane Doe",
  email: "jane@example.com",
  firm: "Doe & Co Solicitors",
  message: "We'd like a demo of CaseSift for our small firm.",
};

function fillValidForm(): void {
  fireEvent.change(screen.getByLabelText(/name/i), {
    target: { value: validInput.name },
  });
  fireEvent.change(screen.getByLabelText(/email/i), {
    target: { value: validInput.email },
  });
  fireEvent.change(screen.getByLabelText(/firm or organisation/i), {
    target: { value: validInput.firm },
  });
  fireEvent.change(screen.getByLabelText(/^Message/i), {
    target: { value: validInput.message },
  });
}

function jsonResponse(status: number, body: unknown): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { "content-type": "application/json" },
  });
}

afterEach(() => {
  cleanup();
  vi.restoreAllMocks();
});

describe("ContactForm — rendering", () => {
  it("renders all four labelled fields and the submit button", () => {
    render(<ContactForm />);

    expect(screen.getByLabelText(/name/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/email/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/firm or organisation/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/^Message/i)).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: /send message/i }),
    ).toBeInTheDocument();
  });

  it("renders a hidden honeypot field", () => {
    const { container } = render(<ContactForm />);
    const honeypot = container.querySelector('input[name="_gotcha"]');
    expect(honeypot).not.toBeNull();
    expect(honeypot).toHaveAttribute("aria-hidden", "true");
    expect(honeypot).toHaveAttribute("tabindex", "-1");
  });
});

describe("ContactForm — client-side validation", () => {
  beforeEach(() => {
    vi.spyOn(globalThis, "fetch");
  });

  it("does NOT call fetch when submitting an empty form", async () => {
    render(<ContactForm />);

    fireEvent.submit(screen.getByRole("button", { name: /send message/i }).closest("form")!);

    await waitFor(() => {
      expect(screen.getByText(/name is required/i)).toBeInTheDocument();
    });
    expect(globalThis.fetch).not.toHaveBeenCalled();
  });

  it("shows an email error when email is invalid and does not call fetch", async () => {
    render(<ContactForm />);
    fillValidForm();
    fireEvent.change(screen.getByLabelText(/email/i), {
      target: { value: "not-an-email" },
    });

    fireEvent.submit(screen.getByRole("button", { name: /send message/i }).closest("form")!);

    await waitFor(() => {
      expect(screen.getByText(/valid email/i)).toBeInTheDocument();
    });
    expect(globalThis.fetch).not.toHaveBeenCalled();
  });
});

describe("ContactForm — submit paths", () => {
  it("submits valid data, calls fetch with the expected payload, and shows success", async () => {
    const fetchSpy = vi
      .spyOn(globalThis, "fetch")
      .mockResolvedValue(jsonResponse(200, { ok: true }));

    render(<ContactForm />);
    fillValidForm();

    fireEvent.submit(screen.getByRole("button", { name: /send message/i }).closest("form")!);

    await waitFor(() => {
      expect(fetchSpy).toHaveBeenCalledTimes(1);
    });

    const [url, init] = fetchSpy.mock.calls[0]!;
    expect(url).toBe("/contact");
    expect(init?.method).toBe("POST");
    if (typeof init?.body !== "string") throw new Error("test: fetch body is not a string");
    const sentBody = JSON.parse(init.body);
    expect(sentBody).toMatchObject({
      name: validInput.name,
      email: validInput.email,
      firm: validInput.firm,
      message: validInput.message,
    });

    await waitFor(() => {
      expect(
        screen.getByText(/^Thanks/i),
      ).toBeInTheDocument();
    });
  });

  it("displays server-side field errors when the route returns 400", async () => {
    vi.spyOn(globalThis, "fetch").mockResolvedValue(
      jsonResponse(400, {
        ok: false,
        error: "validation",
        fields: { email: "Server says: invalid email" },
      }),
    );

    render(<ContactForm />);
    fillValidForm();

    fireEvent.submit(screen.getByRole("button", { name: /send message/i }).closest("form")!);

    await waitFor(() => {
      expect(
        screen.getByText(/server says: invalid email/i),
      ).toBeInTheDocument();
    });
  });

  it("shows the rate-limit message when the route returns 429", async () => {
    vi.spyOn(globalThis, "fetch").mockResolvedValue(
      jsonResponse(429, { ok: false, error: "rate-limited" }),
    );

    render(<ContactForm />);
    fillValidForm();

    fireEvent.submit(screen.getByRole("button", { name: /send message/i }).closest("form")!);

    await waitFor(() => {
      expect(screen.getByText(/too many requests/i)).toBeInTheDocument();
    });
  });

  it("shows the server-error fallback (with mailto) when the route returns 500", async () => {
    vi.spyOn(globalThis, "fetch").mockResolvedValue(
      jsonResponse(500, { ok: false, error: "server" }),
    );

    render(<ContactForm />);
    fillValidForm();

    fireEvent.submit(screen.getByRole("button", { name: /send message/i }).closest("form")!);

    await waitFor(() => {
      const mailtoLink = screen.getByRole("link", {
        name: /info@casesift.co.uk/i,
      });
      expect(mailtoLink).toHaveAttribute(
        "href",
        "mailto:info@casesift.co.uk",
      );
    });
  });

  it("shows the network-error fallback when fetch rejects", async () => {
    vi.spyOn(globalThis, "fetch").mockRejectedValue(new Error("net down"));

    render(<ContactForm />);
    fillValidForm();

    fireEvent.submit(screen.getByRole("button", { name: /send message/i }).closest("form")!);

    await waitFor(() => {
      expect(screen.getByText(/couldn't reach the server/i)).toBeInTheDocument();
    });
  });
});
