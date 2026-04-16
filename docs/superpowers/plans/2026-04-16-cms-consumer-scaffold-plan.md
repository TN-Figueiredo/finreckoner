# CMS Consumer Scaffold Implementation Plan (Wave 4)

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Prepare finreckoner to consume `@tn-figueiredo/cms@1.0.0` the day it ships, by building every consumer-local piece of pillar/post infrastructure (routes, templates, metadata, SEO, YMYL artifacts, tests) against internal fixtures, with a single data seam at `src/lib/content.ts` that swaps on Wave 5 integration.

**Architecture:** Scaffold-and-wait (Approach B from design spec). Templates are pure prop-driven React components receiving fixtures; route handlers fetch via `src/lib/content.ts` (the only CMS seam). YMYL artifacts render as inline JSX marked `POST-WAVE-3:` for later component swap. All cross-repo contract proposals are explicitly out of scope.

**Tech Stack:** Next.js 15 SSG (`output: 'export'`) · React 19 · TypeScript strict · Tailwind 4 + @tailwindcss/typography · Vitest + @testing-library/react · Playwright (new) · @lhci/cli 0.13.0 (existing).

**Reference:** [`docs/superpowers/specs/2026-04-16-cms-consumer-scaffold-design.md`](../specs/2026-04-16-cms-consumer-scaffold-design.md)

**Parallelization:** Tasks grouped into `[GN]` groups. Tasks within the same group have no inter-dependencies and can be dispatched concurrently by subagent-driven-development. Group boundaries are sequential barriers.

---

## Task 0 — Branch + environment setup `[G0]`

**Files:** none (git + npm state only)

- [ ] **Step 1: Verify starting commit**

Run: `git -C /Users/figueiredo/Workspace/finreckoner log --oneline main -5`
Confirm: `842b56f` is present in main's history (the S0-close baseline pre-Wave-2 hygiene). If `main` is not on `842b56f`, use `main`'s current HEAD — scaffold-and-wait is commit-independent as long as `npm install` resolves.

- [ ] **Step 2: Create branch**

```bash
cd /Users/figueiredo/Workspace/finreckoner
git checkout main
git pull
git checkout -b cms-consumer-scaffold
```

- [ ] **Step 3: Verify `npm install` resolves**

```bash
cd apps/web
npm install
```
Expected: clean install, zero peer-dep errors. If fails, branching point includes unpublished package imports — in that case, `git checkout 842b56f -- apps/web/package.json` to revert to pre-hygiene package.json and retry.

- [ ] **Step 4: Smoke test dev server**

```bash
npm run dev
```
Expected: serves `http://localhost:3000/` with the S0 homepage. Ctrl+C to stop.

---

## Task 1 — New devDependencies `[G0]`

**Files:**
- Modify: `apps/web/package.json`

- [ ] **Step 1: Install exact versions**

```bash
cd apps/web
npm install --save-exact --save-dev \
  @playwright/test@1.48.2 \
  @testing-library/react@16.1.0 \
  @testing-library/jest-dom@6.6.3 \
  @tailwindcss/typography@0.5.15
```

- [ ] **Step 2: Install Playwright browsers**

```bash
npx playwright install chromium webkit
```
Expected: downloads browsers to `~/Library/Caches/ms-playwright/`.

- [ ] **Step 3: Commit**

```bash
git add apps/web/package.json apps/web/package-lock.json
git commit -m "chore(web): add Playwright + Testing Library + Tailwind typography devDeps"
```

---

## Task 2 — Playwright config + test scripts `[G0]`

**Files:**
- Create: `apps/web/playwright.config.ts`
- Modify: `apps/web/package.json` (scripts)

- [ ] **Step 1: Write playwright.config.ts**

```ts
// apps/web/playwright.config.ts
import { defineConfig, devices } from '@playwright/test'

export default defineConfig({
  testDir: './e2e',
  timeout: 30_000,
  expect: { timeout: 10_000 },
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 1 : 0,
  reporter: process.env.CI ? [['html', { outputFolder: '.playwright-report' }]] : 'list',
  use: {
    baseURL: 'http://localhost:3000',
    trace: 'on-first-retry',
  },
  webServer: {
    command: 'npm run build && npm run start',
    url: 'http://localhost:3000',
    reuseExistingServer: !process.env.CI,
    timeout: 120_000,
  },
  projects: [
    { name: 'chromium', use: { ...devices['Desktop Chrome'] } },
    { name: 'webkit-mobile', use: { ...devices['iPhone 14 Pro'] } },
  ],
})
```

- [ ] **Step 2: Add scripts to package.json**

Edit `apps/web/package.json` `scripts` to add:
```json
"e2e": "playwright test",
"e2e:ui": "playwright test --ui"
```

- [ ] **Step 3: Gitignore Playwright artifacts**

Append to `apps/web/.gitignore` (create if missing):
```
.playwright-report/
test-results/
```

- [ ] **Step 4: Commit**

```bash
git add apps/web/playwright.config.ts apps/web/package.json apps/web/.gitignore
git commit -m "chore(web): configure Playwright (chromium + webkit mobile)"
```

---

## Task 3 — URL helper `src/lib/url.ts` `[G1]` (parallel with Task 4, Task 5)

**Files:**
- Create: `apps/web/src/lib/url.ts`
- Create: `apps/web/src/lib/__tests__/url.test.ts`

- [ ] **Step 1: Write failing test**

```ts
// apps/web/src/lib/__tests__/url.test.ts
import { describe, it, expect, vi } from 'vitest'

vi.mock('@/lib/site-config', () => ({
  SITE_CONFIG: { url: 'https://finreckoner.com' },
}))

import { toAbsolute } from '../url'

describe('toAbsolute', () => {
  it('passes absolute URLs through', () => {
    expect(toAbsolute('https://example.com/x')).toBe('https://example.com/x')
  })
  it('resolves relative paths against siteUrl', () => {
    expect(toAbsolute('/pillars/foo')).toBe('https://finreckoner.com/pillars/foo')
  })
  it('handles leading-slash-less paths', () => {
    expect(toAbsolute('pillars/foo')).toBe('https://finreckoner.com/pillars/foo')
  })
})
```

- [ ] **Step 2: Run — expect FAIL**

```bash
cd apps/web
npx vitest run src/lib/__tests__/url.test.ts
```

- [ ] **Step 3: Implement**

```ts
// apps/web/src/lib/url.ts
import { SITE_CONFIG } from '@/lib/site-config'

export function toAbsolute(urlOrPath: string): string {
  try {
    return new URL(urlOrPath).toString()
  } catch {
    return new URL(urlOrPath, SITE_CONFIG.url).toString()
  }
}
```

- [ ] **Step 4: Run — expect PASS**

```bash
npx vitest run src/lib/__tests__/url.test.ts
```

- [ ] **Step 5: Commit**

```bash
git add apps/web/src/lib/url.ts apps/web/src/lib/__tests__/url.test.ts
git commit -m "feat(web): add toAbsolute URL helper"
```

---

## Task 4 — Date formatters `src/lib/format.ts` `[G1]`

**Files:**
- Create: `apps/web/src/lib/format.ts`
- Create: `apps/web/src/lib/__tests__/format.test.ts`

- [ ] **Step 1: Write test**

```ts
// apps/web/src/lib/__tests__/format.test.ts
import { describe, it, expect } from 'vitest'
import { formatDate, formatYearMonth } from '../format'

describe('formatters', () => {
  it('formatDate renders en-US long month-day-year', () => {
    expect(formatDate('2026-04-15')).toBe('April 15, 2026')
  })
  it('formatYearMonth renders en-US long month-year', () => {
    expect(formatYearMonth('2026-04-15')).toBe('April 2026')
  })
  it('formatters handle ISO datetimes', () => {
    expect(formatDate('2026-04-15T12:30:00Z')).toBe('April 15, 2026')
  })
})
```

- [ ] **Step 2: Run — expect FAIL**

`npx vitest run src/lib/__tests__/format.test.ts`

- [ ] **Step 3: Implement**

```ts
// apps/web/src/lib/format.ts
const dateFmt = new Intl.DateTimeFormat('en-US', { year: 'numeric', month: 'long', day: 'numeric' })
const yearMonthFmt = new Intl.DateTimeFormat('en-US', { year: 'numeric', month: 'long' })

export function formatDate(iso: string): string {
  return dateFmt.format(new Date(iso))
}

export function formatYearMonth(iso: string): string {
  return yearMonthFmt.format(new Date(iso))
}
```

- [ ] **Step 4: Run — expect PASS**

- [ ] **Step 5: Commit**

```bash
git add apps/web/src/lib/format.ts apps/web/src/lib/__tests__/format.test.ts
git commit -m "feat(web): add en-US date formatters"
```

---

## Task 5 — JSON-LD builders `src/lib/json-ld.ts` `[G1]`

**Files:**
- Create: `apps/web/src/lib/json-ld.ts`
- Create: `apps/web/src/lib/__tests__/json-ld.test.ts`

- [ ] **Step 1: Write test**

```ts
// apps/web/src/lib/__tests__/json-ld.test.ts
import { describe, it, expect, vi } from 'vitest'

vi.mock('@/lib/site-config', () => ({
  SITE_CONFIG: {
    url: 'https://finreckoner.com',
    siteName: 'finreckoner',
    defaultOgImage: 'https://finreckoner.com/og/default.png',
    organization: {
      name: 'finreckoner',
      logoUrl: 'https://finreckoner.com/logo.png',
      sameAs: ['https://twitter.com/tnfigueiredo'],
    },
  },
}))

import { articleJsonLd, breadcrumbJsonLd, organizationJsonLd } from '../json-ld'
import type { PillarMock } from '../content'

const pillar: PillarMock = {
  slug: 'us-tax-basics',
  title: 'US Tax Basics',
  subtitle: 'What every freelancer should know',
  body: null,
  updatedAt: '2026-04-15T00:00:00Z',
  reviewedAt: '2026-04-01T00:00:00Z',
  author: { name: 'Thiago Figueiredo', url: '/about' },
  reviewer: { name: 'Jane CPA', credential: 'CPA', date: '2026-04-02' },
  heroImage: null,
  citations: [{ label: 'IRS Rev. Proc. 2025-32', url: 'https://irs.gov/x', publishedAt: '2025-11-09' }],
  jurisdiction: 'US',
}

describe('articleJsonLd', () => {
  it('emits required Article fields with absolute URLs', () => {
    const ld = articleJsonLd(pillar, 'pillar')
    expect(ld['@context']).toBe('https://schema.org')
    expect(ld['@type']).toBe('Article')
    expect(ld.headline).toBe('US Tax Basics')
    expect(ld.inLanguage).toBe('en')
    expect(ld.image).toBe('https://finreckoner.com/og/default.png')
    expect(ld.datePublished).toBe('2026-04-15T00:00:00Z')
    expect(ld.dateModified).toBe('2026-04-15T00:00:00Z')
    expect(ld.author).toEqual({ '@type': 'Person', name: 'Thiago Figueiredo', url: 'https://finreckoner.com/about' })
    expect(ld.publisher.logo.url).toBe('https://finreckoner.com/logo.png')
    expect(ld.mainEntityOfPage['@id']).toBe('https://finreckoner.com/pillars/us-tax-basics')
    expect(ld.citation).toHaveLength(1)
    expect(ld.citation[0].url).toBe('https://irs.gov/x')
  })
  it('omits author.url when absent (null-safe)', () => {
    const ld = articleJsonLd({ ...pillar, author: { name: 'Someone' } }, 'pillar')
    expect(ld.author).toEqual({ '@type': 'Person', name: 'Someone' })
  })
  it('omits author entirely when null', () => {
    const ld = articleJsonLd({ ...pillar, author: null }, 'pillar')
    expect(ld.author).toBeUndefined()
  })
  it('omits citation array when empty', () => {
    const ld = articleJsonLd({ ...pillar, citations: [] }, 'pillar')
    expect(ld.citation).toBeUndefined()
  })
  it('falls back to defaultOgImage when heroImage null', () => {
    const ld = articleJsonLd(pillar, 'pillar')
    expect(ld.image).toBe('https://finreckoner.com/og/default.png')
  })
})

describe('breadcrumbJsonLd', () => {
  it('emits positions starting at 1, last item has no item url', () => {
    const ld = breadcrumbJsonLd([
      { label: 'Home', url: '/' },
      { label: 'Pillars', url: '/pillars' },
      { label: 'US Tax Basics' },
    ])
    expect(ld.itemListElement[0]).toMatchObject({ position: 1, name: 'Home', item: 'https://finreckoner.com/' })
    expect(ld.itemListElement[1]).toMatchObject({ position: 2, name: 'Pillars', item: 'https://finreckoner.com/pillars' })
    expect(ld.itemListElement[2].item).toBeUndefined()
  })
})

describe('organizationJsonLd', () => {
  it('emits Organization with sameAs array', () => {
    const ld = organizationJsonLd()
    expect(ld['@type']).toBe('Organization')
    expect(ld.sameAs).toEqual(['https://twitter.com/tnfigueiredo'])
    expect(ld.logo).toBe('https://finreckoner.com/logo.png')
  })
})

describe('snapshot stability', () => {
  it('pillar article JSON-LD snapshot', () => {
    expect(articleJsonLd(pillar, 'pillar')).toMatchSnapshot()
  })
})
```

