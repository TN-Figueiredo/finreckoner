# POST-WAVE-3 Swap — Design Spec

**Status:** Revised 2026-04-17 late — swap surface cut from 4 → 2 after runtime inspection of ymyl-ui@0.1.1 built JS
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

## 1. Actual swap surface — final: 2 components × 2 templates

Revised after runtime inspection of `node_modules/@tn-figueiredo/ymyl-ui/dist/react.js`:

### Components that swap (2)

| Component | Output | Replaces |
|---|---|---|
| `AuthorByline({ author })` | `<address><span>By </span><a rel=author>Name</a>...</address>` | inline `{pillar.author && <p>By X</p>}` |
| `ReviewerByline({ reviewer })` | `<p>Reviewed by <strong>Name</strong>, Credential · <time>Date</time></p>` | inline `{pillar.reviewer && <p>Reviewed by...</p>}` |

### "Last reviewed" line — conditional

`ReviewerByline` **already renders the review date**. Separate "Last reviewed: <yearmonth>" line becomes redundant when reviewer exists. Decision:

- `pillar.reviewer` present → drop the standalone "Last reviewed" (ReviewerByline covers it)
- `pillar.reviewer === null` → keep inline "Last reviewed" fallback using `pillar.reviewedAt ?? pillar.updatedAt`

### YmylDisclaimer — **NOT** part of swap

Runtime inspection shows `inlineCalcDisclaimerText()` hardcodes `"This calculator provides estimates..."`. Purpose-built for **calculator** pages, not pillar/post content pages. Using it would semantically mislabel content. **Keep the current inline `<aside role=note>` disclaimer on pillar/post** with its current generic "Informational only" copy. File an ymyl-ui@0.1.2 FR for a `<YmylContentDisclaimer>` variant later.

### `FTCDisclosure` — **NOT** part of swap

Takes a specific `provider: Provider`; designed for per-CTA proximity disclosure. Post's above-fold aside is generic "this post has affiliate links" — different semantics. Keep inline.

### Everything else — stays inline by design

- Jurisdiction footer, Citations section, FTC above-fold, Disclaimer aside — no dedicated ymyl-ui component. Comments rewritten from `POST-WAVE-3:` to `// Inline by design — no dedicated ymyl-ui@0.1.x component`.

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

## 3. Component API compatibility (two adapters needed)

### `pillar.author` → `AuthorByline`

- `PillarMock.author`: `{ name, url? }`
- `ymyl-ui.Author`: `{ name, credential?, bioUrl?, experience? }`

**Mismatch:** field renamed `url` → `bioUrl`. **Adapter at call site:**
```tsx
<AuthorByline author={{ name: pillar.author.name, bioUrl: pillar.author.url }} />
```

### `pillar.reviewer` → `ReviewerByline`

- `ReviewerMock`: `{ name, credential, date }`
- `ymyl-ui.Reviewer` (from built JS inspection): `{ name, credential, reviewedAt, attributionAllowed? }`

**Mismatch:** field renamed `date` → `reviewedAt` (ymyl-ui reads this at `formatIsoDate(reviewer.reviewedAt)`). **Adapter:**
```tsx
<ReviewerByline reviewer={{ name: pillar.reviewer.name, credential: pillar.reviewer.credential, reviewedAt: pillar.reviewer.date }} />
```

Both adapters are 1-line mapping objects at the call site. Not worth
extracting to a helper unless the fixture later grows — when CMS
integration (Wave 5) reshapes types, normalize to ymyl-ui's shape
directly in `src/lib/content.ts`.

## 4. Testing — predicted assertion impact

| Current assertion | AuthorByline/ReviewerByline output | Status |
|---|---|---|
| `getByText(/By /)` | `<span>By </span>` inside `<address>` | ✅ matches |
| `/Reviewed by/` (regex) | `<span>Reviewed by </span>` | ✅ matches |
| `queryByText(/Reviewed by/)` null-case (reviewer=null) | no ReviewerByline rendered | ✅ matches |
| Playwright `article.getByText(/By /)` | `<address>` inside `<article>` | ✅ matches (address is article-scoped) |
| `<p>` selector expectations | AuthorByline uses `<address>` (semantic), not `<p>` | ⚠ **low risk** — no test asserts `<p>` |

If any assertion does break, fix is swap regex, not component. No planned test regex changes required — but verify after swap.

### Lighthouse + axe
ymyl-ui@0.1.1 ships baselines (inline padding + font-size); thresholds restored to 0.95 on PR #5. Swap should not regress.

## 5. Rollback criteria

- Any template test regresses → rollback swap, keep inline
- Lighthouse any category <threshold → rollback
- Axe adds violations → rollback
- Vercel preview visual diff differs meaningfully → adapt styles

## 6. Out of scope

- `Citations`, `Jurisdiction`, `LastReviewed` component creation (ymyl-ui@0.1.2+ epic)
- Fixture shape normalization (`author.url → bioUrl`) — better done in Wave 5 CMS integration where types reset
- `FTCDisclosure` per-link usage — separate epic for per-CTA disclosures

## 7. Success metrics (final)

- [ ] 2 component swaps in pillar-template (AuthorByline + ReviewerByline)
- [ ] 2 component swaps in post-template (AuthorByline + ReviewerByline)
- [ ] Conditional drop of "Last reviewed" line when reviewer present; fallback kept when null
- [ ] 5 remaining inline blocks comment-rewritten (YmylDisclaimer, Jurisdiction, Citations, FTC above-fold, Last-reviewed fallback) — `POST-WAVE-3:` markers replaced with "Inline by design — no dedicated ymyl-ui@0.1.x component"
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
