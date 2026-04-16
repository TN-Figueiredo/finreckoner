# CMS Consumer Scaffold — Design Spec (Wave 4)

**Status:** Proposed (awaiting user review)
**Date:** 2026-04-16
**Author:** Thiago Figueiredo (with Claude collaboration via superpowers:brainstorming)
**Effort estimate:** 16-22h solo-Claude wall-clock (Wave 4A scaffold 12-16h + Wave 4B hygiene 4-6h, parallelizable). Subagent-orchestrated mode (per S0 retro precedent): 4-6h wall-clock for the same scope; do NOT extrapolate speedup without confirming the work remains mechanical (scaffolding + testing is mechanical; content copy + visual polish is not).
**Roadmap reference:** [`docs/roadmap/phase-1-mvp.md`](../../roadmap/phase-1-mvp.md) · [README.md Wave sequence](../../roadmap/README.md)
**Related ADRs (to be written in Wave 4B):** 006 Wave 3 hard-escalation fallback · 007 CMS scaffold-and-wait strategy (this spec) · 008 CMS consumption decision
**Memory entries informing this design:** `cms_status.md`, `ecosystem_contract_ownership.md`, `tnf_ecosystem.md`

---

## 0. Purpose & scope

Prepare finreckoner to consume `@tn-figueiredo/cms@1.0.0` **the day it ships**, without predicting its public API. Build every piece of pillar/post infrastructure that is purely consumer-local (routes, layouts, metadata, SEO, YMYL artifacts, tests) and leave the data source as an opaque internal seam.

**Strategic framing.** The ecosystem owns its contracts; consumers conform. This spec is deliberately silent on CMS API shape, query signatures, frontmatter conventions, role gating, and authoring flows. When CMS 1.0.0 lands, a separate Wave 5 epic rewrites a single internal file (`src/lib/content.ts`) to call the CMS however the CMS exposes itself.

**Context — why not consume beta.4 today.** `@tn-figueiredo/cms@0.1.0-beta.4` exists but is undergoing a core rework in `~/Workspace/tn-cms-s4.75/` introducing user tiers and user-to-role relationships. This is API-breaking. Consuming beta.4 now creates a large migration debt when breaking changes land. Decision: scaffold against fixtures, swap at 1.0.0.

**Scope split.** This spec defines the consumer scaffold (Wave 4). CMS integration (Wave 5) and hygiene items orthogonal to scaffolding (missing ADRs, deps pinning, env Zod validation, audit hard-fail — Wave 4B) are documented here but their execution is independent.

---

## 1. Architecture

### 1.1 New files and directories

```
apps/web/
├── app/
│   ├── layout.tsx                           EXTEND (SkipLink first child of <body>; Organization JSON-LD)
│   ├── global-error.tsx                     NEW
│   ├── not-found.tsx                        NEW
│   ├── sitemap.ts                           EXTEND (add pillar+post slugs)
│   ├── globals.css                          EXTEND (@plugin "@tailwindcss/typography")
│   ├── opengraph-image.tsx                  NEW (static site-wide OG fallback)
│   ├── pillars/
│   │   ├── page.tsx                         NEW (index)
│   │   ├── loading.tsx                      NEW
│   │   ├── error.tsx                        NEW (client boundary)
│   │   └── [slug]/
│   │       ├── page.tsx                     NEW (detail)
│   │       ├── loading.tsx                  NEW
│   │       └── error.tsx                    NEW
│   └── blog/
│       ├── page.tsx                         NEW (renders ALL posts — no pagination in MVP)
│       ├── loading.tsx                      NEW
│       ├── error.tsx                        NEW
│       └── [slug]/
│           ├── page.tsx                     NEW
│           ├── loading.tsx                  NEW
│           └── error.tsx                    NEW
├── src/
│   ├── lib/
│   │   ├── content.ts                       NEW (the ONLY CMS seam)
│   │   ├── url.ts                           NEW (toAbsolute helper)
│   │   ├── format.ts                        NEW (Intl.DateTimeFormat helpers)
│   │   └── json-ld.ts                       NEW (Article/BreadcrumbList/Organization builders)
│   ├── components/
│   │   ├── layout/                          NEW dir
│   │   │   ├── breadcrumb.tsx
│   │   │   └── skip-link.tsx
│   │   ├── ui/                              NEW dir
│   │   │   ├── json-ld.tsx                  (XSS-safe <script> renderer)
│   │   │   ├── share-buttons.tsx            (Twitter/LinkedIn/Reddit + Copy client)
│   │   │   ├── content-body.tsx             (prose typography shell)
│   │   │   ├── pillar-card.tsx
│   │   │   └── post-card.tsx
│   │   └── templates/                       NEW dir
│   │       ├── pillar-template.tsx
│   │       ├── post-template.tsx
│   │       ├── pillar-index.tsx
│   │       └── post-index.tsx
│   └── __fixtures__/                        NEW dir
│       ├── pillar.mock.ts                   (internal shape; not exported)
│       ├── post.mock.ts
│       ├── author.mock.ts
│       └── reviewer.mock.ts
├── playwright.config.ts                     NEW (app root — convention)
├── package.json                             EXTEND (new devDeps: @playwright/test, @testing-library/react, @testing-library/jest-dom, @tailwindcss/typography)
├── lighthouserc.json                        EXTEND (pillar+post URLs; thresholds to "error" level)
└── e2e/                                     NEW dir (Playwright specs only)
    ├── pillar.spec.ts
    ├── post.spec.ts
    ├── links.spec.ts                        (broken-link sanity)
    └── disclaimer-fold.spec.ts              (above-fold viewport test)

apps/web/src/lib/site-config.ts              EXTEND — only if Checkpoint A (§1.6) detects missing fields
.github/workflows/ci.yml                     EXTEND (Playwright e2e job after build; Lighthouse URL additions)
```

