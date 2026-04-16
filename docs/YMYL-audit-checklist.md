# YMYL Audit Checklist

> **Purpose:** map Your-Money-Your-Life compliance artifacts to specific roadmap epics + Definition-of-Done items. Use this checklist as the source of truth when reviewing PRs with the `[ymyl]` prefix + as the pre-AdSense submit gate (S3).
>
> **References:**
> - Project rules: [`CLAUDE.md`](../CLAUDE.md) §YMYL Compliance + §AdSense Finance vertical
> - Roadmap: [`docs/roadmap/phase-1-mvp.md`](roadmap/phase-1-mvp.md)
> - SoW template: [`docs/legal/contractor-sow-template.md`](legal/contractor-sow-template.md)
>
> **Last reviewed:** 2026-04-15

---

## 1. Per-calc requirements (every calculator page)

| # | Requirement | Roadmap epic | DoD item |
|---|---|---|---|
| 1.1 | Inline disclaimer above-fold — "Informational only — not tax, legal, or financial advice. Consult a licensed professional for your specific situation." | S1/S2 calcs | S1 DoD "Cada calc tem disclaimer inline above-fold" |
| 1.2 | Data-source citation (URL to IRS.gov / CRA.gc.ca / revenuquebec.ca / ECB) | S1/S2 calcs | S1 DoD "Cada calc tem data-source citation" |
| 1.3 | "Last reviewed: YYYY-MM" timestamp | S2 E-E-A-T | S2 DoD "Cada calc tem ... 'Last reviewed 2026-05'" |
| 1.4 | Reviewer byline ("Reviewed by [Name, Credential], [Date]") — if SoW permits attribution | S3 epic "Reviewer byline implementation" | G3 "Reviewer byline implementado" |
| 1.5 | Jurisdictional limits explicit — "US federal only" / "CA federal + provincial (QC separate)" | S1/S2 calcs | CLAUDE.md §YMYL item 7 |
| 1.6 | `localStorage` persistence (no DB) | S1 calcs | S1 DoD "Cada calc persiste state em localStorage" |
| 1.7 | Share-via-URL query params | S3 polish | — |
| 1.8 | Visual regression snapshot of disclaimer above-fold (Playwright) | S3 testing | S3 epic "visual regression snapshots pra disclaimer above-fold" |

## 2. Per-page requirements (every page on site)

| # | Requirement | Roadmap epic | DoD item |
|---|---|---|---|
| 2.1 | Footer disclaimer block (global) | S2 `/legal/*` | — |
| 2.2 | CCPA "Do Not Sell or Share My Personal Information" footer link | S2 epic "CCPA DNSMPI" | S2 DoD "CCPA DNSMPI link visível no footer em todas as páginas" |
| 2.3 | GPC (Global Privacy Control) signal honored | S2 `@tnf/lgpd` configure | S2 DoD "GPC signal honored" |
| 2.4 | hreflang EN-US + EN-CA valid | S0 `@tnf/seo` | G0 |
| 2.5 | FTC per-link proximity (16 CFR 255.5) on any affiliate CTA | S2 `@tnf/affiliate` integration | S2 DoD "FTC disclosure visível per-link proximity" |

## 3. Site-wide requirements (single-instance pages / files)

| # | Path | Roadmap epic | Required by |
|---|---|---|---|
| 3.1 | `/contact` (email + DMCA notice template) | S2 `/contact` | AdSense Publisher Policy |
| 3.2 | `/legal/disclaimer` | S2 `/legal/*` | UPL risk |
| 3.3 | `/legal/accuracy` | S2 `/legal/*` | UPL risk |
| 3.4 | `/legal/privacy` | S2 Privacy + ToS | GDPR + LGPD + CCPA |
| 3.5 | `/legal/terms` | S2 Privacy + ToS | Baseline |
| 3.6 | `/legal/ftc-disclosure` | S2 FTC page | FTC 16 CFR Part 255 |
| 3.7 | `/legal/dnsmpi` (if dedicated page needed beyond footer link) | S2 CCPA | CCPA/CPRA |
| 3.8 | `ads.txt` (root-served, placeholder pre-approval) | S0 epic "ads.txt placeholder" | AdSense Publisher Policy |
| 3.9 | `robots.txt` | S0 scaffold | SEO baseline |
| 3.10 | `sitemap.xml` with all pages | S2 GA4+GSC epic | SEO + GSC |

