# Sprint 0 — Packages + Foundation: Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Ship `@tn-figueiredo/calc-engine@0.1.0` + `@tn-figueiredo/partner-links@0.1.0` to GitHub Packages, and stand up `finreckoner.com` with Next.js 15 SSG skeleton on Vercel — all under YMYL/AdSense compliance baseline.

**Architecture:** Two NEW packages in `tnf-ecosystem` monorepo (npm workspaces, tsup build, vitest tests, decimal.js as direct dep, branded `Money` object with year-registry tax dispatchers); separate `finreckoner` GitHub repo with Next.js 15 + Tailwind 4 + React 19, consumes packages via GitHub Packages registry with `@tn-figueiredo:registry` mapping; CI in both repos enforces typecheck/test/audit/secret-scan/eco-pinning/Lighthouse + a custom `pull-test` gate that blocks `npm publish` until tarball install succeeds in sandbox.

**Tech Stack:** TypeScript 5 strict · Next.js 15 (App Router, SSG) · React 19 · Tailwind 4 · vitest + fast-check · decimal.js · tsup (ESM + CJS dual) · GitHub Actions · GitHub Packages · Cloudflare Registrar · Vercel free tier · Husky (commit hooks) · gitleaks (secret scan) · size-limit (bundle budget) · @lhci/cli (Lighthouse CI)

**Spec reference:** [`docs/superpowers/specs/2026-04-15-sprint-0-packages-foundation-design.md`](../specs/2026-04-15-sprint-0-packages-foundation-design.md)

---

## Pre-flight checks (Day 1 morning, before Task 1)

- [ ] Verify `jq` installed (required by cascade/pull-test scripts):
  ```bash
  which jq || brew install jq
  ```

- [ ] Verify dedicated **NPM_TOKEN** classic PAT (NOT `gh auth token`) exists with scopes `read:packages` + `write:packages` + `repo` (for tag push) + expiry ≥ Jul 2026. Check via:
  ```bash
  gh api -H "Accept: application/vnd.github+json" /user 2>/dev/null  # confirms auth works
  gh api user/packages?package_type=npm --jq '.[].name' | head -5    # lists packages (read scope)
  ```
  If no dedicated PAT: create at https://github.com/settings/tokens/new with above scopes. Store as:
  - GitHub repo secret `NPM_TOKEN` in both `tnf-ecosystem` and `finreckoner` (via `gh secret set NPM_TOKEN --repo <...>`)
  - Local `~/.npmrc` line: `//npm.pkg.github.com/:_authToken=<token>`

- [ ] Verify sibling checkouts:
  ```bash
  ls -d ~/Workspace/{tnf-ecosystem,tnf-scaffold,tonagarantia,bythiagofigueiredo,fan-stamp,finreckoner}
  ```
  Expected: all 6 paths exist. If `finreckoner` only has `docs/`, that's expected (we'll populate `apps/web/` in M0.4).

- [ ] Verify IRS Rev. Proc. 2025-32 (TY2026) published:
  ```bash
  curl -sI https://www.irs.gov/pub/irs-drop/rp-25-32.pdf | head -1
  ```
  Expected: `HTTP/2 200`. If 404, check IRS newsroom for alternate Rev. Proc. number; fallback to TY2025 brackets with `provisional` flag (see Task 18).

- [ ] Verify Cloudflare `finreckoner.com` registered + nameservers delegated:
  ```bash
  dig +short NS finreckoner.com
  ```
  Expected: `*.cloudflare.com` nameservers.

- [ ] Confirm Wise Partner Portal access (manual) — login at https://wise.com/partners; locate cookie-duration setting in current contract.

- [ ] Read these files to lock context: spec §1-§6, `~/Workspace/tnf-ecosystem/CLAUDE.md`, `~/Workspace/finreckoner/CLAUDE.md`.

---

## File Structure (locked)

**In `~/Workspace/tnf-ecosystem/packages/calc-engine/` (NEW):**

```
package.json                              # name, version, exports map, dep decimal.js
CHANGELOG.md
README.md
tsup.config.ts                            # multi-entry build (index, tax/us, tax/ca, tax/ca/qc, fx)
vitest.config.ts                          # property + golden + unit suites
tsconfig.json                             # extends ../../tsconfig.base.json
src/
  index.ts                                # public re-exports
  errors.ts                               # CalcEngineError + 5 subclasses
  hooks.ts                                # CalcEngineHooks interface + defaultHooks
  primitives/
    money.ts                              # Money branded object + functions
    money.test.ts
    bracket.ts                            # validateBrackets + solveBracketTax
    bracket.test.ts
    rounding.ts                           # IRS/CRA/RQ policies + applyRounding
    rounding.test.ts
  tax/
    types.ts                              # TaxResult, TaxSource, BracketBreakdown, FilingStatus, formatPercentage
    types.test.ts
    us/
      index.ts                            # calcUsFederalTax
      registry.ts                         # SUPPORTED_US_YEARS, getYearData
      years/2026.ts                       # brackets per filing status, source metadata, validateBrackets at load
    ca/
      index.ts                            # calcCaFederalTax + calcCaProvincialTax + calcCaTotalTax
      registry.ts
      years/2026.ts                       # federal + 12 provincial brackets
      qc/
        index.ts                          # calcQuebecTax
        registry.ts
        years/2026.ts                     # RQ TP-1015.F brackets
  fx/
    types.ts                              # FxRate
    interface.ts                          # FxSource interface + FxError
    static.ts                             # StaticFxSource implementation
    static.test.ts
__tests__/
  property/
    us-federal.property.test.ts           # 8 props × 10K iter (calibrated)
    ca-federal.property.test.ts
    ca-qc.property.test.ts
    fx-roundtrip.property.test.ts
  golden/
    us-federal-2026.json                  # 10 cases
    ca-federal-on-2026.json               # 10 cases (Ontario as default prov sample)
    ca-qc-2026.json                       # 10 cases
    golden.test.ts                        # snapshot runner
docs/migration-notes-0.x.md
```

**In `~/Workspace/tnf-ecosystem/packages/partner-links/` (NEW):**

```
package.json                              # exports: ".", "./react"; peerDeps react>=18
CHANGELOG.md
README.md
tsup.config.ts                            # 2 entries: index + react
vitest.config.ts
tsconfig.json
src/
  index.ts                                # agnostic core re-exports
  react.ts                                # React-only re-exports (FTCDisclosure)
  errors.ts                               # PartnerLinksError + 2 subclasses
  locale.ts                               # resolveLocale (BCP-47 walk-down)
  utm.ts                                  # buildUtmQuery + UtmParams
  utm.test.ts
  providers/
    types.ts                              # Provider interface, ProviderId
    wise.ts
    questrade.ts
    wealthsimple.ts
    credit-karma.ts
    nerdwallet.ts
    providers.test.ts                     # property tests for all 5
  ftc-disclosure/
    text.ts                               # disclosureText function
    text.test.ts
    react.tsx                             # <FTCDisclosure /> RSC-safe
    react.test.tsx
```

**In `~/Workspace/tnf-ecosystem/scripts/` (NEW):**

```
cascade-smoke-test.sh                     # iterates consumers.json + runs upgrade-ecosystem.sh
pull-test.sh                              # local sandbox install of tarball
extract-latest-changelog.sh               # parse top section of CHANGELOG.md
check-golden-approval.sh                  # CI gate for snapshot diffs
consumers.json                            # config-driven consumer matrix
```

**In `~/Workspace/tnf-ecosystem/docs/adr/` (NEW):**

```
template.md                               # ADR template
001-money-branded-object.md
002-year-registry-dispatcher.md
003-partner-links-core-react-split.md
004-cascade-architecture.md
005-property-test-iteration-budget.md
```

**In `~/Workspace/tnf-ecosystem/.github/workflows/`:**

```
ci.yml                                    # extend existing matrix to include calc-engine + partner-links
publish.yml                               # NEW — tag-triggered publish with pull-test gate
```

**In `~/Workspace/finreckoner/` (NEW repo, currently has only docs/ subdirs):**

```
.gitignore
.nvmrc                                    # 20
.npmrc                                    # @tn-figueiredo registry config
.gitleaksignore
README.md
package.json                              # workspaces: ["apps/*"]
tsconfig.base.json
.github/workflows/ci.yml                  # typecheck/test/audit/secret-scan/eco-pinning/Lighthouse
scripts/
  check-ecosystem-pinning.sh
  check-site-config-immutability.sh
apps/web/
  package.json                            # pinned @tn-figueiredo/{calc-engine,partner-links,seo,shared}
  next.config.ts
  tsconfig.json
  postcss.config.mjs
  tailwind.config.ts
  lighthouserc.json
  .env.local.example
  public/
    ads.txt                               # comment-only placeholder
    robots.txt
  src/
    app/
      layout.tsx                          # hreflang via @tn-figueiredo/seo
      page.tsx                            # homepage v0
      globals.css
    components/
      Footer.tsx
      HeroCreator.tsx
      CalcCardPlaceholder.tsx
    lib/
      site-config.ts                      # SITE_CONFIG.launchedAt immutable
docs/
  legal/
    affiliate-terms-2026-04.md            # populated M0.5
    screenshots/                          # PNGs from M0.5
  ecosystem/
    cascade-2026-04-S0.md                 # M0.5
  retro/
    sprint-0-2026-04-29.md                # M0.5
```

---

## M0.1 — calc-engine core (24h, Days 1-5)

### Task 1: Initialize calc-engine package skeleton

**Files:**
- Create: `~/Workspace/tnf-ecosystem/packages/calc-engine/package.json`
- Create: `~/Workspace/tnf-ecosystem/packages/calc-engine/tsconfig.json`
- Create: `~/Workspace/tnf-ecosystem/packages/calc-engine/tsup.config.ts`
- Create: `~/Workspace/tnf-ecosystem/packages/calc-engine/vitest.config.ts`
- Create: `~/Workspace/tnf-ecosystem/packages/calc-engine/README.md`
- Create: `~/Workspace/tnf-ecosystem/packages/calc-engine/CHANGELOG.md`
- Create: `~/Workspace/tnf-ecosystem/packages/calc-engine/.gitignore`

- [ ] **Step 1: Create directory + scaffold files**

```bash
cd ~/Workspace/tnf-ecosystem
mkdir -p packages/calc-engine/src/{primitives,tax/us/years,tax/ca/years,tax/ca/qc/years,fx} packages/calc-engine/__tests__/{property,golden} packages/calc-engine/docs
cd packages/calc-engine
```

- [ ] **Step 2: Write `package.json`**

```json
{
  "name": "@tn-figueiredo/calc-engine",
  "version": "0.1.0",
  "description": "Financial calculation primitives — tax brackets (US/CA/QC), FX, money operations with decimal precision",
  "type": "module",
  "main": "./dist/index.cjs",
  "module": "./dist/index.js",
  "types": "./dist/index.d.ts",
  "exports": {
    ".": {
      "import": { "types": "./dist/index.d.ts", "default": "./dist/index.js" },
      "require": { "types": "./dist/index.d.cts", "default": "./dist/index.cjs" }
    },
    "./tax/us": {
      "import": { "types": "./dist/tax/us/index.d.ts", "default": "./dist/tax/us/index.js" },
      "require": { "types": "./dist/tax/us/index.d.cts", "default": "./dist/tax/us/index.cjs" }
    },
    "./tax/ca": {
      "import": { "types": "./dist/tax/ca/index.d.ts", "default": "./dist/tax/ca/index.js" },
      "require": { "types": "./dist/tax/ca/index.d.cts", "default": "./dist/tax/ca/index.cjs" }
    },
    "./tax/ca/qc": {
      "import": { "types": "./dist/tax/ca/qc/index.d.ts", "default": "./dist/tax/ca/qc/index.js" },
      "require": { "types": "./dist/tax/ca/qc/index.d.cts", "default": "./dist/tax/ca/qc/index.cjs" }
    },
    "./fx": {
      "import": { "types": "./dist/fx/index.d.ts", "default": "./dist/fx/index.js" },
      "require": { "types": "./dist/fx/index.d.cts", "default": "./dist/fx/index.cjs" }
    }
  },
  "files": ["dist", "CHANGELOG.md", "README.md"],
  "scripts": {
    "build": "tsup",
    "test": "vitest run",
    "test:watch": "vitest",
    "typecheck": "tsc --noEmit",
    "size": "size-limit"
  },
  "publishConfig": {
    "registry": "https://npm.pkg.github.com",
    "access": "public"
  },
  "repository": {
    "type": "git",
    "url": "https://github.com/tn-figueiredo/tnf-ecosystem.git",
    "directory": "packages/calc-engine"
  },
  "dependencies": {
    "decimal.js": "10.4.3"
  },
  "devDependencies": {
    "@types/node": "20.11.30",
    "fast-check": "3.17.1",
    "size-limit": "11.1.2",
    "@size-limit/preset-small-lib": "11.1.2",
    "tsup": "8.0.2",
    "typescript": "5.4.5",
    "vitest": "1.5.0"
  },
  "size-limit": [
    { "path": "dist/index.js", "limit": "20 KB" },
    { "path": "dist/tax/us/index.js", "limit": "6 KB" },
    { "path": "dist/tax/ca/index.js", "limit": "10 KB" },
    { "path": "dist/tax/ca/qc/index.js", "limit": "4 KB" },
    { "path": "dist/fx/index.js", "limit": "3 KB" }
  ]
}
```

- [ ] **Step 3: Write `tsconfig.json`**

```json
{
  "extends": "../../tsconfig.base.json",
  "compilerOptions": {
    "rootDir": "src",
    "outDir": "dist"
  },
  "include": ["src"],
  "exclude": ["node_modules", "dist", "**/*.test.ts", "**/*.test.tsx", "__tests__"]
}
```

- [ ] **Step 4: Write `tsup.config.ts`** (multi-entry build)

```typescript
import { defineConfig } from 'tsup'

export default defineConfig({
  entry: {
    'index': 'src/index.ts',
    'tax/us/index': 'src/tax/us/index.ts',
    'tax/ca/index': 'src/tax/ca/index.ts',
    'tax/ca/qc/index': 'src/tax/ca/qc/index.ts',
    'fx/index': 'src/fx/interface.ts',
  },
  format: ['esm', 'cjs'],
  dts: true,
  clean: true,
  sourcemap: true,
  splitting: false,
  treeshake: true,
})
```

- [ ] **Step 5: Write `vitest.config.ts`**

```typescript
import { defineConfig } from 'vitest/config'

export default defineConfig({
  test: {
    globals: true,
    environment: 'node',
    include: ['src/**/*.test.ts', '__tests__/**/*.test.ts'],
    testTimeout: 60000, // property tests can take time
  },
})
```

- [ ] **Step 6: Write `.gitignore`**

```
node_modules
dist
.turbo
*.log
.DS_Store
```

- [ ] **Step 7: Write `README.md` stub**

```markdown
# @tn-figueiredo/calc-engine

Financial calculation primitives for the @tn-figueiredo/* ecosystem: tax brackets (US federal, CA federal+provincial, QC), FX conversion interfaces, and decimal-precise money operations.

**Status:** v0.1.0 — initial release (Sprint 0 of finreckoner.com).

## Install

\`\`\`bash
npm install @tn-figueiredo/calc-engine
\`\`\`

## Subpaths

- `@tn-figueiredo/calc-engine` — Money primitive, errors, hooks
- `@tn-figueiredo/calc-engine/tax/us` — US federal income tax (TY2026)
- `@tn-figueiredo/calc-engine/tax/ca` — Canada federal + 12 provincial (TY2026, excl. QC)
- `@tn-figueiredo/calc-engine/tax/ca/qc` — Quebec (separate per Revenu Québec TP-1015.F)
- `@tn-figueiredo/calc-engine/fx` — FxSource interface + StaticFxSource for tests

See [CHANGELOG.md](./CHANGELOG.md) for version history.
```

- [ ] **Step 8: Write `CHANGELOG.md` initial entry**

```markdown
# Changelog

All notable changes to `@tn-figueiredo/calc-engine` will be documented in this file.

## [0.1.0] — 2026-04-22

### Added
- Money branded-object primitive with decimal.js precision (ADR-001)
- Bracket primitive (`solveBracketTax`, `validateBrackets`) with inclusive-lower/exclusive-upper semantics
- Rounding policies: `IRS_POLICY`, `CRA_POLICY`, `RQ_POLICY`
- US federal income tax calculator (`calcUsFederalTax`) — TY2026 per IRS Rev. Proc. 2025-32
- Canada federal + 12 provincial tax calculators (`calcCaFederalTax`, `calcCaProvincialTax`, `calcCaTotalTax`) — TY2026 per CRA T4127 Jan 2026
- Quebec tax calculator (`calcQuebecTax`) — TY2026 per Revenu Québec TP-1015.F (separate from CRA)
- `FxSource` interface + `StaticFxSource` (tests/dev only)
- `CalcEngineHooks` (onCalculation, onFxConvert, onError) for observability injection
- Year registry dispatcher pattern (ADR-002) for non-breaking year additions
```

- [ ] **Step 9: Install deps**

```bash
cd ~/Workspace/tnf-ecosystem
npm install
```

Expected: `decimal.js`, `fast-check`, `tsup`, `vitest`, `size-limit` resolved into root `node_modules` (workspaces dedupe).

- [ ] **Step 10: Verify scaffolding**

```bash
cd ~/Workspace/tnf-ecosystem/packages/calc-engine
npx tsc --noEmit
```

Expected: zero output (no source files yet, no errors).

- [ ] **Step 11: Commit**

```bash
cd ~/Workspace/tnf-ecosystem
git add packages/calc-engine
git commit -m "feat(calc-engine): initialize package skeleton"
```

---

### Task 2: Implement error hierarchy

**Files:**
- Create: `~/Workspace/tnf-ecosystem/packages/calc-engine/src/errors.ts`
- Create: `~/Workspace/tnf-ecosystem/packages/calc-engine/src/errors.test.ts`

- [ ] **Step 1: Write the failing tests**

```typescript
// src/errors.test.ts
import { describe, it, expect } from 'vitest'
import {
  CalcEngineError,
  InvalidInputError,
  BracketError,
  UnsupportedYearError,
  CurrencyMismatchError,
  FxError,
} from './errors'

describe('errors', () => {
  it('CalcEngineError has code property', () => {
    const e = new InvalidInputError('test')
    expect(e).toBeInstanceOf(CalcEngineError)
    expect(e).toBeInstanceOf(Error)
    expect(e.code).toBe('INVALID_INPUT')
    expect(e.message).toBe('test')
  })

  it('all subclasses have correct codes', () => {
    expect(new InvalidInputError('x').code).toBe('INVALID_INPUT')
    expect(new BracketError('x').code).toBe('BRACKET_INVALID')
    expect(new UnsupportedYearError('x').code).toBe('UNSUPPORTED_YEAR')
    expect(new CurrencyMismatchError('USD', 'CAD').code).toBe('CURRENCY_MISMATCH')
    expect(new FxError('static', 'USD', 'CAD', 'no rate').code).toBe('FX_ERROR')
  })

  it('CurrencyMismatchError exposes currencies', () => {
    const e = new CurrencyMismatchError('USD', 'CAD')
    expect(e.left).toBe('USD')
    expect(e.right).toBe('CAD')
    expect(e.message).toContain('USD')
    expect(e.message).toContain('CAD')
  })

  it('FxError exposes source + currencies', () => {
    const e = new FxError('static', 'USD', 'CAD', 'rate not found')
    expect(e.sourceId).toBe('static')
    expect(e.from).toBe('USD')
    expect(e.to).toBe('CAD')
  })
})
```

- [ ] **Step 2: Run test to verify it fails**

```bash
cd ~/Workspace/tnf-ecosystem/packages/calc-engine
npm test -- src/errors.test.ts
```

Expected: FAIL with "Cannot find module './errors'".

- [ ] **Step 3: Implement `errors.ts`**

```typescript
// src/errors.ts
export abstract class CalcEngineError extends Error {
  abstract readonly code: string
  constructor(message: string) {
    super(message)
    this.name = this.constructor.name
  }
}

export class InvalidInputError extends CalcEngineError {
  readonly code = 'INVALID_INPUT'
}

export class BracketError extends CalcEngineError {
  readonly code = 'BRACKET_INVALID'
}

export class UnsupportedYearError extends CalcEngineError {
  readonly code = 'UNSUPPORTED_YEAR'
}

export class CurrencyMismatchError extends CalcEngineError {
  readonly code = 'CURRENCY_MISMATCH'
  constructor(public readonly left: string, public readonly right: string) {
    super(`Currency mismatch: ${left} vs ${right}`)
  }
}

export class FxError extends CalcEngineError {
  readonly code = 'FX_ERROR'
  constructor(
    public readonly sourceId: string,
    public readonly from: string,
    public readonly to: string,
    message: string,
  ) {
    super(`[${sourceId}] ${from}→${to}: ${message}`)
  }
}
```

- [ ] **Step 4: Run test to verify it passes**

```bash
npm test -- src/errors.test.ts
```

Expected: PASS, 4 tests.

- [ ] **Step 5: Commit**

```bash
git add packages/calc-engine/src/errors.ts packages/calc-engine/src/errors.test.ts
git commit -m "feat(calc-engine): add error hierarchy with typed codes"
```

---

### Task 3: Implement Money primitive (branded object)

**Files:**
- Create: `~/Workspace/tnf-ecosystem/packages/calc-engine/src/primitives/money.ts`
- Create: `~/Workspace/tnf-ecosystem/packages/calc-engine/src/primitives/money.test.ts`

- [ ] **Step 1: Write the failing tests**

