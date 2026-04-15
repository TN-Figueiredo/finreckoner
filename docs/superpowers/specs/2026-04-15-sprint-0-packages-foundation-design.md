# Sprint 0 — Packages + Foundation: Design Spec

**Status:** Proposed (awaiting user review)
**Date:** 2026-04-15
**Author:** Thiago Figueiredo (with Claude collaboration)
**Sprint window:** 2026-04-15 → 2026-04-29 (2 weeks, 12 working days)
**Estimated effort:** 57h
**Roadmap reference:** [`finreckoner/docs/roadmap/phase-1-mvp.md` § Sprint 0](../../roadmap/phase-1-mvp.md)
**Source rationale:** [`ideias/finreckoner/03-roadmap-creator.md`](../../../../ideias/finreckoner/03-roadmap-creator.md) (marked stale; this spec supersedes scope details)

---

## 0. Purpose & scope

Sprint 0 establishes the **package foundation** (`@tn-figueiredo/calc-engine`, `@tn-figueiredo/partner-links`) and the **finreckoner.com app skeleton** (Next.js 15 SSG on Vercel) required for all subsequent calculator and content work. No user-facing calculators ship in S0 — they begin S1.

**Scope adjustment vs source roadmap:** discovery during brainstorming revealed `calc-engine` does NOT exist in `tnf-ecosystem` (roadmap assumed EXTEND; reality is NEW). Existing `@tn-figueiredo/affiliate@0.1.0` is creator-management (outbound), conceptually opposite to finreckoner's needs (inbound partner-links). New package `@tn-figueiredo/partner-links` introduced. CMS integration deferred to S1 (Thiago handling cms extraction in parallel). Net effort: **49h → 57h** (NEW package overhead + comprehensive property-tests per Q7-B decision).

## 1. Architecture

### 1.1 Component layout

```
tnf-ecosystem (existing monorepo)
├── packages/
│   ├── calc-engine/                 [NEW @tn-figueiredo/calc-engine@0.1.0]
│   │   ├── package.json             # exports map, dep decimal.js direct (npm workspaces dedupes)
│   │   ├── CHANGELOG.md
│   │   ├── tsup.config.ts
│   │   ├── vitest.config.ts
│   │   ├── src/
│   │   │   ├── index.ts             # re-exports: Money, formatters, errors, hooks
│   │   │   ├── errors.ts
│   │   │   ├── hooks.ts             # CalcEngineHooks (onCalculation, onFxConvert, onError)
│   │   │   ├── primitives/
│   │   │   │   ├── money.ts         # branded object (RSC-safe), functions add/sub/mul/div/compare/format
│   │   │   │   ├── bracket.ts       # solveBracketTax + validateBrackets
│   │   │   │   └── rounding.ts      # IRS_POLICY, CRA_POLICY, RQ_POLICY constants
│   │   │   ├── tax/
│   │   │   │   ├── types.ts         # TaxResult<TInput>, TaxSource, BracketBreakdown
│   │   │   │   ├── us/
│   │   │   │   │   ├── index.ts     # calcUsFederalTax(input)
│   │   │   │   │   ├── years/2026.ts  # IRS Rev. Proc. 2025-32 brackets, validateBrackets at module-load
│   │   │   │   │   └── registry.ts  # SUPPORTED_US_YEARS = [2026]
│   │   │   │   └── ca/
│   │   │   │       ├── index.ts     # calcCaFederalTax + calcCaProvincialTax + calcCaTotalTax (12 prov, no QC)
│   │   │   │       ├── years/2026.ts  # CRA T4127 Jan 2026
│   │   │   │       ├── registry.ts
│   │   │   │       └── qc/
│   │   │   │           ├── index.ts # calcQuebecTax (separate API)
│   │   │   │           ├── years/2026.ts  # Revenu Québec TP-1015.F 2026
│   │   │   │           └── registry.ts
│   │   │   └── fx/
│   │   │       ├── interface.ts     # FxSource interface
│   │   │       ├── static.ts        # StaticFxSource (test/dev only)
│   │   │       └── types.ts         # FxRate, FxError
│   │   ├── __tests__/
│   │   │   ├── property/            # fast-check 8 props × 3 jurisdictions
│   │   │   ├── golden/              # 30 snapshots S0 (10/jurisdiction); 20 carry to S1
│   │   │   └── unit/
│   │   └── docs/migration-notes-0.x.md
│   │
│   └── partner-links/               [NEW @tn-figueiredo/partner-links@0.1.0]
│       ├── package.json             # exports: ".", "./react"; peerDeps react>=18
│       ├── CHANGELOG.md
│       ├── src/
│       │   ├── index.ts             # agnostic core: providers, UTM, FTC text helpers
│       │   ├── errors.ts            # PartnerLinksError, ProviderError, FtcComplianceError
│       │   ├── providers/
│       │   │   ├── types.ts         # Provider interface
│       │   │   └── {wise,questrade,wealthsimple,credit-karma,nerdwallet}.ts
│       │   ├── ftc-disclosure/
│       │   │   ├── text.ts          # disclosureText(provider, locale)
│       │   │   └── react.tsx        # <FTCDisclosure /> RSC-safe component
│       │   ├── utm.ts               # buildUtmQuery
│       │   └── locale.ts            # resolveLocale (BCP-47 fallback)
│       └── __tests__/

finreckoner (NEW GitHub repo: TN-Figueiredo/finreckoner)
├── .github/workflows/ci.yml         # typecheck + test + audit + secret-scan + ecosystem-pinning + Lighthouse CI
├── .nvmrc                           # 20
├── .npmrc                           # @tn-figueiredo:registry + auth + save-exact + engine-strict
├── apps/web/                        # Next.js 15 SSG, Tailwind 4, React 19
│   ├── package.json                 # pinned @tn-figueiredo/{calc-engine, partner-links, seo, shared}
│   ├── lighthouserc.json            # perf≥90, a11y≥95, seo≥95, LCP<2.0s, CLS<0.1
│   ├── public/
│   │   ├── ads.txt                  # comment-only placeholder pré-AdSense
│   │   └── robots.txt
│   └── src/
│       ├── app/
│       │   ├── layout.tsx           # hreflang alternates EN-US, EN-CA via @tnf/seo
│       │   ├── page.tsx             # homepage v0
│       │   └── (legal)/.gitkeep
│       ├── components/
│       │   ├── Footer.tsx           # reads SITE_CONFIG.launchedAt
│       │   ├── HeroCreator.tsx
│       │   └── CalcCardPlaceholder.tsx  # disabled, "Coming Sprint 1"
│       └── lib/
│           └── site-config.ts       # SITE_CONFIG.launchedAt = '2026-04-29' (immutable, CI-guarded)
├── docs/
│   ├── superpowers/{specs,plans}/
│   ├── adr/                         # app-specific ADRs (later)
│   ├── legal/
│   │   ├── affiliate-terms-2026-04.md  # markdown + PNG screenshots referenced
│   │   └── screenshots/
│   └── ecosystem/
│       └── cascade-2026-04-S0.md    # smoke-test log (null-op em S0; infra warmup)
└── .gitignore                       # *.pdf binaries (use markdown + PNG instead)
```

