# feat(s0-hygiene): ymyl-ui@0.1.0 NEW + lgpd/seo/calc-engine/partner-links 0.2.0

Sprint 0 hygiene wave — addresses gaps surfaced by post-S0 audit.
Composite design score 68 → 83/100 (+15 pts).

## What's in this PR

### NEW package
- **`@tn-figueiredo/ymyl-ui@0.1.0`** — YMYL UI primitives for finance projects
  - `<YmylFooter>`, `<AuthorByline>`, `<ReviewerByline>` (with
    `attributionAllowed` opt-out per contractor SoW), `<YmylDisclaimer>`
    (inline above-fold for calc pages)
  - Templates: `<DisclaimerPage>` (UPL-safe), `<AccuracyPage>` (with
    refresh cadence + source URLs), `<ContactPage>` (with DMCA notice
    per 17 U.S.C. § 512(c))
  - RSC-safe (no `'use client'` needed). All props optional with
    sensible defaults per ecosystem CLAUDE.md backward-compat rule.
  - **49 tests passing** (text + react + templates).
  - v0.x reuse contract locked in
    [finreckoner ADR 004](https://github.com/TN-Figueiredo/finreckoner/blob/main/docs/decisions/004-ymyl-ui-reuse-api-contract.md).

### Extended packages (additive, backward compatible)

- **`@tn-figueiredo/lgpd` 0.1.0 → 0.2.0**
  - New `./ccpa` subpath: `readGpcSignal`, `respondToGpc`,
    `routeOptOutByState` for 10 states (CA/CO/CT/VA/UT + 5 more).
  - New `./consent-mode` subpath: `getRegionFromGeo` with full EEA
    list, `defaultConsentForRegion` as **single source of truth** for
    Consent Mode v2 across the ecosystem (EEA/UK/CH denied, US/CA
    granted, BR analytics-granted/ads-denied).
  - New `./templates` subpath: `<DnsmpiPage>`, `<PrivacyPolicyPage>`,
    `<TermsPage>`, `<FtcDisclosurePage>`.
  - New `./react` subpath: `<DNSMPILink>` (statutory CCPA wording),
    `<ConsentBanner>` placeholder.
  - **105 tests passing**. Zero changes to existing 0.1.0 exports.

- **`@tn-figueiredo/seo` 0.1.0 → 0.2.0**
  - New `./alternates` subpath: `validateAlternates` catches broken
    hreflang at build time when paired with a `RouteInventory` (the
    finreckoner `/en-US` + `/en-CA` broken-hreflang bug is covered by
    an explicit test).
  - New `./locale` subpath: `resolveLocaleFromAcceptLanguage` (RFC
    7231), `JurisdictionLocaleMap`.
  - **80 tests passing**. Backward compatible.

- **`@tn-figueiredo/calc-engine` 0.1.0 → 0.2.0**
  - Exports `SUPPORTED_US_TAX_YEARS`, `SUPPORTED_CA_TAX_YEARS`,
    `SUPPORTED_QC_TAX_YEARS` — consumers can programmatically discover
    supported tax years.
  - JSDoc `@throws` annotations on all public calc functions.
  - Typed `CalcEngineErrorContext` discriminated union for
    `hooks.onError` (was `unknown`).
  - **44 new bracket boundary tests** (-$0.01 / exact / +$0.01 trios
    per jurisdiction). Boundary semantics locked:
    `[lowerBound, upperBound)`. Negative income throws
    `InvalidInputError`.
  - **165 tests passing** (was 121).

- **`@tn-figueiredo/partner-links` 0.1.0 → 0.2.0**
  - Provider interface adds optional `cookieDays`, `payoutModel`,
    `payoutEstimate` for FTC material-connection clarity. Conservative
    defaults per provider (Wise left as `undefined` — requires Partner
    Portal validation per project rules).
  - Real `strictProximityCheck` DOM audit (warns with FTC 16 CFR 255
    citation when disclosure isn't adjacent to a CTA).
  - SSR-safe `<FTCDisclosure>` (no more hydration warning).
  - **71 tests passing** (was 16).

### Root workspace

- `package.json` adds `overrides: { react: 19.2.5, react-dom: 19.2.5 }`
  to fix workspace react@18/19 hoisting conflict surfaced by ymyl-ui
  + lgpd React-component tests. **Required** for clean
  `npm install --legacy-peer-deps` post-merge.

## Test totals

**470 tests passing across 5 packages, zero failures.**

| Package | Tests | Delta |
|---|:-:|:-:|
| calc-engine | 165 | +44 boundary + 2 hooks |
| lgpd | 105 | +97 (CCPA + Consent Mode + templates + react) |
| seo | 80 | +33 (alternates + locale) |
| partner-links | 71 | +55 (proximity + UTM + providers + disclosure) |
| ymyl-ui | 49 | NEW |

## Deferred (not in this PR — scheduled)

- `calc-engine` golden snapshot self-reference (20/30 unverified) —
  S2/S3 tax-contractor sign-off epic.
- `calc-engine` bundle duplication via `splitting:false` — separate
  architectural wave (Phase 2 candidate per
  [finreckoner runbook](https://github.com/TN-Figueiredo/finreckoner/blob/main/docs/runbooks/wave-3-publish.md)).

## Publish order (per Wave 3 runbook)

```bash
for pkg in calc-engine partner-links seo lgpd ymyl-ui; do
  cd packages/$pkg
  npm run build && npm test && npm publish
  cd ../..
done
```

Tag each: `<pkg>-v0.2.0` (or `ymyl-ui-v0.1.0`).

## Cascade

`finreckoner` consumer (in
[finreckoner repo](https://github.com/TN-Figueiredo/finreckoner)) is
already pinned to the new versions and committed; it will go CI-green
on `npm install` once this PR is merged + published.

## Reviewer checklist

- [ ] All 5 package CHANGELOGs reviewed
- [ ] Root `overrides` block correct
- [ ] No `any` introduced (TS strict everywhere)
- [ ] CI green (turbo build + test across all 5 packages)
- [ ] Verify no leak from local main WIP (admin/support/fraud-detection
      packages should be unchanged in this PR)