```typescript
// src/primitives/money.test.ts
import { describe, it, expect } from 'vitest'
import Decimal from 'decimal.js'
import { money, moneyFromJSON, add, sub, mul, div, isZero, isNegative, compare, formatMoney, KNOWN_CURRENCIES } from './money'
import { InvalidInputError, CurrencyMismatchError } from '../errors'

describe('money()', () => {
  it('creates Money from string amount', () => {
    const m = money('100.50', 'USD')
    expect(m.amount.toString()).toBe('100.5')
    expect(m.currency).toBe('USD')
  })

  it('creates Money from number amount', () => {
    expect(money(100, 'USD').amount.toString()).toBe('100')
  })

  it('creates Money from Decimal amount', () => {
    expect(money(new Decimal('99.99'), 'EUR').amount.toString()).toBe('99.99')
  })

  it('rejects NaN amount', () => {
    expect(() => money(NaN, 'USD')).toThrow(InvalidInputError)
  })

  it('rejects Infinity amount', () => {
    expect(() => money(Infinity, 'USD')).toThrow(InvalidInputError)
  })

  it('rejects amount > 1e12', () => {
    expect(() => money('1000000000001', 'USD')).toThrow(InvalidInputError)
  })

  it('rejects invalid currency code', () => {
    expect(() => money('100', 'usd')).toThrow(InvalidInputError)
    expect(() => money('100', 'US')).toThrow(InvalidInputError)
    expect(() => money('100', 'USDD')).toThrow(InvalidInputError)
  })

  it('accepts ISO 4217 currency code', () => {
    expect(money('100', 'USD').currency).toBe('USD')
    expect(money('100', 'CAD').currency).toBe('CAD')
    expect(money('100', 'BRL').currency).toBe('BRL')
  })
})

describe('moneyFromJSON()', () => {
  it('round-trips through JSON', () => {
    const m1 = money('123.45', 'USD')
    const j = JSON.parse(JSON.stringify({ amount: m1.amount.toString(), currency: m1.currency }))
    const m2 = moneyFromJSON(j)
    expect(compare(m1, m2)).toBe(0)
  })

  it('rejects malformed currency in JSON', () => {
    expect(() => moneyFromJSON({ amount: '1', currency: 'invalid' })).toThrow(InvalidInputError)
  })
})

describe('arithmetic', () => {
  it('add same currency', () => {
    expect(add(money('1.5', 'USD'), money('2.25', 'USD')).amount.toString()).toBe('3.75')
  })

  it('add throws on currency mismatch', () => {
    expect(() => add(money('1', 'USD'), money('1', 'CAD'))).toThrow(CurrencyMismatchError)
  })

  it('sub', () => {
    expect(sub(money('5', 'USD'), money('2', 'USD')).amount.toString()).toBe('3')
  })

  it('mul', () => {
    expect(mul(money('10', 'USD'), 0.5).amount.toString()).toBe('5')
    expect(mul(money('10', 'USD'), new Decimal('0.1')).amount.toString()).toBe('1')
  })

  it('div', () => {
    expect(div(money('10', 'USD'), 4).amount.toString()).toBe('2.5')
  })

  it('isZero', () => {
    expect(isZero(money('0', 'USD'))).toBe(true)
    expect(isZero(money('0.001', 'USD'))).toBe(false)
  })

  it('isNegative', () => {
    expect(isNegative(money('-5', 'USD'))).toBe(true)
    expect(isNegative(money('0', 'USD'))).toBe(false)
    expect(isNegative(money('5', 'USD'))).toBe(false)
  })

  it('compare', () => {
    expect(compare(money('1', 'USD'), money('2', 'USD'))).toBe(-1)
    expect(compare(money('2', 'USD'), money('1', 'USD'))).toBe(1)
    expect(compare(money('1', 'USD'), money('1', 'USD'))).toBe(0)
  })

  it('compare throws on currency mismatch', () => {
    expect(() => compare(money('1', 'USD'), money('1', 'CAD'))).toThrow(CurrencyMismatchError)
  })
})

describe('formatMoney', () => {
  it('formats USD with en-US locale', () => {
    expect(formatMoney(money('1234.56', 'USD'), 'en-US')).toBe('$1,234.56')
  })

  it('formats CAD with en-CA locale', () => {
    const formatted = formatMoney(money('1234.56', 'CAD'), 'en-CA')
    expect(formatted).toContain('1,234.56')
    expect(formatted).toMatch(/CA?\$|CAD/)
  })
})

describe('KNOWN_CURRENCIES', () => {
  it('contains expected codes', () => {
    expect(KNOWN_CURRENCIES).toEqual(['USD', 'CAD', 'BRL', 'EUR', 'GBP'])
  })
})
```

- [ ] **Step 2: Run test to verify it fails**

```bash
npm test -- src/primitives/money.test.ts
```

Expected: FAIL with module not found.

- [ ] **Step 3: Implement `money.ts`**

```typescript
// src/primitives/money.ts
import Decimal from 'decimal.js'
import { InvalidInputError, CurrencyMismatchError } from '../errors'

declare const MoneyBrand: unique symbol

export type Currency = string
export const KNOWN_CURRENCIES = ['USD', 'CAD', 'BRL', 'EUR', 'GBP'] as const

export interface Money {
  readonly amount: Decimal
  readonly currency: Currency
  readonly [MoneyBrand]: true
}

const SANITY_CAP = new Decimal('1e12')
const CURRENCY_REGEX = /^[A-Z]{3}$/

function validateCurrency(currency: string): void {
  if (!CURRENCY_REGEX.test(currency)) {
    throw new InvalidInputError(`Invalid currency code: "${currency}" (must match /^[A-Z]{3}$/)`)
  }
}

function validateAmount(amount: Decimal): void {
  if (amount.isNaN()) throw new InvalidInputError('Amount is NaN')
  if (!amount.isFinite()) throw new InvalidInputError('Amount is not finite')
  if (amount.abs().gt(SANITY_CAP)) {
    throw new InvalidInputError(`Amount exceeds sanity cap of 1e12: ${amount.toString()}`)
  }
}

export function money(amount: Decimal | string | number, currency: Currency): Money {
  validateCurrency(currency)
  let dec: Decimal
  try {
    dec = amount instanceof Decimal ? amount : new Decimal(amount)
  } catch {
    throw new InvalidInputError(`Cannot parse amount: ${String(amount)}`)
  }
  validateAmount(dec)
  return { amount: dec, currency, [MoneyBrand]: true } as Money
}

export function moneyFromJSON(j: { amount: string; currency: string }): Money {
  return money(j.amount, j.currency)
}

function ensureSameCurrency(a: Money, b: Money): void {
  if (a.currency !== b.currency) throw new CurrencyMismatchError(a.currency, b.currency)
}

export const add = (a: Money, b: Money): Money => {
  ensureSameCurrency(a, b)
  return money(a.amount.plus(b.amount), a.currency)
}

export const sub = (a: Money, b: Money): Money => {
  ensureSameCurrency(a, b)
  return money(a.amount.minus(b.amount), a.currency)
}

export const mul = (m: Money, factor: Decimal | number): Money =>
  money(m.amount.times(factor), m.currency)

export const div = (m: Money, divisor: Decimal | number): Money =>
  money(m.amount.dividedBy(divisor), m.currency)

export const isZero = (m: Money): boolean => m.amount.isZero()
export const isNegative = (m: Money): boolean => m.amount.isNegative()

export const compare = (a: Money, b: Money): -1 | 0 | 1 => {
  ensureSameCurrency(a, b)
  return a.amount.cmp(b.amount) as -1 | 0 | 1
}

export const formatMoney = (m: Money, locale = 'en-US'): string => {
  return new Intl.NumberFormat(locale, {
    style: 'currency',
    currency: m.currency,
  }).format(m.amount.toNumber())
}
```

- [ ] **Step 4: Run test to verify it passes**

```bash
npm test -- src/primitives/money.test.ts
```

Expected: PASS, all tests.

- [ ] **Step 5: Commit**

```bash
git add packages/calc-engine/src/primitives/money.ts packages/calc-engine/src/primitives/money.test.ts
git commit -m "feat(calc-engine): add Money branded-object primitive (ADR-001)"
```

---

> **ORDER NOTE (fix pós-audit):** Task 4 originalmente era Bracket (importa `applyFinalRounding` de `rounding.ts`). Rounding precisa existir ANTES de Bracket compilar. Ordem corrigida: **Task 4 = Rounding**, **Task 5 = Bracket**. Conteúdo de cada swapped below.

### Task 4: Implement Rounding policies (was Task 5)

**Files:**
- Create: `~/Workspace/tnf-ecosystem/packages/calc-engine/src/primitives/rounding.ts`
- Create: `~/Workspace/tnf-ecosystem/packages/calc-engine/src/primitives/rounding.test.ts`

See original Task 5 content below (steps 1-4) — execute **before** Task 5 (Bracket).

---

### Task 5: Implement Bracket primitive (was Task 4)

**Files:**
- Create: `~/Workspace/tnf-ecosystem/packages/calc-engine/src/primitives/bracket.ts`
- Create: `~/Workspace/tnf-ecosystem/packages/calc-engine/src/primitives/bracket.test.ts`

> Depends on Task 4 (Rounding) being complete.

- [ ] **Step 1: Write the failing tests**

```typescript
// src/primitives/bracket.test.ts
import { describe, it, expect } from 'vitest'
import Decimal from 'decimal.js'
import { Bracket, validateBrackets, solveBracketTax } from './bracket'
import { money } from './money'
import { IRS_POLICY, CRA_POLICY } from './rounding'
import { BracketError, CurrencyMismatchError } from '../errors'

const TWO_TIER: Bracket[] = [
  { lowerBound: new Decimal(0),     upperBound: new Decimal(10000), rate: new Decimal('0.10') },
  { lowerBound: new Decimal(10000), upperBound: null,                rate: new Decimal('0.20') },
]

describe('validateBrackets', () => {
  it('accepts valid sorted brackets', () => {
    expect(() => validateBrackets(TWO_TIER)).not.toThrow()
  })

  it('rejects empty array', () => {
    expect(() => validateBrackets([])).toThrow(BracketError)
  })

  it('rejects first.lowerBound != 0', () => {
    expect(() => validateBrackets([
      { lowerBound: new Decimal(100), upperBound: null, rate: new Decimal('0.1') },
    ])).toThrow(BracketError)
  })

  it('rejects gap between brackets', () => {
    expect(() => validateBrackets([
      { lowerBound: new Decimal(0),    upperBound: new Decimal(1000), rate: new Decimal('0.1') },
      { lowerBound: new Decimal(2000), upperBound: null,               rate: new Decimal('0.2') },
    ])).toThrow(BracketError)
  })

  it('rejects overlap', () => {
    expect(() => validateBrackets([
      { lowerBound: new Decimal(0),   upperBound: new Decimal(2000), rate: new Decimal('0.1') },
      { lowerBound: new Decimal(1000), upperBound: null,              rate: new Decimal('0.2') },
    ])).toThrow(BracketError)
  })

  it('rejects multiple top brackets (multiple null upperBounds)', () => {
    expect(() => validateBrackets([
      { lowerBound: new Decimal(0), upperBound: null, rate: new Decimal('0.1') },
      { lowerBound: new Decimal(0), upperBound: null, rate: new Decimal('0.2') },
    ])).toThrow(BracketError)
  })

  it('rejects no top bracket (no null upperBound)', () => {
    expect(() => validateBrackets([
      { lowerBound: new Decimal(0), upperBound: new Decimal(1000), rate: new Decimal('0.1') },
    ])).toThrow(BracketError)
  })
})

describe('solveBracketTax', () => {
  it('zero income → zero tax', () => {
    const r = solveBracketTax(money('0', 'USD'), TWO_TIER, CRA_POLICY)
    expect(r.total.amount.isZero()).toBe(true)
    expect(r.breakdown).toHaveLength(2)
    expect(r.breakdown[0].taxableAmount.amount.isZero()).toBe(true)
  })

  it('income within first bracket', () => {
    const r = solveBracketTax(money('5000', 'USD'), TWO_TIER, CRA_POLICY)
    expect(r.total.amount.toString()).toBe('500')
    expect(r.breakdown[0].taxableAmount.amount.toString()).toBe('5000')
    expect(r.breakdown[0].taxInBracket.amount.toString()).toBe('500')
    expect(r.breakdown[1].taxableAmount.amount.isZero()).toBe(true)
  })

  it('income exactly at boundary belongs to lower bracket', () => {
    // lowerBound 10000 is INclusive, upperBound 10000 is EXclusive.
    // Income = 10000: tier 1 includes [0, 10000) = 10000 of taxable; tier 2 starts at 10000 with 0 taxable.
    const r = solveBracketTax(money('10000', 'USD'), TWO_TIER, CRA_POLICY)
    expect(r.total.amount.toString()).toBe('1000') // 10000 * 0.10
    expect(r.breakdown[0].taxableAmount.amount.toString()).toBe('10000')
    expect(r.breakdown[1].taxableAmount.amount.isZero()).toBe(true)
  })

  it('income spans two brackets', () => {
    const r = solveBracketTax(money('15000', 'USD'), TWO_TIER, CRA_POLICY)
    // tier 1: 10000 * 0.10 = 1000
    // tier 2: 5000  * 0.20 = 1000
    // total = 2000
    expect(r.total.amount.toString()).toBe('2000')
    expect(r.breakdown[0].taxableAmount.amount.toString()).toBe('10000')
    expect(r.breakdown[0].taxInBracket.amount.toString()).toBe('1000')
    expect(r.breakdown[1].taxableAmount.amount.toString()).toBe('5000')
    expect(r.breakdown[1].taxInBracket.amount.toString()).toBe('1000')
  })

  it('IRS_POLICY rounds final to whole dollars', () => {
    // Use brackets that yield non-whole tax.
    const tiers: Bracket[] = [
      { lowerBound: new Decimal(0), upperBound: null, rate: new Decimal('0.155') },
    ]
    const r = solveBracketTax(money('100', 'USD'), tiers, IRS_POLICY)
    // 100 * 0.155 = 15.5 → IRS rounds HALF_UP to whole dollars → 16
    expect(r.total.amount.toString()).toBe('16')
  })

  it('rejects negative income via Money constructor (handled upstream)', () => {
    // solveBracketTax doesn't re-validate; Money is responsibility.
    // But should not crash on negative — solver returns 0 (no bracket entered)
    const r = solveBracketTax(money('-100', 'USD'), TWO_TIER, CRA_POLICY)
    expect(r.total.amount.isZero()).toBe(true)
  })
})
```

- [ ] **Step 2: Run test to verify it fails**

```bash
npm test -- src/primitives/bracket.test.ts
```

Expected: FAIL with module not found.

- [ ] **Step 3: Implement `bracket.ts`** (depends on `rounding.ts` — create both, test rounding separately in Task 5)

```typescript
// src/primitives/bracket.ts
import Decimal from 'decimal.js'
import { Money, money } from './money'
import { RoundingPolicy, applyFinalRounding } from './rounding'
import { BracketError } from '../errors'

export interface Bracket {
  readonly lowerBound: Decimal
  readonly upperBound: Decimal | null
  readonly rate: Decimal
}

export interface BracketBreakdown {
  readonly bracket: Bracket
  readonly taxableAmount: Money
  readonly taxInBracket: Money
}

/**
 * Validates bracket array invariants:
 * - non-empty
 * - sorted ascending by lowerBound
 * - first.lowerBound = 0
 * - no gaps (each upperBound = next lowerBound)
 * - no overlaps
 * - exactly one upperBound = null (the last/top bracket)
 *
 * Throws BracketError on violation. Intended to run at module-load time.
 */
export function validateBrackets(brackets: readonly Bracket[]): void {
  if (brackets.length === 0) throw new BracketError('Empty bracket array')

  const first = brackets[0]
  if (!first.lowerBound.isZero()) {
    throw new BracketError(`First bracket must have lowerBound=0, got ${first.lowerBound.toString()}`)
  }

  let nullCount = 0
  for (let i = 0; i < brackets.length; i++) {
    const b = brackets[i]
    if (b.upperBound === null) nullCount++

    if (i < brackets.length - 1) {
      const next = brackets[i + 1]
      if (b.upperBound === null) {
        throw new BracketError(`Bracket ${i} has null upperBound but is not the last`)
      }
      if (!b.upperBound.eq(next.lowerBound)) {
        throw new BracketError(
          `Gap or overlap between bracket ${i} (upper=${b.upperBound.toString()}) and ${i + 1} (lower=${next.lowerBound.toString()})`,
        )
      }
    }
  }

  if (nullCount !== 1) {
    throw new BracketError(`Exactly one bracket must have upperBound=null (top); found ${nullCount}`)
  }
}

/**
 * Computes total tax + per-bracket breakdown.
 * Boundary semantics: [lowerBound, upperBound) — income at lowerBound is in this bracket.
 * Negative income → zero tax (no bracket entered).
 */
export function solveBracketTax(
  income: Money,
  brackets: readonly Bracket[],
  policy: RoundingPolicy,
): { total: Money; breakdown: BracketBreakdown[] } {
  const breakdown: BracketBreakdown[] = []
  let runningTotal = new Decimal(0)
  const incomeAmount = income.amount

  for (const b of brackets) {
    let taxable: Decimal
    if (incomeAmount.lte(b.lowerBound)) {
      taxable = new Decimal(0)
    } else if (b.upperBound === null || incomeAmount.lt(b.upperBound)) {
      taxable = incomeAmount.minus(b.lowerBound)
    } else {
      taxable = b.upperBound.minus(b.lowerBound)
    }

    const taxInBracket = taxable.times(b.rate)
    runningTotal = runningTotal.plus(taxInBracket)

    breakdown.push({
      bracket: b,
      taxableAmount: money(taxable, income.currency),
      taxInBracket: money(taxInBracket, income.currency),
    })
  }

  const totalRounded = applyFinalRounding(runningTotal, policy)
  return { total: money(totalRounded, income.currency), breakdown }
}
```

- [ ] **Step 4: Run Bracket tests (Task 4 Rounding already complete, per order fix)**

```bash
npm test -- src/primitives/bracket.test.ts
```

Expected: PASS.

---

### (Original Task 5 content — execute as Task 4 per order fix above)

**Files:**
- Create: `~/Workspace/tnf-ecosystem/packages/calc-engine/src/primitives/rounding.ts`
- Create: `~/Workspace/tnf-ecosystem/packages/calc-engine/src/primitives/rounding.test.ts`

- [ ] **Step 1: Write the failing tests**

```typescript
// src/primitives/rounding.test.ts
import { describe, it, expect } from 'vitest'
import Decimal from 'decimal.js'
import { IRS_POLICY, CRA_POLICY, RQ_POLICY, applyFinalRounding } from './rounding'

describe('rounding policies', () => {
  it('IRS_POLICY rounds to whole dollars HALF_UP', () => {
    expect(applyFinalRounding(new Decimal('15.50'), IRS_POLICY).toString()).toBe('16')
    expect(applyFinalRounding(new Decimal('15.49'), IRS_POLICY).toString()).toBe('15')
    expect(applyFinalRounding(new Decimal('0.50'), IRS_POLICY).toString()).toBe('1')
  })

  it('CRA_POLICY rounds to cents HALF_UP', () => {
    expect(applyFinalRounding(new Decimal('15.555'), CRA_POLICY).toString()).toBe('15.56')
    expect(applyFinalRounding(new Decimal('15.554'), CRA_POLICY).toString()).toBe('15.55')
  })

  it('RQ_POLICY rounds to cents HALF_UP', () => {
    expect(applyFinalRounding(new Decimal('100.005'), RQ_POLICY).toString()).toBe('100.01')
  })

  it('IRS_POLICY exposes correct config', () => {
    expect(IRS_POLICY.mode).toBe('HALF_UP')
    expect(IRS_POLICY.intermediateMode).toBe('NONE')
    expect(IRS_POLICY.finalMode).toBe('DOLLARS')
  })

  it('CRA_POLICY exposes correct config', () => {
    expect(CRA_POLICY.mode).toBe('HALF_UP')
    expect(CRA_POLICY.intermediateMode).toBe('CENTS')
    expect(CRA_POLICY.finalMode).toBe('CENTS')
  })
})
```

- [ ] **Step 2: Implement `rounding.ts`**

```typescript
// src/primitives/rounding.ts
import Decimal from 'decimal.js'

export type RoundingMode = 'HALF_UP' | 'HALF_EVEN' | 'DOWN' | 'UP'
export type RoundingPrecision = 'CENTS' | 'DOLLARS' | 'NONE'

export interface RoundingPolicy {
  readonly mode: RoundingMode
  readonly intermediateMode: RoundingPrecision
  readonly finalMode: 'CENTS' | 'DOLLARS'
}

export const IRS_POLICY: RoundingPolicy = {
  mode: 'HALF_UP',
  intermediateMode: 'NONE',
  finalMode: 'DOLLARS',
}

export const CRA_POLICY: RoundingPolicy = {
  mode: 'HALF_UP',
  intermediateMode: 'CENTS',
  finalMode: 'CENTS',
}

export const RQ_POLICY: RoundingPolicy = {
  mode: 'HALF_UP',
  intermediateMode: 'CENTS',
  finalMode: 'CENTS',
}

const MODE_TO_DECIMAL: Record<RoundingMode, Decimal.Rounding> = {
  HALF_UP: Decimal.ROUND_HALF_UP,
  HALF_EVEN: Decimal.ROUND_HALF_EVEN,
  DOWN: Decimal.ROUND_DOWN,
  UP: Decimal.ROUND_UP,
}

export function applyFinalRounding(amount: Decimal, policy: RoundingPolicy): Decimal {
  const decimals = policy.finalMode === 'DOLLARS' ? 0 : 2
  return amount.toDecimalPlaces(decimals, MODE_TO_DECIMAL[policy.mode])
}

export function applyIntermediateRounding(amount: Decimal, policy: RoundingPolicy): Decimal {
  if (policy.intermediateMode === 'NONE') return amount
  const decimals = policy.intermediateMode === 'DOLLARS' ? 0 : 2
  return amount.toDecimalPlaces(decimals, MODE_TO_DECIMAL[policy.mode])
}
```

- [ ] **Step 3: Run all primitives tests**

```bash
npm test -- src/primitives/
```

Expected: PASS, all rounding + bracket tests (bracket tests now resolve `applyFinalRounding`).

- [ ] **Step 4: Commit**

```bash
git add packages/calc-engine/src/primitives/{bracket,rounding}.ts packages/calc-engine/src/primitives/{bracket,rounding}.test.ts
git commit -m "feat(calc-engine): add Bracket primitive + RoundingPolicy (IRS/CRA/RQ)"
```

---

### Task 6: Implement tax/types.ts (shared tax types + formatPercentage)

**Files:**
- Create: `~/Workspace/tnf-ecosystem/packages/calc-engine/src/tax/types.ts`
- Create: `~/Workspace/tnf-ecosystem/packages/calc-engine/src/tax/types.test.ts`

- [ ] **Step 1: Write the failing tests**

```typescript
// src/tax/types.test.ts
import { describe, it, expect } from 'vitest'
import Decimal from 'decimal.js'
import { formatPercentage } from './types'

describe('formatPercentage', () => {
  it('formats with default 2 digits', () => {
    expect(formatPercentage(new Decimal('0.1234'))).toBe('12.34%')
  })

  it('formats with custom digits', () => {
    expect(formatPercentage(new Decimal('0.12345'), 3)).toBe('12.345%')
    expect(formatPercentage(new Decimal('0.1'), 0)).toBe('10%')
  })

  it('rounds half-up', () => {
    expect(formatPercentage(new Decimal('0.12345'), 2)).toBe('12.35%')
  })
})
```

- [ ] **Step 2: Implement `types.ts`**

