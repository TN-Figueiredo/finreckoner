# ADR 002 — Recharts vs lightweight SVG for Compound Interest chart

**Status:** Pending — will be Decided in S1 Week 2 (week of 2026-05-06)
**Date:** 2026-04-15
**Decider:** Thiago Figueiredo
**Related:** [`docs/roadmap/phase-1-mvp.md`](../roadmap/phase-1-mvp.md) S1 epic "Calc 2: Compound Interest Calculator" + mini-epic "Recharts LCP <2s spike" + Risk R15 · [`CLAUDE.md`](../../CLAUDE.md) §Code standards (LCP budget)

---

## Context

Calc 2 (Compound Interest) needs a visualization of principal-vs-growth over time. Industry default is Recharts: declarative, composable, accessible hover/legend, used widely in finance dashboards.

**Bundle reality:** Recharts ~45 KB min-gzip + React peer (already present) + d3 internals (d3-shape, d3-scale, d3-array, d3-path). A minimal `<LineChart>` + `<XAxis>` + `<YAxis>` + `<Tooltip>` tree pulls ~55 KB transitively after tree-shaking.

**Performance constraint:** finreckoner is YMYL finance. Per `CLAUDE.md`, LCP target is **< 2.0s on 3G throttled** (stricter than the 2.5s general Web Vitals target — compliance-adjacent: slow YMYL pages reduce trust signal and SEO weight per Google QRG).

**Delivery constraint:** Calc 2 is SSG (Next 15 static export). Chart component must hydrate client-side; Recharts SSR-stub + client hydrate adds FID/INP pressure if bundle is large.

## Decision (pending — will be recorded S1 Week 2)

**Spike first, then choose.** 1h S1 Week 2 spike measures real-world LCP of a minimal Recharts Compound Interest demo on Chrome DevTools "Slow 4G" emulation.

## Spike acceptance criteria

| Measured LCP (Slow 4G, median of 5 runs) | Decision | Next step |
|---|---|---|
| **≤ 2.0s** | Adopt Recharts | Proceed with Calc 2 epic as estimated (8h); check bundle budget in size-limit config |
| **2.0s – 2.5s** | Conditional: try Recharts modular import (`recharts/es6/chart/LineChart`) + revisit. If still > 2.0s, switch to SVG fallback | Budget slip: +1h investigation, absorbed in S1 buffer |
| **> 2.5s** | Switch to lightweight inline SVG | +3h implementation budget from S1 buffer; record decision as Decided here |

## Spike method

1. Create `apps/web/app/(spike)/recharts-demo/page.tsx` rendering a single `<CompoundLineChart>` with 30-year hardcoded dataset
2. `pnpm build && pnpm start`
3. Chrome DevTools → Performance → Network: Slow 4G, CPU: 4× slowdown
4. Record 5 page loads from cold cache; take median LCP
5. Record main-bundle size from Next.js build output

Record findings in the "Decision" section below on 2026-05-06+.

## Alternatives considered

### A. Recharts (default)
- **Pro:** hover tooltip, legend, accessible, declarative, industry-standard
- **Con:** 45-55 KB bundle, d3 transitive footprint, React hydration cost

### B. Lightweight inline SVG + CSS animation
- **Pro:** ~5 KB, zero runtime deps beyond React, full SSG compatible, no hydration cost, superb LCP
- **Con:** no hover tooltip (static render only), no interactive legend; limited to CSS `animate` for a "grow" reveal effect on first paint

### C. HTML5 Canvas (Chart.js minimal)
- **Pro:** smaller than Recharts
- **Con:** still ~25 KB, canvas = no screen-reader accessibility without ARIA fallback (YMYL a11y concern), still hydrates client-side
- **Verdict:** not worth the middle ground; either go full-interactive (A) or fully static (B)

## Consequences

### If Recharts (A)
- UX: rich hover exploration → users understand compounding intuitively
- Compliance: LCP headroom becomes tight; any future calc adding its own chart must budget-check
- Cost: ~50 KB permanent bundle tax on a high-traffic route

### If SVG (B)
- UX: reduced interactivity — user sees one static line or a CSS-animated grow
- Compliance: LCP budget preserved with room for future feature additions
- Cost: ~5 KB; easy to audit; no peer-dep upgrades
- **Mitigation for reduced interactivity:** add a table below the chart showing year-by-year principal + interest + balance (already useful for screen readers + printable); re-evaluate Recharts for Phase 2 if demand surfaces

## Revisit trigger

- Phase 2 "live FX" epic: if charting becomes a cross-cutting concern, reconsider a shared chart package (Recharts or `@tn-figueiredo/charts` extract)
- Web Vitals thresholds change: if Google relaxes LCP or finreckoner moves to paid Vercel tier with Edge + streaming, recompute budget

## Changelog

- **2026-04-15** — ADR drafted (Pending). Spike scheduled S1 Week 2 (May 6–13, 2026); decision to be recorded on this page.
