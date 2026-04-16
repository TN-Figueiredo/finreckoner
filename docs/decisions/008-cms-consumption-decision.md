# ADR 008 — @tn-figueiredo/cms consumption decision

**Status:** Decided
**Date:** 2026-04-16
**Decider:** Thiago Figueiredo
**Related:** [ADR 007](007-cms-scaffold-and-wait.md), [CMS consumer scaffold spec](../superpowers/specs/2026-04-16-cms-consumer-scaffold-design.md)

## Context

`@tn-figueiredo/cms` is currently `0.1.0-beta.4`, published to GitHub Packages. A major rework is landing s4.75 (user tiers + roles) that is API-breaking. The user has indicated CMS 1.0.0-stable will ship ~2026-04-16 with Claude Code assistance in a parallel session.

## Decision

- **finreckoner does NOT consume `@tn-figueiredo/cms@0.1.0-beta.4`** — not even transiently.
- **finreckoner will consume `@tn-figueiredo/cms@1.0.0`** (pinned exact version per ecosystem convention) when Wave 5 integration epic runs.
- **If CMS 1.0.0 slips >6 weeks**, reconsider approach — move toward inline-MDX content (Approach C from ADR 007).

## Alternatives considered

- **Consume beta.4 now, migrate later:** rejected. Migration debt from API-breaking rework is larger than reading fixtures + swapping atomically.
- **Pin 1.0.0-rc pre-release:** rejected. Too early to stabilize; consumers should wait for `.0` stable.

## Integration epic (Wave 5)

Executes when:
1. `@tn-figueiredo/cms@1.0.0` is published to GitHub Packages
2. Wave 3 publish has landed (so `staging → main` path is green)
3. Wave 4 scaffold (ADR 007) has merged to main

Epic tasks:
- Add `@tn-figueiredo/cms: "1.0.0"` to `apps/web/package.json` dependencies
- Rewrite `apps/web/src/lib/content.ts` to call CMS (signatures may change; normalizer layer inside the functions absorbs any shape divergence so templates remain stable)
- Delete `apps/web/src/__fixtures__/*.mock.ts`
- Regenerate snapshots (`npx vitest run -u`)
- Run full e2e + Lighthouse to verify no regression
- Validate Google Rich Results Test for pillar + post URLs manually

Estimated effort: 8-14h. Recalibrate once CMS 1.0.0 API is visible.

## Consequences

- **Pro:** consumers always see a stable API (never beta)
- **Pro:** Wave 5 epic is crisp, not exploratory
- **Con:** finreckoner ships initial content via fixtures (stub body), real content gates on CMS 1.0.0

## Changelog

- **2026-04-16** — ADR drafted; awaits CMS 1.0.0 publication to activate Wave 5.