### 1.2 Data seam — `src/lib/content.ts`

The single boundary between route handlers and the content source. Today reads fixtures; Wave 5 rewrites to call CMS.

```ts
// INTERNAL — these function signatures AND types will be rewritten on CMS
// integration. DO NOT treat as stable. DO NOT export from any barrel.

type PillarMock = {
  slug: string              // routing
  title: string              // <h1>, metadata.title
  subtitle: string           // metadata.description
  body: ReactNode            // <ContentBody> children (opaque)
  updatedAt: string          // ISO; edit date
  reviewedAt?: string | null // ISO; YMYL audit date; separate from updatedAt
  author?: AuthorMock | null
  reviewer?: ReviewerMock | null
  heroImage?: string | null  // URL (may be relative; toAbsolute at use site)
  citations?: CitationMock[] | null
  jurisdiction?: 'US' | 'CA' | 'US-CA' | null
}
type PostMock = PillarMock & {
  publishedAt: string
  hasAffiliateLinks?: boolean
}
type AuthorMock = { name: string; url?: string }
type ReviewerMock = { name: string; credential: string; date: string }
type CitationMock = { label: string; url: string; publishedAt: string }

export async function getPillarSlugs(): Promise<string[]>
export async function getPillarBySlug(slug: string): Promise<PillarMock | null>
export async function getAllPillars(): Promise<PillarMock[]>
export async function getPostSlugs(): Promise<string[]>
export async function getPostBySlug(slug: string): Promise<PostMock | null>
export async function getAllPosts(): Promise<PostMock[]>
```

Wave 5 replaces the implementations (and may alter signatures) to call CMS. A normalizer layer inside these functions will absorb any divergence between CMS shape and what templates read, so template code remains stable.

### 1.3 Template hierarchy

```
PillarTemplate({ pillar, content })
├── <Breadcrumb items={[Home, Pillars, pillar.title]}/> (emits BreadcrumbList JSON-LD)
├── <article>
│   ├── <header>
│   │   ├── <h1>{pillar.title}</h1>
│   │   └── <p>{pillar.subtitle}</p>
│   ├── <!-- INLINE JSX (not a component): meta — author + reviewer + "Last reviewed"
│   │        comment marker POST-WAVE-3: replace inline block with
│   │        <AuthorByline>+<ReviewerByline>+<LastReviewed> from @tn-figueiredo/ymyl-ui -->
│   ├── <!-- INLINE JSX (not a component): above-fold disclaimer
│   │        comment marker POST-WAVE-3: replace with <Disclaimer inline/> from ymyl-ui -->
│   ├── <ContentBody>{content}</ContentBody>
│   ├── <!-- INLINE JSX: jurisdiction footer
│   │        POST-WAVE-3: replace with <Jurisdiction/> from ymyl-ui -->
│   └── <!-- INLINE JSX: citations section (conditional)
│            POST-WAVE-3: replace with <Citations/> from ymyl-ui -->
└── <JsonLd data={articleJsonLd(pillar)}/>

PostTemplate({ post, content })  — identical plus, between meta and ContentBody:
└── <!-- INLINE JSX: FTC disclosure (conditional on post.hasAffiliateLinks)
         POST-WAVE-3: replace with <FTCDisclosure variant="above-fold"/>
         from @tn-figueiredo/partner-links -->
    <ShareButtons url=... title=... /> at article footer

PillarIndex({ pillars })  — grid 4-col md, 1-col sm; <PillarCard> per item
PostIndex({ posts })  — list; <PostCard> per item
```

The `POST-WAVE-3` inline blocks are markup (6-15 lines each), not reusable components. Wave 3 + ymyl-ui wiring replaces each block with a component call.

### 1.4 Data flow — pillar detail example

```
Request: /pillars/us-tax-basics
  │
  ▼
app/pillars/[slug]/page.tsx (RSC)
  │
  ├── generateStaticParams()  → getPillarSlugs() → slugs.map(s => ({slug: s}))   [build time]
  │
  ├── generateMetadata({params}) → getPillarBySlug(slug) → {
  │     title, description,
  │     alternates: { canonical, languages: {en-US, en-CA, x-default} },
  │     openGraph: { title, description, url, siteName, type: 'article', images },
  │     twitter: { card: 'summary_large_image' }
  │   }
  │
  └── Page({params}):
      → pillar = await getPillarBySlug(slug)
      → if (!pillar) notFound()  → app/not-found.tsx
      → return <PillarTemplate pillar={pillar} content={pillar.body}/>
```