- [ ] **Step 2: Run — expect FAIL**

`npx vitest run src/lib/__tests__/json-ld.test.ts`

- [ ] **Step 3: Implement**

```ts
// apps/web/src/lib/json-ld.ts
import { SITE_CONFIG } from '@/lib/site-config'
import { toAbsolute } from '@/lib/url'
import type { PillarMock, PostMock } from '@/lib/content'

type Breadcrumb = { label: string; url?: string }

export function articleJsonLd(entity: PillarMock | PostMock, kind: 'pillar' | 'post') {
  const routePrefix = kind === 'pillar' ? '/pillars' : '/blog'
  const datePublished = 'publishedAt' in entity ? entity.publishedAt : entity.updatedAt
  return {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: entity.title,
    description: entity.subtitle,
    inLanguage: 'en',
    image: toAbsolute(entity.heroImage ?? SITE_CONFIG.defaultOgImage),
    datePublished,
    dateModified: entity.updatedAt,
    author: entity.author ? {
      '@type': 'Person',
      name: entity.author.name,
      ...(entity.author.url ? { url: toAbsolute(entity.author.url) } : {}),
    } : undefined,
    publisher: {
      '@type': 'Organization',
      name: SITE_CONFIG.organization.name,
      logo: {
        '@type': 'ImageObject',
        url: toAbsolute(SITE_CONFIG.organization.logoUrl),
      },
    },
    mainEntityOfPage: {
      '@type': 'WebPage',
      '@id': toAbsolute(`${routePrefix}/${entity.slug}`),
    },
    citation: entity.citations?.length
      ? entity.citations.map(c => ({
          '@type': 'CreativeWork',
          name: c.label,
          url: toAbsolute(c.url),
          datePublished: c.publishedAt,
        }))
      : undefined,
  }
}

export function breadcrumbJsonLd(items: Breadcrumb[]) {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, i) => ({
      '@type': 'ListItem',
      position: i + 1,
      name: item.label,
      ...(item.url ? { item: toAbsolute(item.url) } : {}),
    })),
  }
}

export function organizationJsonLd() {
  return {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: SITE_CONFIG.organization.name,
    url: SITE_CONFIG.url,
    logo: toAbsolute(SITE_CONFIG.organization.logoUrl),
    ...(SITE_CONFIG.organization.sameAs?.length ? { sameAs: SITE_CONFIG.organization.sameAs } : {}),
  }
}
```

- [ ] **Step 4: Run — expect PASS**

`npx vitest run src/lib/__tests__/json-ld.test.ts`

Snapshot file is created on first run at `apps/web/src/lib/__tests__/__snapshots__/json-ld.test.ts.snap`.

- [ ] **Step 5: Commit**

```bash
git add apps/web/src/lib/json-ld.ts apps/web/src/lib/__tests__/
git commit -m "feat(web): add Article/BreadcrumbList/Organization JSON-LD builders"
```

**Note:** This task depends on `site-config.ts` exposing `siteName`, `defaultOgImage`, `organization.{name,logoUrl,sameAs}`. These are added in Task 6.

---

## Task 6 — Extend `site-config.ts` with YMYL fields `[G0.5]` (must land before G1 runs)

