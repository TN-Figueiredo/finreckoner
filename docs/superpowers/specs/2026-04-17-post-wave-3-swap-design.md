# POST-WAVE-3 Swap — Design Spec

**Status:** Proposed (awaiting user approval)
**Date:** 2026-04-17
**Author:** Thiago Figueiredo (with Claude collaboration)
**Branch:** `post-wave-3-swap` (to be created from `main`)
**Effort estimate:** ~1-2h (inline JSX → component swap; small surface)
**Dependencies:** `@tn-figueiredo/ymyl-ui@0.1.1` ✅ published; `@tn-figueiredo/partner-links@0.2.0` ✅ published
**Related:** [Wave 4 CMS consumer scaffold spec](2026-04-16-cms-consumer-scaffold-design.md) §2.1 (swap strategy), PR #4 (Wave 2 merge), PR #5 (ymyl-ui bump)

---

## 0. Purpose

Replace the inline JSX stubs in pillar/post templates with published
`@tn-figueiredo/ymyl-ui/react` components now that Wave 3 shipped.
Reduces template-local code duplication; future ymyl-ui improvements
flow into finreckoner automatically.

## 1. Actual swap surface (revised 9 → 4 after audit)

After inspecting `@tn-figueiredo/ymyl-ui@0.1.1` exports, the
original "9 POST-WAVE-3 markers" overestimates available components.

### Components that DO exist in `ymyl-ui/react`

| Component | Props | Swap target |
|---|---|---|
| `AuthorByline` | `author: Author, className?` | "By X" meta block |
| `ReviewerByline` | `reviewer: Reviewer, className?` | "Reviewed by X" meta block |
| `YmylDisclaimer` | `calcName?, jurisdiction?, variant, disclaimerHref?, className?` | Above-fold disclaimer aside |

### `partner-links/react`

| Component | Props | Consider for swap? |
|---|---|---|
| `FTCDisclosure` | `provider: Provider, variant: 'inline'\|'block'` | **No** — designed for per-link proximity disclosure, not generic "this post has affiliates" copy. Keep post-template's inline aside |

### Components that DO NOT exist (stay inline)

- `<Citations />` — not in ymyl-ui@0.1.1
- `<Jurisdiction />` — not in ymyl-ui@0.1.1
- `<LastReviewed />` — pattern is merged into ByLines; standalone absent

These stay as inline JSX. `POST-WAVE-3:` comments rewritten to
`// Inline by design — no dedicated ymyl-ui component`.

## 2. Exact file-level changes

### `apps/web/src/components/templates/pillar-template.tsx`

**Swap 1 (meta block):**

```tsx
// before
<div className="meta mt-4 text-sm text-slate-600 space-y-1">
  {pillar.author && (
    <p>By{' '}
      {pillar.author.url
        ? <a href={pillar.author.url} className="underline">{pillar.author.name}</a>
        : pillar.author.name}
    </p>
  )}
  {pillar.reviewer && (
    <p>Reviewed by {pillar.reviewer.name}, {pillar.reviewer.credential} —{' '}
      <time dateTime={pillar.reviewer.date}>{formatDate(pillar.reviewer.date)}</time>
    </p>
  )}
  <p>Last reviewed: <time dateTime={reviewDate}>{formatYearMonth(reviewDate)}</time></p>
</div>

// after
import { AuthorByline, ReviewerByline } from '@tn-figueiredo/ymyl-ui/react'
...
<div className="meta mt-4 text-sm text-slate-700 space-y-1">
  {pillar.author && <AuthorByline author={{ name: pillar.author.name, bioUrl: pillar.author.url }} />}
  {pillar.reviewer && <ReviewerByline reviewer={pillar.reviewer} />}
  <p>Last reviewed: <time dateTime={reviewDate}>{formatYearMonth(reviewDate)}</time></p>
</div>
```

**Swap 2 (disclaimer aside):**