### 1.5 Error boundary strategy

| Boundary | File | Trigger | Behavior |
|---|---|---|---|
| Global rendering error | `app/global-error.tsx` | Root layout crash (rare in SSG, dead-code but retained defensively) | Client boundary; renders own `<html><body>`; static error message + reset button; `console.error(error)` pending Sentry wire-up in S3 |
| 404 | `app/not-found.tsx` | Unknown route OR `notFound()` call | Server component; branded page with 3 nav links (home, /pillars, /blog); 404 HTTP |
| Per-segment error | `app/pillars/error.tsx`, `app/blog/error.tsx`, and detail equivalents | Runtime render error within segment | Client boundary; "Couldn't load this {pillar\|post}" + Retry calling `reset()` |
| Loading fallback | `loading.tsx` per segment | `<Suspense>` fallback | Skeleton matching template layout (H1-shape, subtitle-shape, 4 body lines) |

**Build-time errors** in `generateStaticParams` or `generateMetadata` surface as CI build failures, not runtime errors. This is intentional fail-fast; error boundaries do not cover build time.

### 1.6 Pre-flight checkpoint — `site-config.ts` completeness

Before opening the scaffold branch, verify `apps/web/src/lib/site-config.ts` exposes:

- [ ] `siteName: string`
- [ ] `siteUrl: string` (https, no trailing slash)
- [ ] `defaultOgImage: string` (absolute URL, 1200×630 PNG/JPG)
- [ ] `author: { name: string; url: string }` (url absolute OR `/about`)
- [ ] `organization: { name: string; logoUrl: string }`
  - `logoUrl`: absolute URL, PNG or SVG, min 112px height, aspect ratio between 1:1 and 16:9, max 600px width (Google Article rich result constraints)
- [ ] `organization.sameAs?: string[]` (optional: social profile URLs for entity unification)
- [ ] `defaultOgImage` is **non-null** (required; null-fallback undefined-behavior avoided by fail-fast at module load)

Any missing field or constraint violation triggers a small `site-config.ts` PR *before* the scaffold PR.

**Note on Zod env validation:** Not a prerequisite here — it is itself a Wave 4B deliverable (hygiene batch). The pre-flight checkpoint covers **site-config shape**, not env-var validation mechanism. Wave 4B adds `apps/web/src/env.ts` with Zod schema validating `VERCEL_GIT_COMMIT_SHA` and any other required env vars at module load.

### 1.7 Branch strategy

- Sub-branch `cms-consumer-scaffold` cut from commit `842b56f` (S0 close, pre-hygiene baseline) — ensures `npm install` resolves without the unpublished ecosystem packages that currently red-list `staging`.
- Rebased onto `main` after Wave 3 publishes and Wave 2 hygiene merges. File-level conflict surface is minimal: the new scaffold touches only new files in `app/pillars/*`, `app/blog/*`, `src/lib/content.ts|url.ts|format.ts|json-ld.ts`, `src/components/layout|ui|templates/*`, `src/__fixtures__/*`, `e2e/*`. The only potential conflict is `app/sitemap.ts` (if Wave 2 touched it).

### 1.8 Decisions log

| Question | Decision | Rationale |
|---|---|---|
| MDX vs HTML content pipeline | `ContentBody` accepts `ReactNode`; pipeline is opaque | Do not predict CMS choice |
| i18n routing | `alternates.languages` with a single URL per slug (no `[locale]` segment) | Content is English with US/CA variants; hreflang metadata is sufficient |
| Pagination on `/blog` | None in MVP | 20 posts total per roadmap; YAGNI; add epic when posts exceed 30 |
| Pagination on `/pillars` | None | 4 pillars total |
| Fixture lookup | Direct match by slug (simple conditional); fine for 1 fixture each | Map-based lookup is an easy upgrade if fixtures grow beyond 2-3 |
| Playwright adoption | Yes — new `@playwright/test` devDep + `playwright.config.ts` + CI job | Vitest cannot render Next 15 fully; a11y + snapshot need real browser |
| Browsers under test | `chromium` + `webkit` | Mobile Safari is the dominant YMYL mobile stack |
| Tailwind 4 typography | `@plugin "@tailwindcss/typography";` in `globals.css` (Tailwind 4 convention) | Required for `prose` classes in `<ContentBody>` |
| `<time>` semantic element | Required on all rendered dates | HTML semantics for parsable dates |
| JSON-LD serialization | `JSON.stringify` + `.replace(/</g, '\u003c')` in `<JsonLd>` helper | Escapes `</script>` injection vectors |
| OG image per-slug dynamic | Deferred to post-CMS epic | MVP ships a single static `app/opengraph-image.tsx` fallback |
| Reviewer in JSON-LD | Not included | `schema.org` has no canonical `reviewedBy` for `Article`; visible byline markup is the YMYL signal |
| Robots on paginated archive | N/A (no pagination) | — |
| Preview/draft mode | Out of scope | CMS-side concern |