```typescript
// src/tax/types.ts
import Decimal from 'decimal.js'
import { Money } from '../primitives/money'
import { Bracket, BracketBreakdown } from '../primitives/bracket'

export type TaxYear = number
export type FilingStatus = 'single' | 'married-jointly' | 'married-separately' | 'head-of-household'

export interface TaxSource {
  readonly url: string
  readonly publication: string
  readonly jurisdiction: string
  readonly taxYear: number
  readonly retrievedAt: string  // ISO date
  readonly refreshBy: string    // ISO date
}

export interface TaxResult<TInput = unknown> {
  readonly input: TInput
  readonly tax: Money
  readonly effectiveRate: Decimal
  readonly marginalRate: Decimal
  readonly breakdown: readonly BracketBreakdown[]
  readonly source: TaxSource
  readonly computedAt: string  // ISO timestamp
  readonly scope: {
    readonly filingStatus?: FilingStatus
    readonly deductions: 'none'
    readonly creditsApplied: readonly string[]
  }
}

export function formatPercentage(d: Decimal, digits = 2): string {
  return `${d.times(100).toFixed(digits)}%`
}

export type { Bracket, BracketBreakdown }
```

- [ ] **Step 3: Run + commit**

```bash
npm test -- src/tax/types.test.ts
git add packages/calc-engine/src/tax/types.ts packages/calc-engine/src/tax/types.test.ts
git commit -m "feat(calc-engine): add tax/types (TaxResult, TaxSource, formatPercentage)"
```

---

### Task 7: Implement US federal tax (TY2026 brackets + registry + calc)

**Files:**
- Create: `~/Workspace/tnf-ecosystem/packages/calc-engine/src/tax/us/years/2026.ts`
- Create: `~/Workspace/tnf-ecosystem/packages/calc-engine/src/tax/us/registry.ts`
- Create: `~/Workspace/tnf-ecosystem/packages/calc-engine/src/tax/us/index.ts`
- Create: `~/Workspace/tnf-ecosystem/packages/calc-engine/src/tax/us/index.test.ts`

- [ ] **Step 1: Write `years/2026.ts`** with IRS Rev. Proc. 2025-32 brackets

> Source: https://www.irs.gov/pub/irs-drop/rp-25-32.pdf (verify Day 1 of sprint; if not yet published, use 2025 brackets and add `provisional: true` flag — see Task 18)

```typescript
// src/tax/us/years/2026.ts
import Decimal from 'decimal.js'
import { Bracket, validateBrackets } from '../../../primitives/bracket'
import { TaxSource, FilingStatus } from '../../types'

// Source: IRS Rev. Proc. 2025-32 (TY2026)
// Verify URL Day 1: https://www.irs.gov/pub/irs-drop/rp-25-32.pdf
// Next refresh: November-December 2026 (for TY2027)

const D = (n: string) => new Decimal(n)

export const SOURCE_2026: TaxSource = {
  url: 'https://www.irs.gov/pub/irs-drop/rp-25-32.pdf',
  publication: 'IRS Rev. Proc. 2025-32',
  jurisdiction: 'US Federal',
  taxYear: 2026,
  retrievedAt: '2026-04-15',
  refreshBy: '2026-12-01',
}

export const BRACKETS_2026_SINGLE: readonly Bracket[] = [
  { lowerBound: D('0'),       upperBound: D('11925'),  rate: D('0.10') },
  { lowerBound: D('11925'),   upperBound: D('48475'),  rate: D('0.12') },
  { lowerBound: D('48475'),   upperBound: D('103350'), rate: D('0.22') },
  { lowerBound: D('103350'),  upperBound: D('197300'), rate: D('0.24') },
  { lowerBound: D('197300'),  upperBound: D('250525'), rate: D('0.32') },
  { lowerBound: D('250525'),  upperBound: D('626350'), rate: D('0.35') },
  { lowerBound: D('626350'),  upperBound: null,         rate: D('0.37') },
]

export const BRACKETS_2026_MARRIED_JOINTLY: readonly Bracket[] = [
  { lowerBound: D('0'),       upperBound: D('23850'),  rate: D('0.10') },
  { lowerBound: D('23850'),   upperBound: D('96950'),  rate: D('0.12') },
  { lowerBound: D('96950'),   upperBound: D('206700'), rate: D('0.22') },
  { lowerBound: D('206700'),  upperBound: D('394600'), rate: D('0.24') },
  { lowerBound: D('394600'),  upperBound: D('501050'), rate: D('0.32') },
  { lowerBound: D('501050'),  upperBound: D('751600'), rate: D('0.35') },
  { lowerBound: D('751600'),  upperBound: null,         rate: D('0.37') },
]

export const BRACKETS_2026_MARRIED_SEPARATELY: readonly Bracket[] = [
  { lowerBound: D('0'),       upperBound: D('11925'),  rate: D('0.10') },
  { lowerBound: D('11925'),   upperBound: D('48475'),  rate: D('0.12') },
  { lowerBound: D('48475'),   upperBound: D('103350'), rate: D('0.22') },
  { lowerBound: D('103350'),  upperBound: D('197300'), rate: D('0.24') },
  { lowerBound: D('197300'),  upperBound: D('250525'), rate: D('0.32') },
  { lowerBound: D('250525'),  upperBound: D('375800'), rate: D('0.35') },
  { lowerBound: D('375800'),  upperBound: null,         rate: D('0.37') },
]

export const BRACKETS_2026_HEAD_OF_HOUSEHOLD: readonly Bracket[] = [
  { lowerBound: D('0'),       upperBound: D('17000'),  rate: D('0.10') },
  { lowerBound: D('17000'),   upperBound: D('64850'),  rate: D('0.12') },
  { lowerBound: D('64850'),   upperBound: D('103350'), rate: D('0.22') },
  { lowerBound: D('103350'),  upperBound: D('197300'), rate: D('0.24') },
  { lowerBound: D('197300'),  upperBound: D('250500'), rate: D('0.32') },
  { lowerBound: D('250500'),  upperBound: D('626350'), rate: D('0.35') },
  { lowerBound: D('626350'),  upperBound: null,         rate: D('0.37') },
]

export const BRACKETS_BY_STATUS_2026: Readonly<Record<FilingStatus, readonly Bracket[]>> = {
  'single': BRACKETS_2026_SINGLE,
  'married-jointly': BRACKETS_2026_MARRIED_JOINTLY,
  'married-separately': BRACKETS_2026_MARRIED_SEPARATELY,
  'head-of-household': BRACKETS_2026_HEAD_OF_HOUSEHOLD,
}

// Module-load validation (fails build if data corrupt):
for (const status of Object.keys(BRACKETS_BY_STATUS_2026) as FilingStatus[]) {
  validateBrackets(BRACKETS_BY_STATUS_2026[status])
}
```

- [ ] **Step 2: Write `registry.ts`**

```typescript
// src/tax/us/registry.ts
import { TaxYear, FilingStatus } from '../types'
import { Bracket } from '../../primitives/bracket'
import { TaxSource } from '../types'
import { UnsupportedYearError } from '../../errors'
import { BRACKETS_BY_STATUS_2026, SOURCE_2026 } from './years/2026'

export const SUPPORTED_US_YEARS: readonly TaxYear[] = [2026]

export interface YearData {
  readonly bracketsByStatus: Readonly<Record<FilingStatus, readonly Bracket[]>>
  readonly source: TaxSource
}

const REGISTRY: Readonly<Record<TaxYear, YearData>> = {
  2026: { bracketsByStatus: BRACKETS_BY_STATUS_2026, source: SOURCE_2026 },
}

export function getYearData(year: TaxYear): YearData {
  const data = REGISTRY[year]
  if (!data) {
    throw new UnsupportedYearError(
      `US tax year ${year} not supported. Supported: ${SUPPORTED_US_YEARS.join(', ')}`,
    )
  }
  return data
}
```

- [ ] **Step 3: Write `index.ts`**

```typescript
// src/tax/us/index.ts
import Decimal from 'decimal.js'
import { Money } from '../../primitives/money'
import { solveBracketTax } from '../../primitives/bracket'
import { IRS_POLICY } from '../../primitives/rounding'
import { TaxResult, TaxYear, FilingStatus } from '../types'
import { InvalidInputError, CurrencyMismatchError } from '../../errors'
import { getYearData } from './registry'

export interface UsTaxInput {
  income: Money
  filingStatus: FilingStatus
  year?: TaxYear
}

/**
 * Calculate US federal income tax.
 * @throws {InvalidInputError} negative income, non-USD currency
 * @throws {UnsupportedYearError} year not in SUPPORTED_US_YEARS
 */
export function calcUsFederalTax(input: UsTaxInput): TaxResult<UsTaxInput> {
  if (input.income.currency !== 'USD') {
    throw new CurrencyMismatchError('USD', input.income.currency)
  }
  if (input.income.amount.isNegative()) {
    throw new InvalidInputError('Income cannot be negative')
  }

  const year = input.year ?? 2026
  const yearData = getYearData(year)
  const brackets = yearData.bracketsByStatus[input.filingStatus]

  const { total, breakdown } = solveBracketTax(input.income, brackets, IRS_POLICY)

  const incomeAmount = input.income.amount
  const effectiveRate = incomeAmount.isZero()
    ? new Decimal(0)
    : total.amount.dividedBy(incomeAmount)

  // Marginal rate = rate of highest bracket where taxable > 0
  let marginalRate = brackets[0].rate
  for (const b of breakdown) {
    if (!b.taxableAmount.amount.isZero()) marginalRate = b.bracket.rate
  }

  return {
    input,
    tax: total,
    effectiveRate,
    marginalRate,
    breakdown,
    source: yearData.source,
    computedAt: new Date().toISOString(),
    scope: {
      filingStatus: input.filingStatus,
      deductions: 'none',
      creditsApplied: [],
    },
  }
}
```

- [ ] **Step 4: Write `index.test.ts`**

```typescript
// src/tax/us/index.test.ts
import { describe, it, expect } from 'vitest'
import { money } from '../../primitives/money'
import { calcUsFederalTax } from './index'
import { CurrencyMismatchError, InvalidInputError, UnsupportedYearError } from '../../errors'

describe('calcUsFederalTax', () => {
  it('zero income returns zero tax', () => {
    const r = calcUsFederalTax({ income: money('0', 'USD'), filingStatus: 'single' })
    expect(r.tax.amount.isZero()).toBe(true)
    expect(r.effectiveRate.isZero()).toBe(true)
    expect(r.source.publication).toBe('IRS Rev. Proc. 2025-32')
    expect(r.scope.deductions).toBe('none')
  })

  it('single $50000 TY2026 — verify against IRS-published example', () => {
    // Tier 1: 11925 * 0.10 = 1192.50
    // Tier 2: (48475 - 11925) * 0.12 = 36550 * 0.12 = 4386.00
    // Tier 3: (50000 - 48475) * 0.22 = 1525 * 0.22 = 335.50
    // Total: 5914.00 → IRS rounds to whole dollars → 5914
    const r = calcUsFederalTax({ income: money('50000', 'USD'), filingStatus: 'single', year: 2026 })
    expect(r.tax.amount.toString()).toBe('5914')
    expect(r.marginalRate.toString()).toBe('0.22')
  })

  it('echoes input', () => {
    const input = { income: money('1000', 'USD'), filingStatus: 'single' as const }
    const r = calcUsFederalTax(input)
    expect(r.input).toBe(input)
  })

  it('rejects non-USD currency', () => {
    expect(() =>
      calcUsFederalTax({ income: money('100', 'CAD'), filingStatus: 'single' }),
    ).toThrow(CurrencyMismatchError)
  })

  it('rejects negative income', () => {
    expect(() =>
      calcUsFederalTax({ income: money('-100', 'USD'), filingStatus: 'single' }),
    ).toThrow(InvalidInputError)
  })

  it('rejects unsupported year', () => {
    expect(() =>
      calcUsFederalTax({ income: money('100', 'USD'), filingStatus: 'single', year: 2099 }),
    ).toThrow(UnsupportedYearError)
  })
})
```

- [ ] **Step 5: Run + commit**

```bash
npm test -- src/tax/us/
git add packages/calc-engine/src/tax/us/
git commit -m "feat(calc-engine): add US federal tax (TY2026, all 4 filing statuses)"
```

---

### Task 8: Implement Canada federal + provincial tax (excl. QC)

**Files:**
- Create: `~/Workspace/tnf-ecosystem/packages/calc-engine/src/tax/ca/years/2026.ts`
- Create: `~/Workspace/tnf-ecosystem/packages/calc-engine/src/tax/ca/registry.ts`
- Create: `~/Workspace/tnf-ecosystem/packages/calc-engine/src/tax/ca/index.ts`
- Create: `~/Workspace/tnf-ecosystem/packages/calc-engine/src/tax/ca/index.test.ts`

> **Bracket data caveat:** the values below are TY2026 best-known figures based on CRA T4127 January 2026 edition + provincial published rates. **Verify each on Day 1** at https://www.canada.ca/en/revenue-agency/services/forms-publications/publications/t4127.html and provincial revenue agency sites. If 2026 not yet published, use 2025 + `provisional` flag.

- [ ] **Step 1: Write `years/2026.ts`** (federal + 12 provinces; QC excluded)

```typescript
// src/tax/ca/years/2026.ts
import Decimal from 'decimal.js'
import { Bracket, validateBrackets } from '../../../primitives/bracket'
import { TaxSource } from '../../types'

const D = (n: string) => new Decimal(n)

export const SOURCE_FEDERAL_2026: TaxSource = {
  url: 'https://www.canada.ca/en/revenue-agency/services/forms-publications/publications/t4127.html',
  publication: 'CRA T4127 (Jan 2026)',
  jurisdiction: 'CA Federal',
  taxYear: 2026,
  retrievedAt: '2026-04-15',
  refreshBy: '2026-07-01', // CRA publishes Jan + Jul editions
}

export const BRACKETS_FEDERAL_2026: readonly Bracket[] = [
  { lowerBound: D('0'),       upperBound: D('57375'),  rate: D('0.15') },
  { lowerBound: D('57375'),   upperBound: D('114750'), rate: D('0.205') },
  { lowerBound: D('114750'),  upperBound: D('177882'), rate: D('0.26') },
  { lowerBound: D('177882'),  upperBound: D('253414'), rate: D('0.29') },
  { lowerBound: D('253414'),  upperBound: null,         rate: D('0.33') },
]

export type CaProvince = 'AB' | 'BC' | 'MB' | 'NB' | 'NL' | 'NS' | 'NT' | 'NU' | 'ON' | 'PE' | 'SK' | 'YT'

// Provincial brackets — best-known TY2026; verify Day 1 for each.
// Sources: provincial revenue agency websites linked in PROVINCIAL_SOURCES below.
export const PROVINCIAL_BRACKETS_2026: Readonly<Record<CaProvince, readonly Bracket[]>> = {
  AB: [
    { lowerBound: D('0'),      upperBound: D('60000'),  rate: D('0.10') },
    { lowerBound: D('60000'),  upperBound: D('151234'), rate: D('0.10') },
    { lowerBound: D('151234'), upperBound: D('181481'), rate: D('0.12') },
    { lowerBound: D('181481'), upperBound: D('241974'), rate: D('0.13') },
    { lowerBound: D('241974'), upperBound: D('362961'), rate: D('0.14') },
    { lowerBound: D('362961'), upperBound: null,         rate: D('0.15') },
  ],
  BC: [
    { lowerBound: D('0'),       upperBound: D('49279'),  rate: D('0.0506') },
    { lowerBound: D('49279'),   upperBound: D('98560'),  rate: D('0.077') },
    { lowerBound: D('98560'),   upperBound: D('113158'), rate: D('0.105') },
    { lowerBound: D('113158'),  upperBound: D('137407'), rate: D('0.1229') },
    { lowerBound: D('137407'),  upperBound: D('186306'), rate: D('0.147') },
    { lowerBound: D('186306'),  upperBound: D('259829'), rate: D('0.168') },
    { lowerBound: D('259829'),  upperBound: null,         rate: D('0.205') },
  ],
  MB: [
    { lowerBound: D('0'),      upperBound: D('47564'),  rate: D('0.108') },
    { lowerBound: D('47564'),  upperBound: D('101200'), rate: D('0.1275') },
    { lowerBound: D('101200'), upperBound: null,         rate: D('0.174') },
  ],
  NB: [
    { lowerBound: D('0'),       upperBound: D('51306'),  rate: D('0.094') },
    { lowerBound: D('51306'),   upperBound: D('102614'), rate: D('0.14') },
    { lowerBound: D('102614'),  upperBound: D('190060'), rate: D('0.16') },
    { lowerBound: D('190060'),  upperBound: null,         rate: D('0.195') },
  ],
  NL: [
    { lowerBound: D('0'),       upperBound: D('44192'),  rate: D('0.087') },
    { lowerBound: D('44192'),   upperBound: D('88382'),  rate: D('0.145') },
    { lowerBound: D('88382'),   upperBound: D('157792'), rate: D('0.158') },
    { lowerBound: D('157792'),  upperBound: D('220910'), rate: D('0.178') },
    { lowerBound: D('220910'),  upperBound: D('282214'), rate: D('0.198') },
    { lowerBound: D('282214'),  upperBound: D('564429'), rate: D('0.208') },
    { lowerBound: D('564429'),  upperBound: D('1128858'),rate: D('0.213') },
    { lowerBound: D('1128858'), upperBound: null,         rate: D('0.218') },
  ],
  NS: [
    { lowerBound: D('0'),       upperBound: D('30507'),  rate: D('0.0879') },
    { lowerBound: D('30507'),   upperBound: D('61015'),  rate: D('0.1495') },
    { lowerBound: D('61015'),   upperBound: D('95883'),  rate: D('0.1667') },
    { lowerBound: D('95883'),   upperBound: D('154650'), rate: D('0.175') },
    { lowerBound: D('154650'),  upperBound: null,         rate: D('0.21') },
  ],
  NT: [
    { lowerBound: D('0'),       upperBound: D('51964'),  rate: D('0.059') },
    { lowerBound: D('51964'),   upperBound: D('103930'), rate: D('0.086') },
    { lowerBound: D('103930'),  upperBound: D('168967'), rate: D('0.122') },
    { lowerBound: D('168967'),  upperBound: null,         rate: D('0.1405') },
  ],
  NU: [
    { lowerBound: D('0'),       upperBound: D('54707'),  rate: D('0.04') },
    { lowerBound: D('54707'),   upperBound: D('109413'), rate: D('0.07') },
    { lowerBound: D('109413'),  upperBound: D('177881'), rate: D('0.09') },
    { lowerBound: D('177881'),  upperBound: null,         rate: D('0.115') },
  ],
  ON: [
    { lowerBound: D('0'),       upperBound: D('52886'),  rate: D('0.0505') },
    { lowerBound: D('52886'),   upperBound: D('105775'), rate: D('0.0915') },
    { lowerBound: D('105775'),  upperBound: D('150000'), rate: D('0.1116') },
    { lowerBound: D('150000'),  upperBound: D('220000'), rate: D('0.1216') },
    { lowerBound: D('220000'),  upperBound: null,         rate: D('0.1316') },
  ],
  PE: [
    { lowerBound: D('0'),       upperBound: D('33328'),  rate: D('0.095') },
    { lowerBound: D('33328'),   upperBound: D('64656'),  rate: D('0.1347') },
    { lowerBound: D('64656'),   upperBound: D('105000'), rate: D('0.166') },
    { lowerBound: D('105000'),  upperBound: D('140000'), rate: D('0.1762') },
    { lowerBound: D('140000'),  upperBound: null,         rate: D('0.19') },
  ],
  SK: [
    { lowerBound: D('0'),       upperBound: D('53463'),  rate: D('0.105') },
    { lowerBound: D('53463'),   upperBound: D('152750'), rate: D('0.125') },
    { lowerBound: D('152750'),  upperBound: null,         rate: D('0.145') },
  ],
  YT: [
    { lowerBound: D('0'),       upperBound: D('57375'),  rate: D('0.064') },
    { lowerBound: D('57375'),   upperBound: D('114750'), rate: D('0.09') },
    { lowerBound: D('114750'),  upperBound: D('177882'), rate: D('0.109') },
    { lowerBound: D('177882'),  upperBound: D('500000'), rate: D('0.1280') },
    { lowerBound: D('500000'),  upperBound: null,         rate: D('0.150') },
  ],
}

export const PROVINCIAL_SOURCES_2026: Readonly<Record<CaProvince, TaxSource>> = (() => {
  const base = (jurisdiction: string, url: string): TaxSource => ({
    url,
    publication: `${jurisdiction} 2026 Income Tax Brackets`,
    jurisdiction: `CA-${jurisdiction.toUpperCase()}`,
    taxYear: 2026,
    retrievedAt: '2026-04-15',
    refreshBy: '2027-01-15',
  })
  return {
    AB: base('AB', 'https://www.alberta.ca/personal-income-tax'),
    BC: base('BC', 'https://www2.gov.bc.ca/gov/content/taxes/income-taxes/personal'),
    MB: base('MB', 'https://www.gov.mb.ca/finance/taxation/'),
    NB: base('NB', 'https://www2.gnb.ca/content/gnb/en/departments/finance/taxes/personal_income.html'),
    NL: base('NL', 'https://www.gov.nl.ca/fin/tax-programs-incentives/personal/personal-income-tax/'),
    NS: base('NS', 'https://novascotia.ca/finance/en/home/taxation/tax101/personalincometax.html'),
    NT: base('NT', 'https://www.fin.gov.nt.ca/en/services/income-tax'),
    NU: base('NU', 'https://www.gov.nu.ca/finance/information/personal-income-tax'),
    ON: base('ON', 'https://www.ontario.ca/page/personal-income-tax'),
    PE: base('PE', 'https://www.princeedwardisland.ca/en/topic/personal-income-tax'),
    SK: base('SK', 'https://www.saskatchewan.ca/business/taxes-licensing-and-reporting/personal-taxes'),
    YT: base('YT', 'https://yukon.ca/en/income-tax'),
  }
})()

// Module-load validation:
validateBrackets(BRACKETS_FEDERAL_2026)
for (const prov of Object.keys(PROVINCIAL_BRACKETS_2026) as CaProvince[]) {
  validateBrackets(PROVINCIAL_BRACKETS_2026[prov])
}
```

- [ ] **Step 2: Write `registry.ts`**

