// Lighthouse CI — mobile configuration for CaseSift.
// Mobile run is SEO-critical: Google uses mobile-first indexing.
// Runs against localhost:3000 (server pre-started by quality.yml).

/** @type {import('@lhci/cli').LhciConfig} */
module.exports = {
  ci: {
    collect: {
      startServerUrl: "http://localhost:3000/",
      url: ["http://localhost:3000/"],
      numberOfRuns: 3,
      settings: {
        preset: "desktop", // base preset; overridden by formFactor below
        formFactor: "mobile",
        screenEmulation: {
          mobile: true,
          width: 390,
          height: 844,
          deviceScaleFactor: 3,
          disabled: false,
        },
        throttlingMethod: "simulate",
      },
    },
    assert: {
      assertions: {
        "categories:performance": ["error", { minScore: 0.9 }],
        "categories:accessibility": ["error", { minScore: 0.95 }],
        "categories:best-practices": ["error", { minScore: 0.95 }],
        "categories:seo": ["error", { minScore: 0.95 }],
      },
    },
    upload: {
      target: "temporary-public-storage",
    },
  },
};