```tsx
// before — manually styled <aside role="note">…Informational only…</aside>
// after
import { YmylDisclaimer } from '@tn-figueiredo/ymyl-ui/react'
...
<YmylDisclaimer variant="inline" jurisdiction={pillar.jurisdiction === 'US-CA' ? undefined : pillar.jurisdiction ?? undefined} />
```

**Keep inline (comment rewrite only):**
- Jurisdiction footer
- Citations section

### `apps/web/src/components/templates/post-template.tsx`

Identical pattern. 2 swaps + 3 stay inline (FTC above-fold + Jurisdiction + Citations).

## 3. Component API compatibility

### `pillar.author` → `AuthorByline`

`PillarMock.author`: `{ name, url? }`
`ymyl-ui.Author`: `{ name, credential?, bioUrl?, experience? }`

**Mismatch:** mock uses `url`, ymyl-ui uses `bioUrl`. Adapter at call
site: `{ name, bioUrl: pillar.author.url }`.

### `pillar.reviewer` → `ReviewerByline`

`ReviewerMock`: `{ name, credential, date }`
`ymyl-ui.Reviewer`: `{ name, credential, date, attributionAllowed? }`

Compatible — pass-through.

### `pillar.jurisdiction` → `YmylDisclaimer.jurisdiction`

`PillarMock.jurisdiction`: `'US' | 'CA' | 'US-CA' | null`
`ymyl-ui.Jurisdiction`: `'US' | 'CA' | 'CA-QC'`

**Mismatch:** `'US-CA'` is not in ymyl-ui enum. Call-site adapter:
`pillar.jurisdiction === 'US-CA' ? undefined : pillar.jurisdiction ?? undefined`.

## 4. Testing strategy

### Unit tests
- `pillar-template.test.tsx` + `post-template.test.tsx` assert text like
  `/By /` and `/Reviewed by/`. After swap, ymyl-ui renders similar text —
  should still pass. Verify locally first; adjust regex if needed.

### E2E
- Already scope to `<article>` (PR #4 fix). No regression risk from scope.

### Lighthouse + axe
- ymyl-ui@0.1.1 ships compliant baselines; thresholds should hold.

## 5. Rollback criteria

- Any template test regresses → rollback swap, keep inline
- Lighthouse any category <threshold → rollback
- Axe adds violations → rollback
- Vercel preview visual diff differs meaningfully → adapt styles

## 6. Out of scope

- `Citations`, `Jurisdiction`, `LastReviewed` component creation (ymyl-ui@0.1.2+ epic)
- Fixture shape normalization (`author.url → bioUrl`) — better done in Wave 5 CMS integration where types reset
- `FTCDisclosure` per-link usage — separate epic for per-CTA disclosures

## 7. Success metrics

- [ ] 4 inline blocks swapped (AuthorByline ×2, ReviewerByline ×2, YmylDisclaimer ×2)
- [ ] 5 inline blocks comment-rewritten (no `POST-WAVE-3:` left; replaced with design-intent comment)
- [ ] `grep -r POST-WAVE-3 apps/web/src` returns 0
- [ ] Vitest: template tests green
- [ ] Playwright: chromium + webkit-mobile 0 failures
- [ ] Axe: 0 WCAG 2.2 AA violations
- [ ] Lighthouse: ≥0.95 all 4 categories
- [ ] Vercel preview visual parity (manual check)

## 8. Execution plan (~1-2h subagent-driven)

1. **Branch** `post-wave-3-swap` from `main`
2. **Edit** pillar-template.tsx (2 swaps + 2 comment rewrites)
3. **Edit** post-template.tsx (2 swaps + 3 comment rewrites)
4. **Run** Vitest template tests — fix any assertion regex that breaks
5. **Run** Playwright e2e (chromium local) — fix any scope issues
6. **Run** Docker Node 20 `npm ci + build + turbo test` for CI parity
7. **Open PR** → watch CI → merge

## 9. Changelog

- **2026-04-17** — initial spec. Awaits user approval before branch + execution.
