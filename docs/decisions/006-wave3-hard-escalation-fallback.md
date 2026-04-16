# ADR 006 — Wave 3 hard-escalation fallback (inline YMYL stubs)

**Status:** Decided (conditional activation)
**Date:** 2026-04-16
**Decider:** Thiago Figueiredo
**Related:** [ADR 003](003-package-publish-prereq.md), [ADR 005](005-wave3-publish-watch.md), [ADR 007](007-cms-scaffold-and-wait.md), [Wave 3 runbook](../runbooks/wave-3-publish.md)

## Context

Wave 3 publishes 5 ecosystem packages (ymyl-ui@0.1.0 NEW, lgpd/seo/calc-engine/partner-links @0.2.0). Target 2026-04-22, hard-escalation 2026-04-29 (= S1 G0). If Wave 3 slips past the hard escalation, finreckoner `staging` cannot merge to `main` (npm install fails on unpublished packages).

The Wave 4 scaffold (ADR 007) is independent of Wave 3 — it builds content-route infrastructure with inline JSX YMYL slots rather than using ymyl-ui components. This means Wave 4 can land to main even if Wave 3 is late.

## Decision

If Wave 3 misses the hard escalation (2026-04-29):

1. **Keep Wave 4 inline YMYL JSX in place** — do NOT implement replacement YMYL components locally. The inline JSX is production-viable for YMYL compliance (author byline, disclaimer, citations all render visibly and correctly).

2. **Revert `staging` to pre-hygiene baseline** (commit `842b56f`) and recreate the legal/* pages using the inline JSX pattern from Wave 4, without ymyl-ui dependencies. Estimated effort: 4h.

3. **Defer Wave 3 publish** until the ecosystem divergence is resolved at the original pace (no forced push, no rushed publish).

4. **Wave 3 swap** (inline → ymyl-ui components) becomes a post-launch epic (Phase 2 nice-to-have) rather than pre-launch blocker.

## Alternatives considered

- **Force-publish Wave 3 packages regardless of ecosystem divergence:** rejected. ecosystem `main` has WIP in admin/support/fraud-detection-utils that cannot be lost; forced push could destroy work.
- **Wait indefinitely for Wave 3:** rejected. Ties S1 kickoff to external dependency.
- **Skip YMYL components entirely pre-launch:** rejected. YMYL visibility is a Google QRG requirement; inline JSX is sufficient.

## Consequences

- **Pro:** decouples launch timeline from Wave 3; no hidden rushed-publish risk
- **Pro:** inline JSX pattern is already proven (Wave 4A)
- **Con:** ymyl-ui polish features (affordances Wave 4 doesn't replicate: rich structured metadata, component-level unit tests, cross-site reuse) are deferred
- **Con:** small technical debt (inline vs component), paid down in Phase 2

## Revisit trigger

- Wave 3 publishes at any later date → schedule swap epic
- Another consumer needs ymyl-ui urgently → reprioritize Wave 3 publish

## Changelog

- **2026-04-16** — ADR drafted alongside Wave 4 plan (cms-consumer-scaffold-plan.md).