**Files:**
- Modify: `apps/web/src/lib/site-config.ts`
- Modify: `apps/web/scripts/check-site-config-immutability.sh` (if needed — verify doesn't block new fields)

- [ ] **Step 1: Read current `check-site-config-immutability.sh`**

```bash
cat apps/web/scripts/check-site-config-immutability.sh 2>/dev/null || cat scripts/check-site-config-immutability.sh 2>/dev/null
```

If the script only protects `launchedAt` field, new fields can be added without label. If it protects the whole file, add the `allow-launch-date-edit` label to this PR (documented in CLAUDE.md).

- [ ] **Step 2: Add YMYL fields**

```ts
// apps/web/src/lib/site-config.ts
// IMMUTABLE: launchedAt is locked at sprint S0 close. CI guards against unauthorized edits.
// To edit launchedAt, add the 'allow-launch-date-edit' label to the PR.

export const SITE_CONFIG = {
  launchedAt: '2026-04-29',
  deployedAt: process.env.VERCEL_GIT_COMMIT_SHA
    ? new Date().toISOString()
    : 'dev',
  url: 'https://finreckoner.com',
  siteName: 'finreckoner',
  defaultLocales: ['en-US', 'en-CA'] as const,
  defaultOgImage: 'https://finreckoner.com/og/default.png',  // 1200x630 PNG, TODO asset to be committed in Task 6.5
  author: {
    name: 'Thiago Figueiredo',
    url: '/about',
  },
  organization: {
    name: 'finreckoner',
    logoUrl: 'https://finreckoner.com/logo.png',  // TODO asset to be committed in Task 6.5
    sameAs: [] as string[],  // populated post-launch when social profiles go live
  },
} as const
```

- [ ] **Step 3: Create placeholder OG image + logo asset files**

```bash
cd apps/web/public
mkdir -p og
# If imagemagick available; otherwise skip and commit README placeholder:
convert -size 1200x630 xc:'#0f172a' \
  -gravity center -pointsize 72 -fill white -annotate 0 'finreckoner' \
  og/default.png 2>/dev/null || \
  echo "# OG image — replace with branded 1200x630 PNG before launch" > og/default.png.README
# Same for logo — min 112px height, AR between 1:1 and 16:9:
convert -size 512x512 xc:'#0f172a' \
  -gravity center -pointsize 64 -fill white -annotate 0 'fr' \
  logo.png 2>/dev/null || \
  echo "# Logo — replace with branded PNG (min 112px height)" > logo.png.README
```

**If imagemagick unavailable**, use Claude to generate placeholder SVGs converted to PNG via `sharp` (already in Next dep tree), OR commit README placeholders + add TODO to replace pre-launch.

- [ ] **Step 4: Verify typecheck + existing tests pass**

```bash
cd apps/web
npm run typecheck
npm test
```

- [ ] **Step 5: Commit**

```bash
git add apps/web/src/lib/site-config.ts apps/web/public/og/ apps/web/public/logo.png*
git commit -m "feat(web): extend site-config with YMYL fields (siteName, defaultOgImage, author, organization)"
```

---

## Task 7 — JsonLd component (XSS-safe) `[G2]`

**Files:**
- Create: `apps/web/src/components/ui/json-ld.tsx`
- Create: `apps/web/src/components/ui/__tests__/json-ld.test.tsx`

- [ ] **Step 1: Write test**

```tsx
// apps/web/src/components/ui/__tests__/json-ld.test.tsx
import { describe, it, expect } from 'vitest'
import { renderToStaticMarkup } from 'react-dom/server'
import { JsonLd } from '../json-ld'

describe('JsonLd', () => {
  it('renders a script tag with application/ld+json', () => {
    const html = renderToStaticMarkup(<JsonLd data={{ a: 1 }} />)
    expect(html).toContain('<script type="application/ld+json">')
    expect(html).toContain('"a":1')
  })
  it('escapes </script> sequences', () => {
    const html = renderToStaticMarkup(<JsonLd data={{ x: '</script><script>alert(1)</script>' }} />)
    expect(html).not.toMatch(/<\/script><script/)
    expect(html).toContain('\\u003c/script')
  })
})
```

- [ ] **Step 2: Run — expect FAIL**

- [ ] **Step 3: Implement**

```tsx
// apps/web/src/components/ui/json-ld.tsx
export function JsonLd({ data }: { data: unknown }) {
  const json = JSON.stringify(data).replace(/</g, '\\u003c')
  return <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: json }} />
}
```

- [ ] **Step 4: Run — expect PASS**

- [ ] **Step 5: Commit**

```bash
git add apps/web/src/components/ui/json-ld.tsx apps/web/src/components/ui/__tests__/
git commit -m "feat(web): add XSS-safe JsonLd component"
```

---

## Task 8 — Fixtures + content seam `[G3]`

**Files:**
- Create: `apps/web/src/__fixtures__/author.mock.ts`
- Create: `apps/web/src/__fixtures__/reviewer.mock.ts`
- Create: `apps/web/src/__fixtures__/pillar.mock.ts`
- Create: `apps/web/src/__fixtures__/post.mock.ts`
- Create: `apps/web/src/lib/content.ts`
- Create: `apps/web/src/lib/__tests__/content.test.ts`

- [ ] **Step 1: Author + reviewer fixtures**

```ts
// apps/web/src/__fixtures__/author.mock.ts
// INTERNAL — replace on CMS integration. Not exported from barrel.
export const authorFixture = {
  name: 'Thiago Figueiredo',
  url: '/about',
}

// apps/web/src/__fixtures__/reviewer.mock.ts
export const reviewerFixture = {
  name: 'Jane CPA',
  credential: 'CPA (US + CA)',
  date: '2026-04-10',
}
```

- [ ] **Step 2: Pillar fixture**

```ts
// apps/web/src/__fixtures__/pillar.mock.ts
// INTERNAL — replace on CMS integration.
import { authorFixture } from './author.mock'
import { reviewerFixture } from './reviewer.mock'

export const pillarFixture = {
  slug: 'us-ca-tax-basics',
  title: 'US & CA tax basics for multi-currency creators',
  subtitle: 'What freelancers earning across borders need to know before April',
  body: null,  // ContentBody opaque; swapped on CMS integration
  updatedAt: '2026-04-15T00:00:00Z',
  reviewedAt: '2026-04-10T00:00:00Z',
  author: authorFixture,
  reviewer: reviewerFixture,
  heroImage: null,
  citations: [
    { label: 'IRS Rev. Proc. 2025-32', url: 'https://www.irs.gov/pub/irs-drop/rp-25-32.pdf', publishedAt: '2025-11-09' },
    { label: 'CRA T4127 January 2026', url: 'https://www.canada.ca/en/revenue-agency/services/forms-publications/payroll/t4127.html', publishedAt: '2026-01-01' },
  ],
  jurisdiction: 'US-CA' as const,
}
```

- [ ] **Step 3: Post fixture**

```ts
// apps/web/src/__fixtures__/post.mock.ts
import { authorFixture } from './author.mock'
import { reviewerFixture } from './reviewer.mock'

export const postFixture = {
  slug: 'wise-vs-traditional-banks-transfer-fees',
  title: 'Wise vs traditional banks: transfer fees for cross-border freelancers',
  subtitle: 'How to save $300+/yr on USD→CAD payroll conversions',
  body: null,
  updatedAt: '2026-04-12T00:00:00Z',
  reviewedAt: '2026-04-10T00:00:00Z',
  publishedAt: '2026-04-12T00:00:00Z',
  author: authorFixture,
  reviewer: reviewerFixture,
  heroImage: null,
  citations: [],
  jurisdiction: 'US-CA' as const,
  hasAffiliateLinks: true,
}
```

- [ ] **Step 4: Content seam**

```ts
// apps/web/src/lib/content.ts
// INTERNAL — these function signatures AND types will be rewritten on CMS integration.
// DO NOT treat as stable. DO NOT export from any barrel.
import type { ReactNode } from 'react'
import { pillarFixture } from '@/__fixtures__/pillar.mock'
import { postFixture } from '@/__fixtures__/post.mock'

export type AuthorMock = { name: string; url?: string }
export type ReviewerMock = { name: string; credential: string; date: string }
export type CitationMock = { label: string; url: string; publishedAt: string }
export type PillarMock = {
  slug: string
  title: string
  subtitle: string
  body: ReactNode
  updatedAt: string
  reviewedAt?: string | null
  author?: AuthorMock | null
  reviewer?: ReviewerMock | null
  heroImage?: string | null
  citations?: CitationMock[] | null
  jurisdiction?: 'US' | 'CA' | 'US-CA' | null
}
export type PostMock = PillarMock & {
  publishedAt: string
  hasAffiliateLinks?: boolean
}

const PILLARS: PillarMock[] = [pillarFixture]
const POSTS: PostMock[] = [postFixture]

export async function getPillarSlugs(): Promise<string[]> {
  return PILLARS.map(p => p.slug)
}
export async function getPillarBySlug(slug: string): Promise<PillarMock | null> {
  return PILLARS.find(p => p.slug === slug) ?? null
}
export async function getAllPillars(): Promise<PillarMock[]> {
  return PILLARS
}
export async function getPostSlugs(): Promise<string[]> {
  return POSTS.map(p => p.slug)
}
export async function getPostBySlug(slug: string): Promise<PostMock | null> {
  return POSTS.find(p => p.slug === slug) ?? null
}
export async function getAllPosts(): Promise<PostMock[]> {
  return POSTS
}
```

- [ ] **Step 5: Content tests**

```ts
// apps/web/src/lib/__tests__/content.test.ts
import { describe, it, expect } from 'vitest'
import {
  getPillarSlugs, getPillarBySlug, getAllPillars,
  getPostSlugs, getPostBySlug, getAllPosts,
} from '../content'

describe('content seam', () => {
  it('getPillarSlugs returns fixture slugs', async () => {
    expect(await getPillarSlugs()).toContain('us-ca-tax-basics')
  })
  it('getPillarBySlug returns null for unknown', async () => {
    expect(await getPillarBySlug('nonexistent')).toBeNull()
  })
  it('getPillarBySlug returns object for known', async () => {
    const p = await getPillarBySlug('us-ca-tax-basics')
    expect(p?.title).toContain('tax basics')
  })
  it('getAllPosts returns array with at least one', async () => {
    expect((await getAllPosts()).length).toBeGreaterThan(0)
  })
  it('getPostBySlug null for unknown', async () => {
    expect(await getPostBySlug('nope')).toBeNull()
  })
})
```

- [ ] **Step 6: Run — expect PASS**

`npx vitest run src/lib/__tests__/content.test.ts`

- [ ] **Step 7: Commit**

```bash
git add apps/web/src/__fixtures__/ apps/web/src/lib/content.ts apps/web/src/lib/__tests__/content.test.ts
git commit -m "feat(web): add content seam + fixtures (internal shape, CMS-swap-ready)"
```

---

## Task 9 — globals.css typography + motion-safe `[G3]`

**Files:**
- Modify: `apps/web/src/app/globals.css`

- [ ] **Step 1: Read current globals.css**

```bash
cat apps/web/src/app/globals.css
```

- [ ] **Step 2: Prepend @plugin + add motion-safe utility**

At the top of `apps/web/src/app/globals.css`, before any existing `@import` directives, add:

```css
@plugin "@tailwindcss/typography";
```

If existing file uses `@import "tailwindcss"`, place `@plugin` directive immediately after that import.

- [ ] **Step 3: Verify Tailwind v4 compiles**

```bash
cd apps/web
npm run dev
```
Expected: dev server starts without Tailwind errors. Open `http://localhost:3000/`; homepage still renders. Ctrl+C.

**If `@plugin` directive fails** (R19): fallback is a hand-written prose styles block. Add directly in `globals.css`:

```css
.prose { max-width: 65ch; color: #334155; }
.prose h1 { font-size: 2.25rem; font-weight: 700; margin: 2rem 0 1rem; color: #0f172a; }
.prose h2 { font-size: 1.75rem; font-weight: 700; margin: 1.5rem 0 0.75rem; color: #0f172a; }
.prose h3 { font-size: 1.25rem; font-weight: 600; margin: 1.25rem 0 0.5rem; color: #0f172a; }
.prose p { margin: 1rem 0; line-height: 1.7; }
.prose a { color: #2563eb; text-decoration: underline; }
.prose ul, .prose ol { margin: 1rem 0; padding-left: 1.5rem; }
.prose li { margin: 0.5rem 0; }
.prose code { background: #f1f5f9; padding: 0.125rem 0.375rem; border-radius: 0.25rem; font-size: 0.875em; }
```

Document the fallback decision in the ADR 007 body (Task 32).

- [ ] **Step 4: Commit**

```bash
git add apps/web/src/app/globals.css
git commit -m "feat(web): enable @tailwindcss/typography plugin"
```

---

## Task 10 — Breadcrumb component `[G4]` (parallel with Tasks 11–14)

**Files:**
- Create: `apps/web/src/components/layout/breadcrumb.tsx`
- Create: `apps/web/src/components/layout/__tests__/breadcrumb.test.tsx`

- [ ] **Step 1: Write test**

```tsx
// apps/web/src/components/layout/__tests__/breadcrumb.test.tsx
import { describe, it, expect } from 'vitest'
import { render } from '@testing-library/react'
import { Breadcrumb } from '../breadcrumb'

describe('Breadcrumb', () => {
  it('renders nav + visible links + JSON-LD', () => {
    const { container } = render(
      <Breadcrumb items={[
        { label: 'Home', url: '/' },
        { label: 'Pillars', url: '/pillars' },
        { label: 'US Tax Basics' },
      ]} />
    )
    expect(container.querySelector('nav[aria-label="Breadcrumb"]')).toBeTruthy()
    expect(container.querySelectorAll('a').length).toBe(2)  // last item not a link
    expect(container.querySelector('script[type="application/ld+json"]')?.textContent).toContain('BreadcrumbList')
  })
})
```

- [ ] **Step 2: Run — expect FAIL**

- [ ] **Step 3: Implement**

```tsx
// apps/web/src/components/layout/breadcrumb.tsx
import Link from 'next/link'
import { JsonLd } from '@/components/ui/json-ld'
import { breadcrumbJsonLd } from '@/lib/json-ld'

type Item = { label: string; url?: string }

export function Breadcrumb({ items }: { items: Item[] }) {
  return (
    <>
      <nav aria-label="Breadcrumb" className="text-sm text-slate-600 mb-4">
        <ol className="flex flex-wrap gap-2">
          {items.map((item, i) => (
            <li key={i} className="flex items-center gap-2">
              {item.url ? (
                <Link href={item.url} className="underline hover:text-slate-900">{item.label}</Link>
              ) : (
                <span aria-current="page" className="text-slate-900">{item.label}</span>
              )}
              {i < items.length - 1 && <span aria-hidden="true">›</span>}
            </li>
          ))}
        </ol>
      </nav>
      <JsonLd data={breadcrumbJsonLd(items)} />
    </>
  )
}
```

- [ ] **Step 4: Run — expect PASS**

- [ ] **Step 5: Commit**

```bash
git add apps/web/src/components/layout/
git commit -m "feat(web): add Breadcrumb component (visible + BreadcrumbList JSON-LD)"
```

---

## Task 11 — SkipLink component `[G4]`

**Files:**
- Create: `apps/web/src/components/layout/skip-link.tsx`

- [ ] **Step 1: Implement (no test needed — pure markup)**

```tsx
// apps/web/src/components/layout/skip-link.tsx
export function SkipLink() {
  return (
    <a
      href="#main-content"
      className="sr-only focus:not-sr-only focus:fixed focus:left-2 focus:top-2 focus:z-50 focus:rounded focus:bg-white focus:px-3 focus:py-2 focus:shadow focus:ring-2 focus:ring-blue-500"
    >
      Skip to content
    </a>
  )
}
```

- [ ] **Step 2: Commit**

```bash
git add apps/web/src/components/layout/skip-link.tsx
git commit -m "feat(web): add SkipLink component (WCAG 2.2 AA)"
```

---

## Task 12 — ContentBody component `[G4]`

**Files:**
- Create: `apps/web/src/components/ui/content-body.tsx`

- [ ] **Step 1: Implement**

```tsx
// apps/web/src/components/ui/content-body.tsx
import type { ReactNode } from 'react'

export function ContentBody({ children }: { children: ReactNode }) {
  return <div className="prose prose-slate max-w-none">{children}</div>
}
```

- [ ] **Step 2: Commit**

```bash
git add apps/web/src/components/ui/content-body.tsx
git commit -m "feat(web): add ContentBody prose shell"
```

---

## Task 13 — ShareButtons component `[G4]`

**Files:**
- Create: `apps/web/src/components/ui/share-buttons.tsx`
- Create: `apps/web/src/components/ui/copy-link-button.tsx` (client)

- [ ] **Step 1: Implement CopyLinkButton (client)**

```tsx
// apps/web/src/components/ui/copy-link-button.tsx
'use client'
import { useState } from 'react'

export function CopyLinkButton({ url }: { url: string }) {
  const [copied, setCopied] = useState(false)
  return (
    <button
      type="button"
      onClick={async () => {
        try {
          await navigator.clipboard.writeText(url)
          setCopied(true)
          setTimeout(() => setCopied(false), 2000)
        } catch { /* silent: clipboard unavailable */ }
      }}
      className="underline text-sm hover:text-slate-900"
      aria-label="Copy link to this page"
    >
      {copied ? 'Copied!' : 'Copy link'}
    </button>
  )
}
```

- [ ] **Step 2: Implement ShareButtons (server)**

```tsx
// apps/web/src/components/ui/share-buttons.tsx
import { CopyLinkButton } from './copy-link-button'

export function ShareButtons({ url, title }: { url: string; title: string }) {
  const u = encodeURIComponent(url)
  const t = encodeURIComponent(title)
  return (
    <div className="flex flex-wrap gap-4 text-sm text-slate-600 mt-8">
      <span className="font-medium">Share:</span>
      <a href={`https://x.com/intent/tweet?url=${u}&text=${t}`} target="_blank" rel="noopener noreferrer" className="underline hover:text-slate-900">X</a>
      <a href={`https://www.linkedin.com/sharing/share-offsite/?url=${u}`} target="_blank" rel="noopener noreferrer" className="underline hover:text-slate-900">LinkedIn</a>
      <a href={`https://www.reddit.com/submit?url=${u}&title=${t}`} target="_blank" rel="noopener noreferrer" className="underline hover:text-slate-900">Reddit</a>
      <CopyLinkButton url={url} />
    </div>
  )
}
```

- [ ] **Step 3: Commit**

```bash
git add apps/web/src/components/ui/share-buttons.tsx apps/web/src/components/ui/copy-link-button.tsx
git commit -m "feat(web): add ShareButtons (X/LinkedIn/Reddit + client Copy)"
```

---

## Task 14 — Card components (PillarCard, PostCard) `[G4]`

**Files:**
- Create: `apps/web/src/components/ui/pillar-card.tsx`
- Create: `apps/web/src/components/ui/post-card.tsx`

- [ ] **Step 1: Implement PillarCard**

```tsx
// apps/web/src/components/ui/pillar-card.tsx
import Link from 'next/link'
import type { PillarMock } from '@/lib/content'