## 4. Pre-AdSense submit checklist (S3 gate)

Must ALL be checked before AdSense application submit (per `CLAUDE.md` §AdSense Finance vertical):

- [ ] Site age ≥ 30 days
- [ ] ≥ 25 quality posts published
- [ ] Restricted-products content audit signed-off (zero crypto trading / payday / debt-relief / binary options — per Google Publisher Restricted Categories)
- [ ] Consent Mode v2 live ≥ 7 days (EEA/UK/CH default denied; US/CA default granted)
- [ ] All `/legal/*` pages live (items 3.2–3.7 above)
- [ ] `/contact` live with real email (item 3.1)
- [ ] `ads.txt` served (item 3.8)
- [ ] Tax contractor review sign-off PDF archived (`docs/legal/tax-review-2026-06.pdf`)
- [ ] Reviewer byline visible on all 4 calcs (item 1.4) OR documented decision that SoW excluded attribution
- [ ] YMYL artifacts 100% on every calc page (items 1.1–1.5)
- [ ] FTC per-link proximity verified on every affiliate CTA (item 2.5)

**Roadmap cross-ref:** [`phase-1-mvp.md`](roadmap/phase-1-mvp.md) S3 epic "AdSense application submit — finance-vertical pre-submit checklist".

## 5. PR conventions

- Any PR that touches compliance artifacts (anything in §§1–3 above) MUST use title prefix `[ymyl]`
- `[ymyl]` PRs require manual review against this checklist before merge
- CI label `ymyl-touch` auto-applied if diff includes: `apps/web/app/legal/**`, `apps/web/components/**/{Disclaimer,FTC}*`, `packages/calc-engine/src/tax/**`, `apps/web/public/ads.txt`
- **Never** squash-merge a `[ymyl]` PR without reviewer checkout + manual verification

## 6. Annual refresh calendar pattern

Tax bracket data + disclaimer timestamps MUST be refreshed on this recurring schedule:

| Window | Source | Action |
|---|---|---|
| **Nov-Dec (yearly)** | IRS Rev. Proc. (published for next tax year) | Update `packages/calc-engine/src/tax/us/years/YYYY.ts` + re-run goldens + bump `calc-engine` minor |
| **Jan (yearly)** | CRA T4127 (January edition) | Update `tax/ca/years/YYYY.ts` + re-run goldens |
| **Jul (yearly)** | CRA T4127 (July edition) — mid-year adjustments | Re-verify `tax/ca/years/YYYY.ts`; patch if indexation changed |
| **Jan + Jul (yearly)** | Revenu Québec TP-1015.F | Update `tax/ca/qc/years/YYYY.ts` (separate from T4127) |
| **Launch + annual** | All `/legal/*` pages | Bump "Last reviewed" footer date + re-read contractor findings; re-engage reviewer if bracket changes are material |

Automation: GitHub Actions scheduled workflow (`.github/workflows/annual-refresh-reminder.yml`) opens an issue tagged `ymyl-refresh` on Nov 1, Jan 2, and Jul 2 each year.

---

## Appendix — terminology

- **YMYL** — Your Money Your Life (Google Quality Rater Guidelines category)
- **UPL** — Unauthorized Practice of Law/Tax (US state-level risk for advice-appearing content)
- **E-E-A-T** — Experience, Expertise, Authoritativeness, Trustworthiness (Google QRG)
- **DNSMPI** — "Do Not Sell or Share My Personal Information" (CCPA/CPRA required link)
- **GPC** — Global Privacy Control (browser opt-out signal)
