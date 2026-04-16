# ADR 007 — CMS consumption: scaffold-and-wait strategy

**Status:** Decided
**Date:** 2026-04-16
**Decider:** Thiago Figueiredo
**Related:** [CMS consumer scaffold spec](../superpowers/specs/2026-04-16-cms-consumer-scaffold-design.md), [CMS consumer scaffold plan](../superpowers/plans/2026-04-16-cms-consumer-scaffold-plan.md), [ADR 004](004-ymyl-ui-reuse-api-contract.md), [ADR 008](008-cms-consumption-decision.md)

## Context

`@tn-figueiredo/cms@0.1.0-beta.4` exists but is undergoing a core rework in `~/Workspace/tn-cms-s4.75/` introducing user tiers + user-to-role relationships. This is API-breaking. finreckoner needs pillar + post routes rendering for S1–S2 content.

Two approaches considered:

- **A. Contract-first adapter:** finreckoner defines a `ContentRepository` interface and feeds it to the CMS side as requirements for 1.0.0.
- **B. Scaffold-and-wait:** finreckoner builds every consumer-local piece of infrastructure (routes, templates, metadata, YMYL artifacts) against internal fixtures, with a single seam at `src/lib/content.ts` that swaps on CMS integration. Zero opinion on CMS API shape.
- **C. Pure MDX inline:** skip CMS for MVP, write pillars + posts in MDX files checked into the repo.

## Decision

**Approach B — scaffold-and-wait.**

## Rationale

- Ecosystem package ownership is the platform side's; consumers conform, they do not propose APIs. Memory entry `ecosystem_contract_ownership.md` codifies this.
- Approach A would have Claude propose a contract that may conflict with decisions Thiago has already made (or is making) on the CMS side, causing rework + token burn.
- Approach C loses the momentum of CMS shipping soon and creates retrofit work post-launch.
- Approach B is risk-symmetric: if CMS 1.0.0 lands tomorrow, scaffold is ready to integrate; if it slips weeks, MVP can still ship with fixtures upgraded to inline-MDX authoring.

## Consequences

- **Pro:** finreckoner and CMS evolve independently until integration day
- **Pro:** templates are testable today with fixtures
- **Pro:** normalizer pattern (Wave 5) absorbs any shape divergence
- **Con:** adapter code in `src/lib/content.ts` may get rewritten substantially in Wave 5 — budget 8-14h for that
- **Con:** fixture shape accretes minor assumptions (11 fields); mitigated by normalizer layer

## Revisit trigger

- CMS 1.0.0 ships: trigger Wave 5 integration epic
- CMS timeline slips >6 weeks: re-evaluate toward Approach C (inline MDX)

## Related decisions

- **Inline YMYL JSX vs ymyl-ui components** — see ADR 006 for the Wave 3 fallback path. Wave 4 renders inline JSX for YMYL artifacts with `POST-WAVE-3:` swap markers; when Wave 3 publishes ymyl-ui@0.1.0, a small PR swaps inline JSX for component imports.
- **Tailwind 4 typography fallback** — `@plugin "@tailwindcss/typography"` works in Tailwind 4; no fallback needed (verified during scaffold implementation).

## Changelog

- **2026-04-16** — ADR drafted post-brainstorming session; codifies decision made in spec `2026-04-16-cms-consumer-scaffold-design.md`.
