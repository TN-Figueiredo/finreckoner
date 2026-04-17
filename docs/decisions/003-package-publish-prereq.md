# ADR 003 — Wave 2 finreckoner consumer requires Wave 3 publish

**Status:** Pending (Decided will follow Wave 3 publish + cascade)
**Date:** 2026-04-15
**Decider:** Thiago

## Context

Post-S0 audit (2026-04-15) identified P0 compliance gaps that the audit's
remediation plan addressed in two coordinated waves:

- **Wave 2 (this commit)** — extends `@tn-figueiredo/lgpd` (0.1.0 → 0.2.0),
  `@tn-figueiredo/seo` (0.1.0 → 0.2.0), and creates new
  `@tn-figueiredo/ymyl-ui@0.1.0`. Refactors `finreckoner` to consume them —
  Footer, all `/legal/*` pages, `/contact`, hreflang fix.
- **Wave 3 (deferred)** — publish the new package versions to GitHub Packages
  registry, run cross-repo cascade smoke-test, bump consumers.

The Wave 2 consumer code in this commit imports from
`@tn-figueiredo/ymyl-ui@0.1.0`, `@tn-figueiredo/lgpd@0.2.0`, and
`@tn-figueiredo/seo@0.2.0`. None of those versions are published yet at the
time of this commit.

## Decision

Land Wave 2 consumer code now (with version pins) even though it will not
build until Wave 3 publish. Reasons:

1. Reviewing structural correctness of the consumer-package contract is
   easier in a single PR than splitting it across publish + consume.
2. The package source for all three changes is in the
   `tnf-ecosystem-s0-hygiene` worktree (off `origin/main`), already
   self-tested (105 + 80 + 49 tests passing across the three packages).
3. Wave 3 (publish) is gated on user review of the package PRs and on
   resolving the workspace `react@18` peer-conflict (root override added).
4. CI on `finreckoner/main` will fail at `npm install` until publish lands;
   that is the intended feedback that Wave 3 is the next step.

## Consequences

- `finreckoner/main` CI fails until Wave 3 lands. Acceptable because the PR
  description explicitly notes the prerequisite and Wave 3 is the next
  unit of work.
- If Wave 3 reveals a package API mismatch with this consumer code, that
  PR will need a follow-up consumer patch — small risk because the
  consumer code uses only top-level documented exports from each package.
- The 'allow-launch-date-edit' guard and other `finreckoner` CI checks
  remain functional independent of Wave 3 (they don't need `npm install`).

## Wave 3 sequence (when ready)

1. In `tnf-ecosystem` (resolve local divergence with WIP first), merge the
   `tnf-ecosystem-s0-hygiene` worktree as a PR against `origin/main`.
2. Bump versions, publish via `npm publish` per ecosystem `CLAUDE.md`.
3. In `finreckoner`, run `npm install` to resolve the new package versions;
   confirm CI green.
4. Tag `finreckoner` commit with `s0-hygiene-cascade-complete`.

**Operational watch + escalation triggers** (dates, soft/hard escalation,
fallback inline plan) live in [ADR 005](005-wave3-publish-watch.md). This ADR
remains the architectural rationale; ADR 005 tracks the schedule.