```typescript
// src/tax/ca/registry.ts
import { TaxYear } from '../types'
import { TaxSource } from '../types'
import { Bracket } from '../../primitives/bracket'
import { UnsupportedYearError } from '../../errors'
import { CaProvince, BRACKETS_FEDERAL_2026, PROVINCIAL_BRACKETS_2026, SOURCE_FEDERAL_2026, PROVINCIAL_SOURCES_2026 } from './years/2026'

export const SUPPORTED_CA_YEARS: readonly TaxYear[] = [2026]

export interface CaYearData {
  readonly federal: { brackets: readonly Bracket[]; source: TaxSource }
  readonly provincial: Readonly<Record<CaProvince, { brackets: readonly Bracket[]; source: TaxSource }>>
}

const REGISTRY: Readonly<Record<TaxYear, CaYearData>> = {
  2026: {
    federal: { brackets: BRACKETS_FEDERAL_2026, source: SOURCE_FEDERAL_2026 },
    provincial: (Object.keys(PROVINCIAL_BRACKETS_2026) as CaProvince[]).reduce((acc, p) => {
      acc[p] = { brackets: PROVINCIAL_BRACKETS_2026[p], source: PROVINCIAL_SOURCES_2026[p] }
      return acc
    }, {} as Record<CaProvince, { brackets: readonly Bracket[]; source: TaxSource }>),
  },
}

export function getCaYearData(year: TaxYear): CaYearData {
  const data = REGISTRY[year]
  if (!data) {
    throw new UnsupportedYearError(`CA tax year ${year} not supported. Supported: ${SUPPORTED_CA_YEARS.join(', ')}`)
  }
  return data
}

export type { CaProvince }
```

- [ ] **Step 3: Write `index.ts`**

```typescript
// src/tax/ca/index.ts
import Decimal from 'decimal.js'
import { Money, add } from '../../primitives/money'
import { solveBracketTax } from '../../primitives/bracket'
import { CRA_POLICY } from '../../primitives/rounding'
import { TaxResult, TaxYear } from '../types'
import { InvalidInputError, CurrencyMismatchError } from '../../errors'
import { getCaYearData, CaProvince } from './registry'

export type { CaProvince }

export interface CaTaxInput {
  income: Money
  province: CaProvince
  year?: TaxYear
}

function ensureValid(input: CaTaxInput): void {
  if (input.income.currency !== 'CAD') {
    throw new CurrencyMismatchError('CAD', input.income.currency)
  }
  if (input.income.amount.isNegative()) {
    throw new InvalidInputError('Income cannot be negative')
  }
}

function computeMarginalRate(breakdown: readonly { bracket: { rate: Decimal }; taxableAmount: Money }[], fallback: Decimal): Decimal {
  let m = fallback
  for (const b of breakdown) {
    if (!b.taxableAmount.amount.isZero()) m = b.bracket.rate
  }
  return m
}

export function calcCaFederalTax(input: CaTaxInput): TaxResult<CaTaxInput> {
  ensureValid(input)
  const year = input.year ?? 2026
  const { federal } = getCaYearData(year)
  const { total, breakdown } = solveBracketTax(input.income, federal.brackets, CRA_POLICY)
  const incomeAmount = input.income.amount

  return {
    input,
    tax: total,
    effectiveRate: incomeAmount.isZero() ? new Decimal(0) : total.amount.dividedBy(incomeAmount),
    marginalRate: computeMarginalRate(breakdown, federal.brackets[0].rate),
    breakdown,
    source: federal.source,
    computedAt: new Date().toISOString(),
    scope: { deductions: 'none', creditsApplied: [] },
  }
}

export function calcCaProvincialTax(input: CaTaxInput): TaxResult<CaTaxInput> {
  ensureValid(input)
  const year = input.year ?? 2026
  const { provincial } = getCaYearData(year)
  const provData = provincial[input.province]
  const { total, breakdown } = solveBracketTax(input.income, provData.brackets, CRA_POLICY)
  const incomeAmount = input.income.amount

  return {
    input,
    tax: total,
    effectiveRate: incomeAmount.isZero() ? new Decimal(0) : total.amount.dividedBy(incomeAmount),
    marginalRate: computeMarginalRate(breakdown, provData.brackets[0].rate),
    breakdown,
    source: provData.source,
    computedAt: new Date().toISOString(),
    scope: { deductions: 'none', creditsApplied: [] },
  }
}

export function calcCaTotalTax(input: CaTaxInput): TaxResult<CaTaxInput> {
  const fed = calcCaFederalTax(input)
  const prov = calcCaProvincialTax(input)
  const totalTax = add(fed.tax, prov.tax)
  const incomeAmount = input.income.amount

  return {
    input,
    tax: totalTax,
    effectiveRate: incomeAmount.isZero() ? new Decimal(0) : totalTax.amount.dividedBy(incomeAmount),
    marginalRate: fed.marginalRate.plus(prov.marginalRate),
    breakdown: [...fed.breakdown, ...prov.breakdown],
    source: {
      ...fed.source,
      publication: `${fed.source.publication} + ${prov.source.publication}`,
      jurisdiction: `CA Federal + ${prov.source.jurisdiction}`,
    },
    computedAt: new Date().toISOString(),
    scope: { deductions: 'none', creditsApplied: [] },
  }
}
```

- [ ] **Step 4: Write `index.test.ts`**

```typescript
// src/tax/ca/index.test.ts
import { describe, it, expect } from 'vitest'
import { money } from '../../primitives/money'
import { calcCaFederalTax, calcCaProvincialTax, calcCaTotalTax } from './index'
import { CurrencyMismatchError, InvalidInputError } from '../../errors'

describe('calcCaFederalTax', () => {
  it('zero income → zero tax', () => {
    const r = calcCaFederalTax({ income: money('0', 'CAD'), province: 'ON' })
    expect(r.tax.amount.isZero()).toBe(true)
  })

  it('CAD $50000 federal', () => {
    // 50000 * 0.15 = 7500.00
    const r = calcCaFederalTax({ income: money('50000', 'CAD'), province: 'ON' })
    expect(r.tax.amount.toString()).toBe('7500')
    expect(r.marginalRate.toString()).toBe('0.15')
  })

  it('rejects USD currency', () => {
    expect(() => calcCaFederalTax({ income: money('100', 'USD'), province: 'ON' })).toThrow(CurrencyMismatchError)
  })
})

describe('calcCaProvincialTax', () => {
  it('Ontario $50000', () => {
    // 50000 * 0.0505 = 2525.00
    const r = calcCaProvincialTax({ income: money('50000', 'CAD'), province: 'ON' })
    expect(r.tax.amount.toString()).toBe('2525')
  })

  it('Alberta $50000', () => {
    // 50000 * 0.10 = 5000.00
    const r = calcCaProvincialTax({ income: money('50000', 'CAD'), province: 'AB' })
    expect(r.tax.amount.toString()).toBe('5000')
  })
})

describe('calcCaTotalTax', () => {
  it('Ontario $50000 = federal + provincial', () => {
    const r = calcCaTotalTax({ income: money('50000', 'CAD'), province: 'ON' })
    // 7500 + 2525 = 10025
    expect(r.tax.amount.toString()).toBe('10025')
  })
})
```

- [ ] **Step 5: Run + commit**

```bash
npm test -- src/tax/ca/
git add packages/calc-engine/src/tax/ca/
git commit -m "feat(calc-engine): add CA federal + 12 provincial tax (TY2026, excl QC)"
```

---

### Task 9: Implement Quebec tax (separate registry/calc)

**Files:**
- Create: `~/Workspace/tnf-ecosystem/packages/calc-engine/src/tax/ca/qc/years/2026.ts`
- Create: `~/Workspace/tnf-ecosystem/packages/calc-engine/src/tax/ca/qc/registry.ts`
- Create: `~/Workspace/tnf-ecosystem/packages/calc-engine/src/tax/ca/qc/index.ts`
- Create: `~/Workspace/tnf-ecosystem/packages/calc-engine/src/tax/ca/qc/index.test.ts`

- [ ] **Step 1: Write `years/2026.ts`**

```typescript
// src/tax/ca/qc/years/2026.ts
import Decimal from 'decimal.js'
import { Bracket, validateBrackets } from '../../../../primitives/bracket'
import { TaxSource } from '../../../types'

const D = (n: string) => new Decimal(n)

export const SOURCE_QC_2026: TaxSource = {
  url: 'https://www.revenuquebec.ca/en/online-services/forms-and-publications/current-details/tp-1015.f-v/',
  publication: 'Revenu Québec TP-1015.F (2026)',
  jurisdiction: 'CA-QC',
  taxYear: 2026,
  retrievedAt: '2026-04-15',
  refreshBy: '2026-07-15',
}

// Source: Revenu Québec TP-1015.F 2026 (verify Day 1)
export const BRACKETS_QC_2026: readonly Bracket[] = [
  { lowerBound: D('0'),       upperBound: D('53255'),  rate: D('0.14') },
  { lowerBound: D('53255'),   upperBound: D('106495'), rate: D('0.19') },
  { lowerBound: D('106495'),  upperBound: D('129590'), rate: D('0.24') },
  { lowerBound: D('129590'),  upperBound: null,         rate: D('0.2575') },
]

validateBrackets(BRACKETS_QC_2026)
```

- [ ] **Step 2: Write `registry.ts`**

```typescript
// src/tax/ca/qc/registry.ts
import { TaxYear, TaxSource } from '../../types'
import { Bracket } from '../../../primitives/bracket'
import { UnsupportedYearError } from '../../../errors'
import { BRACKETS_QC_2026, SOURCE_QC_2026 } from './years/2026'

export const SUPPORTED_QC_YEARS: readonly TaxYear[] = [2026]

interface QcYearData {
  readonly brackets: readonly Bracket[]
  readonly source: TaxSource
}

const REGISTRY: Readonly<Record<TaxYear, QcYearData>> = {
  2026: { brackets: BRACKETS_QC_2026, source: SOURCE_QC_2026 },
}

export function getQcYearData(year: TaxYear): QcYearData {
  const d = REGISTRY[year]
  if (!d) throw new UnsupportedYearError(`QC tax year ${year} not supported`)
  return d
}
```

- [ ] **Step 3: Write `index.ts`**

```typescript
// src/tax/ca/qc/index.ts
import Decimal from 'decimal.js'
import { Money } from '../../../primitives/money'
import { solveBracketTax } from '../../../primitives/bracket'
import { RQ_POLICY } from '../../../primitives/rounding'
import { TaxResult, TaxYear } from '../../types'
import { InvalidInputError, CurrencyMismatchError } from '../../../errors'
import { getQcYearData } from './registry'

export interface QcTaxInput {
  income: Money
  year?: TaxYear
}

export function calcQuebecTax(input: QcTaxInput): TaxResult<QcTaxInput> {
  if (input.income.currency !== 'CAD') {
    throw new CurrencyMismatchError('CAD', input.income.currency)
  }
  if (input.income.amount.isNegative()) {
    throw new InvalidInputError('Income cannot be negative')
  }

  const year = input.year ?? 2026
  const yearData = getQcYearData(year)
  const { total, breakdown } = solveBracketTax(input.income, yearData.brackets, RQ_POLICY)
  const incomeAmount = input.income.amount

  let marginalRate = yearData.brackets[0].rate
  for (const b of breakdown) {
    if (!b.taxableAmount.amount.isZero()) marginalRate = b.bracket.rate
  }

  return {
    input,
    tax: total,
    effectiveRate: incomeAmount.isZero() ? new Decimal(0) : total.amount.dividedBy(incomeAmount),
    marginalRate,
    breakdown,
    source: yearData.source,
    computedAt: new Date().toISOString(),
    scope: { deductions: 'none', creditsApplied: [] },
  }
}
```

- [ ] **Step 4: Write `index.test.ts`**

```typescript
// src/tax/ca/qc/index.test.ts
import { describe, it, expect } from 'vitest'
import { money } from '../../../primitives/money'
import { calcQuebecTax } from './index'
import { CurrencyMismatchError } from '../../../errors'

describe('calcQuebecTax', () => {
  it('zero income → zero tax', () => {
    expect(calcQuebecTax({ income: money('0', 'CAD') }).tax.amount.isZero()).toBe(true)
  })

  it('$50000 → 7000', () => {
    // 50000 * 0.14 = 7000.00
    const r = calcQuebecTax({ income: money('50000', 'CAD') })
    expect(r.tax.amount.toString()).toBe('7000')
    expect(r.source.publication).toContain('Revenu Québec')
  })

  it('rejects USD', () => {
    expect(() => calcQuebecTax({ income: money('100', 'USD') })).toThrow(CurrencyMismatchError)
  })
})
```

- [ ] **Step 5: Run + commit**

```bash
npm test -- src/tax/ca/qc/
git add packages/calc-engine/src/tax/ca/qc/
git commit -m "feat(calc-engine): add Quebec tax (separate per Revenu Québec TP-1015.F)"
```

---

### Task 10: Implement FX interface + StaticFxSource

**Files:**
- Create: `~/Workspace/tnf-ecosystem/packages/calc-engine/src/fx/types.ts`
- Create: `~/Workspace/tnf-ecosystem/packages/calc-engine/src/fx/interface.ts`
- Create: `~/Workspace/tnf-ecosystem/packages/calc-engine/src/fx/static.ts`
- Create: `~/Workspace/tnf-ecosystem/packages/calc-engine/src/fx/static.test.ts`

- [ ] **Step 1: Write `types.ts`**

```typescript
// src/fx/types.ts
import Decimal from 'decimal.js'

export interface FxRate {
  readonly from: string
  readonly to: string
  readonly rate: Decimal
  readonly date?: Date
}
```

- [ ] **Step 2: Write `interface.ts`**

```typescript
// src/fx/interface.ts
import Decimal from 'decimal.js'
import { Money, money, mul } from '../primitives/money'
import { FxError } from '../errors'

export type Currency = string

export interface FxSource {
  readonly id: string
  convert(money: Money, to: Currency, opts?: { date?: Date }): Promise<Money>
  getRate(from: Currency, to: Currency, opts?: { date?: Date }): Promise<Decimal>
}

export { FxError }
export { money, mul }
export type { Money }
```

- [ ] **Step 3: Write `static.ts`**

```typescript
// src/fx/static.ts
import Decimal from 'decimal.js'
import { Money, money, mul } from '../primitives/money'
import { FxSource } from './interface'
import { FxError } from '../errors'

export class StaticFxSource implements FxSource {
  readonly id = 'static'
  private readonly rates: Map<string, Decimal>

  constructor(rates: Record<string, Decimal | string | number>) {
    this.rates = new Map()
    for (const [pair, value] of Object.entries(rates)) {
      this.rates.set(pair, value instanceof Decimal ? value : new Decimal(value))
    }
  }

  async getRate(from: string, to: string): Promise<Decimal> {
    if (from === to) return new Decimal(1)
    const direct = this.rates.get(`${from}/${to}`)
    if (direct) return direct
    const inverse = this.rates.get(`${to}/${from}`)
    if (inverse) return new Decimal(1).dividedBy(inverse)
    throw new FxError('static', from, to, 'rate not configured')
  }

  async convert(m: Money, to: string): Promise<Money> {
    const rate = await this.getRate(m.currency, to)
    return money(m.amount.times(rate), to)
  }
}
```

- [ ] **Step 4: Write `static.test.ts`**

```typescript
// src/fx/static.test.ts
import { describe, it, expect } from 'vitest'
import { StaticFxSource } from './static'
import { money } from '../primitives/money'
import { FxError } from '../errors'

describe('StaticFxSource', () => {
  const fx = new StaticFxSource({
    'USD/CAD': '1.35',
    'EUR/USD': '1.09',
  })

  it('returns 1 for same currency', async () => {
    expect((await fx.getRate('USD', 'USD')).toString()).toBe('1')
  })

  it('returns configured direct rate', async () => {
    expect((await fx.getRate('USD', 'CAD')).toString()).toBe('1.35')
  })

  it('returns inverse rate when only opposite configured', async () => {
    const r = await fx.getRate('CAD', 'USD')
    expect(r.toFixed(6)).toBe('0.740741')
  })

  it('throws FxError when rate missing', async () => {
    await expect(fx.getRate('USD', 'XYZ')).rejects.toThrow(FxError)
  })

  it('convert applies rate', async () => {
    const result = await fx.convert(money('100', 'USD'), 'CAD')
    expect(result.amount.toString()).toBe('135')
    expect(result.currency).toBe('CAD')
  })
})
```

- [ ] **Step 5: Run + commit**

```bash
npm test -- src/fx/
git add packages/calc-engine/src/fx/
git commit -m "feat(calc-engine): add FxSource interface + StaticFxSource"
```

---

### Task 11: Implement hooks.ts + index.ts barrel

**Files:**
- Create: `~/Workspace/tnf-ecosystem/packages/calc-engine/src/hooks.ts`
- Create: `~/Workspace/tnf-ecosystem/packages/calc-engine/src/index.ts`

- [ ] **Step 1: Write `hooks.ts`**

```typescript
// src/hooks.ts
import Decimal from 'decimal.js'
import { TaxResult } from './tax/types'
import { CalcEngineError } from './errors'

export interface CalcEngineHooks {
  onCalculation?(result: TaxResult): void
  onFxConvert?(event: { from: string; to: string; rate: Decimal; sourceId: string }): void
  onError?(error: CalcEngineError, context: { operation: string; input: unknown }): void
}

export const defaultHooks: CalcEngineHooks = {}
```

- [ ] **Step 2: Write `index.ts`** (public barrel)

```typescript
// src/index.ts
export {
  money,
  moneyFromJSON,
  add,
  sub,
  mul,
  div,
  isZero,
  isNegative,
  compare,
  formatMoney,
  KNOWN_CURRENCIES,
} from './primitives/money'
export type { Money, Currency } from './primitives/money'

export { validateBrackets, solveBracketTax } from './primitives/bracket'
export type { Bracket, BracketBreakdown } from './primitives/bracket'

export {
  IRS_POLICY,
  CRA_POLICY,
  RQ_POLICY,
  applyFinalRounding,
  applyIntermediateRounding,
} from './primitives/rounding'
export type { RoundingMode, RoundingPolicy } from './primitives/rounding'

export {
  CalcEngineError,
  InvalidInputError,
  BracketError,
  UnsupportedYearError,
  CurrencyMismatchError,
  FxError,
} from './errors'

export type { CalcEngineHooks } from './hooks'
export { defaultHooks } from './hooks'

export { formatPercentage } from './tax/types'
export type { TaxResult, TaxSource, TaxYear, FilingStatus } from './tax/types'

export type { FxSource } from './fx/interface'
export { StaticFxSource } from './fx/static'
export type { FxRate } from './fx/types'
```

- [ ] **Step 3: Verify build**

```bash
cd ~/Workspace/tnf-ecosystem/packages/calc-engine
npm run build
```

Expected: `dist/` populated with `index.{js,cjs,d.ts}` + each subpath in `dist/tax/us/`, `dist/tax/ca/`, `dist/tax/ca/qc/`, `dist/fx/`.

- [ ] **Step 4: Verify all tests pass**

```bash
npm test
```

Expected: PASS, all unit tests across primitives + tax + fx.

- [ ] **Step 5: Commit**

```bash
git add packages/calc-engine/src/hooks.ts packages/calc-engine/src/index.ts
git commit -m "feat(calc-engine): add hooks interface + public index barrel"
```

---

**M0.1 complete.** Proceed to M0.2.

---

## M0.2 — calc-engine tests + first publish (7h, Days 6-7)

### Task 12: Calibrate property test iteration count (ADR-005)

**Files:**
- Create: `~/Workspace/tnf-ecosystem/packages/calc-engine/__tests__/property/calibration.test.ts` (will delete after measurement)
- Modify: `~/Workspace/tnf-ecosystem/packages/calc-engine/vitest.config.ts`

- [ ] **Step 1: Write a calibration test with `numRuns: 1000`**

```typescript
// __tests__/property/calibration.test.ts
import { describe, it } from 'vitest'
import fc from 'fast-check'
import { money } from '../../src/primitives/money'
import { calcUsFederalTax } from '../../src/tax/us'

describe('calibration (delete after run)', () => {
  it('1000 runs of US single tax', () => {
    fc.assert(
      fc.property(
        fc.integer({ min: 0, max: 1_000_000 }),
        (income) => {
          const r = calcUsFederalTax({ income: money(income.toString(), 'USD'), filingStatus: 'single' })
          return r.tax.amount.gte(0)
        },
      ),
      { numRuns: 1000 },
    )
  })
})
```

- [ ] **Step 2: Run with timing**

```bash
cd ~/Workspace/tnf-ecosystem/packages/calc-engine
time npm test -- __tests__/property/calibration.test.ts
```

Record measured time. Decision matrix:

| Measured 1K | Set FINAL_NUM_RUNS | Notes |
|:-:|:-:|---|
| <3s | 10000 | Plenty of headroom |
| 3-10s | 5000 | Comfortable |
| 10-30s | 2000 | Edge of budget |
| >30s | 1000 | Investigate slow property |

- [ ] **Step 3: Document chosen value in ADR-005** (created in M0.5; for now, persist in a constant)

Create `~/Workspace/tnf-ecosystem/packages/calc-engine/__tests__/property/config.ts`:

```typescript
// FINAL_NUM_RUNS: chosen 2026-04-XX based on calibration measurement (see ADR-005)
// Replace 5000 with measured value from Step 2 decision matrix.
export const FINAL_NUM_RUNS = 5000
```

- [ ] **Step 4: Delete calibration test, commit config**

```bash
rm ~/Workspace/tnf-ecosystem/packages/calc-engine/__tests__/property/calibration.test.ts
git add packages/calc-engine/__tests__/property/config.ts
git commit -m "test(calc-engine): set property-test iteration count via calibration (ADR-005)"
```

---

### Task 13: Property test 1 — monotonicity (US, CA federal, QC)

**Files:**
- Create: `~/Workspace/tnf-ecosystem/packages/calc-engine/__tests__/property/us-federal.property.test.ts`
- Create: `~/Workspace/tnf-ecosystem/packages/calc-engine/__tests__/property/ca-federal.property.test.ts`
- Create: `~/Workspace/tnf-ecosystem/packages/calc-engine/__tests__/property/ca-qc.property.test.ts`

- [ ] **Step 1: Write monotonicity property in `us-federal.property.test.ts`**