---

## 2. YMYL + SEO artifacts

### 2.1 Strategy — visible inline today, component swap post-Wave-3

Pages without visible author byline, disclaimer, and citations fail Google QRG YMYL. Re-implementing `ymyl-ui` components is prohibited (duplication with `@tn-figueiredo/ymyl-ui@0.1.0` that Wave 3 will publish). Resolution: render YMYL artifacts as **inline JSX** (not reusable components). A Wave 3 swap PR replaces each inline block with a component import — no component is rewritten.

### 2.2 JSON-LD Article — full shape

```ts
// src/lib/json-ld.ts
export function articleJsonLd(entity: PillarMock | PostMock, kind: 'pillar' | 'post') {
  const routePrefix = kind === 'pillar' ? '/pillars' : '/blog'
  // Type narrowing: PostMock has publishedAt; PillarMock falls back to updatedAt
  const datePublished = 'publishedAt' in entity ? entity.publishedAt : entity.updatedAt
  return {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: entity.title,              // ≤ 110 chars (Google rich result max)
    description: entity.subtitle,
    inLanguage: 'en',
    image: toAbsolute(entity.heroImage ?? siteConfig.defaultOgImage),
    datePublished,
    dateModified: entity.updatedAt,
    author: entity.author ? {
      '@type': 'Person',
      name: entity.author.name,
      // author.url is optional; emit Person without url when absent
      ...(entity.author.url ? { url: toAbsolute(entity.author.url) } : {}),
    } : undefined,
    publisher: {
      '@type': 'Organization',
      name: siteConfig.organization.name,
      logo: {
        '@type': 'ImageObject',
        url: toAbsolute(siteConfig.organization.logoUrl),
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
```

### 2.3 JSON-LD BreadcrumbList

Emitted by `<Breadcrumb>` alongside the visible `<nav>`:

```ts
{
  '@context': 'https://schema.org',
  '@type': 'BreadcrumbList',
  itemListElement: items.map((item, i) => ({
    '@type': 'ListItem',
    position: i + 1,
    name: item.label,
    item: item.url ? toAbsolute(item.url) : undefined,  // last item (current page) omits `item`
  })),
}
```

### 2.4 JSON-LD Organization (global, in `RootLayout`)

```tsx
<JsonLd data={{
  '@context': 'https://schema.org',
  '@type': 'Organization',
  name: siteConfig.organization.name,
  url: siteConfig.siteUrl,
  logo: toAbsolute(siteConfig.organization.logoUrl),
  sameAs: siteConfig.organization.sameAs,  // undefined if absent
}}/>
```

Pillar/post pages do not duplicate Organization — it lives once at root.

### 2.5 YMYL inline artifacts — layout

**PillarTemplate has 4 visible slots:**

1. **Header meta** (below `<h1>`, above body):
```tsx
{/* POST-WAVE-3: replace with <AuthorByline>+<ReviewerByline>+<LastReviewed> from @tn-figueiredo/ymyl-ui */}
<div className="meta mt-4 text-sm text-slate-600">
  {pillar.author && (
    <p>By{' '}
      {pillar.author.url
        ? <a href={pillar.author.url} className="underline">{pillar.author.name}</a>
        : pillar.author.name}
    </p>
  )}
  {pillar.reviewer && (
    <p>Reviewed by {pillar.reviewer.name}, {pillar.reviewer.credential}{' '}
      — <time dateTime={pillar.reviewer.date}>{formatDate(pillar.reviewer.date)}</time></p>
  )}
  <p>Last reviewed:{' '}
    <time dateTime={pillar.reviewedAt ?? pillar.updatedAt}>
      {formatYearMonth(pillar.reviewedAt ?? pillar.updatedAt)}
    </time></p>
</div>
```

2. **Above-fold disclaimer** (immediately after meta):
```tsx
{/* POST-WAVE-3: replace with <Disclaimer inline/> from @tn-figueiredo/ymyl-ui */}
<aside role="note" className="my-6 rounded border-l-4 border-amber-400 bg-amber-50 p-4 text-sm">
  <p>
    <strong>Informational only.</strong> Not tax, legal, or financial advice.
    Consult a licensed professional for your situation.{' '}
    <a href="/legal/disclaimer" className="underline">Full disclaimer</a>.
  </p>
</aside>
```

3. **Jurisdiction footer** (immediately after body):
```tsx
{/* POST-WAVE-3: replace with <Jurisdiction jurisdiction={pillar.jurisdiction}/> from @tn-figueiredo/ymyl-ui */}
<p className="text-sm text-slate-500 mt-8">
  Jurisdiction: {pillar.jurisdiction ?? 'US federal / CA federal + provincial'}. State/provincial rules may vary.
</p>
```

4. **Citations section** (last block):
```tsx
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
```

**PostTemplate has 5 slots:** 1+2+3+4 plus:

5. **FTC above-fold disclosure** (between meta and body; only when `hasAffiliateLinks=true`):
```tsx
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
```

### 2.6 Slot TODO discipline

Every inline YMYL slot carries a comment of the exact form:

```tsx
{/* POST-WAVE-3: replace <description> with <ComponentName [propsSummary]> from @tn-figueiredo/<pkg> */}
```

CI may grep for `POST-WAVE-3:` and report count (informational, non-blocking). Wave 3 swap PR removes each comment as it replaces the inline block.

### 2.7 Metadata + viewport

```ts
// app/pillars/[slug]/page.tsx
export async function generateMetadata({params}): Promise<Metadata> {
  const pillar = await getPillarBySlug(params.slug)
  if (!pillar) return {}
  const url = toAbsolute(`/pillars/${pillar.slug}`)
  return {
    title: `${pillar.title} — ${siteConfig.siteName}`,
    description: pillar.subtitle,
    alternates: {
      canonical: url,
      languages: { 'en-US': url, 'en-CA': url, 'x-default': url },
    },
    openGraph: {
      title: pillar.title, description: pillar.subtitle, url,
      siteName: siteConfig.siteName, type: 'article',
      images: [{ url: toAbsolute(pillar.heroImage ?? siteConfig.defaultOgImage) }],
    },
    twitter: { card: 'summary_large_image' },
  }
}

export function generateViewport(): Viewport {
  return { colorScheme: 'light', themeColor: '#ffffff' }  // dark mode is Phase 2
}
```

### 2.8 Robots directives

| Route | Robots | Rationale |
|---|---|---|
| `/`, `/pillars`, `/pillars/[slug]`, `/blog`, `/blog/[slug]`, `/about`, `/contact`, `/legal/*` | `index, follow` | Default; institutional and content routes |
| 404 | `noindex` (Next default) | — |

**Global Google Bot preview directives** (set once in `RootLayout` metadata):
```ts
export const metadata: Metadata = {
  ...
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
```
Rationale: YMYL pages benefit from large image previews in SERP (trust signal); `max-snippet: -1` gives Google discretion for rich snippet length. Per-page `generateMetadata` inherits unless overridden.

### 2.9 Accessibility — WCAG 2.2 AA

- `<SkipLink>` as first child of `<body>` anchored to `<main id="main-content">`
- Semantic landmarks: `<main>`, `<nav aria-label>`, `<footer>`, `<article>`
- `prefers-reduced-motion` respected in any animation — `loading.tsx` skeleton uses `motion-safe:animate-pulse` (Tailwind modifier) so users with reduced-motion preference get a static skeleton
- `focus-visible` styles via Tailwind utilities
- Color contrast verified by axe-core in Playwright

### 2.10 Edge cases

| Null field | Render behavior |
|---|---|
| `pillar.author = null` | No "By X"; JSON-LD omits `author` |
| `pillar.reviewer = null` | No "Reviewed by"; JSON-LD unchanged |
| `pillar.citations = []` or `null` | Citations section does not render |
| `pillar.heroImage = null` | `<img>` and OG image fall back to `siteConfig.defaultOgImage` (required non-null per Checkpoint A — double-null path is fail-fast at build) |
| `post.hasAffiliateLinks = false` or undefined | FTC above-fold does not render |

All template renders use optional chaining and null guards; zero non-null assertions.

---

## 3. Testing strategy

### 3.1 Matrix

| Layer | Tool | Scope | Files | CI gate |
|---|---|---|---|:-:|
| Unit | Vitest | JSON-LD builders, `toAbsolute`, date formatters, metadata output | `apps/web/src/__tests__/*.test.ts` | **fail** |
| Snapshot | Vitest `toMatchSnapshot` | Article, BreadcrumbList, Organization JSON-LD | ibid | **fail** |
| Component | Vitest + `@testing-library/react` | Templates render fixtures, null-safe edges, slot TODOs present | `components/templates/*.test.tsx` | **fail** |
| E2E | Playwright | Navigation, broken-link sanity, axe-core, above-fold viewport | `apps/web/e2e/*.spec.ts` | **fail** |
| Lighthouse CI | `@lhci/cli` | Performance + Accessibility + SEO + Best Practices ≥ 0.95 on pillar+post fixtures | `lighthouserc.json` | **fail** (upgrade from `warn`) |
| Typecheck | `tsc --noEmit` | `strict: true`, zero `any`, zero `@ts-ignore` | existing | **fail** (already) |
| Audit | `npm audit --audit-level=moderate` | Vulnerabilities | CI step | **fail** (upgrade from `\|\| true`) |

### 3.2 New devDependencies

- `@playwright/test` (latest stable)
- `@testing-library/react` + `@testing-library/jest-dom` (verified absent in current `package.json`)
- `@tailwindcss/typography` (Tailwind 4 plugin; verify canonical install path in plan phase)

### 3.2.1 Unit test scope vs E2E — RSC boundary

Next 15 RSCs with data fetching (`async` server components that call `getPillarBySlug`) cannot be unit-tested ergonomically with `@testing-library/react` because the data dependency is intrinsic. Split:

- **Unit (Vitest + @testing-library/react):** pure template functions that receive data as props — e.g., `<PillarTemplate pillar={fixturePillar} content={<p>…</p>}/>`. The data seam is *not* exercised; fixtures passed directly.
- **E2E (Playwright):** the real Next route render, which exercises `generateStaticParams` → `getPillarBySlug` → template render end-to-end via the actual `npm run build && npm run start` pipeline.

