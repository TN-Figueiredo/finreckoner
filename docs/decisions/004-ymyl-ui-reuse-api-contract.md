# ADR 004 — ymyl-ui v0.x reuse API contract for cross-project consumption

**Status:** Decided 2026-04-15
**Date:** 2026-04-15
**Decider:** Thiago Figueiredo
**Related:** [`ADR 003`](003-package-publish-prereq.md) · [`CLAUDE.md`](../../CLAUDE.md) §Stack (intended) · ecosystem `packages/ymyl-ui/src/types.ts`

---

## Context

The ecosystem directive (`CLAUDE.md` rev2, "tudo nos packages") is explicit:
almost all implementation lives in `packages/*` under `tn-figueiredo/tnf-ecosystem`;
projects (finreckoner, TNG, MEISimples, fan-stamp) only customize specifics
locally via config + brand objects. The S0 hygiene reuso target for finreckoner
was **"zero NEW packages"** (12 INSTALL + 2 EXTEND + 0 NEW).

`@tn-figueiredo/ymyl-ui@0.1.0` violates the rev1 "zero NEW" rule. It was created
during Wave 2 of the S0 audit remediation because the YMYL footer + legal pages
+ reviewer/author byline primitives are cross-cutting for any YMYL-vertical
project (finance, health, legal) — keeping them inlined in finreckoner would
repeat the same extraction work when MEISimples (BR tax) and fan-stamp (no YMYL,
but shares Footer chrome) land.

The S0 audit flagged a risk: the `ymyl-ui` API surface may be
**finreckoner-idiom-locked** (hardcoded `/legal/*` paths, English-only copy,
Tailwind class baked in, US/CA-QC jurisdictions hardcoded). If the package is
published with a locked-in API, the first non-finreckoner consumer will force a
major bump before v0.2.0 ships — breaking ecosystem rule "nova prop opcional,
novo export = minor bump".

This ADR commits the v0.x API contract so future consumers can hold the package
accountable without a major-bump negotiation.

## Decision

Lock the v0.x reuse contract. `@tn-figueiredo/ymyl-ui` commits to the following
across every 0.x.y release:

1. **`BrandConfig` is the only required prop on top-level components.** All
   other props (`author`, `reviewer`, `jurisdictions`, `legalLinks`, `locale`,
   `className`) are optional with sensible defaults. A consumer with just a
   `BrandConfig` object must render a working Footer + legal page.

2. **Locale handling via pluggable `text()` registry.** Components accept
   `locale?: string` (BCP 47, default `'en-US'`) and delegate user-facing
   strings to `src/text.ts` parameterized functions. In v0.3.0 (scheduled
   when a 2nd consumer needs it), a React context provider will let callers
   override the disclaimer wording per-locale without forking.

3. **No hardcoded copy in components.** All user-facing strings come from
   `src/text.ts`. Consumers can wrap to inject their own brand voice (e.g.
   MEISimples may require formal PT-BR legal language, fan-stamp casual EN).

4. **No Tailwind / CSS framework assumption.** Components accept `className`
   and use semantic HTML only. Caller supplies styles. This preserves
   compatibility with Tailwind 4 (finreckoner), Tailwind 3 + shadcn (TNG),
   CSS Modules (any future), or plain CSS.

5. **Jurisdiction list is data, not enum.** `Jurisdiction` is a string union
   (`'US' | 'CA' | 'CA-QC' | 'UK' | 'BR' | 'PT' | 'EU' | 'global'`) open
   enough that adding a market = minor bump (never major). Extending the
   union is a non-breaking addition.

6. **Templates are render-only.** Template components (e.g.
   `DisclaimerTemplate`, `AccuracyTemplate`) return React fragments with
   semantic heading hierarchy (`h1` → `h2` → `h3`). Caller wraps in app
   layout. No assumptions about page chrome, navigation, or
   metadata generation.

7. **Reviewer attribution opt-out is explicit.** `Reviewer.attributionAllowed?:
   boolean` (default `true`) respects contractor SoW language that prohibits
   named attribution. When `false`, renders as "Reviewed by qualified
   contributor" preserving Google QRG signal without contract breach.

## Consequences

- **Second-consumer acceptance test.** When TNG, MEISimples, or fan-stamp land,
  this contract is the bar. If they need capabilities beyond the above, those
  become v0.x API additions (minor bump per ecosystem rule) — never forks or
  major bumps.
- **finreckoner cannot extend `ymyl-ui` via inheritance/wrapping in
  `apps/web/`.** If a need emerges, the correct path is to propose a package
  extension (ADR + PR against `tnf-ecosystem`), not a local monkey-patch. This
  protects the cross-project contract.
- **Cross-project reuse is "proven" when at least one non-finreckoner consumer
  ships a YMYL footer + legal page from the package** with zero source-code
  modifications beyond a `brand-config.ts` equivalent. **Target: MEISimples by
  Phase 2 M8** (post-launch flex window, Q4 2026).

## Test plan (when 2nd consumer lands)

1. Run `npm pack` from the `ymyl-ui` worktree; install the tarball in the
   candidate consumer repo (MEISimples or fan-stamp).
2. Build a `/legal/disclaimer`, `/contact`, and Footer with
   `brand: BrandConfig = { brandName: 'MEISimples', ... }` using only public
   exports.
3. Verify **zero source-code modifications** needed beyond the consumer's
   local `brand-config.ts`.
4. Run `axe-core` a11y check on rendered output. Verify tab order, semantic
   heading hierarchy (no `h3` without `h2` ancestor), contrast (caller's
   styling, but the semantic structure must not fight a11y).
5. If any friction surfaces, record as v0.x minor-bump follow-up (not a
   regression of this contract).

## Revisit trigger

- **Second consumer lands and hits a contract limitation** — document the gap
  and propose a minor-bump API addition in a follow-up ADR.
- **Third jurisdiction group** (e.g. APAC markets in Phase 3) forces
  structural rethink — revisit the `Jurisdiction` open-union model.
- **React 20 / Next 16** upgrade cycle — re-validate that "no framework
  assumption" still holds.

## Changelog

- **2026-04-15** — ADR drafted and Decided. Contract commits at v0.1.0 publish
  (Wave 3).