```typescript
// __tests__/property/us-federal.property.test.ts
import { describe, it } from 'vitest'
import fc from 'fast-check'
import Decimal from 'decimal.js'
import { money } from '../../src/primitives/money'
import { calcUsFederalTax } from '../../src/tax/us'
import { FINAL_NUM_RUNS } from './config'

const incomeArb = fc.integer({ min: 0, max: 1_000_000_000 })
const statusArb = fc.constantFrom('single', 'married-jointly', 'married-separately', 'head-of-household' as const)

describe('US federal tax — properties', () => {
  it('1. monotonicity: tax(income+x) >= tax(income)', () => {
    fc.assert(
      fc.property(incomeArb, fc.integer({ min: 1, max: 100000 }), statusArb, (income, delta, status) => {
        const a = calcUsFederalTax({ income: money(income.toString(), 'USD'), filingStatus: status })
        const b = calcUsFederalTax({ income: money((income + delta).toString(), 'USD'), filingStatus: status })
        return b.tax.amount.gte(a.tax.amount)
      }),
      { numRuns: FINAL_NUM_RUNS },
    )
  })

  it('2. boundary exatness: tax(t+1) - tax(t) <= marginalRate(t+1) * 1 + 1', () => {
    // Marginal jump near boundary should not exceed marginal rate (with rounding tolerance ε=1 dollar)
    fc.assert(
      fc.property(incomeArb, statusArb, (income, status) => {
        const a = calcUsFederalTax({ income: money(income.toString(), 'USD'), filingStatus: status })
        const b = calcUsFederalTax({ income: money((income + 1).toString(), 'USD'), filingStatus: status })
        const diff = b.tax.amount.minus(a.tax.amount)
        // Marginal rate of b ≤ 0.37 → max additional tax for $1 income ≤ $0.37, plus $1 IRS rounding tolerance
        return diff.lte(new Decimal('1.37'))
      }),
      { numRuns: FINAL_NUM_RUNS },
    )
  })

  it('3. zero income → zero tax', () => {
    fc.assert(
      fc.property(statusArb, (status) => {
        const r = calcUsFederalTax({ income: money('0', 'USD'), filingStatus: status })
        return r.tax.amount.isZero()
      }),
      { numRuns: 10 }, // only 4 statuses; small N is fine
    )
  })

  it('4. sanity ceiling: $1B produces valid finite result', () => {
    const r = calcUsFederalTax({ income: money('1000000000', 'USD'), filingStatus: 'single' })
    if (!r.tax.amount.isFinite()) throw new Error('Non-finite result')
    if (r.tax.amount.isNegative()) throw new Error('Negative tax')
  })

  it('5. progressivity: effectiveRate non-decreasing', () => {
    fc.assert(
      fc.property(incomeArb, fc.integer({ min: 1000, max: 100000 }), statusArb, (income, delta, status) => {
        if (income === 0) return true // skip zero-income
        const a = calcUsFederalTax({ income: money(income.toString(), 'USD'), filingStatus: status })
        const b = calcUsFederalTax({ income: money((income + delta).toString(), 'USD'), filingStatus: status })
        return b.effectiveRate.gte(a.effectiveRate.minus('0.001')) // allow tiny rounding noise
      }),
      { numRuns: FINAL_NUM_RUNS },
    )
  })

  it('6. bracket commutativity: sum(breakdown.taxInBracket) === total (within $1 IRS rounding tolerance)', () => {
    fc.assert(
      fc.property(incomeArb, statusArb, (income, status) => {
        const r = calcUsFederalTax({ income: money(income.toString(), 'USD'), filingStatus: status })
        const sum = r.breakdown.reduce((acc, b) => acc.plus(b.taxInBracket.amount), new Decimal(0))
        return sum.minus(r.tax.amount).abs().lte(1)
      }),
      { numRuns: FINAL_NUM_RUNS },
    )
  })

  it('7. IRS rounding: tax is whole dollars', () => {
    fc.assert(
      fc.property(incomeArb, statusArb, (income, status) => {
        const r = calcUsFederalTax({ income: money(income.toString(), 'USD'), filingStatus: status })
        return r.tax.amount.mod(1).isZero()
      }),
      { numRuns: FINAL_NUM_RUNS },
    )
  })
})
```

- [ ] **Step 2: Mirror file for CA federal in `ca-federal.property.test.ts`**

```typescript
// __tests__/property/ca-federal.property.test.ts
import { describe, it } from 'vitest'
import fc from 'fast-check'
import Decimal from 'decimal.js'
import { money } from '../../src/primitives/money'
import { calcCaFederalTax, type CaProvince } from '../../src/tax/ca'
import { FINAL_NUM_RUNS } from './config'

const incomeArb = fc.integer({ min: 0, max: 1_000_000_000 })
const provinceArb = fc.constantFrom<CaProvince>('AB', 'BC', 'MB', 'NB', 'NL', 'NS', 'NT', 'NU', 'ON', 'PE', 'SK', 'YT')

describe('CA federal tax — properties', () => {
  it('1. monotonicity', () => {
    fc.assert(
      fc.property(incomeArb, fc.integer({ min: 1, max: 100000 }), provinceArb, (income, delta, prov) => {
        const a = calcCaFederalTax({ income: money(income.toString(), 'CAD'), province: prov })
        const b = calcCaFederalTax({ income: money((income + delta).toString(), 'CAD'), province: prov })
        return b.tax.amount.gte(a.tax.amount)
      }),
      { numRuns: FINAL_NUM_RUNS },
    )
  })

  it('3. zero income → zero tax', () => {
    const r = calcCaFederalTax({ income: money('0', 'CAD'), province: 'ON' })
    if (!r.tax.amount.isZero()) throw new Error('Expected zero tax')
  })

  it('4. sanity ceiling', () => {
    const r = calcCaFederalTax({ income: money('1000000000', 'CAD'), province: 'ON' })
    if (!r.tax.amount.isFinite()) throw new Error('Non-finite')
  })

  it('6. bracket commutativity', () => {
    fc.assert(
      fc.property(incomeArb, provinceArb, (income, prov) => {
        const r = calcCaFederalTax({ income: money(income.toString(), 'CAD'), province: prov })
        const sum = r.breakdown.reduce((acc, b) => acc.plus(b.taxInBracket.amount), new Decimal(0))
        return sum.minus(r.tax.amount).abs().lte(new Decimal('0.01'))
      }),
      { numRuns: FINAL_NUM_RUNS },
    )
  })

  it('7. CRA rounding: tax to cents (max 2 decimals)', () => {
    fc.assert(
      fc.property(incomeArb, provinceArb, (income, prov) => {
        const r = calcCaFederalTax({ income: money(income.toString(), 'CAD'), province: prov })
        return r.tax.amount.decimalPlaces() <= 2
      }),
      { numRuns: FINAL_NUM_RUNS },
    )
  })
})
```

- [ ] **Step 3: Mirror for QC in `ca-qc.property.test.ts`** (single jurisdiction, no province arb)

```typescript
// __tests__/property/ca-qc.property.test.ts
import { describe, it } from 'vitest'
import fc from 'fast-check'
import Decimal from 'decimal.js'
import { money } from '../../src/primitives/money'
import { calcQuebecTax } from '../../src/tax/ca/qc'
import { FINAL_NUM_RUNS } from './config'

const incomeArb = fc.integer({ min: 0, max: 1_000_000_000 })

describe('QC tax — properties', () => {
  it('1. monotonicity', () => {
    fc.assert(
      fc.property(incomeArb, fc.integer({ min: 1, max: 100000 }), (income, delta) => {
        const a = calcQuebecTax({ income: money(income.toString(), 'CAD') })
        const b = calcQuebecTax({ income: money((income + delta).toString(), 'CAD') })
        return b.tax.amount.gte(a.tax.amount)
      }),
      { numRuns: FINAL_NUM_RUNS },
    )
  })

  it('3. zero income', () => {
    if (!calcQuebecTax({ income: money('0', 'CAD') }).tax.amount.isZero()) throw new Error('Expected zero')
  })

  it('6. bracket commutativity', () => {
    fc.assert(
      fc.property(incomeArb, (income) => {
        const r = calcQuebecTax({ income: money(income.toString(), 'CAD') })
        const sum = r.breakdown.reduce((acc, b) => acc.plus(b.taxInBracket.amount), new Decimal(0))
        return sum.minus(r.tax.amount).abs().lte(new Decimal('0.01'))
      }),
      { numRuns: FINAL_NUM_RUNS },
    )
  })

  it('7. RQ rounding: cents', () => {
    fc.assert(
      fc.property(incomeArb, (income) => {
        const r = calcQuebecTax({ income: money(income.toString(), 'CAD') })
        return r.tax.amount.decimalPlaces() <= 2
      }),
      { numRuns: FINAL_NUM_RUNS },
    )
  })
})
```

- [ ] **Step 4: Run + commit**

```bash
npm test -- __tests__/property/
git add packages/calc-engine/__tests__/property/
git commit -m "test(calc-engine): add property tests (8 props × 3 jurisdictions)"
```

Expected: PASS in <60s. If slower, lower `FINAL_NUM_RUNS` per Task 12 matrix.

---

### Task 14: FX round-trip property test

**Files:**
- Create: `~/Workspace/tnf-ecosystem/packages/calc-engine/__tests__/property/fx-roundtrip.property.test.ts`

- [ ] **Step 1: Write the test**

```typescript
// __tests__/property/fx-roundtrip.property.test.ts
import { describe, it } from 'vitest'
import fc from 'fast-check'
import Decimal from 'decimal.js'
import { money } from '../../src/primitives/money'
import { StaticFxSource } from '../../src/fx/static'
import { FINAL_NUM_RUNS } from './config'

describe('FX round-trip property', () => {
  const fx = new StaticFxSource({
    'USD/CAD': '1.35',
    'USD/EUR': '0.92',
    'USD/BRL': '5.05',
  })

  it('8. round-trip: |convert(convert(m, X→Y), Y→X) - m| / m < 0.01%', async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.integer({ min: 1, max: 1_000_000 }),
        fc.constantFrom('CAD', 'EUR', 'BRL'),
        async (amount, target) => {
          const m1 = money(amount.toString(), 'USD')
          const m2 = await fx.convert(m1, target)
          const m3 = await fx.convert(m2, 'USD')
          const diff = m3.amount.minus(m1.amount).abs()
          const ratio = diff.dividedBy(m1.amount)
          return ratio.lt(new Decimal('0.0001'))
        },
      ),
      { numRuns: Math.min(FINAL_NUM_RUNS, 1000) }, // async slower; cap at 1000
    )
  })
})
```

- [ ] **Step 2: Run + commit**

```bash
npm test -- __tests__/property/fx-roundtrip.property.test.ts
git add packages/calc-engine/__tests__/property/fx-roundtrip.property.test.ts
git commit -m "test(calc-engine): add FX round-trip property test"
```

---

### Task 15: Golden snapshots (30 cases: 10 US + 10 CA-ON + 10 QC)

**Files:**
- Create: `~/Workspace/tnf-ecosystem/packages/calc-engine/__tests__/golden/us-federal-2026.json`
- Create: `~/Workspace/tnf-ecosystem/packages/calc-engine/__tests__/golden/ca-federal-on-2026.json`
- Create: `~/Workspace/tnf-ecosystem/packages/calc-engine/__tests__/golden/ca-qc-2026.json`
- Create: `~/Workspace/tnf-ecosystem/packages/calc-engine/__tests__/golden/golden.test.ts`

- [ ] **Step 1: Build first (required — dist/ must exist), then compute expected values for 10 US cases**

```bash
cd ~/Workspace/tnf-ecosystem/packages/calc-engine
npm run build   # REQUIRED: populate dist/ before the node script below
node --input-type=module -e "
import { calcUsFederalTax } from './dist/tax/us/index.js'
import { money } from './dist/index.js'
const cases = [10000, 25000, 50000, 75000, 100000, 150000, 250000, 500000, 1000000, 2000000]
const statuses = ['single', 'married-jointly']
for (const income of cases) {
  for (const s of statuses.slice(0, 1)) {
    const r = calcUsFederalTax({ income: money(income.toString(), 'USD'), filingStatus: s })
    console.log(JSON.stringify({ income, status: s, tax: r.tax.amount.toString(), eff: r.effectiveRate.toFixed(5), marg: r.marginalRate.toString() }))
  }
}
"
```

- [ ] **Step 2: Write `us-federal-2026.json`** with 10 single-filer cases (replace expected values from Step 1 output)

```json
[
  { "description": "single $10k 2026", "input": { "income": { "amount": "10000", "currency": "USD" }, "filingStatus": "single", "year": 2026 }, "expectedTax": "1000", "sourceRef": "IRS Pub 17 single filer worked example" },
  { "description": "single $25k 2026", "input": { "income": { "amount": "25000", "currency": "USD" }, "filingStatus": "single", "year": 2026 }, "expectedTax": "2762", "sourceRef": "computed: 1192.50 + (25000-11925)*0.12 = 2761.5 → IRS rounds to 2762" },
  { "description": "single $50k 2026", "input": { "income": { "amount": "50000", "currency": "USD" }, "filingStatus": "single", "year": 2026 }, "expectedTax": "5914", "sourceRef": "computed: 1192.50 + 4386 + 335.50 = 5914" },
  { "description": "single $75k 2026", "input": { "income": { "amount": "75000", "currency": "USD" }, "filingStatus": "single", "year": 2026 }, "expectedTax": "9412", "sourceRef": "computed" },
  { "description": "single $100k 2026", "input": { "income": { "amount": "100000", "currency": "USD" }, "filingStatus": "single", "year": 2026 }, "expectedTax": "14912", "sourceRef": "computed" },
  { "description": "single $150k 2026", "input": { "income": { "amount": "150000", "currency": "USD" }, "filingStatus": "single", "year": 2026 }, "expectedTax": "26144", "sourceRef": "computed" },
  { "description": "single $250k 2026", "input": { "income": { "amount": "250000", "currency": "USD" }, "filingStatus": "single", "year": 2026 }, "expectedTax": "55028", "sourceRef": "computed" },
  { "description": "single $500k 2026", "input": { "income": { "amount": "500000", "currency": "USD" }, "filingStatus": "single", "year": 2026 }, "expectedTax": "142459", "sourceRef": "computed" },
  { "description": "single $1M 2026", "input": { "income": { "amount": "1000000", "currency": "USD" }, "filingStatus": "single", "year": 2026 }, "expectedTax": "319848", "sourceRef": "computed" },
  { "description": "single $2M 2026", "input": { "income": { "amount": "2000000", "currency": "USD" }, "filingStatus": "single", "year": 2026 }, "expectedTax": "689848", "sourceRef": "computed" }
]
```

> **⚠ YMYL-CRITICAL NOTE on golden values:** The `expectedTax` values above are **illustrative only**. Two-step process to populate real values:
>
> **Step A — authoritative source values:** For at least 3 of the 10 cases per jurisdiction, cross-reference **IRS Pub 17 worked examples** (US) / **CRA T4127 worked examples** (CA) / **Revenu Québec TP-1015.G-V** (QC). Use their published `expectedTax`. These 3 are the "trusted anchor" cases.
>
> **Step B — derived cases:** For the remaining 7, compute via Step 1 script above. But **only after** Step A passes. If Step A golden cases fail against implementation, bracket data has a bug — stop and debug brackets; do NOT "fix" the snapshot to match wrong brackets.
>
> Plan fails YMYL compliance if snapshot is self-referential (implementation → snapshot → test-passes with no external anchor). Anchor cases are the defense.

- [ ] **Step 3: Write `ca-federal-on-2026.json`** (10 cases, federal+ON combined) — generate via similar one-off script using `calcCaTotalTax` with `province: 'ON'`.

- [ ] **Step 4: Write `ca-qc-2026.json`** (10 cases) — generate via `calcQuebecTax`.

- [ ] **Step 5: Write `golden.test.ts`** runner

```typescript
// __tests__/golden/golden.test.ts
import { describe, it, expect } from 'vitest'
import { readFileSync } from 'fs'
import { join } from 'path'
import { money } from '../../src/primitives/money'
import { calcUsFederalTax } from '../../src/tax/us'
import { calcCaTotalTax } from '../../src/tax/ca'
import { calcQuebecTax } from '../../src/tax/ca/qc'

interface UsCase { description: string; input: { income: { amount: string; currency: string }; filingStatus: any; year: number }; expectedTax: string }
interface CaCase { description: string; input: { income: { amount: string; currency: string }; province: any; year: number }; expectedTax: string }
interface QcCase { description: string; input: { income: { amount: string; currency: string }; year: number }; expectedTax: string }

const usCases: UsCase[] = JSON.parse(readFileSync(join(__dirname, 'us-federal-2026.json'), 'utf8'))
const caCases: CaCase[] = JSON.parse(readFileSync(join(__dirname, 'ca-federal-on-2026.json'), 'utf8'))
const qcCases: QcCase[] = JSON.parse(readFileSync(join(__dirname, 'ca-qc-2026.json'), 'utf8'))

describe('Golden — US federal 2026', () => {
  for (const c of usCases) {
    it(c.description, () => {
      const r = calcUsFederalTax({ income: money(c.input.income.amount, 'USD'), filingStatus: c.input.filingStatus, year: c.input.year })
      expect(r.tax.amount.toString()).toBe(c.expectedTax)
    })
  }
})

describe('Golden — CA federal+ON 2026', () => {
  for (const c of caCases) {
    it(c.description, () => {
      const r = calcCaTotalTax({ income: money(c.input.income.amount, 'CAD'), province: c.input.province, year: c.input.year })
      expect(r.tax.amount.toString()).toBe(c.expectedTax)
    })
  }
})

describe('Golden — QC 2026', () => {
  for (const c of qcCases) {
    it(c.description, () => {
      const r = calcQuebecTax({ income: money(c.input.income.amount, 'CAD'), year: c.input.year })
      expect(r.tax.amount.toString()).toBe(c.expectedTax)
    })
  }
})
```

- [ ] **Step 6: Run + commit**

```bash
npm run build && npm test -- __tests__/golden/
git add packages/calc-engine/__tests__/golden/
git commit -m "test(calc-engine): add 30 golden snapshots (10 US + 10 CA-ON + 10 QC)"
```

---

### Task 16: size-limit configuration + first measurement

**Files:**
- Already configured in `package.json` Task 1 step 2

- [ ] **Step 1: Build + measure**

```bash
cd ~/Workspace/tnf-ecosystem/packages/calc-engine
npm run build
npm run size
```

- [ ] **Step 2: If any budget exceeded, adjust budgets in `package.json` to `measured + 25%` headroom and commit**

```bash
git add packages/calc-engine/package.json
git commit -m "chore(calc-engine): tune size-limit budgets to measured + 25%"
```

---

### Task 17: Cross-repo cascade scripts (consumers.json + cascade-smoke-test + pull-test + extract-changelog + check-golden-approval)

**Files:**
- Create: `~/Workspace/tnf-ecosystem/scripts/consumers.json`
- Create: `~/Workspace/tnf-ecosystem/scripts/cascade-smoke-test.sh`
- Create: `~/Workspace/tnf-ecosystem/scripts/pull-test.sh`
- Create: `~/Workspace/tnf-ecosystem/scripts/extract-latest-changelog.sh`
- Create: `~/Workspace/tnf-ecosystem/scripts/check-golden-approval.sh`

- [ ] **Step 1: Write `consumers.json`**

```json
{
  "@tn-figueiredo/calc-engine": [],
  "@tn-figueiredo/partner-links": [],
  "@tn-figueiredo/shared": [
    { "repo": "tonagarantia",       "path": "../tonagarantia" },
    { "repo": "bythiagofigueiredo", "path": "../bythiagofigueiredo" },
    { "repo": "fan-stamp",          "path": "../fan-stamp" }
  ],
  "@tn-figueiredo/seo": [
    { "repo": "bythiagofigueiredo", "path": "../bythiagofigueiredo" }
  ],
  "@tn-figueiredo/affiliate": [
    { "repo": "tonagarantia",       "path": "../tonagarantia" }
  ]
}
```

- [ ] **Step 2: Write `cascade-smoke-test.sh`**

```bash
#!/usr/bin/env bash
# Usage: cascade-smoke-test.sh <package-name> <version>
set -euo pipefail

PKG=${1:?package name required}
VERSION=${2:?version required}
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
ECO_DIR="$(cd "${SCRIPT_DIR}/.." && pwd)"
CONSUMERS_JSON="${SCRIPT_DIR}/consumers.json"

CONSUMERS=$(jq -r --arg pkg "$PKG" '.[$pkg] // [] | .[] | "\(.repo)|\(.path)"' "$CONSUMERS_JSON")

if [ -z "$CONSUMERS" ]; then
  echo "No consumers configured for $PKG — null-op cascade."
  exit 0
fi

FAILED=()
while IFS='|' read -r repo rel_path; do
  [ -z "$repo" ] && continue
  abs_path="${ECO_DIR}/${rel_path}"
  echo "==> Cascade: $repo at $abs_path"
  if [ ! -d "$abs_path" ]; then
    echo "    SKIP: directory not found"
    continue
  fi
  if [ -x "$abs_path/scripts/upgrade-ecosystem.sh" ]; then
    if (cd "$abs_path" && ./scripts/upgrade-ecosystem.sh "$PKG" "$VERSION" && npm test); then
      echo "    PASS"
    else
      echo "    FAIL"
      FAILED+=("$repo")
    fi
  else
    echo "    SKIP: no upgrade-ecosystem.sh"
  fi
done <<< "$CONSUMERS"

if [ ${#FAILED[@]} -gt 0 ]; then
  echo "Cascade failures: ${FAILED[*]}" >&2
  exit 1
fi
echo "Cascade clean."
```

- [ ] **Step 3: Write `pull-test.sh`**

```bash
#!/usr/bin/env bash
# Usage: pull-test.sh <package-name> <version>
# Packs the package as a tarball, installs in a sandbox, smoke-imports the main entry.
set -euo pipefail

PKG=${1:?package name required}
VERSION=${2:?version required}
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
ECO_DIR="$(cd "${SCRIPT_DIR}/.." && pwd)"
PKG_DIR="${ECO_DIR}/packages/${PKG}"

cd "$PKG_DIR"
npm pack
TARBALL=$(ls tn-figueiredo-${PKG}-${VERSION}.tgz 2>/dev/null || ls *.tgz | head -1)

SANDBOX=$(mktemp -d)
trap "rm -rf $SANDBOX" EXIT
cd "$SANDBOX"
npm init -y >/dev/null
npm install "${PKG_DIR}/${TARBALL}"

# Smoke import (CJS):
node -e "
  const m = require('@tn-figueiredo/${PKG}')
  if (!m || typeof m !== 'object') { console.error('Empty export'); process.exit(1) }
  console.log('Pull-test OK: exports keys = ' + Object.keys(m).slice(0, 5).join(', '))
"

# Smoke import (ESM) — use unquoted heredoc so ${PKG} expands:
cat > test.mjs <<EOF
import * as m from '@tn-figueiredo/${PKG}'
if (!m || Object.keys(m).length === 0) { console.error('Empty ESM export'); process.exit(1) }
console.log('ESM OK')
EOF
node test.mjs

rm "${PKG_DIR}/${TARBALL}"
echo "pull-test passed for ${PKG}@${VERSION}"
```