**Cross-repo cascade tooling** (committed to `tnf-ecosystem/scripts/`):
- `cascade-smoke-test.sh` — iterates `consumers.json`, runs `upgrade-ecosystem.sh + npm test` per consumer
- `pull-test.sh` — local sandbox install of tarball (gates publish)
- `consumers.json` — config-driven consumer matrix
- `extract-latest-changelog.sh` — feeds GitHub release body
- `check-golden-approval.sh` — CI gate for snapshot changes (requires PR label `approved-golden-change`)

### 1.2 Locked architectural decisions

| ID | Decision | Rationale |
|---|---|---|
| ADR-001 | `Money` as branded object (not class), with `decimal.js`-typed `amount` field | RSC-safe (passes RSC boundary, JSON-serializable); branded prevents `{amount, currency}` raw misuse; functions tree-shake better than methods |
| ADR-002 | `yearRegistry` dispatcher per jurisdiction (not coupled to a single year file) | Adding TY2027 in S1 2027 = additive only (push to `SUPPORTED_*_YEARS`); zero breaking change |
| ADR-003 | `partner-links` split via `exports` map: `"."` (agnostic core) + `"./react"` (FTCDisclosure JSX) | Future Astro/Remix/Node consumers reuse core without React peer-dep |
| ADR-004 | Cascade architecture: ecosystem-push initially (S0); migrate to consumer-pull (CI-triggered on registry event) in S1+ | Push is simpler for null-op S0; pull is more robust as consumer count grows |
| ADR-005 | Property-test iteration count: measure with 1K runs first, extrapolate, set final budget Day 6 | Avoids guessing CI timing; 240K iter naive estimate could blow CI budget |

ADRs 001-005 written in S0 M0.5 to `tnf-ecosystem/docs/adr/` using template in §6.4.

### 1.3 finreckoner = new GitHub repo (NOT inside tnf-ecosystem)

**Decision:** `TN-Figueiredo/finreckoner` is a separate repo. tnf-ecosystem hosts reusable packages; finreckoner hosts the consumer app. Same pattern as `tonagarantia`, `bythiagofigueiredo`, `fan-stamp`.

## 2. Public APIs

### 2.1 calc-engine — Money primitive (RSC-safe branded object)