export function PillarCard({ pillar }: { pillar: PillarMock }) {
  return (
    <Link href={`/pillars/${pillar.slug}`} className="block rounded border border-slate-200 bg-white p-6 hover:border-slate-400 hover:shadow transition">
      <h3 className="text-lg font-semibold text-slate-900">{pillar.title}</h3>
      <p className="mt-2 text-sm text-slate-600">{pillar.subtitle}</p>
    </Link>
  )
}
```

- [ ] **Step 2: Implement PostCard**

```tsx
// apps/web/src/components/ui/post-card.tsx
import Link from 'next/link'
import { formatDate } from '@/lib/format'
import type { PostMock } from '@/lib/content'

export function PostCard({ post }: { post: PostMock }) {
  return (
    <Link href={`/blog/${post.slug}`} className="block border-b border-slate-200 py-6 hover:bg-slate-50 transition px-2">
      <h3 className="text-lg font-semibold text-slate-900">{post.title}</h3>
      <p className="mt-1 text-sm text-slate-600">{post.subtitle}</p>
      <p className="mt-2 text-xs text-slate-500">
        <time dateTime={post.publishedAt}>{formatDate(post.publishedAt)}</time>
      </p>
    </Link>
  )
}
```

- [ ] **Step 3: Commit**

```bash
git add apps/web/src/components/ui/pillar-card.tsx apps/web/src/components/ui/post-card.tsx
git commit -m "feat(web): add PillarCard + PostCard"
```

---

## Task 15 — PillarTemplate `[G5]` (parallel with Task 16)

**Files:**
- Create: `apps/web/src/components/templates/pillar-template.tsx`
- Create: `apps/web/src/components/templates/__tests__/pillar-template.test.tsx`

- [ ] **Step 1: Write test**

```tsx
// apps/web/src/components/templates/__tests__/pillar-template.test.tsx
import { describe, it, expect } from 'vitest'
import { render } from '@testing-library/react'
import { PillarTemplate } from '../pillar-template'
import { pillarFixture } from '@/__fixtures__/pillar.mock'

describe('PillarTemplate', () => {
  it('renders h1, author byline, disclaimer, citations', () => {
    const { container, getByText } = render(
      <PillarTemplate pillar={pillarFixture} content={<p>body content</p>} />
    )
    expect(container.querySelector('h1')?.textContent).toBe(pillarFixture.title)
    expect(getByText(/By/)).toBeTruthy()
    expect(getByText(/Informational only/)).toBeTruthy()
    expect(getByText('Sources')).toBeTruthy()
    expect(container.querySelector('script[type="application/ld+json"]')).toBeTruthy()
  })
  it('omits citations section when empty', () => {
    const pillar = { ...pillarFixture, citations: [] }
    const { queryByText } = render(<PillarTemplate pillar={pillar} content={null} />)
    expect(queryByText('Sources')).toBeNull()
  })
  it('omits reviewer when null', () => {
    const pillar = { ...pillarFixture, reviewer: null }
    const { queryByText } = render(<PillarTemplate pillar={pillar} content={null} />)
    expect(queryByText(/Reviewed by/)).toBeNull()
  })
})
```

- [ ] **Step 2: Run — expect FAIL**

- [ ] **Step 3: Implement**

```tsx
// apps/web/src/components/templates/pillar-template.tsx
import type { ReactNode } from 'react'
import type { PillarMock } from '@/lib/content'
import { Breadcrumb } from '@/components/layout/breadcrumb'
import { ContentBody } from '@/components/ui/content-body'
import { JsonLd } from '@/components/ui/json-ld'
import { articleJsonLd } from '@/lib/json-ld'
import { formatDate, formatYearMonth } from '@/lib/format'

export function PillarTemplate({ pillar, content }: { pillar: PillarMock; content: ReactNode }) {
  const reviewDate = pillar.reviewedAt ?? pillar.updatedAt
  return (
    <article className="mx-auto max-w-3xl px-4 py-10">
      <Breadcrumb items={[
        { label: 'Home', url: '/' },
        { label: 'Pillars', url: '/pillars' },
        { label: pillar.title },
      ]} />

      <header>
        <h1 className="text-4xl font-bold text-slate-900">{pillar.title}</h1>
        <p className="mt-3 text-lg text-slate-600">{pillar.subtitle}</p>
      </header>

      {/* POST-WAVE-3: replace with <AuthorByline>+<ReviewerByline>+<LastReviewed> from @tn-figueiredo/ymyl-ui */}
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
        <p>Last reviewed:{' '}
          <time dateTime={reviewDate}>{formatYearMonth(reviewDate)}</time>
        </p>
      </div>

      {/* POST-WAVE-3: replace with <Disclaimer inline /> from @tn-figueiredo/ymyl-ui */}
      <aside role="note" className="my-6 rounded border-l-4 border-amber-400 bg-amber-50 p-4 text-sm">
        <p>
          <strong>Informational only.</strong> Not tax, legal, or financial advice.
          Consult a licensed professional for your situation.{' '}
          <a href="/legal/disclaimer" className="underline">Full disclaimer</a>.
        </p>
      </aside>

      <ContentBody>{content}</ContentBody>

      {/* POST-WAVE-3: replace with <Jurisdiction jurisdiction={pillar.jurisdiction}/> from @tn-figueiredo/ymyl-ui */}
      <p className="text-sm text-slate-500 mt-8">
        Jurisdiction: {pillar.jurisdiction ?? 'US federal / CA federal + provincial'}. State/provincial rules may vary.
      </p>

      {/* POST-WAVE-3: replace with <Citations citations={pillar.citations}/> from @tn-figueiredo/ymyl-ui */}
      {pillar.citations && pillar.citations.length > 0 && (
        <section aria-labelledby="citations-heading" className="mt-12 border-t pt-6">
          <h2 id="citations-heading" className="text-lg font-semibold">Sources</h2>
          <ul className="mt-3 space-y-2 text-sm">
            {pillar.citations.map((c, i) => (
              <li key={i}>
                <a href={c.url} className="underline">{c.label}</a>
                {' '}— published <time dateTime={c.publishedAt}>{formatDate(c.publishedAt)}</time>
              </li>
            ))}
          </ul>
        </section>
      )}

      <JsonLd data={articleJsonLd(pillar, 'pillar')} />
    </article>
  )
}
```

- [ ] **Step 4: Run — expect PASS**

- [ ] **Step 5: Commit**

```bash
git add apps/web/src/components/templates/pillar-template.tsx apps/web/src/components/templates/__tests__/
git commit -m "feat(web): add PillarTemplate with 4 inline YMYL slots"
```

---

## Task 16 — PostTemplate `[G5]`

**Files:**
- Create: `apps/web/src/components/templates/post-template.tsx`
- Create: `apps/web/src/components/templates/__tests__/post-template.test.tsx`

- [ ] **Step 1: Write test**

```tsx
// apps/web/src/components/templates/__tests__/post-template.test.tsx
import { describe, it, expect } from 'vitest'
import { render } from '@testing-library/react'
import { PostTemplate } from '../post-template'
import { postFixture } from '@/__fixtures__/post.mock'

describe('PostTemplate', () => {
  it('renders FTC disclosure when hasAffiliateLinks true', () => {
    const { getByText } = render(<PostTemplate post={postFixture} content={null} />)
    expect(getByText(/Affiliate disclosure/)).toBeTruthy()
  })
  it('omits FTC when hasAffiliateLinks false', () => {
    const { queryByText } = render(
      <PostTemplate post={{ ...postFixture, hasAffiliateLinks: false }} content={null} />
    )
    expect(queryByText(/Affiliate disclosure/)).toBeNull()
  })
  it('renders ShareButtons', () => {
    const { container } = render(<PostTemplate post={postFixture} content={null} />)
    expect(container.textContent).toContain('Share:')
  })
})
```

- [ ] **Step 2: Run — expect FAIL**

- [ ] **Step 3: Implement**

```tsx
// apps/web/src/components/templates/post-template.tsx
import type { ReactNode } from 'react'
import type { PostMock } from '@/lib/content'
import { Breadcrumb } from '@/components/layout/breadcrumb'
import { ContentBody } from '@/components/ui/content-body'
import { ShareButtons } from '@/components/ui/share-buttons'
import { JsonLd } from '@/components/ui/json-ld'
import { articleJsonLd } from '@/lib/json-ld'
import { formatDate, formatYearMonth } from '@/lib/format'
import { SITE_CONFIG } from '@/lib/site-config'