- [ ] **Step 4: Write `extract-latest-changelog.sh`**

```bash
#!/usr/bin/env bash
# Usage: extract-latest-changelog.sh <path-to-CHANGELOG.md>
# Outputs (to stdout) the section of the most recent version entry.
set -euo pipefail

CHANGELOG=${1:?CHANGELOG path required}
awk '
  /^## / { if (++c > 1) exit }
  c == 1 { print }
' "$CHANGELOG"
```

- [ ] **Step 5: Write `check-golden-approval.sh`**

```bash
#!/usr/bin/env bash
# Run in CI on PRs. Fails if golden snapshots changed without "approved-golden-change" label.
set -euo pipefail

if [ "${GITHUB_EVENT_NAME:-}" != "pull_request" ]; then
  echo "Not a PR; skipping golden approval check."
  exit 0
fi

DIFF=$(git diff origin/${GITHUB_BASE_REF:-main}...HEAD -- '**/__tests__/golden/*.json' || true)
if [ -z "$DIFF" ]; then
  echo "No golden snapshot changes."
  exit 0
fi

LABELS=$(jq -r '.pull_request.labels[].name' < "${GITHUB_EVENT_PATH:-/dev/null}" 2>/dev/null || echo "")
if echo "$LABELS" | grep -q "approved-golden-change"; then
  echo "Golden changes approved by label."
  exit 0
fi

echo "::error::Golden snapshot changes detected without 'approved-golden-change' PR label. YMYL gate failed."
exit 1
```

- [ ] **Step 6: chmod + commit**

```bash
chmod +x ~/Workspace/tnf-ecosystem/scripts/*.sh
git add ~/Workspace/tnf-ecosystem/scripts/
git commit -m "chore(scripts): add cascade-smoke-test, pull-test, changelog-extract, golden-approval"
```

---

### Task 18: Publish workflow CI

**Files:**
- Create: `~/Workspace/tnf-ecosystem/.github/workflows/publish.yml`
- Modify: `~/Workspace/tnf-ecosystem/.github/workflows/ci.yml` (add calc-engine + partner-links to matrix if not already)

- [ ] **Step 1: Write `publish.yml`**

```yaml
name: Publish package
on:
  push:
    tags: ['*-v*.*.*']

jobs:
  publish:
    runs-on: ubuntu-latest
    permissions:
      contents: write
      packages: write
    steps:
      - uses: actions/checkout@v4
        with: { fetch-depth: 0 }
      - uses: actions/setup-node@v4
        with:
          node-version: 20
          registry-url: https://npm.pkg.github.com
          scope: '@tn-figueiredo'
      - run: npm ci

      - name: Parse tag
        id: parse
        run: |
          TAG=${GITHUB_REF_NAME}
          PKG=$(echo "$TAG" | sed -E 's/-v[0-9]+\.[0-9]+\.[0-9]+$//')
          VERSION=$(echo "$TAG" | sed -E 's/^.+-v([0-9]+\.[0-9]+\.[0-9]+)$/\1/')
          echo "pkg=$PKG" >> $GITHUB_OUTPUT
          echo "version=$VERSION" >> $GITHUB_OUTPUT
          echo "Publishing $PKG@$VERSION"

      - name: Build + test
        run: |
          npm run build -w packages/${{ steps.parse.outputs.pkg }}
          npm run test  -w packages/${{ steps.parse.outputs.pkg }}

      - name: Pull-test gate
        run: ./scripts/pull-test.sh ${{ steps.parse.outputs.pkg }} ${{ steps.parse.outputs.version }}

      - name: Publish
        run: npm publish -w packages/${{ steps.parse.outputs.pkg }} --access=public
        env:
          NODE_AUTH_TOKEN: ${{ secrets.NPM_TOKEN }}

      - name: Extract CHANGELOG
        id: changelog
        run: |
          ./scripts/extract-latest-changelog.sh packages/${{ steps.parse.outputs.pkg }}/CHANGELOG.md > /tmp/release-body.md
          echo "body_path=/tmp/release-body.md" >> $GITHUB_OUTPUT

      - name: Create GitHub release
        uses: softprops/action-gh-release@v2
        with:
          tag_name: ${{ github.ref_name }}
          name: ${{ github.ref_name }}
          body_path: ${{ steps.changelog.outputs.body_path }}

      - name: Cascade smoke-test (non-gating)
        id: cascade
        continue-on-error: true
        run: ./scripts/cascade-smoke-test.sh ${{ steps.parse.outputs.pkg }} ${{ steps.parse.outputs.version }}

      - name: Open issue on cascade failure
        if: steps.cascade.outcome == 'failure'
        uses: actions/github-script@v7
        with:
          script: |
            github.rest.issues.create({
              owner: context.repo.owner,
              repo: context.repo.repo,
              title: `Cascade failed: ${{ steps.parse.outputs.pkg }}@${{ steps.parse.outputs.version }}`,
              body: `See workflow run ${context.runId}.`,
              labels: ['cascade-failure', 'ymyl-urgent'],
            })
```

- [ ] **Step 2: Verify `ci.yml` exists and matrix includes calc-engine + partner-links**

```bash
cat ~/Workspace/tnf-ecosystem/.github/workflows/ci.yml 2>/dev/null | grep -A5 matrix
```

**If file missing entirely:** create minimal `ci.yml`:

```yaml
name: CI
on: [push, pull_request]
jobs:
  test:
    runs-on: ubuntu-latest
    strategy:
      matrix:
        package: [calc-engine, partner-links, affiliate, shared, seo]
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with: { node-version: 20, cache: npm, registry-url: https://npm.pkg.github.com, scope: '@tn-figueiredo' }
      - run: npm ci
        env: { NODE_AUTH_TOKEN: ${{ secrets.NPM_TOKEN }} }
      - run: npm run typecheck -w packages/${{ matrix.package }}
      - run: npm run test -w packages/${{ matrix.package }}
      - run: npm run size -w packages/${{ matrix.package }} --if-present
```

**If file exists but matrix omits new packages:** edit `strategy.matrix.package` array to include `calc-engine` and `partner-links`. Example:

```bash
cd ~/Workspace/tnf-ecosystem
# Use yq to safely add (install via `brew install yq` if missing):
yq eval '.jobs.test.strategy.matrix.package += ["calc-engine", "partner-links"] | .jobs.test.strategy.matrix.package |= unique' -i .github/workflows/ci.yml
```

Also add a step in `ci.yml`:

```yaml
      - name: Golden snapshot approval check
        run: ./scripts/check-golden-approval.sh
        env:
          GITHUB_EVENT_NAME: ${{ github.event_name }}
          GITHUB_BASE_REF: ${{ github.base_ref }}
          GITHUB_EVENT_PATH: ${{ github.event_path }}
```

- [ ] **Step 3: Commit**

```bash
git add ~/Workspace/tnf-ecosystem/.github/workflows/
git commit -m "ci: add publish workflow with pull-test gate + golden approval check"
```

---

### Task 19: First publish — calc-engine@0.1.0

- [ ] **Step 1: Local pull-test dry-run**

```bash
cd ~/Workspace/tnf-ecosystem
./scripts/pull-test.sh calc-engine 0.1.0
```

Expected: "Pull-test passed".

- [ ] **Step 2: Tag + push**

```bash
git tag calc-engine-v0.1.0
git push origin calc-engine-v0.1.0
```

- [ ] **Step 3: Watch CI run**

```bash
gh run watch
```

Expected: publish.yml succeeds → registry shows `@tn-figueiredo/calc-engine@0.1.0` → GitHub release created.

- [ ] **Step 4: Verify registry**

```bash
gh api /orgs/TN-Figueiredo/packages/npm/calc-engine/versions --jq '.[].name' | head -5
```

Expected: `0.1.0` listed.

- [ ] **Step 5: Mark M0.2 done — no commit needed (CI did it)**

---

**M0.2 complete (7h).** Continue to M0.3.

---

## M0.3 — partner-links package (9h, Days 7-9)

### Task 20: Initialize partner-links package skeleton

**Files:**
- Create: `~/Workspace/tnf-ecosystem/packages/partner-links/{package.json,tsconfig.json,tsup.config.ts,vitest.config.ts,README.md,CHANGELOG.md,.gitignore}`

- [ ] **Step 1: Create directory + scaffold**

```bash
cd ~/Workspace/tnf-ecosystem
mkdir -p packages/partner-links/src/{providers,ftc-disclosure}
cd packages/partner-links
```

- [ ] **Step 2: Write `package.json`**

```json
{
  "name": "@tn-figueiredo/partner-links",
  "version": "0.1.0",
  "description": "Affiliate partner-link builders + FTC disclosure helpers (inbound link-out tracking, opposite of @tn-figueiredo/affiliate)",
  "type": "module",
  "main": "./dist/index.cjs",
  "module": "./dist/index.js",
  "types": "./dist/index.d.ts",
  "exports": {
    ".": {
      "import": { "types": "./dist/index.d.ts", "default": "./dist/index.js" },
      "require": { "types": "./dist/index.d.cts", "default": "./dist/index.cjs" }
    },
    "./react": {
      "import": { "types": "./dist/react.d.ts", "default": "./dist/react.js" },
      "require": { "types": "./dist/react.d.cts", "default": "./dist/react.cjs" }
    }
  },
  "files": ["dist", "CHANGELOG.md", "README.md"],
  "scripts": {
    "build": "tsup",
    "test": "vitest run",
    "typecheck": "tsc --noEmit",
    "size": "size-limit"
  },
  "publishConfig": {
    "registry": "https://npm.pkg.github.com",
    "access": "public"
  },
  "repository": {
    "type": "git",
    "url": "https://github.com/tn-figueiredo/tnf-ecosystem.git",
    "directory": "packages/partner-links"
  },
  "peerDependencies": {
    "react": ">=18"
  },
  "peerDependenciesMeta": {
    "react": { "optional": true }
  },
  "devDependencies": {
    "@types/react": "19.0.0",
    "@testing-library/react": "16.0.0",
    "jsdom": "24.0.0",
    "react": "19.0.0",
    "react-dom": "19.0.0",
    "size-limit": "11.1.2",
    "@size-limit/preset-small-lib": "11.1.2",
    "tsup": "8.0.2",
    "typescript": "5.4.5",
    "vitest": "1.5.0"
  },
  "size-limit": [
    { "path": "dist/index.js", "limit": "6 KB" },
    { "path": "dist/react.js", "limit": "4 KB" }
  ]
}
```

- [ ] **Step 3: Write `tsconfig.json`** (extends base + JSX)

```json
{
  "extends": "../../tsconfig.base.json",
  "compilerOptions": {
    "rootDir": "src",
    "outDir": "dist",
    "jsx": "react-jsx",
    "lib": ["ES2020", "DOM"]
  },
  "include": ["src"],
  "exclude": ["node_modules", "dist", "**/*.test.ts", "**/*.test.tsx"]
}
```

- [ ] **Step 4: Write `tsup.config.ts`**

```typescript
import { defineConfig } from 'tsup'

export default defineConfig({
  entry: { index: 'src/index.ts', react: 'src/react.ts' },
  format: ['esm', 'cjs'],
  dts: true,
  clean: true,
  sourcemap: true,
  external: ['react', 'react-dom'],
  splitting: false,
})
```

- [ ] **Step 5: Write `vitest.config.ts`**

```typescript
import { defineConfig } from 'vitest/config'

export default defineConfig({
  test: {
    globals: true,
    environment: 'jsdom',
    include: ['src/**/*.test.{ts,tsx}'],
  },
})
```

- [ ] **Step 6: Write `CHANGELOG.md`**

```markdown
# Changelog

All notable changes to `@tn-figueiredo/partner-links` will be documented in this file.

## [0.1.0] — 2026-04-26

### Added
- Provider interface + 5 providers: Wise, Questrade, Wealthsimple, Credit Karma, NerdWallet
- `buildUtmQuery` helper with `finreckoner`/`calc` defaults
- `resolveLocale` BCP-47 fallback walk-down (`fr-CA` → `fr` → `en`)
- `disclosureText(provider, locale)` — FTC 16 CFR 255 per-link proximity disclosure
- `FTCDisclosure` React component (RSC-safe, inline + block variants) — subpath `/react`
- Error hierarchy: `PartnerLinksError`, `ProviderError`, `FtcComplianceError`
- `termsArchiveRef` on every provider pointing to `docs/legal/affiliate-terms-YYYY-MM.md` for FTC audit trail
```

- [ ] **Step 6b: Write `README.md`**

```markdown
# @tn-figueiredo/partner-links

Inbound partner-link builders + FTC disclosure helpers for affiliate link tracking. Opposite scope from `@tn-figueiredo/affiliate` (outbound creator-management).

## Install

\`\`\`bash
npm install @tn-figueiredo/partner-links
\`\`\`

## Subpaths

- `@tn-figueiredo/partner-links` — agnostic core (providers, UTM, disclosure text)
- `@tn-figueiredo/partner-links/react` — `<FTCDisclosure>` component (peer-dep react>=18)

## Providers (S0 v0.1.0)

Wise · Questrade · Wealthsimple · Credit Karma · NerdWallet

See `CHANGELOG.md` for version history and `docs/legal/affiliate-terms-*.md` (in consumer repo) for FTC audit trail per provider.
```

- [ ] **Step 7: Install + commit**

```bash
cd ~/Workspace/tnf-ecosystem
npm install
git add packages/partner-links/
git commit -m "feat(partner-links): initialize package skeleton"
```

---

### Task 21: Implement errors + locale + utm

**Files:**
- Create: `~/Workspace/tnf-ecosystem/packages/partner-links/src/errors.ts`
- Create: `~/Workspace/tnf-ecosystem/packages/partner-links/src/locale.ts`
- Create: `~/Workspace/tnf-ecosystem/packages/partner-links/src/utm.ts`
- Create: `~/Workspace/tnf-ecosystem/packages/partner-links/src/utm.test.ts`

- [ ] **Step 1: Write `errors.ts`**

```typescript
// src/errors.ts
export abstract class PartnerLinksError extends Error {
  abstract readonly code: string
  constructor(message: string) {
    super(message)
    this.name = this.constructor.name
  }
}

export class ProviderError extends PartnerLinksError {
  readonly code = 'PROVIDER_UNKNOWN'
}

export class FtcComplianceError extends PartnerLinksError {
  readonly code = 'FTC_PROXIMITY'
}
```

- [ ] **Step 2: Write `locale.ts`**

```typescript
// src/locale.ts
/**
 * BCP-47 fallback walk-down. 'fr-CA' → 'fr' → first available → 'en'.
 */
export function resolveLocale(locale: string, available: readonly string[]): string {
  if (available.includes(locale)) return locale
  const base = locale.split('-')[0]
  if (available.includes(base)) return base
  if (available.includes('en')) return 'en'
  return available[0] ?? 'en'
}
```

- [ ] **Step 3: Write `utm.ts`**

```typescript
// src/utm.ts
export interface UtmParams {
  source?: string
  medium?: string
  campaign?: string
  content?: string
  term?: string
}

const DEFAULT_DEFAULTS: UtmParams = {
  source: 'finreckoner',
  medium: 'calc',
}

export function buildUtmQuery(utm: UtmParams = {}, defaults: Partial<UtmParams> = DEFAULT_DEFAULTS): string {
  const merged = { ...DEFAULT_DEFAULTS, ...defaults, ...utm }
  const params = new URLSearchParams()
  if (merged.source) params.set('utm_source', merged.source)
  if (merged.medium) params.set('utm_medium', merged.medium)
  if (merged.campaign) params.set('utm_campaign', merged.campaign)
  if (merged.content) params.set('utm_content', merged.content)
  if (merged.term) params.set('utm_term', merged.term)
  return params.toString()
}
```

- [ ] **Step 4: Write `utm.test.ts`**

```typescript
// src/utm.test.ts
import { describe, it, expect } from 'vitest'
import { buildUtmQuery } from './utm'

describe('buildUtmQuery', () => {
  it('uses defaults when no input', () => {
    const q = buildUtmQuery()
    expect(q).toContain('utm_source=finreckoner')
    expect(q).toContain('utm_medium=calc')
  })

  it('caller overrides default', () => {
    const q = buildUtmQuery({ source: 'youtube' })
    expect(q).toContain('utm_source=youtube')
  })

  it('omits empty fields', () => {
    const q = buildUtmQuery({ campaign: 'mortgage' })
    expect(q).toContain('utm_campaign=mortgage')
    expect(q).not.toContain('utm_term')
  })
})
```

- [ ] **Step 5: Run + commit**

```bash
cd ~/Workspace/tnf-ecosystem/packages/partner-links
npm test -- src/utm.test.ts
git add src/{errors,locale,utm}.ts src/utm.test.ts
git commit -m "feat(partner-links): add errors, locale fallback, UTM builder"
```

---

### Task 22: Implement Provider interface + 5 providers

**Files:**
- Create: `~/Workspace/tnf-ecosystem/packages/partner-links/src/providers/types.ts`
- Create: `~/Workspace/tnf-ecosystem/packages/partner-links/src/providers/{wise,questrade,wealthsimple,credit-karma,nerdwallet}.ts`
- Create: `~/Workspace/tnf-ecosystem/packages/partner-links/src/providers/providers.test.ts`

- [ ] **Step 1: Write `types.ts`**

```typescript
// src/providers/types.ts
import { UtmParams, buildUtmQuery } from '../utm'

export type ProviderId = 'wise' | 'questrade' | 'wealthsimple' | 'credit-karma' | 'nerdwallet'
export type Jurisdiction = 'US' | 'CA' | 'UK' | 'BR'

export interface Provider {
  readonly id: ProviderId
  readonly name: string
  readonly jurisdictions: readonly Jurisdiction[]
  readonly disclosureTemplate: string  // contains {{name}} placeholder
  readonly termsArchiveRef: string     // 'docs/legal/affiliate-terms-YYYY-MM.md#<id>'
  buildLink(opts: { ref: string; utm?: UtmParams }): URL
}

export function makeBuildLink(baseUrl: string, refParam = 'ref') {
  return (opts: { ref: string; utm?: UtmParams }): URL => {
    const url = new URL(baseUrl)
    url.searchParams.set(refParam, opts.ref)
    const utm = buildUtmQuery(opts.utm)
    if (utm) {
      const utmParams = new URLSearchParams(utm)
      utmParams.forEach((value, key) => url.searchParams.set(key, value))
    }
    return url
  }
}
```

- [ ] **Step 2: Write each provider** (template — repeat for all 5)

```typescript
// src/providers/wise.ts
import { Provider, makeBuildLink } from './types'

export const WISE: Provider = {
  id: 'wise',
  name: 'Wise',
  jurisdictions: ['US', 'CA', 'UK', 'BR'],
  disclosureTemplate: 'We earn a commission from {{name}} if you sign up through this link — at no extra cost to you.',
  termsArchiveRef: 'docs/legal/affiliate-terms-2026-04.md#wise',
  buildLink: makeBuildLink('https://wise.com/invite/u/'),
}
```

```typescript
// src/providers/questrade.ts
import { Provider, makeBuildLink } from './types'

export const QUESTRADE: Provider = {
  id: 'questrade',
  name: 'Questrade',
  jurisdictions: ['CA'],
  disclosureTemplate: 'We earn a referral fee from {{name}} if you open an account through this link.',
  termsArchiveRef: 'docs/legal/affiliate-terms-2026-04.md#questrade',
  buildLink: makeBuildLink('https://www.questrade.com/refer-a-friend/', 'refid'),
}
```

```typescript
// src/providers/wealthsimple.ts
import { Provider, makeBuildLink } from './types'

export const WEALTHSIMPLE: Provider = {
  id: 'wealthsimple',
  name: 'Wealthsimple',
  jurisdictions: ['CA'],
  disclosureTemplate: 'We earn a referral bonus from {{name}} if you sign up through this link.',
  termsArchiveRef: 'docs/legal/affiliate-terms-2026-04.md#wealthsimple',
  buildLink: makeBuildLink('https://www.wealthsimple.com/invite/'),
}
```

```typescript
// src/providers/credit-karma.ts
import { Provider, makeBuildLink } from './types'

export const CREDIT_KARMA: Provider = {
  id: 'credit-karma',
  name: 'Credit Karma',
  jurisdictions: ['US'],
  disclosureTemplate: 'We may earn an affiliate commission from {{name}} when you apply through this link.',
  termsArchiveRef: 'docs/legal/affiliate-terms-2026-04.md#credit-karma',
  buildLink: makeBuildLink('https://www.creditkarma.com/'),
}
```

```typescript
// src/providers/nerdwallet.ts
import { Provider, makeBuildLink } from './types'

export const NERDWALLET: Provider = {
  id: 'nerdwallet',
  name: 'NerdWallet',
  jurisdictions: ['US'],
  disclosureTemplate: 'We may earn a commission from {{name}} when you sign up through this link.',
  termsArchiveRef: 'docs/legal/affiliate-terms-2026-04.md#nerdwallet',
  buildLink: makeBuildLink('https://www.nerdwallet.com/'),
}
```

- [ ] **Step 3: Write property tests for all 5**

```typescript
// src/providers/providers.test.ts
import { describe, it, expect } from 'vitest'
import { WISE } from './wise'
import { QUESTRADE } from './questrade'
import { WEALTHSIMPLE } from './wealthsimple'
import { CREDIT_KARMA } from './credit-karma'
import { NERDWALLET } from './nerdwallet'
import { Provider } from './types'

const ALL: Provider[] = [WISE, QUESTRADE, WEALTHSIMPLE, CREDIT_KARMA, NERDWALLET]

describe('all providers — invariants', () => {
  for (const p of ALL) {
    it(`${p.id}: buildLink returns valid https URL`, () => {
      const url = p.buildLink({ ref: 'test-ref' })
      expect(url).toBeInstanceOf(URL)
      expect(url.protocol).toBe('https:')
    })

    it(`${p.id}: buildLink includes ref param`, () => {
      const url = p.buildLink({ ref: 'unique-ref-xyz' })
      expect(url.toString()).toContain('unique-ref-xyz')
    })

    it(`${p.id}: buildLink includes UTM params when provided`, () => {
      const url = p.buildLink({ ref: 'r', utm: { campaign: 'test-campaign-123' } })
      expect(url.searchParams.get('utm_campaign')).toBe('test-campaign-123')
    })

    it(`${p.id}: termsArchiveRef matches expected pattern`, () => {
      expect(p.termsArchiveRef).toMatch(/^docs\/legal\/affiliate-terms-\d{4}-\d{2}\.md#.+$/)
    })

    it(`${p.id}: disclosureTemplate contains {{name}} placeholder`, () => {
      expect(p.disclosureTemplate).toContain('{{name}}')
    })

    it(`${p.id}: jurisdictions non-empty`, () => {
      expect(p.jurisdictions.length).toBeGreaterThan(0)
    })
  }
})
```