```ts
// primitives/money.ts
declare const MoneyBrand: unique symbol
export type Currency = string  // ISO 4217, validated runtime via /^[A-Z]{3}$/
export const KNOWN_CURRENCIES = ['USD','CAD','BRL','EUR','GBP'] as const

export interface Money {
  readonly amount: Decimal
  readonly currency: Currency
  readonly [MoneyBrand]: true
}

export function money(amount: Decimal | string | number, currency: Currency): Money
  // throws InvalidInputError if amount NaN/Infinity/non-numeric/exceeds 1e12 sanity cap, or currency invalid

export function moneyFromJSON(j: { amount: string; currency: string }): Money
  // RSC boundary deserializer; validates currency regex

export const add = (a: Money, b: Money): Money       // throws CurrencyMismatchError if currencies differ
export const sub = (a: Money, b: Money): Money
export const mul = (m: Money, factor: Decimal | number): Money
export const div = (m: Money, divisor: Decimal | number): Money
export const isZero = (m: Money): boolean
export const isNegative = (m: Money): boolean
export const compare = (a: Money, b: Money): -1 | 0 | 1   // throws if currencies differ
export const formatMoney = (m: Money, locale?: string): string
  // Intl.NumberFormat(locale, { style: 'currency', currency: m.currency })
```

### 2.2 calc-engine — Bracket primitive

```ts
// primitives/bracket.ts
/**
 * Inclusive lower-bound, exclusive upper-bound: [lowerBound, upperBound).
 * Income exactly = lowerBound belongs to THIS bracket.
 * Income exactly = upperBound belongs to the NEXT bracket.
 * Top bracket: upperBound = null (infinity).
 */
export interface Bracket {
  readonly lowerBound: Decimal
  readonly upperBound: Decimal | null
  readonly rate: Decimal  // 0.12 = 12%
}

export interface BracketBreakdown {
  readonly bracket: Bracket
  readonly taxableAmount: Money
  readonly taxInBracket: Money
}

export function validateBrackets(brackets: readonly Bracket[]): void
  // Enforces: sorted ascending, no gaps, no overlaps, exactly one upperBound=null (last), first.lowerBound = 0
  // throws BracketError on violation
  // CALLED AT MODULE LOAD TIME in each years/YYYY.ts (fail at import, not runtime)

export function solveBracketTax(
  income: Money,
  brackets: readonly Bracket[],
  policy: RoundingPolicy
): { total: Money; breakdown: readonly BracketBreakdown[] }
```

### 2.3 calc-engine — Rounding policies

```ts
// primitives/rounding.ts
export type RoundingMode = 'HALF_UP' | 'HALF_EVEN' | 'DOWN' | 'UP'

export interface RoundingPolicy {
  readonly mode: RoundingMode
  readonly intermediateMode: 'CENTS' | 'DOLLARS' | 'NONE'
  readonly finalMode: 'CENTS' | 'DOLLARS'
}

export const IRS_POLICY: RoundingPolicy = { mode: 'HALF_UP', intermediateMode: 'NONE', finalMode: 'DOLLARS' }
export const CRA_POLICY: RoundingPolicy = { mode: 'HALF_UP', intermediateMode: 'CENTS', finalMode: 'CENTS' }
export const RQ_POLICY:  RoundingPolicy = { mode: 'HALF_UP', intermediateMode: 'CENTS', finalMode: 'CENTS' }
```

### 2.4 calc-engine — Tax APIs

```ts
// tax/types.ts
export type TaxYear = number  // public type is plain number; runtime check against SUPPORTED_*_YEARS
export type FilingStatus = 'single' | 'married-jointly' | 'married-separately' | 'head-of-household'

export interface TaxSource {
  readonly url: string                    // canonical PDF link
  readonly publication: string            // e.g., "IRS Rev. Proc. 2025-32"
  readonly jurisdiction: string           // "US Federal" | "CA Federal" | "CA-ON" | "CA-QC" | ...
  readonly taxYear: number
  readonly retrievedAt: string            // ISO date when snapshot taken
  readonly refreshBy: string              // ISO date next refresh expected (Nov-Dec for IRS, Jan/Jul for CRA/RQ)
}

export interface TaxResult<TInput = unknown> {
  readonly input: TInput                  // echoed for debug/display
  readonly tax: Money
  readonly effectiveRate: Decimal
  readonly marginalRate: Decimal
  readonly breakdown: readonly BracketBreakdown[]
  readonly source: TaxSource
  readonly computedAt: string             // ISO timestamp
  readonly scope: {
    readonly filingStatus?: FilingStatus
    readonly deductions: 'none'           // S0: single filer baseline, no deductions
    readonly creditsApplied: readonly string[]  // S0: empty
  }
}

export function formatPercentage(d: Decimal, digits?: number): string  // "12.43%"

// tax/us/index.ts
export interface UsTaxInput {
  income: Money            // must be USD
  filingStatus: FilingStatus
  year?: TaxYear           // default 2026
}
/**
 * @throws {InvalidInputError, UnsupportedYearError, CurrencyMismatchError}
 */
export function calcUsFederalTax(input: UsTaxInput): TaxResult<UsTaxInput>

// tax/ca/index.ts
export type CaProvince = 'AB'|'BC'|'MB'|'NB'|'NL'|'NS'|'NT'|'NU'|'ON'|'PE'|'SK'|'YT'
// QC excluded; use tax/ca/qc/calcQuebecTax

export interface CaTaxInput {
  income: Money            // must be CAD
  province: CaProvince
  year?: TaxYear
}
export function calcCaFederalTax(input: CaTaxInput): TaxResult<CaTaxInput>
export function calcCaProvincialTax(input: CaTaxInput): TaxResult<CaTaxInput>
export function calcCaTotalTax(input: CaTaxInput): TaxResult<CaTaxInput>

// tax/ca/qc/index.ts
export interface QcTaxInput {
  income: Money            // must be CAD
  year?: TaxYear
}
export function calcQuebecTax(input: QcTaxInput): TaxResult<QcTaxInput>
```

