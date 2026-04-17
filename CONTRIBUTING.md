# Contributing to finreckoner

## Branch policy

`main` only. No staging. PR → review → squash-merge → CI → deploy via Vercel.

## Commit convention

```
type(scope?): subject

[optional body]
```

Types: `feat`, `fix`, `refactor`, `chore`, `docs`, `test`, `ci`, `perf`.

YMYL-touching PRs **must** prefix the title with `[ymyl]` (see `docs/YMYL-audit-checklist.md`).

## Pre-PR checklist

- [ ] `npm run typecheck` clean
- [ ] `npm test` passing
- [ ] `npm run lighthouse` (S3+) ≥90 mobile, LCP <2s on Slow 4G
- [ ] No `any` added (CI enforces)
- [ ] Ecosystem packages pinned to exact versions (no `^`/`~`)
- [ ] `[ymyl]` PRs: YMYL audit checklist items applicable to the change ticked

## Package consumption (reuse-first)

This project consumes `@tn-figueiredo/*` packages. Almost all reusable logic
lives in the package; this repo only configures and customizes locally.

If you find yourself writing logic in `apps/web/src/` that could plausibly be
reused by another `@tn-figueiredo/*` project, propose extending or creating
the relevant package in `tn-figueiredo/tnf-ecosystem` first.

## Tax contractor review (YMYL)

Calculations consuming `@tn-figueiredo/calc-engine` tax subpaths (US/CA/QC) must
be reviewed by a qualified tax professional before launch and on the annual
refresh cadence. See `docs/legal/contractor-sow-template.md` and the YMYL audit
checklist.

## Reporting issues

- Bugs: GitHub Issues with reproduction steps
- Compliance gaps: `[security]` or `[ymyl]` prefix
- Affiliate / partner-links discrepancies: tag `affiliate`
