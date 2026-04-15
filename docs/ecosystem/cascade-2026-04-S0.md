# Cascade smoke-test log — Sprint 0 closeout (2026-04-29)

## @tn-figueiredo/calc-engine@0.1.0

**Result:** ✅ null-op cascade (zero consumers configured per `tnf-ecosystem/scripts/consumers.json`).
**Infrastructure validated:** publish workflow correctly invokes `cascade-smoke-test.sh` post-publish; script exits 0 when consumers array is empty; no false positives.

## @tn-figueiredo/partner-links@0.1.0

**Result:** ✅ null-op cascade (zero consumers configured).
**Infrastructure validated:** same as above.

## @tn-figueiredo/shared@0.8.0 (control test — DEFERRED)

**Status:** Not executed in S0. `consumers.json` lists 3 real consumer repos (tonagarantia, bythiagofigueiredo, fan-stamp) but running cascade against them would trigger `upgrade-ecosystem.sh` + `npm test` in each sibling checkout, potentially touching user's active work-in-progress. Deferred to a dedicated cascade verification sprint (future) OR to first REAL version bump of `shared` when consumers actually need the upgrade.

## Infrastructure confidence level

- ✅ `cascade-smoke-test.sh` exists + executable + reads consumers.json + handles empty consumer list
- ✅ `pull-test.sh` gate works (validated in both publish CI runs)
- ✅ Publish workflow proven: builds package, runs pull-test, publishes to GitHub Packages, creates GH release, runs cascade
- ⚠️  Real cross-repo cascade not yet exercised against live consumers — first real test will happen when a shared/seo/affiliate version bump triggers publish workflow in production
- ⚠️  Architecture migration (ADR-004) from ecosystem-push to consumer-pull remains a Sprint 1+ item

## Next steps

- First real cascade test: when any of `shared`, `seo`, `affiliate`, `admin` gets a minor version bump (Sprint 1+)
- Consumer-pull architecture migration per ADR-004 targeted Sprint 1+