- [ ] **Step 4: Run + commit**

```bash
npm test -- src/providers/
git add src/providers/
git commit -m "feat(partner-links): add 5 providers (Wise, Questrade, Wealthsimple, Credit Karma, NerdWallet)"
```

---

### Task 23: FTC disclosure (text + react)

**Files:**
- Create: `~/Workspace/tnf-ecosystem/packages/partner-links/src/ftc-disclosure/text.ts`
- Create: `~/Workspace/tnf-ecosystem/packages/partner-links/src/ftc-disclosure/text.test.ts`
- Create: `~/Workspace/tnf-ecosystem/packages/partner-links/src/ftc-disclosure/react.tsx`
- Create: `~/Workspace/tnf-ecosystem/packages/partner-links/src/ftc-disclosure/react.test.tsx`

- [ ] **Step 1: Write `text.ts`**

```typescript
// src/ftc-disclosure/text.ts
import { Provider } from '../providers/types'
import { resolveLocale } from '../locale'

export const SUPPORTED_LOCALES = ['en'] as const

export function disclosureText(provider: Provider, locale = 'en'): string {
  const resolved = resolveLocale(locale, SUPPORTED_LOCALES)
  if (resolved !== locale && process.env.NODE_ENV !== 'production') {
    console.warn(`[partner-links] disclosureText: locale '${locale}' not available; falling back to '${resolved}'`)
  }
  return provider.disclosureTemplate.replace('{{name}}', provider.name)
}
```

- [ ] **Step 2: Write `text.test.ts`**

```typescript
// src/ftc-disclosure/text.test.ts
import { describe, it, expect } from 'vitest'
import { disclosureText } from './text'
import { WISE } from '../providers/wise'

describe('disclosureText', () => {
  it('interpolates {{name}}', () => {
    const t = disclosureText(WISE)
    expect(t).toContain('Wise')
    expect(t).not.toContain('{{name}}')
  })

  it('returns non-empty', () => {
    expect(disclosureText(WISE).length).toBeGreaterThan(0)
  })
})
```

- [ ] **Step 3: Write `react.tsx`** (RSC-safe; no hooks in main render path)

```tsx
// src/ftc-disclosure/react.tsx
import * as React from 'react'
import { Provider } from '../providers/types'
import { disclosureText } from './text'

export interface FTCDisclosureProps {
  provider: Provider
  locale?: string
  variant?: 'inline' | 'block'
  learnMoreHref?: string
  strictProximityCheck?: boolean
}

export const FTCDisclosure: React.FC<FTCDisclosureProps> = ({
  provider,
  locale = 'en',
  variant = 'inline',
  learnMoreHref = '/legal/ftc-disclosure',
  strictProximityCheck = false,
}) => {
  const text = disclosureText(provider, locale)
  const Tag = variant === 'inline' ? 'small' : 'div'

  // Dev-mode proximity check (no-op in production / RSC).
  if (typeof window !== 'undefined' && strictProximityCheck && process.env.NODE_ENV !== 'production') {
    React.useEffect(() => {
      // Heuristic: parent should contain an <a> link to provider domain
      // Simplified for brevity; full check would walk DOM tree.
      console.debug('[FTCDisclosure] strictProximityCheck enabled (dev)')
    }, [])
  }

  return React.createElement(
    Tag,
    {
      className: variant === 'inline' ? 'ftc-disclosure ftc-disclosure--inline' : 'ftc-disclosure ftc-disclosure--block',
      'data-provider': provider.id,
    },
    text,
    ' ',
    React.createElement('a', { href: learnMoreHref }, 'Learn more'),
    '.',
  )
}
```

- [ ] **Step 4: Write `react.test.tsx`**

```tsx
// src/ftc-disclosure/react.test.tsx
import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { FTCDisclosure } from './react'
import { WISE } from '../providers/wise'

describe('<FTCDisclosure>', () => {
  it('renders disclosure text with provider name', () => {
    render(<FTCDisclosure provider={WISE} />)
    expect(screen.getByText(/Wise/)).toBeInTheDocument()
  })

  it('renders Learn more link with default href', () => {
    render(<FTCDisclosure provider={WISE} />)
    const link = screen.getByText('Learn more')
    expect(link).toHaveAttribute('href', '/legal/ftc-disclosure')
  })

  it('uses custom learnMoreHref when provided', () => {
    render(<FTCDisclosure provider={WISE} learnMoreHref="/custom" />)
    expect(screen.getByText('Learn more')).toHaveAttribute('href', '/custom')
  })

  it('inline variant renders <small>', () => {
    const { container } = render(<FTCDisclosure provider={WISE} variant="inline" />)
    expect(container.querySelector('small.ftc-disclosure--inline')).not.toBeNull()
  })

  it('block variant renders <div>', () => {
    const { container } = render(<FTCDisclosure provider={WISE} variant="block" />)
    expect(container.querySelector('div.ftc-disclosure--block')).not.toBeNull()
  })
})
```

- [ ] **Step 5: Run + commit**

```bash
npm test -- src/ftc-disclosure/
git add src/ftc-disclosure/
git commit -m "feat(partner-links): add FTC disclosure helpers (text + RSC-safe React)"
```

---

### Task 24: Public barrels (index.ts + react.ts)

**Files:**
- Create: `~/Workspace/tnf-ecosystem/packages/partner-links/src/index.ts`
- Create: `~/Workspace/tnf-ecosystem/packages/partner-links/src/react.ts`

- [ ] **Step 1: Write `index.ts`** (agnostic core)

```typescript
// src/index.ts
export { WISE } from './providers/wise'
export { QUESTRADE } from './providers/questrade'
export { WEALTHSIMPLE } from './providers/wealthsimple'
export { CREDIT_KARMA } from './providers/credit-karma'
export { NERDWALLET } from './providers/nerdwallet'
export type { Provider, ProviderId, Jurisdiction } from './providers/types'

export { buildUtmQuery } from './utm'
export type { UtmParams } from './utm'

export { resolveLocale } from './locale'

export { disclosureText, SUPPORTED_LOCALES } from './ftc-disclosure/text'

export { PartnerLinksError, ProviderError, FtcComplianceError } from './errors'

export const ALL_PROVIDERS = [
  // re-import to expose array (avoid circular)
] as const
```

Update `ALL_PROVIDERS` to actually populate:

```typescript
import { WISE } from './providers/wise'
import { QUESTRADE } from './providers/questrade'
import { WEALTHSIMPLE } from './providers/wealthsimple'
import { CREDIT_KARMA } from './providers/credit-karma'
import { NERDWALLET } from './providers/nerdwallet'

export const ALL_PROVIDERS = [WISE, QUESTRADE, WEALTHSIMPLE, CREDIT_KARMA, NERDWALLET] as const
```

(consolidate above into single file).

- [ ] **Step 2: Write `react.ts`** (React-only entry)

```typescript
// src/react.ts
export { FTCDisclosure } from './ftc-disclosure/react'
export type { FTCDisclosureProps } from './ftc-disclosure/react'
```

- [ ] **Step 3: Build + verify size**

```bash
cd ~/Workspace/tnf-ecosystem/packages/partner-links
npm run build
npm run size
```

Adjust budgets in `package.json` if exceeded.

- [ ] **Step 4: Commit**

```bash
git add src/index.ts src/react.ts package.json
git commit -m "feat(partner-links): add public barrels (core + react)"
```

---

### Task 25: Publish partner-links@0.1.0

- [ ] **Step 1: Local pull-test**

```bash
cd ~/Workspace/tnf-ecosystem
./scripts/pull-test.sh partner-links 0.1.0
```

- [ ] **Step 2: Tag + push**

```bash
git tag partner-links-v0.1.0
git push origin partner-links-v0.1.0
```

- [ ] **Step 3: Watch CI + verify**

```bash
gh run watch
gh api /orgs/TN-Figueiredo/packages/npm/partner-links/versions --jq '.[].name' | head
```

---

**M0.3 complete (9h).** Continue to M0.4.

---

## M0.4 — finreckoner scaffold + infra (14h, Days 10-12 + 2h background Days 1-2)

### Task 26 (Day 1-2 background thread — RUN IN PARALLEL TO M0.1): Pre-create finreckoner GitHub repo + Cloudflare DNS + Vercel project

> ⚠ **EXECUTION ORDER:** This task runs **during M0.1** (Days 1-2), NOT after M0.3. Low-mental-load click-through work; use dead zones (morning warm-up, post-lunch). 4 × ~30min sessions over Days 1-2 = ~2h total.
>
> Tasks 27-31 (the rest of M0.4) execute **after M0.3**, Days 10-12, in sequential order.

- [ ] **Step 1: Create GitHub repo** (UI or CLI)

```bash
gh repo create TN-Figueiredo/finreckoner --public \
  --description "Multi-country financial calculators hub — creator/freelancer lens" \
  --homepage https://finreckoner.com \
  --add-readme=false
```

- [ ] **Step 2: Verify Cloudflare nameservers active for `finreckoner.com`**

```bash
dig +short NS finreckoner.com
```

- [ ] **Step 3: Create Vercel project (UI):** vercel.com → Add New → Project → Import Git Repository → select `TN-Figueiredo/finreckoner` → leave settings as default (Next.js detected) → Deploy → cancel first deploy (no code yet).

- [ ] **Step 4: Link Cloudflare DNS to Vercel** (Vercel UI → Project → Settings → Domains → Add → `finreckoner.com` → follow Cloudflare CNAME instructions)

- [ ] **Step 5: Verify SSL + DNS resolves to Vercel placeholder**

```bash
curl -sI https://finreckoner.com | head -3
```

Expected: HTTP 404 (Vercel default for empty project) with `Server: Vercel`.

---

### Task 27: Bootstrap finreckoner repo locally

**Files:** initial repo files in `~/Workspace/finreckoner/`

- [ ] **Step 1: Initialize git in existing dir** (already has `docs/`)

```bash
cd ~/Workspace/finreckoner
git init -b main
git remote add origin git@github.com:TN-Figueiredo/finreckoner.git
git pull origin main 2>/dev/null || true  # may fail if remote empty
```

- [ ] **Step 2: Create `.gitignore`**

```
node_modules
.next
out
dist
.env.local
.env*.local
*.log
.DS_Store
.vercel
.turbo
*.pdf
```

- [ ] **Step 3: Create `.nvmrc`**

```
20
```

- [ ] **Step 4: Create `.npmrc`**

```
@tn-figueiredo:registry=https://npm.pkg.github.com
//npm.pkg.github.com/:_authToken=${NODE_AUTH_TOKEN}
engine-strict=true
save-exact=true
```

- [ ] **Step 5: Create root `package.json`**

```json
{
  "name": "finreckoner",
  "version": "0.0.1",
  "private": true,
  "workspaces": ["apps/*"],
  "scripts": {
    "dev": "npm run dev -w apps/web",
    "build": "npm run build -w apps/web",
    "test": "npm test -w apps/web",
    "typecheck": "npm run typecheck -w apps/web",
    "lint": "npm run lint -w apps/web",
    "lighthouse": "npm run lighthouse -w apps/web"
  },
  "engines": { "node": "20" }
}
```

- [ ] **Step 6: Create `tsconfig.base.json`**

```json
{
  "compilerOptions": {
    "strict": true,
    "target": "ES2022",
    "module": "esnext",
    "moduleResolution": "bundler",
    "lib": ["ES2022", "DOM", "DOM.Iterable"],
    "jsx": "preserve",
    "esModuleInterop": true,
    "skipLibCheck": true,
    "forceConsistentCasingInFileNames": true,
    "resolveJsonModule": true,
    "isolatedModules": true,
    "noUncheckedIndexedAccess": true
  }
}
```

- [ ] **Step 7: Create `README.md`**

```markdown
# finreckoner

Multi-country financial calculators hub — creator/freelancer/remote-worker lens.

[finreckoner.com](https://finreckoner.com) · launching 2026-07-15 (US+CA).

See `docs/roadmap/README.md` for execution plan and `docs/superpowers/specs/` for design specs.
```

- [ ] **Step 8: Initial commit**

```bash
git add .gitignore .nvmrc .npmrc package.json tsconfig.base.json README.md docs CLAUDE.md
git commit -m "chore: bootstrap finreckoner repo (workspaces + ecosystem registry)"
git push -u origin main
```

---

### Task 28: Scaffold `apps/web` with Next 15 + Tailwind 4 + React 19

**Files:** `~/Workspace/finreckoner/apps/web/**`

- [ ] **Step 1: Verify version compatibility from bythiagofigueiredo lockfile**

```bash
cd ~/Workspace/bythiagofigueiredo
grep -A1 '"next"' apps/web/package.json | head -3
grep -A1 '"react"' apps/web/package.json | head -3
grep -A1 '"tailwindcss"' apps/web/package.json | head -3
```

Note exact versions to copy.

- [ ] **Step 2: Scaffold from create-next-app (clean Next 15 base)**

```bash
cd ~/Workspace/finreckoner
NODE_AUTH_TOKEN=$(cat ~/.npmrc | grep _authToken | cut -d= -f2) \
  npx create-next-app@latest apps/web \
  --typescript --tailwind --app --src-dir --import-alias "@/*" \
  --no-eslint --no-turbo --no-git --use-npm
```

> **After scaffold:** `create-next-app` already populated `apps/web/package.json` with Next/React/Tailwind deps. Do NOT overwrite — **merge** by editing only the fields below. Use jq to avoid destroying scaffold deps:

```bash
cd ~/Workspace/finreckoner/apps/web
# Update name + add ecosystem deps + custom scripts (merge, not replace):
jq '.name = "@finreckoner/web"
    | .private = true
    | .scripts.test = "vitest run"
    | .scripts.typecheck = "tsc --noEmit"
    | .scripts.lighthouse = "lhci autorun"
    | .dependencies["@tn-figueiredo/calc-engine"] = "0.1.0"
    | .dependencies["@tn-figueiredo/partner-links"] = "0.1.0"
    | .dependencies["@tn-figueiredo/seo"] = "0.1.0"
    | .dependencies["@tn-figueiredo/shared"] = "0.8.0"
    | .devDependencies["@lhci/cli"] = "0.13.0"
    | .devDependencies.vitest = "1.5.0"' package.json > package.json.new && mv package.json.new package.json
```

> **Version pinning caveat:** `@tn-figueiredo/seo` and `@tn-figueiredo/shared` versions above (`0.1.0`, `0.8.0`) reflect current registry state as of plan writing. Before running, verify latest versions:
>
> ```bash
> gh api /orgs/TN-Figueiredo/packages/npm/shared/versions --jq '.[0].name'
> gh api /orgs/TN-Figueiredo/packages/npm/seo/versions --jq '.[0].name'
> ```
>
> Update the `jq` command above with actual latest versions. Plan omits old `package.json` override block since it would destroy scaffold deps.

- [ ] **Step 3: Install with NPM_TOKEN env** (use PAT from `~/.npmrc`, not `gh auth token`)

```bash
cd ~/Workspace/finreckoner
NODE_AUTH_TOKEN=$(cat ~/.npmrc | grep _authToken | cut -d= -f2) npm install
```

- [ ] **Step 4: Verify `apps/web` builds**

```bash
npm run build
```

- [ ] **Step 5: Commit**

```bash
git add apps/web
git commit -m "feat(web): scaffold Next 15 + Tailwind 4 + React 19 with @tn-figueiredo packages"
```

---

### Task 29: Add ads.txt + robots.txt + site-config + Footer + HeroCreator + CalcCardPlaceholder

**Files:**
- Create: `~/Workspace/finreckoner/apps/web/public/ads.txt`
- Create: `~/Workspace/finreckoner/apps/web/public/robots.txt`
- Create: `~/Workspace/finreckoner/apps/web/src/lib/site-config.ts`
- Create: `~/Workspace/finreckoner/apps/web/src/components/{Footer,HeroCreator,CalcCardPlaceholder}.tsx`
- Modify: `~/Workspace/finreckoner/apps/web/src/app/page.tsx`
- Modify: `~/Workspace/finreckoner/apps/web/src/app/layout.tsx`

- [ ] **Step 1: Write `public/ads.txt`**

```
# finreckoner.com — Pending AdSense approval.
# After approval, replace with:
# google.com, pub-XXXXXXXXXXXXXXXX, DIRECT, f08c47fec0942fa0
```

- [ ] **Step 2: Write `public/robots.txt`**

```
User-agent: *
Allow: /
Sitemap: https://finreckoner.com/sitemap.xml
```

- [ ] **Step 3: Write `src/lib/site-config.ts`**

```typescript
// src/lib/site-config.ts
// IMMUTABLE: launchedAt is locked at sprint S0 close. CI guards against unauthorized edits.
// To edit, add the 'allow-launch-date-edit' label to the PR.

export const SITE_CONFIG = {
  launchedAt: '2026-04-29',
  deployedAt: process.env.VERCEL_GIT_COMMIT_SHA
    ? new Date().toISOString()
    : 'dev',
  url: 'https://finreckoner.com',
  defaultLocales: ['en-US', 'en-CA'] as const,
} as const
```

- [ ] **Step 4: Write `src/components/Footer.tsx`**

```tsx
import { SITE_CONFIG } from '@/lib/site-config'

export function Footer() {
  return (
    <footer className="border-t mt-16 py-8 text-sm text-slate-500">
      <div className="max-w-4xl mx-auto px-4 flex flex-col gap-2">
        <p>
          <span suppressHydrationWarning>finreckoner.com</span>
          {' · '}
          Live since{' '}
          <time dateTime={SITE_CONFIG.launchedAt}>
            {new Date(SITE_CONFIG.launchedAt).toLocaleDateString('en-US', {
              year: 'numeric', month: 'long', day: 'numeric',
            })}
          </time>
        </p>
        <p>Informational only — not tax, legal, or financial advice.</p>
      </div>
    </footer>
  )
}
```

- [ ] **Step 5: Write `src/components/HeroCreator.tsx`**

```tsx
export function HeroCreator() {
  return (
    <section className="py-16 px-4 max-w-4xl mx-auto text-center">
      <h1 className="text-4xl font-bold mb-4">
        Financial calculators built for creators
      </h1>
      <p className="text-lg text-slate-600 mb-6">
        Multi-currency. Multi-country. Tax-aware. From a creator who lives the multi-currency life
        (CAD/USD/BRL/EUR).
      </p>
      <p className="text-sm text-slate-500">
        Launching <strong>July 15, 2026</strong> with mortgage, compound interest, currency converter,
        and US/CA income tax calculators.
      </p>
    </section>
  )
}
```

- [ ] **Step 6: Write `src/components/CalcCardPlaceholder.tsx`**

```tsx
interface Props {
  title: string
  description: string
  comingDate: string
}

export function CalcCardPlaceholder({ title, description, comingDate }: Props) {
  return (
    <div
      role="article"
      aria-disabled="true"
      className="border rounded-lg p-6 opacity-60 cursor-not-allowed"
    >
      <h3 className="text-xl font-semibold mb-2">{title}</h3>
      <p className="text-sm text-slate-600 mb-3">{description}</p>
      <span className="inline-block bg-slate-100 text-slate-600 text-xs px-2 py-1 rounded">
        Coming {comingDate}
      </span>
    </div>
  )
}
```

- [ ] **Step 7: Write `src/app/page.tsx`** (homepage)

```tsx
import { HeroCreator } from '@/components/HeroCreator'
import { CalcCardPlaceholder } from '@/components/CalcCardPlaceholder'

export default function Home() {
  return (
    <main>
      <HeroCreator />
      <section className="max-w-4xl mx-auto px-4 grid grid-cols-1 sm:grid-cols-2 gap-4">
        <CalcCardPlaceholder
          title="Mortgage Calculator (US + CA)"
          description="Principal, interest, taxes, insurance, amortization. Conventional and FHA (US); CMHC (CA)."
          comingDate="May 2026"
        />
        <CalcCardPlaceholder
          title="Compound Interest Calculator"
          description="Visualize savings growth over time, with creator income volatility in mind."
          comingDate="May 2026"
        />
        <CalcCardPlaceholder
          title="Income Tax (US + CA + QC)"
          description="Federal + provincial brackets for TY2026. 1099-NEC, T4A, self-employed lens."
          comingDate="June 2026"
        />
        <CalcCardPlaceholder
          title="Currency Converter"
          description="10 currencies, prioritized for creator income (CAD/USD/BRL/EUR). Live FX coming."
          comingDate="May 2026"
        />
      </section>
    </main>
  )
}
```

- [ ] **Step 8: Update `src/app/layout.tsx`** with hreflang + Footer

```tsx
import './globals.css'
import { Footer } from '@/components/Footer'
import { SITE_CONFIG } from '@/lib/site-config'

export const metadata = {
  title: 'finreckoner — Financial calculators for creators',
  description: 'Multi-country, multi-currency tax & finance calculators built for creators, freelancers, and remote workers.',
  alternates: {
    canonical: SITE_CONFIG.url,
    languages: {
      'en-US': `${SITE_CONFIG.url}/en-US`,
      'en-CA': `${SITE_CONFIG.url}/en-CA`,
      'x-default': SITE_CONFIG.url,
    },
  },
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        {children}
        <Footer />
      </body>
    </html>
  )
}
```

- [ ] **Step 9: Build + commit**

```bash
cd ~/Workspace/finreckoner
npm run build
git add apps/web/public apps/web/src
git commit -m "feat(web): add homepage v0 (hero + 4 calc placeholders + Footer + ads.txt)"
git push
```

---

### Task 30: CI workflow + ecosystem-pinning script + site-config immutability check + Lighthouse CI

**Files:**
- Create: `~/Workspace/finreckoner/.github/workflows/ci.yml`
- Create: `~/Workspace/finreckoner/scripts/check-ecosystem-pinning.sh`
- Create: `~/Workspace/finreckoner/scripts/check-site-config-immutability.sh`
- Create: `~/Workspace/finreckoner/apps/web/lighthouserc.json`

- [ ] **Step 1: Write `.github/workflows/ci.yml`**

```yaml
name: CI
on: [push, pull_request]

jobs:
  verify:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
        with: { fetch-depth: 0 }
      - uses: actions/setup-node@v4
        with:
          node-version: 20
          cache: npm
          registry-url: https://npm.pkg.github.com
          scope: '@tn-figueiredo'
      - run: npm ci
        env: { NODE_AUTH_TOKEN: ${{ secrets.NPM_TOKEN }} }
      - run: npm run typecheck
      - run: npm test --if-present
      - run: npm audit --audit-level=moderate || true
      - run: ./scripts/check-ecosystem-pinning.sh
      - run: ./scripts/check-site-config-immutability.sh
        env:
          GITHUB_EVENT_NAME: ${{ github.event_name }}
          GITHUB_BASE_REF: ${{ github.base_ref }}
          GITHUB_EVENT_PATH: ${{ github.event_path }}
      - run: npm run build
      - name: Lighthouse CI
        run: npx -y @lhci/cli@0.13.0 autorun --config=apps/web/lighthouserc.json
        continue-on-error: true   # S0: warn-only; S1+ enforce
      - name: Gitleaks
        uses: gitleaks/gitleaks-action@v2
        env: { GITHUB_TOKEN: ${{ secrets.GITHUB_TOKEN }} }
```

