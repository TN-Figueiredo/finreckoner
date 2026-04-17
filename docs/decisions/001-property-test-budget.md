# ADR 001 — Property-test iteration budget for calc-engine CI

**Status:** Pending — will be Decided in S1 Week 1 (week of 2026-04-29)
**Date:** 2026-04-15
**Decider:** Thiago Figueiredo
**Related:** [`docs/roadmap/phase-1-mvp.md`](../roadmap/phase-1-mvp.md) S1 epic "`@tnf/calc-engine` consumer integration" · [Sprint 0 retro §Decisions for S1](../retro/sprint-0-2026-04-29.md)

---

## Context

Sprint 0 retro locked `FINAL_NUM_RUNS=10000` for property-based tests (fast-check) on calc-engine bracket-boundary properties. The value was chosen for YMYL audit-trail strength — 10K iterations give strong statistical coverage of bracket transitions (a single off-by-one in a threshold = tax-liability exposure).

**What was NOT measured during S0:** CI wall-clock cost of 10K iterations in GitHub Actions `ubuntu-latest`.

**Surface area:**
- 8 properties (boundary monotonicity, zero-income, negative-income guard, etc.)
- 3 jurisdictions (US federal, CA federal+provincial, CA QC)
- 10,000 iterations each
- **Total: 8 × 3 × 10,000 = 240,000 invocations per CI run**

Each invocation exercises `solveBracketTax` + `Money` arithmetic (decimal.js). Local dev (Node 25, M-class CPU) completes in seconds; CI runner (Node 20, shared-tenant VM) is unknown.

CI budget constraint: total test job wall-clock should remain under ~2 min to keep PR feedback fast. Property tests are one contributor among typecheck, unit, golden, audit.

## Decision (pending — will be recorded S1 Week 1)

**Measure first, then choose:**

1. Run CI with `FINAL_NUM_RUNS=10000` on a representative PR
2. Record wall-clock of the `property/` test subsuite (Vitest reporter timing)
3. Apply acceptance criteria below

## Acceptance criteria

| Measured wall-clock | Decision | Rationale |
|---|---|---|
| **< 15s** | Keep `FINAL_NUM_RUNS=10000` | Audit-trail strength preserved, no CI pain |
| **15s – 30s** | Keep 10K, add watchdog comment in CI config flagging review if duration creeps > 30s | Acceptable slack |
| **> 30s** | Reduce to `FINAL_NUM_RUNS=5000` and document here as Decided | Halve coverage to respect CI budget; 5K still catches vast majority of bracket-boundary bugs per fast-check stats |

## Measurement command

From `packages/calc-engine/`:

```bash
FINAL_NUM_RUNS=10000 npx vitest run __tests__/property/ --reporter=verbose 2>&1 | tee /tmp/proptest-ci.log
grep -E "(PASS|FAIL|Duration)" /tmp/proptest-ci.log
```

Or invoke on a throwaway branch + inspect the GitHub Actions job timing for the `test` step, filtering to property/ output.

## Consequences

### If 10K kept
- **Pro:** maximum audit-trail strength — "we tested every bracket boundary 10K times × 3 jurisdictions" is a strong YMYL compliance statement (useful for tax-contractor review context in S3)
- **Con:** higher CI minutes cost (marginal on free tier); slower PR iteration if measured > 30s

### If reduced to 5K
- **Pro:** faster CI feedback; still statistically robust for boundary discovery
- **Con:** weaker audit-trail narrative; golden snapshots + externally-verified anchors (6 of 30) remain the dominant compliance artifact regardless
- **Mitigation:** document reduction rationale here; offer annual `nightly-property` workflow at 50K iterations (runs off critical path) to preserve audit-trail strength without PR-blocking cost

## Revisit trigger

- Hardware: if GitHub-hosted runners change tier
- Surface area: if property count grows > 12 or a 4th jurisdiction is added (UK — Phase 3)
- Evidence: if a real bracket bug escapes golden + unit + property coverage, revisit iteration count upward

## Changelog

- **2026-04-15** — ADR drafted (Pending). Decision deferred to S1 Week 1 measurement.
