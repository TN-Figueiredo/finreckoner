# ADR 005 — Wave 3 publish coordination + escalation

**Status:** Pending (Decided when Wave 3 publish lands or escalates to fallback)
**Date:** 2026-04-15
**Decider:** Thiago Figueiredo
**Related:** [`ADR 003`](003-package-publish-prereq.md) (architectural rationale) · [`ADR 004`](004-ymyl-ui-reuse-api-contract.md) (API contract being published) · `docs/roadmap/phase-1-mvp.md` S1 kickoff

---

## Context

Wave 2 (S0 hygiene remediation, 2026-04-15) landed consumer code in
`finreckoner/main` that imports from unpublished package versions. Per ADR 003
this was intentional: review structural correctness of the consumer-package
contract in a single PR, accept red CI as feedback that Wave 3 is the next unit
of work.

**Wave 3 unblocks:**

- Publish `@tn-figueiredo/ymyl-ui@0.1.0` (NEW)
- Publish `@tn-figueiredo/lgpd@0.2.0`
- Publish `@tn-figueiredo/seo@0.2.0`
- Publish `@tn-figueiredo/calc-engine@0.2.0` and
  `@tn-figueiredo/partner-links@0.2.0` (if Wave 2.5 patch-bump landed; at ADR
  draft time, partner-links is at 0.2.0 and calc-engine remains at 0.1.0)
- Resolve ecosystem local `main` vs `origin/main` divergence
- Cascade smoke-test in `finreckoner`: `npm install` green, CI green

**The risk is async coordination.** Wave 3 requires user review of multiple
package PRs + a local-vs-remote `main` divergence resolution. If the user has a
busy week or deprioritizes the review, `finreckoner/main` stays red and S1
calc-engine consumer work (scheduled 2026-04-29) cannot start cleanly.

This ADR pre-commits the escalation triggers and watch dates so the Wave 3
status is observable from `finreckoner/main` without requiring the user to
hold dates in their head.

## Decision

Commit the escalation schedule below. ADR 003 remains the architectural
rationale; this ADR is the operational watch.

### Dates

| Date | Milestone | Trigger / action |
|---|---|---|
| **2026-04-22** | **Target Wave 3 publish** | 1 week after Wave 2 lands; gives the user time to review package PRs + resolve ecosystem `main` divergence. No action if on track. |
| **2026-04-22 (soft escalation)** | If no publish by EOD | Add "Wave 3 watch — N days overdue" line to `README.md` Status notes; add CI banner job that prints a warning step in the failing `npm install` log so the state is visible to any future contributor. |
| **2026-04-29 (hard escalation = G0 / S1 kickoff)** | If still no publish | **S1 cannot start packaged-consumer work.** Fallback: temporarily inline `YmylFooter` + `DisclaimerPage` + `AccuracyPage` + `ContactPage` into `apps/web/src/components/_inline/` (technical debt). Track every inline file with a `// FROM-WAVE-3-INLINE` comment at top. Write **ADR 006 "Wave 3 fallback inline"** to document the deviation + refactor-back plan. |

### Calendar reminders (user-manual)

Create a Google Calendar entry titled **"finreckoner Wave 3 publish watch"**
with reminders on:

- **2026-04-19** — T-3 check (are the package PRs reviewable? local
  divergence resolved?)
- **2026-04-22** — T-0 target (publish or flip soft escalation)
- **2026-04-26** — T-3 to hard escalation (last chance before S1 kickoff
  fallback)

## Consequences

- **Worst case:** S1 starts with inlined YMYL components. Technical debt, but
  S1-S3 roadmap absorbs 1-2 weeks of refactor-back work within the 17.5%
  schedule buffer. Launch date **2026-07-15 is not directly threatened**.
- **Best case:** publish lands 2026-04-22, `finreckoner/main` CI goes green,
  S1 starts cleanly with the packaged consumer — this is the ADR 003 + 004
  happy path.
- **Middle case:** publish lands 2026-04-23 to 2026-04-28. Soft escalation
  banner appears briefly; no inline fallback needed; S1 kicks off on time.

## Watch checklist

Track completion by ticking items in a follow-up PR or retro doc.

- [ ] User reviews `ymyl-ui` PR (worktree → `tnf-ecosystem` `origin/main`)
- [ ] User reviews `lgpd` PR
- [ ] User reviews `seo` PR
- [ ] User reviews `calc-engine` PR (if Wave 2.5 patch lands)
- [ ] User reviews `partner-links` PR (Wave 2.5 — already at 0.2.0 in worktree)
- [ ] Resolve ecosystem local `main` vs `origin/main` divergence
- [ ] `npm publish` per package (5 packages if Wave 2.5 full; 4 if partial; 3
      if calc-engine defers)
- [ ] Cascade smoke-test in finreckoner (`npm install` green; `npm run
      typecheck && npm run test` green)
- [ ] Tag `finreckoner` commit `wave-3-cascade-complete`
- [ ] Close ADR 003 + ADR 005 (flip Status to Decided with publish date)

## Revisit trigger

- Any publish slip past 2026-04-29 → open ADR 006 (fallback inline) and
  update this ADR's Status to "Escalated to fallback".
- If Wave 3 publishes reveal a package API mismatch with Wave 2 consumer
  code, record the patch in a follow-up ADR and bump the consumer pins.

## Changelog

- **2026-04-15** — ADR drafted (Pending). Watch dates committed.