### 2.5 calc-engine — FX

```ts
// fx/interface.ts
export interface FxSource {
  readonly id: string
  /** Sugar for mul(money, await getRate(money.currency, to)). */
  convert(money: Money, to: Currency, opts?: { date?: Date }): Promise<Money>
  getRate(from: Currency, to: Currency, opts?: { date?: Date }): Promise<Decimal>
}

export class StaticFxSource implements FxSource {
  readonly id = 'static'
  constructor(rates: Record<`${string}/${string}`, Decimal | string>)
  // missing rate → throws FxError
}

export class FxError extends CalcEngineError { code = 'FX_ERROR' }
```

### 2.6 calc-engine — Hooks (observability-ready)

```ts
// hooks.ts
export interface CalcEngineHooks {
  onCalculation?(result: TaxResult): void
  onFxConvert?(event: { from: Currency; to: Currency; rate: Decimal; sourceId: string }): void
  onError?(error: CalcEngineError, context: { operation: string; input: unknown }): void
}
export const defaultHooks: CalcEngineHooks = {}
// Consumer injects via context (S3 wires Sentry).
```

### 2.7 partner-links — Provider interface

```ts
// providers/types.ts
export type ProviderId = 'wise' | 'questrade' | 'wealthsimple' | 'credit-karma' | 'nerdwallet'

export interface Provider {
  readonly id: ProviderId
  readonly name: string
  readonly jurisdictions: readonly ('US'|'CA'|'UK'|'BR')[]
  readonly disclosureTemplate: string       // e.g., "We earn a commission from {{name}} if you sign up..."
  readonly termsArchiveRef: string          // e.g., "docs/legal/affiliate-terms-2026-04.md#wise"
  buildLink(opts: { ref: string; utm?: UtmParams }): URL  // typed URL, not string
}

export const WISE: Provider, QUESTRADE: Provider, WEALTHSIMPLE: Provider, CREDIT_KARMA: Provider, NERDWALLET: Provider
```

### 2.8 partner-links — UTM + FTC

```ts
// utm.ts
export interface UtmParams {
  source?: string    // default 'finreckoner'
  medium?: string    // default 'calc'
  campaign?: string
  content?: string
  term?: string
}
export function buildUtmQuery(utm: UtmParams, defaults?: Partial<UtmParams>): string

// ftc-disclosure/text.ts
export function disclosureText(provider: Provider, locale?: string): string
  // Interpolates provider.disclosureTemplate; falls back via resolveLocale

// ftc-disclosure/react.tsx (subpath /react, peerDep react>=18)
export interface FTCDisclosureProps {
  provider: Provider
  locale?: string
  variant?: 'inline' | 'block'              // inline = per-link proximity; block = footer
  learnMoreHref?: string                    // default '/legal/ftc-disclosure'
  strictProximityCheck?: boolean            // dev-only useEffect warn; no-op in production
}
export const FTCDisclosure: React.FC<FTCDisclosureProps>  // RSC-safe (no hooks in render path)
```

### 2.9 Error hierarchy

```
CalcEngineError (abstract, code: string)
├── InvalidInputError (INVALID_INPUT)
├── BracketError (BRACKET_INVALID)
├── UnsupportedYearError (UNSUPPORTED_YEAR)
├── CurrencyMismatchError (CURRENCY_MISMATCH)
└── FxError (FX_ERROR)

PartnerLinksError (abstract, code: string)
├── ProviderError (PROVIDER_UNKNOWN)
└── FtcComplianceError (FTC_PROXIMITY)  // dev-mode runtime check
```

### 2.10 Bundle budgets (`size-limit`)

| Package | Subpath | Budget gzipped |
|---|---|:-:|
| calc-engine | `dist/index.js` | 20 KB |
| calc-engine | `dist/tax/us/index.js` | 6 KB |
| calc-engine | `dist/tax/ca/index.js` | 10 KB |
| calc-engine | `dist/tax/ca/qc/index.js` | 4 KB |
| calc-engine | `dist/fx/index.js` | 3 KB |
| partner-links | `dist/index.js` | 6 KB |
| partner-links | `dist/react/index.js` | 4 KB |

Tuned with measurement at end of M0.2 (replace placeholders with measured + 25% headroom).

## 3. Data flows

### 3.1 Release flow (publish + cascade)