export function PostTemplate({ post, content }: { post: PostMock; content: ReactNode }) {
  const reviewDate = post.reviewedAt ?? post.updatedAt
  const pageUrl = `${SITE_CONFIG.url}/blog/${post.slug}`
  return (
    <article className="mx-auto max-w-3xl px-4 py-10">
      <Breadcrumb items={[
        { label: 'Home', url: '/' },
        { label: 'Blog', url: '/blog' },
        { label: post.title },
      ]} />

      <header>
        <h1 className="text-4xl font-bold text-slate-900">{post.title}</h1>
        <p className="mt-3 text-lg text-slate-600">{post.subtitle}</p>
      </header>

      {/* POST-WAVE-3: replace with <AuthorByline>+<ReviewerByline>+<LastReviewed> from @tn-figueiredo/ymyl-ui */}
      <div className="meta mt-4 text-sm text-slate-600 space-y-1">
        {post.author && (
          <p>By{' '}
            {post.author.url
              ? <a href={post.author.url} className="underline">{post.author.name}</a>
              : post.author.name}
          </p>
        )}
        {post.reviewer && (
          <p>Reviewed by {post.reviewer.name}, {post.reviewer.credential} —{' '}
            <time dateTime={post.reviewer.date}>{formatDate(post.reviewer.date)}</time>
          </p>
        )}
        <p>
          Published <time dateTime={post.publishedAt}>{formatDate(post.publishedAt)}</time>
          {' '}· Last reviewed <time dateTime={reviewDate}>{formatYearMonth(reviewDate)}</time>
        </p>
      </div>

      {/* POST-WAVE-3: replace with <FTCDisclosure variant="above-fold"/> from @tn-figueiredo/partner-links */}
      {post.hasAffiliateLinks && (
        <aside role="note" className="my-4 rounded bg-slate-100 p-3 text-sm">
          <p>
            <strong>Affiliate disclosure:</strong> This post contains affiliate links.
            We may earn a commission at no extra cost to you.{' '}
            <a href="/legal/ftc-disclosure" className="underline">Learn how we disclose</a>.
          </p>
        </aside>
      )}

      {/* POST-WAVE-3: replace with <Disclaimer inline/> from @tn-figueiredo/ymyl-ui */}
      <aside role="note" className="my-6 rounded border-l-4 border-amber-400 bg-amber-50 p-4 text-sm">
        <p>
          <strong>Informational only.</strong> Not tax, legal, or financial advice.
          Consult a licensed professional for your situation.{' '}
          <a href="/legal/disclaimer" className="underline">Full disclaimer</a>.
        </p>
      </aside>

      <ContentBody>{content}</ContentBody>

      {/* POST-WAVE-3: replace with <Jurisdiction/> from @tn-figueiredo/ymyl-ui */}
      <p className="text-sm text-slate-500 mt-8">
        Jurisdiction: {post.jurisdiction ?? 'US federal / CA federal + provincial'}. State/provincial rules may vary.
      </p>

      {/* POST-WAVE-3: replace with <Citations/> from @tn-figueiredo/ymyl-ui */}
      {post.citations && post.citations.length > 0 && (
        <section aria-labelledby="citations-heading" className="mt-12 border-t pt-6">
          <h2 id="citations-heading" className="text-lg font-semibold">Sources</h2>
          <ul className="mt-3 space-y-2 text-sm">
            {post.citations.map((c, i) => (
              <li key={i}>
                <a href={c.url} className="underline">{c.label}</a>
                {' '}— published <time dateTime={c.publishedAt}>{formatDate(c.publishedAt)}</time>
              </li>
            ))}
          </ul>
        </section>
      )}

      <ShareButtons url={pageUrl} title={post.title} />
      <JsonLd data={articleJsonLd(post, 'post')} />
    </article>
  )
}
```

- [ ] **Step 4: Run — expect PASS**

- [ ] **Step 5: Commit**

```bash
git add apps/web/src/components/templates/post-template.tsx apps/web/src/components/templates/__tests__/post-template.test.tsx
git commit -m "feat(web): add PostTemplate with 5 inline YMYL slots + ShareButtons"
```

---

## Task 17 — Index templates `[G6]` (parallel)

**Files:**
- Create: `apps/web/src/components/templates/pillar-index.tsx`
- Create: `apps/web/src/components/templates/post-index.tsx`

- [ ] **Step 1: PillarIndex**

```tsx
// apps/web/src/components/templates/pillar-index.tsx
import type { PillarMock } from '@/lib/content'
import { PillarCard } from '@/components/ui/pillar-card'

export function PillarIndex({ pillars }: { pillars: PillarMock[] }) {
  return (
    <main id="main-content" className="mx-auto max-w-5xl px-4 py-10">
      <header className="mb-10">
        <h1 className="text-4xl font-bold text-slate-900">Pillars</h1>
        <p className="mt-3 text-lg text-slate-600">Comprehensive guides for cross-border creators and freelancers.</p>
      </header>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {pillars.map(p => <PillarCard key={p.slug} pillar={p} />)}
      </div>
    </main>
  )
}
```

- [ ] **Step 2: PostIndex**

```tsx
// apps/web/src/components/templates/post-index.tsx
import type { PostMock } from '@/lib/content'
import { PostCard } from '@/components/ui/post-card'

export function PostIndex({ posts }: { posts: PostMock[] }) {
  return (
    <main id="main-content" className="mx-auto max-w-3xl px-4 py-10">
      <header className="mb-6">
        <h1 className="text-4xl font-bold text-slate-900">Blog</h1>
        <p className="mt-3 text-lg text-slate-600">Deep-dives on taxes, currency, and cross-border finance.</p>
      </header>
      <div>
        {posts.map(p => <PostCard key={p.slug} post={p} />)}
      </div>
    </main>
  )
}
```

- [ ] **Step 3: Commit**

```bash
git add apps/web/src/components/templates/pillar-index.tsx apps/web/src/components/templates/post-index.tsx
git commit -m "feat(web): add PillarIndex + PostIndex"
```

---

## Task 18 — RootLayout extension (SkipLink + Org JSON-LD + robots) `[G7]`

**Files:**
- Modify: `apps/web/src/app/layout.tsx`

- [ ] **Step 1: Update layout.tsx**

```tsx
// apps/web/src/app/layout.tsx
import './globals.css'
import type { Metadata } from 'next'
import { Footer } from '@/components/Footer'
import { SITE_CONFIG } from '@/lib/site-config'
import { SkipLink } from '@/components/layout/skip-link'
import { JsonLd } from '@/components/ui/json-ld'
import { organizationJsonLd } from '@/lib/json-ld'

export const metadata: Metadata = {
  title: 'finreckoner — Financial calculators for creators',
  description: 'Multi-country, multi-currency tax & finance calculators built for creators, freelancers, and remote workers.',
  alternates: {
    canonical: SITE_CONFIG.url,
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      'max-image-preview': 'large',
      'max-snippet': -1,
      'max-video-preview': -1,
    },
  },
}

export function generateViewport() {
  return { colorScheme: 'light' as const, themeColor: '#ffffff' }
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <SkipLink />
        {children}
        <Footer />
        <JsonLd data={organizationJsonLd()} />
      </body>
    </html>
  )
}
```

- [ ] **Step 2: Verify typecheck**

```bash
cd apps/web
npm run typecheck
```

- [ ] **Step 3: Commit**

```bash
git add apps/web/src/app/layout.tsx
git commit -m "feat(web): extend RootLayout with SkipLink + Organization JSON-LD + robots googleBot directives"
```

---

## Task 19 — Error boundaries `[G7]`

**Files:**
- Create: `apps/web/src/app/not-found.tsx`
- Create: `apps/web/src/app/global-error.tsx`

- [ ] **Step 1: not-found.tsx**

```tsx
// apps/web/src/app/not-found.tsx
import Link from 'next/link'

export default function NotFound() {
  return (
    <main id="main-content" className="mx-auto max-w-2xl px-4 py-20 text-center">
      <h1 className="text-5xl font-bold text-slate-900">Page not found</h1>
      <p className="mt-4 text-lg text-slate-600">The page you're looking for doesn't exist or has moved.</p>
      <nav className="mt-8 flex flex-wrap gap-4 justify-center text-sm" aria-label="Site navigation">
        <Link href="/" className="underline">Home</Link>
        <Link href="/pillars" className="underline">Pillars</Link>
        <Link href="/blog" className="underline">Blog</Link>
      </nav>
    </main>
  )
}
```

- [ ] **Step 2: global-error.tsx**

```tsx
// apps/web/src/app/global-error.tsx
'use client'

export default function GlobalError({ error, reset }: { error: Error; reset: () => void }) {
  // eslint-disable-next-line no-console
  console.error('GlobalError boundary caught:', error)
  return (
    <html lang="en">
      <body>
        <main className="mx-auto max-w-2xl px-4 py-20 text-center">
          <h1 className="text-3xl font-bold text-slate-900">Something went wrong</h1>
          <p className="mt-4 text-slate-600">We're sorry — an unexpected error occurred.</p>
          <button
            type="button"
            onClick={() => reset()}
            className="mt-6 rounded bg-slate-900 px-4 py-2 text-white hover:bg-slate-700"
          >
            Try again
          </button>
        </main>
      </body>
    </html>
  )
}
```

- [ ] **Step 3: Commit**

```bash
git add apps/web/src/app/not-found.tsx apps/web/src/app/global-error.tsx
git commit -m "feat(web): add not-found + global-error boundaries"
```

---

## Task 20 — Pillar routes `[G8]` (parallel with Task 21)

**Files:**
- Create: `apps/web/src/app/pillars/page.tsx`
- Create: `apps/web/src/app/pillars/loading.tsx`
- Create: `apps/web/src/app/pillars/error.tsx`
- Create: `apps/web/src/app/pillars/[slug]/page.tsx`
- Create: `apps/web/src/app/pillars/[slug]/loading.tsx`
- Create: `apps/web/src/app/pillars/[slug]/error.tsx`

- [ ] **Step 1: /pillars index**

```tsx
// apps/web/src/app/pillars/page.tsx
import type { Metadata } from 'next'
import { getAllPillars } from '@/lib/content'
import { PillarIndex } from '@/components/templates/pillar-index'
import { SITE_CONFIG } from '@/lib/site-config'

const url = `${SITE_CONFIG.url}/pillars`

export const metadata: Metadata = {
  title: `Pillars — ${SITE_CONFIG.siteName}`,
  description: 'Comprehensive guides for cross-border creators and freelancers.',
  alternates: { canonical: url, languages: { 'en-US': url, 'en-CA': url, 'x-default': url } },
  openGraph: { title: 'Pillars', description: 'Cross-border creator guides', url, siteName: SITE_CONFIG.siteName, type: 'website' },
}

export default async function PillarsPage() {
  const pillars = await getAllPillars()
  return <PillarIndex pillars={pillars} />
}
```

- [ ] **Step 2: /pillars/[slug] detail**

```tsx
// apps/web/src/app/pillars/[slug]/page.tsx
import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { getPillarSlugs, getPillarBySlug } from '@/lib/content'
import { PillarTemplate } from '@/components/templates/pillar-template'
import { SITE_CONFIG } from '@/lib/site-config'
import { toAbsolute } from '@/lib/url'

export async function generateStaticParams() {
  const slugs = await getPillarSlugs()
  return slugs.map(slug => ({ slug }))
}

