import { describe, it, expect, afterEach } from "vitest";
import { render, screen, cleanup } from "@testing-library/react";
import HomePage from "../app/page";

// Ensure jsdom is cleaned up between tests so elements don't accumulate
// across render() calls in the same describe block.
afterEach(() => {
  cleanup();
});

describe("HomePage — component render smoke test", () => {
  it("renders without throwing", () => {
    expect(() => render(<HomePage />)).not.toThrow();
  });

  it("renders exactly one h1 element", () => {
    const { container } = render(<HomePage />);
    const headings = container.querySelectorAll("h1");
    expect(headings).toHaveLength(1);
  });

  it("hero h1 contains the expected copy", () => {
    const { container } = render(<HomePage />);
    const heading = container.querySelector("h1");
    expect(heading).not.toBeNull();
    expect(heading?.textContent).toMatch(/Know if a case is worth/i);
  });

  it("renders at least one mailto:info@casesift.co.uk link", () => {
    const { container } = render(<HomePage />);
    const mailtoLinks = container.querySelectorAll(
      'a[href^="mailto:info@casesift.co.uk"]'
    );
    expect(mailtoLinks.length).toBeGreaterThanOrEqual(1);
  });

  // Negative case: no more than one h1
  it("does not render more than one h1 (heading hierarchy invariant)", () => {
    const { container } = render(<HomePage />);
    const headings = container.querySelectorAll("h1");
    expect(headings.length).not.toBeGreaterThan(1);
  });
});