```
Edit packages/<pkg>/src
    ↓
npm run build && test && size -w packages/<pkg>
    ↓
Edit CHANGELOG.md + bump package.json
    ↓
git tag <pkg>-v<version> && git push
    ↓
GitHub Actions publish.yml triggered:
    1. npm pack (tarball local)
    2. ./scripts/pull-test.sh <pkg> <version>  ← GATES publish
    3. npm publish to GitHub Packages
    4. gh release create with extracted CHANGELOG entry
    5. ./scripts/cascade-smoke-test.sh (non-gating; opens issue on failure)
```

### 3.2 Site-age flow (immutable launchedAt)

```
apps/web/src/lib/site-config.ts (SITE_CONFIG.launchedAt = '2026-04-29', committed)
    ↓ CI guard: PR diff to launchedAt requires label 'allow-launch-date-edit'
    ↓
Footer.tsx imports SITE_CONFIG → renders <small>Live since {formatDate(launchedAt, locale)}</small>
```

### 3.3 Tax calculation flow (consumer-side, S1+ usage)

```
import { calcUsFederalTax, money, formatMoney, formatPercentage } from '@tn-figueiredo/calc-engine/...'

const input = { income: money('75000', 'USD'), filingStatus: 'single', year: 2026 }
try {
  const result = calcUsFederalTax(input)
  // UI:
  //   formatMoney(result.tax, 'en-US')
  //   formatPercentage(result.effectiveRate)
  //   <table> from result.breakdown
  //   <cite>per {result.source.publication} <a href={result.source.url}>(source)</a></cite>
  //   <LegalDisclaimer variant="inline" />
  hooks.onCalculation?.(result)  // S3 wires Sentry breadcrumb
} catch (err) {
  hooks.onError?.(err, { operation: 'us-federal', input })
  if (err instanceof UnsupportedYearError) /* UI: year not supported */
  else if (err instanceof InvalidInputError) /* form field error */
  else /* generic retry */
}
```

### 3.4 Partner link + FTC flow (consumer-side, S1+ usage)

```tsx
import { WISE, FTCDisclosure } from '@tn-figueiredo/partner-links/react'

<a
  href={WISE.buildLink({ ref: 'currency-converter', utm: { campaign: 'cad-usd' } }).toString()}
  rel="sponsored nofollow noopener"
  target="_blank"
>
  Transfer CAD → USD on Wise
</a>
<FTCDisclosure provider={WISE} variant="inline" />
```

## 4. Testing strategy

### 4.1 Test matrix

| Layer | Tool | Scope | Cases | CI budget |
|---|---|---|---|:-:|
| Unit | vitest | Money ops, validateBrackets, rounding policies | ~60 | <2s |
| Property | vitest + fast-check | 8 properties × 3 jurisdictions (US, CA, QC) | budget set Day 6 (1K trial → extrapolate) | <60s target |
| Golden | vitest snapshot | 30 cases S0 (10/jurisdiction); 20 carry to S1 | 30 | <3s |
| Bundle | size-limit | 7 budget checks | 7 | <5s |
| Typecheck | tsc --noEmit | both packages | — | <5s |

### 4.2 Property-based properties (calc-engine)

1. **Monotonicity:** ∀ i1<i2 (same other input): `tax(i1) ≤ tax(i2)`
2. **Boundary exatness:** ∀ threshold t: `tax(t+0.01) − tax(t) ≤ marginalRate × 0.01 + ε`
3. **Zero income:** `tax(money('0', cur)) === money('0', cur)`
4. **Sanity ceiling:** `tax(money('1e9', cur))` produces valid result (no NaN/Infinity)
5. **Progressivity:** ∀ i1<i2: `effectiveRate(i1) ≤ effectiveRate(i2)`
6. **Bracket commutativity:** `sum(breakdown[].taxInBracket) === result.tax` (±rounding ε)
7. **Rounding policy conformance:** result respects jurisdiction RoundingPolicy
8. **FX round-trip:** `|convert(convert(m, USD→CAD), CAD→USD) − m| / m < 0.01%`

### 4.3 Golden snapshots (S0 deliverable: 30; format)

```json
[
  {
    "description": "single filer $50k 2026",
    "input": { "income": { "amount": "50000", "currency": "USD" }, "filingStatus": "single", "year": 2026 },
    "expected": { "tax": { "amount": "6307", "currency": "USD" }, "effectiveRate": "0.12614", "marginalRate": "0.22" },
    "sourceRef": "IRS Pub 17 (2026), example 3-2"
  }
]
```

Sources: IRS Pub 17 worked examples; CRA T4127 worksheet examples; Revenu Québec TP-1015.G-V guide examples.

CI gate: PR diff to `__tests__/golden/*.json` requires PR label `approved-golden-change` (YMYL ward).

### 4.4 Property-test CI calibration (ADR-005)

Day 6 first run with `numRuns: 1000`. Measure. Decision matrix:

| Measured 1K runtime | Set numRuns | Reasoning |
|:-:|:-:|---|
| <3s | 10000 | Plenty of headroom |
| 3-10s | 5000 | Comfortable |
| 10-30s | 2000 | Edge of budget |
| >30s | 1000 + investigate | Slow property; profile |