Template components in `src/components/templates/` are therefore designed as **pure prop-driven components** (no data fetching inside) — route handlers (`page.tsx`) are the only place that fetches data.

### 3.3 Snapshot test targets

- `articleJsonLd(pillarFixture)` — Article shape regression
- `articleJsonLd(postFixture)` — Post-specific fields regression
- `breadcrumbJsonLd([...items])` — BreadcrumbList shape
- Rendered HTML of `<PillarTemplate>` (Playwright snapshot of actual page)
- Rendered HTML of `<PostTemplate>` with and without `hasAffiliateLinks`

### 3.4 E2E spec inventory

- `pillar.spec.ts` — renders, has `<h1>`, author byline, disclaimer, citations, JSON-LD present
- `post.spec.ts` — same + FTC disclosure conditional rendering
- `links.spec.ts` — navigate home → pillars → pillar detail → blog → post detail; assert all links 200, external links have `rel="noopener noreferrer"`
- `disclaimer-fold.spec.ts` — viewport 390×844; disclaimer visible without scroll (`toBeInViewport({ ratio: 0.9 })`)

### 3.5 Lighthouse CI config changes

- Add URLs: `/pillars/[fixture-slug]`, `/blog/[fixture-slug]`
- Assertions from `["warn", ...]` to `["error", { minScore: 0.95 }]` for Performance, Accessibility, SEO, Best Practices
- Applied only to fixtures for now; thresholds may relax when real content lands (re-evaluate in Wave 5)

---

## 4. Roadmap delta

### 4.1 Wave sequence

```
2026-04-16 (today)
  │
  ├─ Wave 3 publish  ────  target 04-22 · hard 04-29
  │   Gate: resolve tnf-ecosystem main divergence; publish 5 packages
  │
  ├─ Wave 4 — CMS consumer scaffold + hygiene (THIS SPEC)
  │   Starts today. Branch `cms-consumer-scaffold` from 842b56f.
  │   Independent of Wave 3.
  │   ├─ 4A scaffold pillar/post (~12-16h, 2 days wall-clock)
  │   ├─ 4B hygiene orthogonal (~4-6h, parallel):
  │   │    ADRs 006/007/008, deps pinning exact, Zod env validation,
  │   │    npm audit hard-fail, Lighthouse thresholds error-level
  │   └─ 4C rebase onto main after Wave 3 merges
  │
  ├─ CMS 1.0.0 ships  ────  expected today (other session)
  │
  ├─ Wave 5 — CMS integration (separate epic, spec TBD post-API-visibility)
  │   Gated on: Wave 3 published + Wave 4 merged + CMS 1.0.0 available
  │   Rewrites src/lib/content.ts; deletes __fixtures__/; re-generates snapshots
  │   Estimate 8-14h, recalibrate once CMS 1.0.0 API is visible
  │
  └─ 2026-04-29 — S1 kickoff (G0) with clean infrastructure
```

### 4.2 S1 scope (2026-04-29 → 2026-05-20)

Originally 60h. Revised Claude-side effort:

| Epic | Hours | Note |
|---|:-:|---|
| Calc 1: Mortgage US+CA | 10 | Wave-3-gated |
| Calc 2: Compound Interest | 8 | ADR 002 spike W2 |
| Calc 3: Currency Converter | 6 | — |
| Calcs polish (QA, Lighthouse per calc, a11y) | 6 | — |
| S1 exit QA | 4 | — |
| **Claude subtotal** | **34h** | |
| Content production — 2 pillars + 8 posts (Thiago authors in CMS) | ~18 Thiago | parallel; depends on Wave 5 done; recalibrate after G1 W1 |

S1 code work drops from 60h to 34h because scaffolding (previously implicit) is absorbed by Wave 4 and content production moves to parallel Thiago time. Margin absorbs Wave 3 or CMS slippage.

### 4.3 S2 scope (2026-05-20 → 2026-06-10)

Unchanged materially (~75h). Content production for 2 more pillars + 12 posts is Thiago time in CMS, orthogonal to Claude code work on Income Tax calc + compliance + affiliates + `/legal/*` + `/about`.

### 4.4 S3 + Launch

Unchanged.

### 4.5 Gates

| Gate | Date | Criterion | Fallback |
|---|:-:|---|---|
| **G0** | 2026-04-29 | Wave 3 + 4 + 5 landed; CI green; staging merged to main | If Wave 3 slip: activate ADR 006 inline fallback; defer Wave 5 |
| G1-G4 | unchanged | — | — |

### 4.6 Roadmap file edits (executed in the plan)

