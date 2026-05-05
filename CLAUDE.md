# CaseSift Website (Public Marketing) — Claude Working Notes

All non-trivial work in this repo MUST use the FSM state machine.

## FSM Setup

The FSM kernel lives at `../FSM/` (parent directory), shared with the CaseSift backend repo. It is cloned manually, not a submodule.

To set up the FSM locally (one-time, from this repo):
```bash
# From the parent Startup/ directory:
git clone https://github.com/CaseSift/Coding_FSM.git ../FSM
```

(Or run `make fsm-setup` from the sibling `CaseSift/` repo — same outcome.)

**Before starting any multi-step task:**
1. Read `../FSM/skills/sm-agent-workflow/SKILL.md` for the workflow protocol
2. Read `../FSM/skills/sm-orchestrator/SKILL.md` to drive state transitions
3. Read `../FSM/skills/sm-state-machine/SKILL.md` for the formal spec

**Project adapter:** `fsm-config/project-adapters/casesift-frontend/` (in-repo source of truth — `adapter.json` points at the shared `../FSM/skills/` and a project-namespaced `../FSM/pipeline/casesift-frontend/`)

## Quick Reference — FSM task types

- **Bug Fix / Feature:** 7 states (Planner → Worker → Runner → Verifier → Breaker → Resolver → Cleanup)
- **Bug Review:** 6 states (Planner → Checker → Verifier → Breaker → Resolver → Cleanup)
- **Architecture Update:** 6 states, opus everywhere, no Runner
- **Refactoring:** 7 states, zero behaviour change
- **Doc Maintenance:** Lighter weight, skip Runner

## What You Don't Skip

- **Plan Confirmation Gate:** Always pause after Planner STAGE_COMPLETE for user approval
- **Agent Isolation:** Every state is a fresh agent (Verifier ≠ Worker, Breaker ≠ Verifier)
- **Pre-Spawn Path Validation:** Orchestrator runs the 7 path checks before spawning any non-Planner agent
- **Stage Files:** All context flows through markdown files

## Project Context

This repo is the **public marketing website** at https://casesift.co.uk — a single-page Next.js 15 site that drives UK solicitors to contact us. Static-export-friendly, no auth, no DB, no backend dependencies.

The product itself (backend API, FSM engine, AI agents, customer dashboard) lives in a separate private repo (CaseSift). Don't reference backend code from this repo.

- **Tech stack:** Next.js 15 App Router, React 19, TypeScript (strict), Tailwind CSS v4, Radix UI, Lucide
- **Hosting:** Vercel (auto-deploy from `main`)
- **Source layout:** `src/app/` — App Router pages, layout, robots.ts, sitemap.ts
- **SEO baseline:** Metadata API in `layout.tsx`, robots.ts, sitemap.ts, security headers in `next.config.ts`
- **Tests:** Vitest unit tests in `src/test/`, Playwright E2E in `tests/e2e/`, `@axe-core/playwright` for WCAG2AA
- **CI:** GitHub Actions workflows in `.github/workflows/` (Lighthouse, accessibility, structured-data, robots, sitemap, links, Playwright E2E)

## Critical Invariants

1. **No `noindex` on production pages** — accidentally setting `metadata.robots.index: false` is a cataclysmic SEO regression
2. **Sitemap matches routes** — every public route in `src/app/` MUST be in `sitemap.ts`; every disallowed path in `robots.ts` MUST NOT be in `sitemap.ts`
3. **Heading hierarchy** — exactly one `<h1>` per page; never skip heading levels
4. **Strict TypeScript** — no `any`, no `@ts-ignore` without a justifying comment
5. **Marketing copy must match product reality** — no aspirational claims; legal-tech reputation risk is severe

## Adapter Files

The FSM kernel reads adapter and project-doc files directly from this repo at the absolute paths declared in `adapter.json`. There is NO copy step — `fsm-config/` IS the source of truth:

- `fsm-config/project-adapters/casesift-frontend/adapter.json` — paths, metadata, planner context
- `fsm-config/project-adapters/casesift-frontend/worker-conventions.md` — file locations, patterns, SEO/a11y rules
- `fsm-config/project-adapters/casesift-frontend/runner-commands.md` — type-check, lint, build commands
- `fsm-config/project-adapters/casesift-frontend/verifier-checks.md` — App Router patterns, metadata cohesion, SEO completeness
- `fsm-config/project-adapters/casesift-frontend/breaker-audit.md` — XSS, security headers, dependency hygiene, supply chain
- `fsm-config/project-adapters/casesift-frontend/file-size-limits.md` — per-pattern line limits
- `fsm-config/project-docs/architecture.md` — repo layout, tech stack, deployment model
- `fsm-config/project-docs/seo.md` — SEO baseline, ranking factors, Lighthouse and axe-core a11y targets

Pipeline runs go to `../FSM/pipeline/casesift-frontend/run-N/` (project-namespaced under the shared FSM kernel).

## When to Use the FSM

Use the FSM when ANY are true:
- Spans 3+ files or 4+ lines of logic
- Touches SEO config (metadata, robots, sitemap, structured data)
- Adds or changes CI workflows
- Could affect Core Web Vitals, accessibility, or search ranking
- You're uncertain about the approach

**Skip the FSM** only when: 1-3 lines, purely mechanical (typo, copy fix, dependency bump verified safe), no ambiguity, no risk to SEO or build.