Final number documented in ADR-005 + `vitest.config.ts`.

### 4.5 partner-links property tests

1. ∀ provider, ref string: `provider.buildLink({ ref })` parses as valid URL via `new URL()`
2. ∀ provider, utm: returned URL contains all non-empty utm params as query
3. ∀ provider, locale ∈ KNOWN_LOCALES: `disclosureText(p, locale)` non-empty + contains `p.name`
4. ∀ provider: `termsArchiveRef` matches `/^docs\/legal\/affiliate-terms-\d{4}-\d{2}\.md#.+$/`

### 4.6 Integration tests (S0 minimum)

- `@tn-figueiredo/calc-engine` import via `.npmrc` → GitHub Packages registry succeeds
- `@tn-figueiredo/partner-links/react` subpath import succeeds
- `apps/web` Next build produces `/index.html` with Footer rendering
- HTTP GET `/ads.txt` returns 200 + `text/plain`
- HTTP GET `/robots.txt` returns 200

### 4.7 Security review (S0 boundary validation, 1h in M0.2)

- `money()` rejects: NaN, Infinity, non-numeric string, amount > 1e12 (sanity DoS guard)
- `Currency` runtime: `/^[A-Z]{3}$/` regex enforced
- fast-check property tests include adversarial inputs (Decimal min/max, empty strings, near-boundary values)

## 5. CI pipeline

### 5.1 tnf-ecosystem (existing — extend)

`.github/workflows/ci.yml` matrix-tests calc-engine + partner-links along existing packages: typecheck + test + size + audit + secret-scan.

`.github/workflows/publish.yml` (new): triggered on tag `<pkg>-v<version>`:
1. `npm pack` (tarball local)
2. `pull-test.sh` (sandbox install + smoke import) — **gates publish**
3. `npm publish` to GitHub Packages
4. `gh release create` with `extract-latest-changelog.sh` output
5. `cascade-smoke-test.sh` (non-gating; opens issue on failure)

### 5.2 finreckoner (new repo)

`.github/workflows/ci.yml`:
- typecheck, test, audit, secret-scan
- `check-ecosystem-pinning.sh` (no `^/~` in `@tn-figueiredo/*` deps)
- `npm run build` (Next.js SSG)
- Lighthouse CI per `lighthouserc.json` (perf≥90, a11y≥95, seo≥95, LCP<2.0s, CLS<0.1)
  - **NB:** S0 homepage minimal; LCP green is shell-level signal, not real-content compliance proof. Real-device WebPageTest run at G3 (S3) before launch.
- gitleaks
- Site-config immutability check: PR diff `apps/web/src/lib/site-config.ts launchedAt` requires `allow-launch-date-edit` label

### 5.3 .npmrc (finreckoner)

```
@tn-figueiredo:registry=https://npm.pkg.github.com
//npm.pkg.github.com/:_authToken=${NODE_AUTH_TOKEN}
engine-strict=true
save-exact=true
```

## 6. Sprint timeline + execution plan

### 6.1 Effort breakdown

| Milestone | Hours | Days |
|---|:-:|:-:|
| M0.1 calc-engine core | 24 | 1-5 |
| M0.2 calc-engine tests + first publish | 7 | 6-7 |
| M0.3 partner-links + publish | 9 | 7-9 |
| M0.4 finreckoner scaffold + infra (split: 2h Days 1-2 background + 12h Days 10-12) | 14 | 1-2 (bg) + 10-12 |
| M0.5 closeout (terms archive + ADRs 001-005 + retro + cascade dry-run) | 3 | 12 |
| **Total** | **57** | **12** |

**Pacing:** Week 1 ~5.2h/day; Week 2 ~4.4h/day. Wed Apr 22 PM = rest slot (post-M0.2-publish celebration, fadiga mitigation).

### 6.2 Milestone DAG

```
M0.4a (Day 1-2 bg, low-mental-load: GitHub repo, DNS, Vercel UI) ──┐
                                                                   │
M0.1 calc-engine core (Days 1-5, primary) ──┬──► M0.2 (Days 6-7) ──┴──► M0.4b code (Days 10-11)
                                            │              │                    │
                                            └──► M0.3 partner-links ────────────┘
                                                 (Days 7-9, parallel after M0.1)
                                                                                ▼
                                                                         M0.4c polish + M0.5 (Day 12)
```

### 6.3 Slippage playbook

| Trigger | Date | Action |
|---|---|---|
| M0.1 > Day 5 | Apr 17 EOD | Cut `tax/ca/qc` pra S1 (US + CA-12prov ship) |
| M0.2 publish fails | Day 6-7 | 4h debug; manual publish Day 7 fallback; CI fix post-sprint |
| M0.3 > Day 9 | Apr 26 EOD | Ship 3 providers (Wise+Questrade+NerdWallet); 2 carry to S1 v0.2.0 |
| M0.4 > Day 11 | Apr 27 EOD | Cut `seo` configure to S1 (homepage without hreflang OK 1 week); domain+ads.txt remain critical |
| M0.5 > Day 12 | Apr 29 EOD | Defer ADRs to S1 W1 (non-blocking); affiliate terms archive IS blocking |
| G0 ❌ Day 11 | EOD | Day 12 = 100% fix mode; Launch Week still on target |
| G0 ❌ Day 12 | EOD | Slip 1 day; S1 starts Apr 30 (1-day ripple, absorbed by 17.5% buffer) |

