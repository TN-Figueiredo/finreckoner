# ADR 009 — `npm audit` threshold: production-strict, dev-tool-aware

**Status:** Decided
**Date:** 2026-04-16
**Decider:** Thiago Figueiredo
**Related:** Wave 4B hygiene (see plan `docs/superpowers/plans/2026-04-16-cms-consumer-scaffold-plan.md` Task 26), [review that surfaced this](../superpowers/reviews/2026-04-16-wave-4-review.md) (if committed)

## Context

Wave 4B initially set CI to `npm audit --audit-level=moderate` as a hard-fail gate. Independent code review caught that at the time of scaffold, the full audit tree reports **18 vulnerabilities (1 critical, 7 high, 3 moderate, 7 low)** transitively pulled through:

- `@lhci/cli@0.13.0` (current latest) → `lighthouse` → `@sentry/node` → `cookie` (GHSA-pxg6-pf52-xh8x)
- `@playwright/test@1.48.2` → `playwright` (GHSA-7mvr-c777-76hp)
- `vitest@1.5.0` → `vite` → `esbuild` (GHSA-67mh-4wv8-2f99)
- `@lhci/cli` → `inquirer` → `external-editor` → `tmp` (GHSA-52f5-9888-hmc6)
- `@lhci/cli` → `puppeteer-core` → `@puppeteer/browsers` → `tar-fs` (multiple)

Running `npm audit fix --force` would cascade-downgrade `@lhci/cli` to 0.1.0 (breaking; no Lighthouse CI possible) or pin vitest/playwright to versions outside our dependency range. Upstream fixes are not yet released in the tool chain at the latest major.

Production audit (`npm audit --omit=dev`) returns **0 vulnerabilities** — the site's runtime bundle is clean.

## Decision

CI runs two audit passes:

1. **Production-only, strict** — `npm audit --audit-level=moderate --omit=dev` **must pass** (hard-fail). This guards the actual shipped bundle (React, Next, Zod, @tn-figueiredo/*).
2. **Dev-only, informational** — `npm audit --audit-level=high --omit=prod` emits a CI warning but does **not** block merges. Tracked manually each sprint.

The static site deploys zero server-side runtime; dev-tool vulnerabilities affect the local developer machine and CI runner, not end users.

## Alternatives considered

- **Raise threshold to `high` uniformly** — weaker posture for production; we want to catch any new prod vuln immediately at moderate.
- **Add per-CVE `npm overrides`** — tempting but creates a maintenance surface every time a dep updates.
- **Downgrade `@lhci/cli` / `vitest` to patched versions** — `npm audit fix --force` proposes this but breaks Lighthouse CI and test runner.
- **Switch Lighthouse CI to an alternative** — e.g., `treosh/lighthouse-ci-action` — future option if lhci chain remains unpatched. Tracked as a potential migration in Phase 2.

## Revisit trigger

- `@lhci/cli` releases a patched major that clears `cookie` / `tmp` / `tar-fs` chain
- A new **critical CVE** appears in any prod dep (`React`, `Next`, `Zod`, `@tn-figueiredo/*`)
- Pre-launch S3 security review flags additional concerns

## Consequences

- **Pro:** production bundle is clean today; CI green on merge
- **Pro:** principled two-tier audit matches the real risk surface
- **Pro:** no destructive `--force` downgrade
- **Con:** dev-chain CVEs accumulate silently until the informational warning is reviewed
- **Con:** small maintenance surface each sprint to read the dev audit warning

## Changelog

- **2026-04-16** — ADR drafted after reviewer flagged 18-vuln audit failing the Wave 4 CI gate. Production audit verified 0 vulns.