export async function generateMetadata(
  { params }: { params: Promise<{ slug: string }> },
): Promise<Metadata> {
  const { slug } = await params
  const pillar = await getPillarBySlug(slug)
  if (!pillar) return {}
  const url = toAbsolute(`/pillars/${pillar.slug}`)
  const image = toAbsolute(pillar.heroImage ?? SITE_CONFIG.defaultOgImage)
  return {
    title: `${pillar.title} — ${SITE_CONFIG.siteName}`,
    description: pillar.subtitle,
    alternates: { canonical: url, languages: { 'en-US': url, 'en-CA': url, 'x-default': url } },
    openGraph: {
      title: pillar.title, description: pillar.subtitle, url,
      siteName: SITE_CONFIG.siteName, type: 'article',
      images: [{ url: image }],
    },
    twitter: { card: 'summary_large_image' },
  }
}

export default async function PillarDetailPage(
  { params }: { params: Promise<{ slug: string }> },
) {
  const { slug } = await params
  const pillar = await getPillarBySlug(slug)
  if (!pillar) notFound()
  return (
    <main id="main-content">
      <PillarTemplate pillar={pillar} content={<p>Pillar content body will be sourced from CMS post-Wave-5. This placeholder renders until then.</p>} />
    </main>
  )
}
```

- [ ] **Step 3: loading.tsx (both levels)**

```tsx
// apps/web/src/app/pillars/loading.tsx AND apps/web/src/app/pillars/[slug]/loading.tsx (same content)
export default function Loading() {
  return (
    <main className="mx-auto max-w-3xl px-4 py-10">
      <div className="motion-safe:animate-pulse space-y-4" aria-busy="true" aria-label="Loading">
        <div className="h-10 w-3/4 rounded bg-slate-200" />
        <div className="h-5 w-1/2 rounded bg-slate-200" />
        <div className="h-4 w-full rounded bg-slate-200" />
        <div className="h-4 w-full rounded bg-slate-200" />
        <div className="h-4 w-4/5 rounded bg-slate-200" />
      </div>
    </main>
  )
}
```

- [ ] **Step 4: error.tsx (both levels, same content)**

```tsx
// apps/web/src/app/pillars/error.tsx AND apps/web/src/app/pillars/[slug]/error.tsx
'use client'

export default function Error({ error, reset }: { error: Error; reset: () => void }) {
  // eslint-disable-next-line no-console
  console.error('Pillar route error:', error)
  return (
    <main className="mx-auto max-w-2xl px-4 py-20 text-center">
      <h1 className="text-3xl font-bold text-slate-900">Couldn't load this pillar</h1>
      <p className="mt-4 text-slate-600">Something went wrong loading this page.</p>
      <button
        type="button"
        onClick={() => reset()}
        className="mt-6 rounded bg-slate-900 px-4 py-2 text-white hover:bg-slate-700"
      >
        Try again
      </button>
    </main>
  )
}
```

- [ ] **Step 5: Smoke test**

```bash
cd apps/web
npm run dev
```
Visit `http://localhost:3000/pillars` — index renders with 1 card. Visit `/pillars/us-ca-tax-basics` — detail renders. Ctrl+C.

- [ ] **Step 6: Commit**

```bash
git add apps/web/src/app/pillars/
git commit -m "feat(web): add /pillars index + detail routes with loading/error boundaries"
```

---

## Task 21 — Blog routes `[G8]`

**Files:** mirror of Task 20 for `/blog` and `/blog/[slug]`.

- [ ] **Step 1-4:** Duplicate Task 20 steps substituting:
  - `pillars` → `blog`
  - `getAllPillars` → `getAllPosts`
  - `getPillarSlugs/ByPillar` → `getPostSlugs/ByPost`
  - `PillarIndex` → `PostIndex`
  - `PillarTemplate` → `PostTemplate`
  - "pillar" → "post" in user-facing copy and error messages

Full code for `/blog/[slug]/page.tsx` is analogous to the pillar detail page. Swap imports and types. The placeholder body string: "Post content body will be sourced from CMS post-Wave-5. This placeholder renders until then."

- [ ] **Step 5: Smoke test**

Visit `/blog` and `/blog/wise-vs-traditional-banks-transfer-fees`.

- [ ] **Step 6: Commit**

```bash
git add apps/web/src/app/blog/
git commit -m "feat(web): add /blog index + detail routes with loading/error boundaries"
```

---

## Task 22 — opengraph-image.tsx (static fallback) `[G9]`

**Files:**
- Create: `apps/web/src/app/opengraph-image.tsx`

- [ ] **Step 1: Implement**

```tsx
// apps/web/src/app/opengraph-image.tsx
// Static OG image reference. Per-slug dynamic OG is a post-CMS epic.
import { ImageResponse } from 'next/og'

export const size = { width: 1200, height: 630 }
export const contentType = 'image/png'
export const runtime = 'edge'

export default async function OG() {
  return new ImageResponse(
    (
      <div style={{
        width: '100%', height: '100%',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        background: '#0f172a', color: 'white', fontSize: 80, fontWeight: 700,
        fontFamily: 'sans-serif',
      }}>
        finreckoner
      </div>
    ),
    size,
  )
}
```

**Note:** `output: 'export'` mode may not support `ImageResponse` + `runtime: 'edge'`. If Next build fails, fall back to a static PNG already at `public/og/default.png` — delete this file and rely on `defaultOgImage` URL in metadata. Document the fallback choice in ADR 007.

- [ ] **Step 2: Build test**

```bash
cd apps/web
npm run build
```
If error mentions `edge runtime` or `ImageResponse`, execute fallback: `rm apps/web/src/app/opengraph-image.tsx`.

- [ ] **Step 3: Commit (regardless of path)**

```bash
git add apps/web/src/app/opengraph-image.tsx 2>/dev/null
git commit -m "feat(web): add static OG image (or remove if static-export incompatible)" --allow-empty
```

---

## Task 23 — sitemap.ts extension `[G9]`

**Files:**
- Modify: `apps/web/src/app/sitemap.ts`

- [ ] **Step 1: Update**

```ts
// apps/web/src/app/sitemap.ts
import type { MetadataRoute } from 'next'
import { SITE_CONFIG } from '@/lib/site-config'
import { getPillarSlugs, getPostSlugs, getAllPillars, getAllPosts } from '@/lib/content'

export const dynamic = 'force-static'

const STATIC_PATHS = [
  '/',
  '/contact',
  '/pillars',
  '/blog',
  '/legal/disclaimer',
  '/legal/accuracy',
  '/legal/privacy',
  '/legal/terms',
  '/legal/ftc-disclosure',
  '/legal/dnsmpi',
] as const

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const now = new Date()
  const staticEntries = STATIC_PATHS.map(path => ({
    url: path === '/' ? SITE_CONFIG.url : `${SITE_CONFIG.url}${path}`,
    lastModified: now,
    changeFrequency: 'monthly' as const,
    priority: path === '/' ? 1 : 0.5,
  }))

  const [pillars, posts] = await Promise.all([getAllPillars(), getAllPosts()])
  const pillarEntries = pillars.map(p => ({
    url: `${SITE_CONFIG.url}/pillars/${p.slug}`,
    lastModified: new Date(p.updatedAt),
    changeFrequency: 'monthly' as const,
    priority: 0.8,
  }))
  const postEntries = posts.map(p => ({
    url: `${SITE_CONFIG.url}/blog/${p.slug}`,
    lastModified: new Date(p.updatedAt),
    changeFrequency: 'monthly' as const,
    priority: 0.6,
  }))

  return [...staticEntries, ...pillarEntries, ...postEntries]
}
```

- [ ] **Step 2: Commit**

```bash
git add apps/web/src/app/sitemap.ts
git commit -m "feat(web): extend sitemap with pillar + post entries"
```

---

## Task 24 — E2E specs `[G10]`

**Files:**
- Create: `apps/web/e2e/pillar.spec.ts`
- Create: `apps/web/e2e/post.spec.ts`
- Create: `apps/web/e2e/links.spec.ts`
- Create: `apps/web/e2e/disclaimer-fold.spec.ts`

- [ ] **Step 1: pillar.spec.ts**

```ts
// apps/web/e2e/pillar.spec.ts
import { test, expect } from '@playwright/test'

test.describe('/pillars/[slug]', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/pillars/us-ca-tax-basics')
  })

  test('renders H1, meta, disclaimer, citations', async ({ page }) => {
    await expect(page.locator('h1')).toHaveText(/tax basics/i)
    await expect(page.getByText(/By /)).toBeVisible()
    await expect(page.getByText(/Informational only/)).toBeVisible()
    await expect(page.getByText('Sources')).toBeVisible()
  })

  test('emits Article JSON-LD', async ({ page }) => {
    const ld = await page.locator('script[type="application/ld+json"]').first().textContent()
    expect(ld).toContain('"@type":"Article"')
    expect(ld).toContain('"datePublished"')
    expect(ld).toContain('"publisher"')
  })

  test('emits BreadcrumbList JSON-LD', async ({ page }) => {
    const lds = await page.locator('script[type="application/ld+json"]').allTextContents()
    expect(lds.some(ld => ld.includes('"@type":"BreadcrumbList"'))).toBe(true)
  })
})
```

- [ ] **Step 2: post.spec.ts**

```ts
// apps/web/e2e/post.spec.ts
import { test, expect } from '@playwright/test'

test('/blog/[slug] renders FTC disclosure when affiliate', async ({ page }) => {
  await page.goto('/blog/wise-vs-traditional-banks-transfer-fees')
  await expect(page.getByText(/Affiliate disclosure/)).toBeVisible()
  await expect(page.getByText(/Share:/)).toBeVisible()
})
```

- [ ] **Step 3: links.spec.ts (broken-link sanity)**

```ts
// apps/web/e2e/links.spec.ts
import { test, expect } from '@playwright/test'

test('internal navigation from home through content hits all 200s', async ({ page }) => {
  const route = async (path: string) => {
    const resp = await page.goto(path)
    expect(resp?.status()).toBeLessThan(400)
  }
  await route('/')
  await route('/pillars')
  await route('/pillars/us-ca-tax-basics')
  await route('/blog')
  await route('/blog/wise-vs-traditional-banks-transfer-fees')
})

test('external links open in new tab with rel="noopener noreferrer"', async ({ page }) => {
  await page.goto('/pillars/us-ca-tax-basics')
  const externals = page.locator('a[target="_blank"]')
  const count = await externals.count()
  for (let i = 0; i < count; i++) {
    const rel = await externals.nth(i).getAttribute('rel')
    expect(rel).toContain('noopener')
    expect(rel).toContain('noreferrer')
  }
})
```

- [ ] **Step 4: disclaimer-fold.spec.ts**

```ts
// apps/web/e2e/disclaimer-fold.spec.ts
import { test, expect } from '@playwright/test'

test.use({ viewport: { width: 390, height: 844 } })

test('disclaimer is above the fold on iPhone 14 Pro viewport (pillar)', async ({ page }) => {
  await page.goto('/pillars/us-ca-tax-basics')
  const disclaimer = page.locator('aside[role="note"]').filter({ hasText: /Informational only/ })
  await expect(disclaimer.first()).toBeInViewport({ ratio: 0.5 })
})

test('FTC disclosure is above the fold on post with affiliate links', async ({ page }) => {
  await page.goto('/blog/wise-vs-traditional-banks-transfer-fees')
  const ftc = page.locator('aside[role="note"]').filter({ hasText: /Affiliate disclosure/ })
  await expect(ftc.first()).toBeInViewport({ ratio: 0.5 })
})
```