| File | Edit |
|---|---|
| `docs/roadmap/README.md` | Banner: Wave 4+5 sequence; active-sprint → "Wave 4 in progress"; rev 3.2 changelog |
| `docs/roadmap/phase-1-mvp.md` | New section **"Pre-S1 prep phase (2026-04-16 → 04-29)"** inserted between S0 close and S1 kickoff sections; contains Wave 3 publish (existing), Wave 4 CMS consumer scaffold + hygiene (new), Wave 5 CMS integration (new). S1 epic list revised to reflect scaffold + hygiene already done. |
| `docs/decisions/006-wave3-hard-escalation-fallback.md` | NEW |
| `docs/decisions/007-cms-scaffold-and-wait.md` | NEW (codifies this spec) |
| `docs/decisions/008-cms-consumption-decision.md` | NEW |

---

## 5. Risks

**Resolved or mitigated by this design:**

- R13 "CMS extraction timing blocks S1" — addressed via scaffold-and-wait + Wave 5 isolation.
- R5 (partial) YMYL insufficiency — YMYL artifacts render visibly in Wave 4 (inline markup), so even pre-Wave-3 staging is YMYL-presentable.

**Introduced or reinforced:**

- **R16 NEW — CMS 1.0.0 API drift:** if 1.0.0 exposes a shape very different from what the normalizer expects, Wave 5 estimate (8-14h) may swell to 20h+. **Mitigation:** normalizer absorbs divergence in one file; templates remain stable.
- **R17 NEW — Fixture shape creep:** `PillarMock` has 11 fields; each is a de facto assumption about CMS. **Mitigation:** fixtures are internal and deleted in Wave 5; normalizer owns any mapping.
- **R18 NEW — FTC `hasAffiliateLinks` flag forgotten by author:** missed flag = no disclosure = FTC 16 CFR 255 violation. **Mitigation (post-MVP epic):** content-scanner build job that regexes `<ContentBody>` against known partner hosts and fails CI if an unlabeled affiliate URL is detected. Out of scope for this spec.

- **R19 NEW — Tailwind 4 typography plugin maturity:** `@tailwindcss/typography` is established in Tailwind 3 but Tailwind 4 plugin ecosystem is recent; the `@plugin` directive path may not work as-expected. **Mitigation:** verify canonical install path in Wave 4 plan phase (before scaffold branch opens); if plugin broken, fall back to hand-written prose utility classes in `globals.css` (~30 lines, one-time).

- **R20 NEW — `next/image` static export constraints:** `output: 'export'` disables default image optimization. For hero images and OG images, `<Image>` either needs `unoptimized: true` or a custom loader. **Mitigation:** for MVP fixtures + CMS-provided hero URLs, use `unoptimized: true` flag; document in `next.config.ts`; re-evaluate when real content lands (maybe switch to Cloudflare/Vercel image service). No launch blocker.

- **R21 NEW — Playwright first-time setup friction:** new test framework introduces learning surface (config, CI integration, artifact handling, flake management). **Mitigation:** budget 2h within Wave 4A for Playwright initial setup; adopt conservative defaults (chromium + webkit, no sharding, no parallel beyond default); treat flakes as must-fix, not `retries: 3`.

- **R22 NEW — `sitemap.ts` async fetch failure mode:** if `getPillarSlugs()` / `getPostSlugs()` throws at build, sitemap generation fails the whole build. Today: fixtures never throw. Post-CMS: network/auth issues could. **Mitigation:** in Wave 5, wrap CMS calls in `sitemap.ts` with try/catch and fall back to an empty array + emit a build warning; never fail the whole build for sitemap.

- **R23 NEW — ymyl-ui prop surface may differ from inline JSX assumptions:** inline slots render `pillar.author.name`, `pillar.reviewer.credential`, etc. If `@tn-figueiredo/ymyl-ui@0.1.0` `<AuthorByline>` accepts a differently-shaped prop (e.g., `<AuthorByline author={{...}}/>` vs `<AuthorByline name=... url=.../>`), Wave 3 swap is non-trivial. **Mitigation:** ADR 004 locks ymyl-ui v0.x API contract; inline slots here read fields in a shape compatible with ymyl-ui's expected consumer contract. Verified by cross-reading ymyl-ui source during Wave 4A.

---

## 6. Out of scope (explicit)

1. Any proposal for `@tn-figueiredo/cms` public API shape (owned by the platform side)
2. Real pillar + post content (authored in CMS by Thiago, post-Wave-5)
3. Wiring `@tn-figueiredo/ymyl-ui` / `lgpd` / `partner-links` components (separate Wave 3 consumer swap epic)
4. Calc page routes (S1 scope, separate)
5. `/authors/[slug]` dedicated routes (`/about` subsumes author bio)
6. RSS feed (post-launch M+1)
7. `[locale]` URL segment (hreflang alternates are sufficient)
8. Preview / draft mode
9. Dynamic per-slug OG image generation (post-CMS epic)
10. Storybook / Ladle
11. Pagination on `/blog` (YAGNI for 20 posts)
12. Content-scanner FTC auto-detect (post-Wave-5 epic)
13. Sentry wire-up (S3)

---

## 7. Success metrics — Definition of Done