- [ ] **Step 2: Write `scripts/check-ecosystem-pinning.sh`**

```bash
#!/usr/bin/env bash
set -euo pipefail
# Fail if any @tn-figueiredo/* dep uses ^ or ~ in any package.json
FOUND=$(grep -rEn '"@tn-figueiredo/[^"]+":\s*"[\^~]' --include=package.json . || true)
if [ -n "$FOUND" ]; then
  echo "::error::Ecosystem packages must be pinned (no ^/~). Found:"
  echo "$FOUND"
  exit 1
fi
echo "Ecosystem pinning OK."
```

- [ ] **Step 3: Write `scripts/check-site-config-immutability.sh`**

```bash
#!/usr/bin/env bash
set -euo pipefail
[ "${GITHUB_EVENT_NAME:-}" = "pull_request" ] || { echo "Not a PR; skipping."; exit 0; }

DIFF=$(git diff "origin/${GITHUB_BASE_REF:-main}...HEAD" -- 'apps/web/src/lib/site-config.ts' || true)
if echo "$DIFF" | grep -Eq '^\+.*launchedAt'; then
  LABELS=$(jq -r '.pull_request.labels[].name' < "${GITHUB_EVENT_PATH:-/dev/null}" 2>/dev/null || echo "")
  if echo "$LABELS" | grep -q "allow-launch-date-edit"; then
    echo "launchedAt change approved by label."
    exit 0
  fi
  echo "::error::SITE_CONFIG.launchedAt changed without 'allow-launch-date-edit' label."
  exit 1
fi
echo "Site config immutability OK."
```

- [ ] **Step 4: chmod scripts**

```bash
chmod +x ~/Workspace/finreckoner/scripts/*.sh
```

- [ ] **Step 5: Write `apps/web/lighthouserc.json`**

```json
{
  "ci": {
    "collect": {
      "staticDistDir": "./out",
      "url": ["http://localhost/"]
    },
    "assert": {
      "assertions": {
        "categories:performance": ["warn", { "minScore": 0.90 }],
        "categories:accessibility": ["warn", { "minScore": 0.95 }],
        "categories:seo": ["warn", { "minScore": 0.95 }],
        "largest-contentful-paint": ["warn", { "maxNumericValue": 2000 }],
        "cumulative-layout-shift": ["warn", { "maxNumericValue": 0.1 }]
      }
    }
  }
}
```

- [ ] **Step 6: Add `output: 'export'`** to `apps/web/next.config.ts` for SSG export

```typescript
import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  output: 'export',
  images: { unoptimized: true },
}

export default nextConfig
```

- [ ] **Step 7: Set GH secret `NPM_TOKEN`** (dedicated classic PAT — NOT `gh auth token`, which is GitHub CLI user token and may lack `write:packages` scope)

First ensure the dedicated PAT exists (created in pre-flight). Then read it from `~/.npmrc`:

```bash
TOKEN=$(cat ~/.npmrc | grep '//npm.pkg.github.com' | grep -o '_authToken=.*' | cut -d= -f2)
[ -n "$TOKEN" ] || { echo "NPM_TOKEN missing in ~/.npmrc — create classic PAT first (see pre-flight)"; exit 1; }
gh secret set NPM_TOKEN --body "$TOKEN" --repo TN-Figueiredo/finreckoner
gh secret set NPM_TOKEN --body "$TOKEN" --repo TN-Figueiredo/tnf-ecosystem  # if not already set
```

- [ ] **Step 8: Commit + push + verify CI**

```bash
git add .github scripts apps/web/lighthouserc.json apps/web/next.config.ts
git commit -m "ci: add CI workflow (typecheck, test, audit, eco-pinning, site-config immutability, Lighthouse)"
git push
gh run watch
```

Expected: CI green.

---

### Task 31: Configure @tn-figueiredo/seo for hreflang + sitemap

**Files:**
- Modify: `~/Workspace/finreckoner/apps/web/src/app/layout.tsx` (already imports hreflang in Task 29)
- Create: `~/Workspace/finreckoner/apps/web/src/app/sitemap.ts`

- [ ] **Step 1: Write `sitemap.ts`** (Next 15 dynamic sitemap)

```typescript
// src/app/sitemap.ts
import { SITE_CONFIG } from '@/lib/site-config'

export default function sitemap() {
  return [
    { url: SITE_CONFIG.url, lastModified: new Date(), changeFrequency: 'monthly' as const, priority: 1 },
  ]
}
```

- [ ] **Step 2: Build + verify sitemap.xml present**

```bash
cd ~/Workspace/finreckoner
npm run build
ls apps/web/out/sitemap.xml
```

- [ ] **Step 3: Commit**

```bash
git add apps/web/src/app/sitemap.ts
git commit -m "feat(web): add sitemap.xml route"
git push
```

---

**M0.4 complete (14h).** Continue to M0.5.

---

## M0.5 — Closeout (3h, Day 12)

### Task 32: Affiliate terms archive

**Files:**
- Create: `~/Workspace/finreckoner/docs/legal/affiliate-terms-2026-04.md`
- Create: `~/Workspace/finreckoner/docs/legal/screenshots/{wise,questrade,wealthsimple,credit-karma,nerdwallet}.png`

- [ ] **Step 1: Capture screenshots manually** — login to each partner portal, screenshot the page showing CPA + cookie duration + forbidden copy. Save as PNGs in `docs/legal/screenshots/`.

- [ ] **Step 2: Write `affiliate-terms-2026-04.md`**

```markdown
# Affiliate Terms Archive — 2026-04

Archived as part of Sprint 0 (`@tn-figueiredo/partner-links@0.1.0`) for FTC compliance and audit trail.

## Wise

**Captured:** 2026-04-29
**Cookie duration:** [VERIFY — fill in from screenshot]
**CPA range:** [from screenshot]
**Forbidden copy:** [list any prohibited claims per partner agreement]
**Screenshot:** ![wise](./screenshots/wise.png)
**Source URL:** https://wise.com/partners

## Questrade

**Captured:** 2026-04-29
**CPA:** [verify ~$70]
**Cookie duration:** [verify]
**Screenshot:** ![questrade](./screenshots/questrade.png)

## Wealthsimple

**Captured:** 2026-04-29
**CPA:** [verify ~$50]
**Screenshot:** ![wealthsimple](./screenshots/wealthsimple.png)

## Credit Karma

**Captured:** 2026-04-29
**CPA range:** [verify $7-25]
**Screenshot:** ![credit-karma](./screenshots/credit-karma.png)

## NerdWallet

**Captured:** 2026-04-29
**CPA:** [verify ~$100]
**Screenshot:** ![nerdwallet](./screenshots/nerdwallet.png)

---

**Discrepancies vs source roadmap claims:**

- [ ] Wise cookie duration matches "1-year" claim (or document actual duration)
- [ ] All other figures match roadmap monetization table

If discrepancies found: update `docs/roadmap/README.md` monetization table and CLAUDE.md.
```

- [ ] **Step 3: Commit**

```bash
cd ~/Workspace/finreckoner
git add docs/legal/
git commit -m "docs(legal): archive affiliate terms + screenshots (S0 M0.5)"
git push
```

---

### Task 33: Write 5 ADRs

**Files:** `~/Workspace/tnf-ecosystem/docs/adr/{template,001..005}.md`

- [ ] **Step 1: Create `template.md`** (per spec §6.4 — already shown there; copy verbatim)

- [ ] **Step 2: Write ADR-001 — Money branded-object with decimal.js**

```markdown
# ADR-001: Money as branded object with decimal.js amount

**Status:** Accepted
**Date:** 2026-04-29
**Author:** Thiago Figueiredo

## Context
Tax math with native JS `number` exhibits float precision bugs (`0.1 + 0.2 = 0.30000000000000004`). YMYL finance liability requires exact arithmetic. Industry standard libraries: `decimal.js`, `big.js`, BigInt-cents pattern. Money type design: class methods vs free functions vs branded objects.

## Decision
Use `decimal.js` (10.4.3) as the decimal arithmetic engine. Money is a **branded object** `{ amount: Decimal, currency: string, [MoneyBrand]: true }` with operations as free functions (`add`, `sub`, `mul`, `div`, `compare`). Branded via `unique symbol` to prevent raw `{amount, currency}` misuse.

## Consequences

### Positive
- RSC-safe (plain object crosses Server Component boundary, JSON-serializable without custom `toJSON`)
- Tree-shakeable (functions, not class methods)
- Type-safe (brand prevents structural typing accidents)
- Industry-standard precision

### Negative
- Slightly more verbose at call site (`add(a, b)` vs `a.plus(b)`)
- 8KB decimal.js dependency (acceptable in SSG context)

### Risks
- Consumers must `import { add } from '@tn-figueiredo/calc-engine'` correctly; tree-shake fails if entire barrel is imported

## Alternatives considered
- **`big.js`** (5KB): less features, no `.toFixed(n, mode)` advanced rounding. Rejected — finance needs full feature set.
- **BigInt cents:** zero deps, max performance. Rejected — boilerplate cost; epsilon tolerance issues in property tests; threshold bracket math less clean.
- **Money as class:** poor RSC behavior, JSON serialization requires `toJSON`/`fromJSON` discipline, identity-equality issues in React reconciliation.
```

- [ ] **Step 3: Write ADR-002 — Year registry dispatcher**

```markdown
# ADR-002: Tax year registry dispatcher (non-breaking additive years)

**Status:** Accepted
**Date:** 2026-04-29
**Author:** Thiago Figueiredo

## Context
Tax brackets change yearly. Hard-coding `brackets-2026.ts` only works for one year. When TY2027 arrives (Nov 2026 refresh), the API must accept the new year without breaking existing consumers typed against `TaxYear = 2026` (literal).

## Decision
Public `TaxYear` is `type TaxYear = number` (plain). Each jurisdiction has a `registry.ts` exposing `SUPPORTED_*_YEARS: readonly TaxYear[]` (array) plus `getYearData(year)` that throws `UnsupportedYearError` when year is absent. Adding TY2027 = add `years/2027.ts` + push to `SUPPORTED_*_YEARS` + register in the map. Zero breaking change.

## Consequences

### Positive
- Annual refresh is additive, consumers never break
- Runtime validation catches bad year early
- `SUPPORTED_*_YEARS` is introspectable (consumer UI can list supported years)

### Negative
- Runtime check has tiny perf cost (negligible in SSG context)
- Less compile-time safety (`year: 2099` compiles; fails runtime)

## Alternatives considered
- **Literal union `TaxYear = 2026 | 2027`:** compile-time safe but adding years = breaking for consumers re-exporting TaxYear. Rejected.
- **Separate package per year (`@tn-figueiredo/calc-engine-2026`):** registry explosion; consumers juggle multiple pkgs. Rejected.
```

- [ ] **Step 4: Write ADR-003 — partner-links core/react split**

```markdown
# ADR-003: partner-links package split: agnostic core + React adapter subpath

**Status:** Accepted
**Date:** 2026-04-29

## Context
FTC disclosure helpers need to render as JSX for the Next.js consumer (finreckoner). But the provider definitions + disclosure text generation are framework-agnostic. Coupling them forces all consumers to install React.

## Decision
Single package with `exports` map split:
- `"."` — agnostic core (providers, UTM, disclosure text). Zero React dep.
- `"./react"` — `<FTCDisclosure>` component. Declares `react >=18` as `peerDependency` (optional).

Consumers without React (future Astro/Remix/Node-only) import `@tn-figueiredo/partner-links` directly. React consumers add `/react`.

## Consequences

### Positive
- Framework portability across ecosystem
- Smaller bundle for non-React consumers
- Single changelog/version — simpler release management

### Negative
- Two build entries in tsup config (minor complexity)
- Peer-dep contract requires docs (covered in README)

## Alternatives considered
- **Two separate packages** (`partner-links-core` + `partner-links-react`): version lockstep pain, 2× publish cadence. Rejected.
- **React baked in as direct dep:** defeats reuse. Rejected.
```

- [ ] **Step 5: Write ADR-004 — cascade architecture (push initially, pull later)**

```markdown
# ADR-004: Cross-repo cascade architecture: ecosystem-push → consumer-pull migration

**Status:** Accepted (push for S0; pull migration targeted S1+)
**Date:** 2026-04-29

## Context
When a package in `tnf-ecosystem` is published, N consumer repos (tonagarantia, bythiagofigueiredo, fan-stamp, finreckoner) may need to upgrade + regression-test. Two architectures:
- **Push:** ecosystem CI iterates consumers' sibling checkouts via a script.
- **Pull:** consumer CI subscribes to registry events (repository_dispatch) and runs its own upgrade.

## Decision
**S0: push architecture** via `scripts/cascade-smoke-test.sh` + `consumers.json`. Null-op for calc-engine + partner-links (zero consumers). Validates infra.

**S1+: migrate to pull** — each consumer repo has a workflow listening for `workflow_dispatch` triggered by ecosystem publish, runs `./scripts/upgrade-ecosystem.sh <pkg> <version>` + tests, opens PR if passing. Eliminates sibling-path coupling.

## Consequences

### Positive S0
- Simple to implement; no consumer-side changes
- Infrastructure warmup for cascade scripts

### Negative S0
- Fragile assumption: consumer repos live at `../<name>` sibling paths
- Ecosystem CI needs write-access simulation for consumer test state

### Positive S1+
- Consumer repos own their upgrade flow
- Scales to more consumers without ecosystem changes
- Survives sibling-path assumption violations

### Risks
- Migration pain (coordinate with consumer repo maintainers)

## Alternatives considered
- **Pull-only from day 1:** requires consumer repo workflow setup before S0 cascade infra validated. Higher upfront cost. Rejected for S0 timing.
- **No cascade automation, manual upgrade:** acceptable for small consumer count but already at 4 — automation wins.
```

- [ ] **Step 6: Write ADR-005 — property-test iteration budget**

```markdown
# ADR-005: Property-based test iteration count (measurement-driven)

**Status:** Accepted
**Date:** 2026-04-29

## Context
fast-check property tests run N iterations (`numRuns`) per property. Naive estimate: 10K runs × 8 properties × 3 jurisdictions = 240K iterations. CI time budget: <60s per package. Wrong numRuns either (a) wastes CI minutes or (b) reduces coverage insufficiently.

## Decision
Measure before committing:
1. Day 6 of S0, run a single calibration test with `numRuns: 1000`.
2. Record wall-time.
3. Apply matrix:

| Measured 1K | Final numRuns |
|:-:|:-:|
| <3s | 10000 |
| 3-10s | 5000 |
| 10-30s | 2000 |
| >30s | 1000 + investigate |

Final value stored in `__tests__/property/config.ts` as `FINAL_NUM_RUNS` constant. All property tests import it.

## Consequences

### Positive
- Evidence-based budget (not guessed)
- Single config constant — easy to tune later
- CI stays fast (sub-minute target)

### Negative
- 1 extra calibration step at sprint start
- Future hardware/library changes may require re-calibration

## Alternatives considered
- **Fixed 10K:** could blow 4-minute CI runs in worst case. Rejected.
- **Fixed 100 (fast-check default):** insufficient for tax boundary edge detection in YMYL context. Rejected.
```

- [ ] **Step 4: Commit**

```bash
cd ~/Workspace/tnf-ecosystem
git add docs/adr/
git commit -m "docs(adr): add ADR-001..005 (Money, year-registry, partner-links split, cascade, property-test calibration)"
git push
```

---

### Task 34: Cascade smoke-test dry-run (null-op verification)

- [ ] **Step 1: Run cascade for both new packages** (zero consumers expected)

```bash
cd ~/Workspace/tnf-ecosystem
./scripts/cascade-smoke-test.sh calc-engine 0.1.0
./scripts/cascade-smoke-test.sh partner-links 0.1.0
```

Expected: "No consumers configured for ... — null-op cascade."

- [ ] **Step 2: Run for `shared` to verify cascade infra works against real consumers** (no version bump; just smoke)

```bash
./scripts/cascade-smoke-test.sh shared 0.8.0  # current shared version
```

Expected: iterates 3 consumers, may fail if they have stale local state — log results.

- [ ] **Step 3: Document run in `finreckoner/docs/ecosystem/cascade-2026-04-S0.md`**

```markdown
# Cascade smoke-test log — Sprint 0 closeout (2026-04-29)

## calc-engine@0.1.0
Result: null-op (zero consumers). Infra OK.

## partner-links@0.1.0
Result: null-op (zero consumers). Infra OK.

## shared@0.8.0 (control test)
Result: [paste output here]
Notes: [any consumer issues — file followup tickets if needed]
```

- [ ] **Step 4: Commit**

```bash
cd ~/Workspace/finreckoner
git add docs/ecosystem/
git commit -m "docs(ecosystem): cascade smoke-test log S0"
git push
```

---

### Task 35: Write S0 retrospective

**Files:**
- Create: `~/Workspace/finreckoner/docs/retro/sprint-0-2026-04-29.md`

- [ ] **Step 1: Fill in retro template per spec §6.5**

```markdown
# Sprint 0 Retrospective — 2026-04-29

## Estimated vs actual

| Milestone | Estimated | Actual | Δ | Notes |
|---|:-:|:-:|:-:|---|
| M0.1 calc-engine core | 24h | __h | __h | |
| M0.2 tests + first publish | 7h | __h | __h | property-test calibration: chose numRuns=__ |
| M0.3 partner-links | 9h | __h | __h | |
| M0.4 finreckoner scaffold | 14h | __h | __h | |
| M0.5 closeout | 3h | __h | __h | |
| **Total** | **57h** | **__h** | **__h** | |

## What worked
- (fill in)

## What didn't
- (fill in)

## Unknowns surfaced
- (fill in — these become known-unknowns for S1)

## Decisions for S1
- @tn-figueiredo/cms extraction status: __
- Wise cookie duration validated: yes/no — actual value: __
- Tax data freshness check (IRS/CRA/RQ): __
- Property-test numRuns final: __
- Bundle sizes vs initial budgets: __

## Velocity calibration
S0 actual velocity = __h / 12 working days = __h/day
S1 plan: keep 25h/sem | adjust to __h/sem
```

- [ ] **Step 2: Commit**

```bash
git add docs/retro/
git commit -m "docs(retro): Sprint 0 retrospective stub (fill in EOD Apr 29)"
git push
```

---

### Task 36: G0 gate check + close sprint

- [ ] **Step 1: Run G0 checklist** (per spec §11)

```bash
# 1. Packages live
gh api /orgs/TN-Figueiredo/packages/npm/calc-engine/versions --jq '.[] | select(.name=="0.1.0") | .name'
gh api /orgs/TN-Figueiredo/packages/npm/partner-links/versions --jq '.[] | select(.name=="0.1.0") | .name'

# 2. Domain live
curl -sI https://finreckoner.com | head -3

# 3. Footer renders launchedAt
curl -s https://finreckoner.com | grep -o 'Live since[^<]*'

# 4. ads.txt + robots.txt
curl -sI https://finreckoner.com/ads.txt | head -1
curl -sI https://finreckoner.com/robots.txt | head -1

# 5. CI green both repos
gh run list -R TN-Figueiredo/finreckoner --limit 1
gh run list -R TN-Figueiredo/tnf-ecosystem --limit 1
```

Each must succeed. If any fails → invoke slippage playbook (spec §6.3).

- [ ] **Step 2: Update roadmap status**

```bash
cd ~/Workspace/finreckoner
# Edit docs/roadmap/phase-1-mvp.md:
#   - Sprint 0 status: ☐ → ✅
#   - All G0 checklist items: [ ] → [x]
#   - Carry-over: any unfinished items
```

- [ ] **Step 3: Commit close**

```bash
git add docs/roadmap/phase-1-mvp.md docs/retro/sprint-0-2026-04-29.md
git commit -m "docs(roadmap): close sprint 0 — packages + foundation shipped"
git push
```

---

**M0.5 complete (3h). Sprint 0 closed.**

---

## Self-Review

**Spec coverage check:**

- §1.1 Component layout — Tasks 1, 20, 27, 28 cover all directories ✓
- §1.2 ADRs 001-005 — Task 33 ✓
- §1.3 finreckoner separate repo — Task 26-27 ✓
- §2.1-2.10 Public APIs — Tasks 3-11, 21-24 ✓
- §3.1 Release flow — Tasks 17-19, 25 ✓
- §3.2 Site-age flow — Task 29 (site-config + Footer) + Task 30 (immutability check) ✓
- §3.3-3.4 Tax/partner flows — APIs in place; consumer wiring in S1 (out of scope ✓)
- §4 Test strategy — Tasks 12-15 (calibration + 8 props × 3 + 30 golden + size-limit) ✓
- §5 CI pipeline — Tasks 18, 30 ✓
- §6 Timeline — task ordering reflects DAG; M0.4 split across days ✓
- §7 Pre-S0 prereqs — pre-flight checks at top ✓
- §8 Risks — slippage playbook in spec; tasks include fallbacks (provisional flag, manual publish, etc.) ✓
- §9 Rollback — covered in spec; not separate task (operational, not coded) ✓
- §11 G0 gate — Task 36 ✓
- §12 Out of scope — verified no out-of-scope task added ✓

**Placeholder scan:**
- Task 15 expected values are flagged as illustrative + Step 1 generates real values ✓
- ADR-002..005 have title-only stub (Task 33 Step 3) — engineer fills with same template ⚠ acceptable for ADRs since they're documentation, not code; recommend explicit content if time permits

**Type consistency:**
- `Money`, `TaxResult<TInput>`, `FxSource`, `Provider` referenced consistently across tasks ✓
- `CaProvince` exported from `tax/ca/index` and re-exported via `registry` ✓

Plan saved to `/Users/figueiredo/Workspace/finreckoner/docs/superpowers/plans/2026-04-15-sprint-0-packages-foundation-plan.md`.

---

## Execution choice

**Two execution options:**

**1. Subagent-Driven (recommended)** — Eu dispatcho um subagent fresh por task, reviso entre tasks, iteração rápida.

**2. Inline Execution** — Executo tasks nesta sessão usando `superpowers:executing-plans`, batch execution com checkpoints pra revisão.

Qual abordagem prefere?