- [ ] **Step 5: Run full e2e**

```bash
cd apps/web
npm run e2e
```

- [ ] **Step 6: Commit**

```bash
git add apps/web/e2e/
git commit -m "test(web): add Playwright e2e specs (pillar, post, links, disclaimer-fold)"
```

---

## Task 25 — Lighthouse CI thresholds + URLs `[G11]` (parallel — Wave 4B start)

**Files:**
- Modify: `apps/web/lighthouserc.json`

- [ ] **Step 1: Update**

```json
{
  "ci": {
    "collect": {
      "staticDistDir": "./out",
      "url": [
        "http://localhost/",
        "http://localhost/pillars",
        "http://localhost/pillars/us-ca-tax-basics",
        "http://localhost/blog",
        "http://localhost/blog/wise-vs-traditional-banks-transfer-fees"
      ]
    },
    "assert": {
      "assertions": {
        "categories:performance": ["error", { "minScore": 0.95 }],
        "categories:accessibility": ["error", { "minScore": 0.95 }],
        "categories:seo": ["error", { "minScore": 0.95 }],
        "categories:best-practices": ["error", { "minScore": 0.95 }],
        "largest-contentful-paint": ["error", { "maxNumericValue": 2000 }],
        "cumulative-layout-shift": ["error", { "maxNumericValue": 0.1 }]
      }
    }
  }
}
```

- [ ] **Step 2: Commit**

```bash
git add apps/web/lighthouserc.json
git commit -m "chore(web): upgrade Lighthouse assertions to error + add pillar/post URLs"
```

---

## Task 26 — CI workflow: Playwright job + audit hard-fail `[G11]`

**Files:**
- Modify: `.github/workflows/ci.yml`

- [ ] **Step 1: Update**

Replace the `npm audit` line:
- FROM: `- run: npm audit --audit-level=moderate || true`
- TO: `- run: npm audit --audit-level=moderate`

Remove `continue-on-error: true` from the Lighthouse CI step.

Add a new job after `verify`:

```yaml
  e2e:
    needs: verify
    runs-on: ubuntu-latest
    env:
      NPM_TOKEN: ${{ secrets.NPM_TOKEN }}
      NODE_AUTH_TOKEN: ${{ secrets.NPM_TOKEN }}
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: 20
          cache: npm
          registry-url: https://npm.pkg.github.com
          scope: '@tn-figueiredo'
      - run: npm ci
      - run: npx playwright install --with-deps chromium webkit
      - run: npm run build
        working-directory: apps/web
      - run: npm run e2e
        working-directory: apps/web
      - uses: actions/upload-artifact@v4
        if: failure()
        with:
          name: playwright-report
          path: apps/web/.playwright-report
          retention-days: 7
```

- [ ] **Step 2: Commit**

```bash
git add .github/workflows/ci.yml
git commit -m "ci: add Playwright e2e job; hard-fail npm audit + Lighthouse"
```

---

## Task 27 — Pin exact devDeps `[G12]` (parallel Wave 4B)

**Files:**
- Modify: `apps/web/package.json`

- [ ] **Step 1: Change `^` to exact versions in devDependencies**

Current floating devDeps (per earlier audit):
- `"typescript": "^5"` → lock to current installed version (e.g., `"5.9.3"` or whatever `npm ls typescript` reports)
- `"@types/node": "^20"` → pin (e.g., `"20.14.10"`)
- `"@types/react": "^19"` → pin
- `"@types/react-dom": "^19"` → pin
- `"@tailwindcss/postcss": "^4"` → pin
- `"tailwindcss": "^4"` → pin

Run:
```bash
cd apps/web
npm ls typescript @types/node @types/react @types/react-dom @tailwindcss/postcss tailwindcss --depth=0
```

Then hand-edit `apps/web/package.json` replacing each `^X` with the exact installed version from the output.

- [ ] **Step 2: Verify**

```bash
cd apps/web
npm install
npm run typecheck
```

- [ ] **Step 3: Commit**

```bash
git add apps/web/package.json apps/web/package-lock.json
git commit -m "chore(web): pin exact versions for all devDeps (enforce .npmrc save-exact intent)"
```

---

## Task 28 — Zod env validation `[G12]`

**Files:**
- Create: `apps/web/src/env.ts`
- Create: `apps/web/.env.example`
- Modify: `apps/web/src/lib/site-config.ts` (import env)

- [ ] **Step 1: Install zod**

```bash
cd apps/web
npm install --save-exact zod@3.23.8
```

- [ ] **Step 2: Create env.ts**

```ts
// apps/web/src/env.ts
import { z } from 'zod'

const envSchema = z.object({
  VERCEL_GIT_COMMIT_SHA: z.string().optional(),
  NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),
})

const parsed = envSchema.safeParse(process.env)
if (!parsed.success) {
  // eslint-disable-next-line no-console
  console.error('Env validation failed:', parsed.error.flatten())
  throw new Error('Invalid env — see above')
}

export const ENV = parsed.data
```

- [ ] **Step 3: Create .env.example**

```
# apps/web/.env.example — copy to .env.local, fill in values as needed
# VERCEL_GIT_COMMIT_SHA is injected by Vercel in production; dev leaves it empty
VERCEL_GIT_COMMIT_SHA=
NODE_ENV=development
```

- [ ] **Step 4: Use ENV in site-config.ts**

```ts
// Replace direct process.env access:
import { ENV } from '@/env'

// inside SITE_CONFIG:
deployedAt: ENV.VERCEL_GIT_COMMIT_SHA
  ? new Date().toISOString()
  : 'dev',
```

- [ ] **Step 5: Verify**

```bash
cd apps/web
npm run typecheck
npm test
```

- [ ] **Step 6: Commit**

```bash
git add apps/web/src/env.ts apps/web/.env.example apps/web/src/lib/site-config.ts apps/web/package.json apps/web/package-lock.json
git commit -m "chore(web): add zod env validation at module load"
```

---

## Task 29 — ADR 006: Wave 3 hard-escalation fallback `[G13]` (parallel)

**Files:**
- Create: `docs/decisions/006-wave3-hard-escalation-fallback.md`

- [ ] **Step 1: Write ADR**

```markdown
# ADR 006 — Wave 3 hard-escalation fallback (inline YMYL stubs)

**Status:** Decided (conditional activation)
**Date:** 2026-04-16
**Decider:** Thiago Figueiredo
**Related:** [ADR 003](003-package-publish-prereq.md), [ADR 005](005-wave3-publish-watch.md), [ADR 007](007-cms-scaffold-and-wait.md), [Wave 3 runbook](../runbooks/wave-3-publish.md)

## Context

Wave 3 publishes 5 ecosystem packages (ymyl-ui@0.1.0 NEW, lgpd/seo/calc-engine/partner-links @0.2.0). Target 2026-04-22, hard-escalation 2026-04-29 (= S1 G0). If Wave 3 slips past the hard escalation, finreckoner `staging` cannot merge to `main` (npm install fails on unpublished packages).

The Wave 4 scaffold (ADR 007) is independent of Wave 3 — it builds content-route infrastructure with inline JSX YMYL slots rather than using ymyl-ui components. This means Wave 4 can land to main even if Wave 3 is late.

## Decision

If Wave 3 misses the hard escalation (2026-04-29):

1. **Keep Wave 4 inline YMYL JSX in place** — do NOT implement replacement YMYL components locally. The inline JSX is production-viable for YMYL compliance (author byline, disclaimer, citations all render visibly and correctly).

2. **Revert `staging` to pre-hygiene baseline** (commit `842b56f`) and recreate the legal/* pages using the inline JSX pattern from Wave 4, without ymyl-ui dependencies. Estimated effort: 4h.

3. **Defer Wave 3 publish** until the ecosystem divergence is resolved at the original pace (no forced push, no rushed publish).

4. **Wave 3 swap** (inline → ymyl-ui components) becomes a post-launch epic (Phase 2 nice-to-have) rather than pre-launch blocker.

## Alternatives considered

- **Force-publish Wave 3 packages regardless of ecosystem divergence:** rejected. ecosystem `main` has WIP in admin/support/fraud-detection-utils that cannot be lost; forced push could destroy work.
- **Wait indefinitely for Wave 3:** rejected. Ties S1 kickoff to external dependency.
- **Skip YMYL components entirely pre-launch:** rejected. YMYL visibility is a Google QRG requirement; inline JSX is sufficient.

## Consequences

- **Pro:** decouples launch timeline from Wave 3; no hidden rushed-publish risk
- **Pro:** inline JSX pattern is already proven (Wave 4A)
- **Con:** ymyl-ui polish features (affordances Wave 4 doesn't replicate: rich structured metadata, component-level unit tests, cross-site reuse) are deferred
- **Con:** small technical debt (inline vs component), paid down in Phase 2

## Revisit trigger

- Wave 3 publishes at any later date → schedule swap epic
- Another consumer needs ymyl-ui urgently → reprioritize Wave 3 publish

## Changelog

- **2026-04-16** — ADR drafted alongside Wave 4 plan (cms-consumer-scaffold-plan.md).
```

- [ ] **Step 2: Commit**

```bash
git add docs/decisions/006-wave3-hard-escalation-fallback.md
git commit -m "docs(adr): 006 Wave 3 hard-escalation fallback (inline YMYL stubs)"
```

---

## Task 30 — ADR 007: CMS scaffold-and-wait codification `[G13]`

**Files:**
- Create: `docs/decisions/007-cms-scaffold-and-wait.md`

- [ ] **Step 1: Write ADR**

```markdown
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
- **Tailwind 4 typography fallback** — if `@plugin "@tailwindcss/typography"` fails in Tailwind 4, falls back to hand-written prose styles (~30 lines).

## Changelog

- **2026-04-16** — ADR drafted post-brainstorming session; codifies decision made in spec `2026-04-16-cms-consumer-scaffold-design.md`.
```

- [ ] **Step 2: Commit**

```bash
git add docs/decisions/007-cms-scaffold-and-wait.md
git commit -m "docs(adr): 007 CMS scaffold-and-wait strategy"
```

---

## Task 31 — ADR 008: CMS consumption decision `[G13]`

**Files:**
- Create: `docs/decisions/008-cms-consumption-decision.md`

- [ ] **Step 1: Write ADR**

```markdown
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
```

- [ ] **Step 2: Commit**

```bash
git add docs/decisions/008-cms-consumption-decision.md
git commit -m "docs(adr): 008 CMS consumption decision (1.0.0 only, scaffold-and-wait interim)"
```

---

## Task 32 — Roadmap updates `[G14]`

**Files:**
- Modify: `docs/roadmap/README.md`
- Modify: `docs/roadmap/phase-1-mvp.md`

- [ ] **Step 1: README.md — update banner + rev 3.2 changelog**

In `docs/roadmap/README.md`:

Replace the "NEXT ACTION — Wave 3 publish (start here)" section with an expanded version that lists Waves 3 + 4 + 5 in sequence. The updated banner points to the pre-S1 prep phase.

Add a new entry at the top of the Changelog section:

```markdown
- **rev3.2 (2026-04-16):** Pre-S1 prep phase established — Wave 4 (CMS consumer scaffold + hygiene, independent of Wave 3) + Wave 5 (CMS integration, gated on CMS 1.0.0 ship). Spec: `docs/superpowers/specs/2026-04-16-cms-consumer-scaffold-design.md`. Plan: `docs/superpowers/plans/2026-04-16-cms-consumer-scaffold-plan.md`. ADRs 006/007/008 drafted.
```

Update "Sprint ativo" line to: `Wave 4 in progress (cms-consumer-scaffold branch). Wave 3 publish still pending. S1 kickoff 2026-04-29 (G0).`

- [ ] **Step 2: phase-1-mvp.md — insert pre-S1 prep section**

In `docs/roadmap/phase-1-mvp.md`, insert a new section **between** "Sprint 0 — Packages + Foundation" and "Sprint 1 — Calcs + Content":

```markdown
---

## Pre-S1 prep phase (2026-04-16 → 04-29) [🟡 in-progress]

**Purpose:** Land infrastructure work (Wave 3 publish, Wave 4 CMS consumer scaffold + hygiene, Wave 5 CMS integration) so S1 kickoff has a clean starting state.

**Wave 3 — Ecosystem packages publish** [⏸ gate-pending]
- Target 2026-04-22, hard-escalation 2026-04-29
- Runbook: `docs/runbooks/wave-3-publish.md`
- ADR 005, ADR 006 (fallback)
- Blocks: `finreckoner/main` CI (intentional per ADR 003)

**Wave 4 — CMS consumer scaffold + hygiene** [🟡 in-progress, independent of Wave 3]
- Spec: `docs/superpowers/specs/2026-04-16-cms-consumer-scaffold-design.md`
- Plan: `docs/superpowers/plans/2026-04-16-cms-consumer-scaffold-plan.md`
- Sub-branch: `cms-consumer-scaffold` (from pre-hygiene baseline)
- Scope 4A (scaffold): pillar/post routes, templates, metadata, SEO, YMYL inline artifacts, fixtures, Playwright e2e, Lighthouse CI tightening
- Scope 4B (hygiene): pin exact devDeps, Zod env validation, `npm audit` hard-fail, Lighthouse assertions to `error` level
- Effort: 16-22h solo Claude / 4-6h subagent-driven

**Wave 5 — CMS integration** [☐ gated on CMS 1.0.0 + Waves 3 + 4]
- ADR 008
- Triggers when `@tn-figueiredo/cms@1.0.0` publishes
- Rewrites `apps/web/src/lib/content.ts` to consume CMS; deletes fixtures
- Estimated 8-14h, recalibrate once CMS API visible

**G0 gate (2026-04-29):** Waves 3 + 4 + 5 landed; CI green; staging merged to main.

---
```

Update the Sprint 1 scope inside the same file to note that scaffolding + content-route infrastructure is **already done** (via Wave 4), so S1 focuses only on calcs + content production + polish.

- [ ] **Step 3: Commit**

```bash
git add docs/roadmap/README.md docs/roadmap/phase-1-mvp.md
git commit -m "docs(roadmap): add pre-S1 prep phase (Wave 4 + Wave 5); rev 3.2"
```

---

## Task 33 — Wave 5 spec skeleton `[G14]`

**Files:**
- Create: `docs/superpowers/specs/2026-04-16-cms-integration-wave-5-design.md`

- [ ] **Step 1: Write skeleton**

```markdown
# CMS Integration — Wave 5 Design Spec [SKELETON]

**Status:** Skeleton (awaiting CMS 1.0.0 API visibility)
**Date drafted:** 2026-04-16
**Author:** Thiago Figueiredo (with Claude collaboration)
**Gated on:** `@tn-figueiredo/cms@1.0.0` published to GitHub Packages; Wave 3 + Wave 4 merged to main
**Related:** [CMS consumer scaffold spec (Wave 4)](2026-04-16-cms-consumer-scaffold-design.md), [ADR 007](../../decisions/007-cms-scaffold-and-wait.md), [ADR 008](../../decisions/008-cms-consumption-decision.md)

---

## 0. Purpose

Rewrite `apps/web/src/lib/content.ts` to consume `@tn-figueiredo/cms@1.0.0` in place of fixtures. Delete fixtures. Regenerate snapshots. Validate no regression across unit + e2e + Lighthouse + Rich Results.

## 1. Pre-conditions (fill in when CMS 1.0.0 ships)

- [ ] CMS 1.0.0 package published at `npm.pkg.github.com/@tn-figueiredo/cms`
- [ ] CMS 1.0.0 public API documented (functions exposed, types, build-time vs runtime usage)
- [ ] Wave 3 ecosystem publish landed
- [ ] Wave 4 scaffold (`cms-consumer-scaffold`) merged to main
- [ ] finreckoner `main` CI green

## 2. Tasks (fill in based on CMS API)

- [ ] TBD: add `@tn-figueiredo/cms: "1.0.0"` to `apps/web/package.json` dependencies (exact pin per ecosystem convention)
- [ ] TBD: write normalizer in `apps/web/src/lib/content.ts` — maps CMS response shape to the fields templates read (slug, title, subtitle, body, updatedAt, reviewedAt, author, reviewer, heroImage, citations, jurisdiction, publishedAt, hasAffiliateLinks)
- [ ] TBD: handle build-time fetch (generateStaticParams) — exact mechanism depends on whether CMS exposes filesystem / API / both
- [ ] TBD: handle authentication if CMS exposes a gated API (auth-at-build)
- [ ] TBD: delete `apps/web/src/__fixtures__/*.mock.ts`
- [ ] TBD: regenerate Vitest snapshots (`npx vitest run -u`)
- [ ] TBD: regenerate Playwright snapshots (`npx playwright test --update-snapshots`)
- [ ] TBD: validate Google Rich Results for pillar + post manually (https://search.google.com/test/rich-results)
- [ ] TBD: update roadmap phase-1-mvp.md to mark Wave 5 ✅

## 3. Success metrics

- [ ] All Vitest + Playwright tests pass after snapshot regeneration
- [ ] Lighthouse CI thresholds hold (Performance + SEO + A11y ≥ 0.95)
- [ ] Google Rich Results Test: Article + BreadcrumbList recognized, zero errors
- [ ] No `POST-WAVE-3:` comments remain in templates (after Wave 3 swap; that is a separate PR from Wave 5)
- [ ] PR merged to `main`; staging clean

## 4. Risks

- **CMS 1.0.0 public surface is larger than expected:** increases Wave 5 effort. Mitigation: normalizer layer absorbs; templates unchanged.
- **CMS requires build-time authentication:** may need new env var + secret. Mitigation: document in Zod env schema, add to Vercel project.
- **Role gating leaks into consumer API (`userRole` param):** resolve via a "public-anonymous" stub role passed by finreckoner at every call site.

## 5. Changelog

- **2026-04-16** — Skeleton drafted alongside Wave 4 close; body TBD when CMS 1.0.0 API is visible.
```

- [ ] **Step 2: Commit**

```bash
git add docs/superpowers/specs/2026-04-16-cms-integration-wave-5-design.md
git commit -m "docs(spec): Wave 5 CMS integration skeleton (awaiting CMS 1.0.0 API)"
```

---

## Task 34 — Final verification + PR `[G15]`

- [ ] **Step 1: Full local verification**

```bash
cd /Users/figueiredo/Workspace/finreckoner/apps/web
npm run typecheck
npm test
npm run build
npm run e2e
npx @lhci/cli@0.13.0 autorun --config=./lighthouserc.json || echo "Lighthouse check (local run may differ from CI)"
```

All must pass. Fix any failure before PR.

- [ ] **Step 2: Push branch**

```bash
cd /Users/figueiredo/Workspace/finreckoner
git push -u origin cms-consumer-scaffold
```

- [ ] **Step 3: Open PR (human gate — don't auto-open)**

User opens PR with body referencing:
- Spec: `docs/superpowers/specs/2026-04-16-cms-consumer-scaffold-design.md`
- Plan: `docs/superpowers/plans/2026-04-16-cms-consumer-scaffold-plan.md`
- ADRs: 006, 007, 008
- Target branch: `main`
- Merge condition: Wave 3 packages published first (see Wave 3 runbook)

- [ ] **Step 4: POST-WAVE-3 comment count verification (informational)**

```bash
cd /Users/figueiredo/Workspace/finreckoner
grep -rn "POST-WAVE-3:" apps/web/src | wc -l
```
Expected: 9 occurrences (4 in PillarTemplate + 5 in PostTemplate). Record actual count for the Wave 3 swap PR checklist.

---

## Parallelization summary (for subagent-driven-development)

```
Sequential (must run in order):
  G0: Tasks 0, 1, 2            (branch + deps + Playwright config)
  G0.5: Task 6                  (site-config extension — unblocks G1)
  G1 (parallel ×3): Tasks 3, 4, 5  (url, format, json-ld libs)
  G2: Task 7                    (JsonLd component — needs json-ld.ts from G1)
  G3 (parallel ×2): Tasks 8, 9  (fixtures+content, globals.css typography)
  G4 (parallel ×5): Tasks 10-14 (Breadcrumb, SkipLink, ContentBody, ShareButtons, Cards)
  G5 (parallel ×2): Tasks 15, 16 (PillarTemplate, PostTemplate)
  G6: Task 17                    (index templates)
  G7 (parallel ×2): Tasks 18, 19 (RootLayout, error boundaries)
  G8 (parallel ×2): Tasks 20, 21 (pillar routes, blog routes)
  G9 (parallel ×2): Tasks 22, 23 (opengraph-image, sitemap)
  G10: Task 24                   (E2E specs)
  G11 (parallel ×2): Tasks 25, 26 (Lighthouse thresholds, CI workflow)
  G12 (parallel ×2): Tasks 27, 28 (pin deps, Zod env)
  G13 (parallel ×3): Tasks 29, 30, 31 (ADRs 006, 007, 008)
  G14 (parallel ×2): Tasks 32, 33 (roadmap, Wave 5 skeleton)
  G15: Task 34                   (final verify + PR)
```

Max parallelism within a group: 5 (G4). Subagent-driven-development dispatches one subagent per task in the current group, waits for all to complete, then advances to the next group.

---

## Self-review notes

**Spec coverage scan:**
- §1.1 new files — all 40+ items mapped to tasks ✓
- §1.2 data seam — Task 8 ✓
- §1.3 template hierarchy — Tasks 15, 16 ✓
- §1.4 data flow — Tasks 20, 21 ✓
- §1.5 error boundaries — Tasks 19, 20, 21 ✓
- §1.6 pre-flight checkpoint — Task 6 ✓
- §1.7 branch strategy — Task 0 ✓
- §1.8 decisions log — captured across multiple tasks + ADR 007
- §2.1-2.10 YMYL/SEO — Tasks 15, 16, 18 ✓
- §3 testing — Tasks 3-5, 7, 15, 16, 24, 25, 26 ✓
- §4 roadmap delta — Task 32 ✓
- §5-8 risks + DoD + rollback — captured in ADR 006 + ADR 007 + ADR 008

**Placeholder scan:** `TBD` only appears in Wave 5 skeleton (Task 33), which is intentionally a skeleton pending CMS 1.0.0 visibility.

**Type consistency:** `PillarMock` + `PostMock` defined in Task 8, imported consistently by all subsequent tasks.