**Functional:**
- [ ] `/pillars/[fixture-slug]` renders with `<h1>`, author byline, above-fold disclaimer, citations, Article JSON-LD
- [ ] `/blog/[fixture-slug]` renders idem plus FTC disclosure when `hasAffiliateLinks=true`
- [ ] `/pillars`, `/blog` list fixtures with cards
- [ ] `app/sitemap.ts` includes pillar + post absolute URLs with `lastmod`
- [ ] `app/not-found.tsx`, `global-error.tsx`, per-route `error.tsx` + `loading.tsx` present

**Quality gates:**
- [ ] `tsc --noEmit` passes strict with no ignores
- [ ] Vitest unit + snapshot: 100% pass
- [ ] Playwright e2e: 100% pass on chromium + webkit
- [ ] axe-core: zero WCAG 2.2 AA violations on templates
- [ ] Lighthouse CI: ≥ 0.95 on all four assertions for pillar + post fixtures

**SEO/YMYL:**
- [ ] hreflang alternates include en-US + en-CA + x-default, all absolute URLs
- [ ] Article JSON-LD includes `datePublished` + `dateModified` + `author` + `publisher.logo` (dimensions-compliant)
- [ ] Disclaimer inline is above-fold at viewport 390×844
- [ ] FTC disclosure above-fold when applicable
- [ ] Exactly N occurrences of `POST-WAVE-3:` in the codebase (N matches planned slot count)

**Swap readiness (Wave 5 preparedness):**
- [ ] `src/lib/content.ts` is the only boundary to the content source — no fixture references outside it and `__fixtures__/`
- [ ] Fixtures isolated in `apps/web/src/__fixtures__/`, not exported from any barrel
- [ ] `PillarMock` and `PostMock` types are not exported; comments mark them `INTERNAL — replace on CMS integration`

**Epic wrap:**
- [ ] PR `cms-consumer-scaffold` merged to `main` (post Wave 3 rebase)
- [ ] Vercel preview URL active showing fixtures in production-like env (prerequisite: Vercel project is configured to auto-deploy previews for the branch; confirm via dashboard before PR)
- [ ] ADRs 006/007/008 committed
- [ ] Roadmap README + phase-1-mvp updated (Wave 4/5 visible as pre-S1 prep phase)
- [ ] Wave 5 epic spec skeleton drafted in `docs/superpowers/specs/` (body TBD until CMS 1.0.0 API visible)

---

## 8. Rollback criteria

Revert the Wave 4 PR if:
- Lighthouse Performance < 0.85 on fixtures (structural scaffold problem, not content-specific)
- Typecheck regresses on `@tn-figueiredo/*` imports after rebase onto Wave 3
- Playwright chromium + webkit diverge on > 2 specs (scaffold fragility)
- Merge conflict with Wave 2 hygiene cannot be resolved without functional regression

Rollback path: `git revert <PR-merge-commit>` → staging CI returns to pre-Wave-4 state → re-brainstorm (likely toward pure inline-MDX approach, skipping scaffold-and-wait).

---

## 9. References

- **Memory entries:**
  - `cms_status.md` — wait for CMS 1.0.0 rationale
  - `ecosystem_contract_ownership.md` — no cross-repo contract proposals from consumer
  - `tnf_ecosystem.md` — consumer cascade context
  - `collaboration_style.md` — iterative scoring preference
- **Existing ADRs:**
  - [003](../../decisions/003-package-publish-prereq.md) package publish prerequisite
  - [004](../../decisions/004-ymyl-ui-reuse-api-contract.md) ymyl-ui reuse API contract
  - [005](../../decisions/005-wave3-publish-watch.md) Wave 3 publish watch
- **Roadmap:**
  - [`docs/roadmap/README.md`](../../roadmap/README.md)
  - [`docs/roadmap/phase-1-mvp.md`](../../roadmap/phase-1-mvp.md)
- **Related runbook:**
  - [`docs/runbooks/wave-3-publish.md`](../../runbooks/wave-3-publish.md)
- **YMYL external references:**
  - Google Search Central — Article rich results: https://developers.google.com/search/docs/appearance/structured-data/article
  - FTC 16 CFR Part 255 (2023 update)
  - WCAG 2.2 AA

---

## 10. Changelog

- **2026-04-16 rev1** — initial spec drafted via superpowers:brainstorming; 5 sections iterated to 98+/100 self-score each; approved for implementation planning.
- **2026-04-16 rev2** — post-commit audit round caught 15 issues (5 critical, 6 medium, 4 minor). Patches applied: (a) `articleJsonLd` null-safe for optional `author.url`; (b) pre-flight checkpoint decoupled from Wave 4B Zod env deliverable; (c) Section 1.1 file tree completed with EXTEND targets (`layout.tsx`, `globals.css`, `lighthouserc.json`, `package.json`, `ci.yml`, `site-config.ts`); (d) Playwright config relocated to app root; (e) `max-image-preview:large` added to global robots; (f) `motion-safe:animate-pulse` applied to loading skeleton; (g) 5 new risks (R19-R23); (h) unit vs E2E boundary documented for RSC testing; (i) wall-clock qualified (solo 16-22h vs subagent 4-6h); (j) pre-S1 prep phase positioning clarified; (k) Vercel preview prerequisite noted in DoD. Post-patch self-score: 98/100.
