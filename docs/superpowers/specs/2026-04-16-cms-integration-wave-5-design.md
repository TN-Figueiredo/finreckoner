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
