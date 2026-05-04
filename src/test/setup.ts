import "@testing-library/jest-dom/vitest";

// jsdom does not implement IntersectionObserver — page.tsx's useScrollReveal needs it.
class MockIntersectionObserver {
  observe(): void {}
  unobserve(): void {}
  disconnect(): void {}
  takeRecords(): IntersectionObserverEntry[] {
    return [];
  }
  root: Element | null = null;
  rootMargin: string = "";
  thresholds: ReadonlyArray<number> = [];
}

// Assignment at module-top so all subsequent test files see it.
globalThis.IntersectionObserver =
  MockIntersectionObserver as unknown as typeof IntersectionObserver;