### 6.4 ADR template (used for ADR-001..005)

```markdown
# ADR-NNN: <Title>

**Status:** Proposed | Accepted | Deprecated | Superseded by ADR-XXX
**Date:** YYYY-MM-DD
**Author:** <name>

## Context
<problem statement, forces, constraints>

## Decision
<chosen approach in 1-3 sentences>

## Consequences
### Positive
- ...
### Negative
- ...
### Risks
- ...

## Alternatives considered
<2-3 options with rejection rationale>
```

### 6.5 Retro template (M0.5 deliverable)

```markdown
# Sprint 0 Retrospective — 2026-04-29

## Estimated vs actual
| Milestone | Estimated | Actual | Δ |
|---|:-:|:-:|:-:|
| M0.1 | 24h | __ | __ |
| M0.2 | 7h | __ | __ |
| M0.3 | 9h | __ | __ |
| M0.4 | 14h | __ | __ |
| M0.5 | 3h | __ | __ |

## What worked
## What didn't
## Unknowns surfaced (now known-unknowns for S1)
## Decisions for S1
## Velocity calibration
S0 actual: __h / 12 days = __h/day. S1 plan: keep / increase / decrease.
```

## 7. Pre-S0 prerequisites (all by Apr 13 EOD, except where noted)

| Prereq | Owner | Fallback if not met |
|---|---|---|
| GitHub org `TN-Figueiredo` write access + NPM_TOKEN classic PAT (write+read packages, expiry ≥ Jul 2026) | Thiago | Rotate proactively |
| Cloudflare Registrar `finreckoner.com` registered + nameservers delegated | Thiago | Vercel preview URL until Day 11 |
| Vercel free-tier 1 slot available | Thiago | Delete old project OR upgrade Pro |
| 5 affiliate logins confirmed (Wise, Questrade, Wealthsimple, Credit Karma, NerdWallet) | Thiago | If Wise broken, defer cookie validation to S1 |
| Sibling checkouts present (`tonagarantia`, `bythiagofigueiredo`, `fan-stamp`, `tnf-ecosystem`, `tnf-scaffold`) | Thiago | `git clone` what's missing (Apr 14 OK) |
| Tax contractor outreach initiated | Thiago | Async; doesn't block S0 (S2 hard requirement) |
| Confirm IRS Rev. Proc. 2025-32 published; CRA T4127 Jan 2026 published; RQ TP-1015.F 2026 published | Thiago | Use 2025 brackets with `provisional 2026` flag; refresh in S1 |
| **OD-11 confirm:** Thiago working calendar S0 (M-F 5h + Sun 5h, Sat off?) | Thiago | Adjust day-by-day if pattern differs |

## 8. Risks (S0-specific)

| # | Risk | Prob | Impact | Mitigation |
|---|---|:-:|:-:|---|
| S0-R1 | IRS Rev. Proc. 2025-32 not published by Apr 15 | Low | 🔴 high | Day 1 check; fallback 2025 + provisional flag |
| S0-R2 | CRA T4127 / RQ TP-1015.F 2026 missing | Low | 🔴 high | Same fallback pattern |
| S0-R3 | Wise Partner Portal access broken or terms different | Med | 🟡 med | Spike Day 1; copy "long-window affiliate" if cookie ≠ 1yr |
| S0-R4 | tnf-scaffold outdated (Next 14 not 15) | Med | 🟡 med | Day 10 health check; +2h scaffold upgrade buffer OR fresh `create-next-app` |
| S0-R5 | NPM_TOKEN expired/insufficient | Low | 🟡 med | Day 1 check; rotate proactively |
| S0-R6 | Vercel free tier slot/domain delay | Low | 🟢 low | Cloudflare-Vercel integration is instant typically |
| S0-R7 | Property tests blow CI time budget | Low | 🟢 low | ADR-005 measurement-based calibration |
| S0-R8 | Cross-repo cascade false-positive in existing consumers | Med | 🟢 low | S0 cascade is null-op (NEW packages); infra warmup only |
| S0-R9 | Next 15 + TW 4 + React 19 + Node 20 compat quirks | Med | 🟡 med | Copy versions exactly from `bythiagofigueiredo` lockfile |
| S0-R10 | Day-12 crunch (7h vs 5h baseline) | Med | 🟢 low | M0.5 padded; can slip 1 day |
| S0-R11 | Calc bug discovered post-publish | Low | 🟡 med | Rollback plan §9 |

## 9. Rollback plan

For both `calc-engine@0.1.0` and `partner-links@0.1.0`:

| Severity | Window | Action |
|---|---|---|
| Low (typo, doc, non-functional) | Any | Patch → `@0.1.1`, continue sprint |
| Medium (API incorrect but no consumer yet — S0 has zero) | Any | `@0.1.1` patch + announce in CHANGELOG |
| High (calc tax computation wrong) | <72h post-publish | `npm unpublish @tn-figueiredo/<pkg>@<ver>` (registry allows within 72h) + republish `@0.1.1` after fix + cascade rerun |
| High (post-72h window) | >72h | Cannot unpublish; publish `@0.1.1` with fix, mark `@0.1.0` deprecated in npm metadata, document in CHANGELOG |

S0 budget: 2h reserved within Day 12 for rollback event.

## 10. Open decisions (resolve in plan or first-day-of-S0)

| # | Decision | Default proposed |
|---|---|---|
| OD-1 | tnf-scaffold branch | `main@latest` (greenfield OK with bleeding-edge) |
| OD-2 | Package manager | npm workspaces (ecosystem consistency) |
| OD-3 | ADR template | Simple markdown per §6.4 |
| OD-4 | Golden snapshots S0 count | 30 (10/jurisdiction); 20 carry to S1 |
| OD-5 | Lighthouse CI scope S0 | Homepage only; explicit "shell-only signal" caveat |
| OD-6 | site-config immutability enforcement | CI only (Husky bypassable) |
| OD-7 | .npmrc auth source | env `NODE_AUTH_TOKEN`; dev reads `~/.npmrc` global |
| OD-8 | Homepage 4 calc placeholders | Disabled `<div role="article" aria-disabled="true">` with "Coming May 2026" badge |
| OD-9 | Tax contractor SoW template | Defer to Thiago outreach (S2 epic) |
| OD-10 | FTCDisclosure dev-mode strict check | `useEffect` client-only warn |
| OD-11 | Thiago working calendar S0 | M-F 5h + Sun 5h (confirm before Day 1) |

## 11. Go/No-Go G0 checklist (Apr 29 EOD, ideally Apr 28 EOD)

- [ ] `@tn-figueiredo/calc-engine@0.1.0` live on GitHub Packages registry
- [ ] `@tn-figueiredo/partner-links@0.1.0` idem
- [ ] `finreckoner.com` resolves with valid SSL
- [ ] Homepage v0 accessible; Footer shows "Live since 2026-04-29"
- [ ] `/ads.txt` + `/robots.txt` served HTTP 200
- [ ] CI green in both repos (typecheck + test + size + audit + secret-scan + ecosystem-pinning + Lighthouse ≥90)
- [ ] hreflang EN-US + EN-CA present in `<head>` via `@tn-figueiredo/seo`
- [ ] `docs/legal/affiliate-terms-2026-04.md` committed with 5 PNG screenshots + confirmed terms (or flagged discrepancies)
- [ ] ADR-001..005 committed in `tnf-ecosystem/docs/adr/`
- [ ] `scripts/{cascade-smoke-test,pull-test,extract-latest-changelog,check-golden-approval}.sh` + `consumers.json` committed
- [ ] Retro filled (estimated vs actual at minimum)
- [ ] `docs(roadmap): close sprint 0` commit in `finreckoner/`

## 12. Out of scope (deferred to later sprints)

- Any user-facing calculator (S1+)
- `@tn-figueiredo/cms` integration (Thiago's parallel work; integrate in S1)
- Tax contractor review (S2 SoW signed; S3 review delivered)
- AdSense submission (S3)
- Real FX implementation (`EcbFxSource`, `WiseFxSource`) — only interface + StaticFxSource in S0
- Premium tier, Supabase, Auth (Phase 3D)
- 4 user-facing legal pages (Privacy, ToS, FTC, Disclaimer/Accuracy) — S2
- `/about`, `/contact` pages — S2

## 13. References

- Roadmap: `finreckoner/docs/roadmap/phase-1-mvp.md` § Sprint 0
- Source rationale (stale): `ideias/finreckoner/03-roadmap-creator.md`
- Compliance baseline: `finreckoner/CLAUDE.md` § YMYL Compliance + AdSense Finance vertical
- Ecosystem conventions: `tnf-ecosystem/CLAUDE.md`
- IRS Rev. Proc. 2025-32 (TY2026 inflation adjustments): https://www.irs.gov/pub/irs-drop/rp-25-32.pdf (verify Day 1)
- CRA T4127 Jan 2026 edition: https://www.canada.ca/en/revenue-agency/services/forms-publications/publications/t4127.html
- Revenu Québec TP-1015.F: https://www.revenuquebec.ca/en/online-services/forms-and-publications/current-details/tp-1015.f-v/
- FTC 16 CFR Part 255 (2023 update): https://www.ftc.gov/legal-library/browse/rules/guides-concerning-use-endorsements-testimonials-advertising
- Google YMYL QRG 2024: https://services.google.com/fh/files/misc/hsw-sqrg.pdf

---

**End of design spec.** Awaits user review before transition to `superpowers:writing-plans`.
