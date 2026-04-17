## Summary

<!-- one or two sentences describing what changed and why -->

## Type of change

- [ ] `feat` — new feature
- [ ] `fix` — bug fix
- [ ] `refactor` — internal cleanup, no behavior change
- [ ] `docs` — documentation only
- [ ] `chore` / `ci` / `test` — tooling, infra, or test changes
- [ ] `perf` — performance improvement
- [ ] **`[ymyl]`** — touches YMYL compliance (calcs, tax data, disclaimers, citations, affiliate disclosure, privacy)

## YMYL checklist (only if `[ymyl]`)

See `docs/YMYL-audit-checklist.md`. Tick all that apply to this PR:

- [ ] Inline above-fold disclaimer on each calc page
- [ ] Data citation + "Last reviewed: YYYY-MM" present
- [ ] Reviewer byline rendered (when contractor SoW allows attribution)
- [ ] FTC per-link disclosure proximity (16 CFR 255.5)
- [ ] CCPA DNSMPI link present in footer
- [ ] GPC signal honored
- [ ] Hreflang validated against actual route inventory (no broken alternates)
- [ ] No restricted-products adjacency (crypto trading / payday / debt-relief)
- [ ] Tax data source comment updated (URL + publication date + next refresh)

## Test plan

- [ ] `npm run typecheck`
- [ ] `npm test`
- [ ] Manual: <!-- describe what you clicked / verified -->

## Screenshots / recordings

<!-- if UI changed -->

## Related

- Roadmap: `docs/roadmap/phase-1-mvp.md` Sprint <!-- N -->
- Spec / Plan: <!-- link if applicable -->
- Issue: <!-- link if applicable -->
