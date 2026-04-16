← [Roadmap overview](README.md)

# Fase 1 — MVP (US+CA launch) [☐ not-started]

**Sprints:** 0–3 + Launch · **Horas:** 268h · **Semanas:** 13
**Estimativa de entrega:** 2026-04-15 → **2026-07-15** (launch US+CA)
**Depende de:** nada (entry point)
**Bloqueia:** Fase 2, Fase 3 (UK/BR/PT expansion), monetização diversificada

**Goal:** `finreckoner.com` ao vivo US+CA com 4 calcs interativos, 4 pillar pages, 20 posts, monetização diversificada (5 afiliados Day 1 + AdSense pending), compliance finance vertical (YMYL + FTC + LGPD + GDPR + CCPA + CCPA DNSMPI).

**Capacidade real:** 13 sem × 25h = **325h**. Plano 268h. **Buffer real = 57h (17.5%)**. (rev2 fix: antes reportava 12 sem / 300h / 13% buffer — calendar/capacity error corrigido pelo engineering audit.)

## Exit criteria (Fase 1 → DONE)

Ver [README.md#exit-criteria](README.md) — 14 itens mensuráveis (ampliado com `/contact`, CCPA DNSMPI, `/legal/disclaimer+accuracy`, ads.txt, reviewer byline).

## Definition of Done (aplicável a todos sprints)

- [ ] Todos epics do sprint marcados ✅
- [ ] CI verde em `main` (typecheck + tests + audit + secret-scan + ecosystem-pinning + Lighthouse CI)
- [ ] Zero `any` adicionado (CI já enforce — cross-check manual em code review)
- [ ] Specs/plans linkados ao epic correspondente quando aplicável
- [ ] Commit de fechamento: `docs(roadmap): close sprint N — <resumo>`
- [ ] **Carry-over section** atualizada (ver placeholder final de cada sprint) se algum item não fechou

---

## Sprint 0 — Packages + Foundation [✅ done] (49h plan / ~5h wall-clock subagent-driven)

**Closed:** 2026-04-15 (14 days ahead of 2026-04-29 target via subagent orchestration)

**Deliverables shipped:**
- ✅ `@tn-figueiredo/calc-engine@0.1.0` — published npm.pkg.github.com (US/CA/QC TY2026 + FX + 69 unit + 30 golden + 16 property tests + 6 externally-verified anchors)
- ✅ `@tn-figueiredo/partner-links@0.1.0` — published (5 providers + FTC + UTM + React RSC-safe disclosure)
- ✅ `finreckoner.com` repo live at github.com/TN-Figueiredo/finreckoner (Next 15 SSG + Tailwind 4 + React 19 + 6 static pages)
- ✅ CI green — publish.yml (3 guards + post-verify) + ci.yml (typecheck + tests + audit + eco-pinning + site-config immutability + Lighthouse warn + gitleaks CLI)
- ✅ ADRs 001-005 committed in tnf-ecosystem/docs/adr/
- ✅ Retro + cascade log committed in finreckoner/docs/
- ⚠️ Affiliate terms archive (Task 32) — USER-MANUAL portal logins pending; placeholder committed

**See:** [docs/retro/sprint-0-2026-04-29.md](../retro/sprint-0-2026-04-29.md) for full retrospective.



**Goal:** `@tnf/calc-engine` e `@tnf/affiliate` extendidos e released. `finreckoner.com` acessível com homepage v0 e 1 blog post teste via CMS.
**Estimativa:** 2026-04-15 → 2026-04-29 (2 semanas × ~24.5h)
**Depende de:** nada

**Epics** (soma = 49h):
- [ ] **`@tnf/calc-engine` EXTEND** — subpaths `tax/us` (federal brackets 2026 via IRS Rev. Proc.), `tax/ca` (federal + 12 provincial brackets 2026 via CRA T4127 Jan edition), **`tax/ca/qc` separado** (Revenu Québec TP-1015.F, **NÃO está no T4127**), `fx` (source interface + ECB fallback) — **16h**
- [ ] `@tnf/calc-engine` tests — unit + **property-based (fast-check) nas bracket boundaries** (off-by-one em thresholds = liability) + golden-file snapshots per year + JSDoc types — **4h**
- [ ] **`@tnf/affiliate` EXTEND** — providers: Questrade, Wealthsimple, Credit Karma, NerdWallet (schema + link builders + UTM defaults) — **6h**
- [ ] Changesets release + **cross-repo cascade checklist** (list all `@figueiredo-technology/calc-engine` + `/affiliate` consumers: MEISimples, bythiagofigueiredo, fan-stamp; confirm pinned; **smoke-test each post-publish: `npm install` + `npm test` + `npm run build` em cada consumer**; commit cascade verification em `docs/ecosystem/cascade-2026-04-S0.md`) + consumer bumps — **2h**
- [ ] tnf-scaffold clone → `apps/web` + CI/CD baseline (typecheck, test, audit, secret-scan, ecosystem-pinning, Lighthouse CI) — **4h**
- [ ] Domain + DNS + Vercel deploy — `finreckoner.com` via Cloudflare Registrar, SSL, custom domain, **ads.txt placeholder** na raiz — **2h**
- [ ] `@tnf/cms` integration (consume, configure, first MDX render path) — **6h**
- [ ] `@tnf/seo` configure — hreflang EN-US + EN-CA, metadata base, sitemap skeleton, OG defaults — **5h**
- [ ] Homepage landing v0 — hero creator-first, value prop, CTA skeleton, 4 calc card placeholders — **3h**
- [ ] **Affiliate terms validation + archive** — screenshot Wise + Questrade + Wealthsimple + Credit Karma + NerdWallet partner portals (cookie duration, CPA, forbidden copy); commit a `docs/legal/affiliate-terms-2026-04.md` — **1h** (NEW, P1 compliance)

**Deliverables:** (status inicial = `[ ]` até fechar sprint)
- [ ] `@tnf/calc-engine@x.y.0` + `@tnf/affiliate@x.y.0` published ao `@figueiredo-technology` registry
- [ ] `finreckoner.com` resolvendo com SSL + ads.txt served
- [ ] 1 blog post teste renderizando via @tnf/cms
- [ ] CI green em `main`
- [ ] `docs/legal/affiliate-terms-2026-04.md` committed com evidência screenshot

**Validações S0 específicas (YMYL-critical):**
- [ ] **Wise affiliate cookie duration** confirmada via Wise Partner Portal ([https://wise.com/partners](https://wise.com/partners) — login owner: Thiago). Hard-code em copy SÓ pós-validação; fallback copy "long-window affiliate"
- [ ] **IRS 2026 federal brackets** snapshot (Rev. Proc. 2025-32, publicado ~Nov 2025) em `packages/calc-engine/src/tax/us/brackets-2026.ts` com link-citation no comment de topo
- [ ] **CRA T4127 Jan 2026 edition** (12 provincias + territories, NÃO incluiu QC) em `tax/ca/brackets-2026.ts`
- [ ] **Revenu Québec TP-1015.F 2026** em `tax/ca/qc/brackets-2026.ts` (source separado, erro comum)
- [ ] Comment em cada arquivo: `// Source: [URL oficial]. Published: YYYY-MM. Next refresh: [IRS Nov-Dec / CRA Jan+Jul / RQ Jan+Jul].`

**Riscos S0:**
- calc-engine EXTEND estourando 16h → 24h+ (prob Média) — **mitigação:** cortar `tax/ca/qc` pra S1 (QC é separado, cortável)
- Wise cookie ser 30d (não 1-yr) — **mitigação:** copy neutra; revenue model não muda
- IRS/CRA publicam brackets 2026 tardios — **mitigação:** usar 2025 brackets + flag "provisional 2026" no UI até publicação oficial

**Go/No-Go G0 (2026-04-29):** packages released + domain live + CI green + ads.txt served? ✅ avançar S1 / ❌ adiar S1 1 semana.

**Carry-over para S1:** (preencher no fechamento)
- [ ] —

**Spec / Plan:** —

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
- Sub-branch: `cms-consumer-scaffold` (from pre-hygiene baseline `842b56f`)
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

## Sprint 1 — App Core + First Calcs [☐ not-started] (60h)

**Goal:** 3 calcs live (Mortgage US+CA, Compound Interest, Currency Converter), 2 pillar pages, 8 long-tail posts. ≥10 páginas indexáveis.
**Estimativa:** 2026-04-29 → 2026-05-20 (3 semanas × 20h)
**Depende de:** Sprint 0

**Epics** (soma = 60h):
- [ ] `@tnf/calc-engine` consumer integration — `InputNumber`, `CurrencyInput`, `PercentInput`, `ResultCard`, `ShareButton` components reutilizáveis — **8h**
- [ ] Calc 1: Mortgage Calculator US+CA — principal+interest+taxes+insurance, amortization table, 2 locales (US: conventional/FHA; CA: CMHC insurance) — **10h**
- [ ] Calc 2: Compound Interest Calculator — Recharts growth chart, creator savings angle — **8h**
- [ ] Calc 3: Currency Converter (creator lens) — 10 currencies, CAD/USD/BRL/EUR prioritário, Wise CTA integrado inline — **6h**
- [ ] 2 pillar pages (Mortgage + Compound Interest, 2K+ words, creator-angled, FAQ schema.org, internal linking) — **12h**
- [ ] 8 long-tail blog posts (batch 1a, 800-1500 words, creator-finance keywords) — **16h**

**Deliverables:**
- [ ] 3 calcs interativos cross-browser
- [ ] 2 pillar pages indexáveis
- [ ] 8 posts publicados
- [ ] ≥10 páginas totais no sitemap

**DoD adicional (YMYL):**
- [ ] Cada calc tem disclaimer inline above-fold: "Informational only, not advice..."
- [ ] Cada calc tem data-source citation (URL IRS.gov / CRA.gc.ca / Revenu Québec / ECB)
- [ ] Cada calc persiste state em `localStorage` (sem DB)
- [ ] Cada calc tem Share via URL funcional minimum; polish em S3

**Go/No-Go G1 (2026-05-20):** 3 calcs + 2 pillars + 8 posts live? ✅ go S2 / ❌ cortar Currency pra S2.

**Riscos S1:** baixo — packages released em S0; consumer integration é config-based.

**Carry-over para S2:** —

**Spec / Plan:** —

---

## Sprint 2 — Core Complete + Compliance [☐ not-started] (79h)

**Goal:** 4 calcs completos, 4 pillars, 20 posts, LGPD+GDPR+CCPA+**CCPA DNSMPI**+FTC live, 5 afiliados ativos, analytics ativo, `/about` E-E-A-T, `/contact`, `/legal/disclaimer`+`/legal/accuracy`, **tax contractor review signed-off**. Pronto pra AdSense app.
**Estimativa:** 2026-05-20 → 2026-06-10 (3 semanas × ~26h — sprint denso)
**Depende de:** Sprint 1
**Risco alto:** YMYL + compliance gaps — tax contractor sign-off é gating pra AdSense submit

**Epics** (soma = 79h):
- [ ] **Calc 4: Income Tax** (US federal + CA federal/provincial + QC separado) — bracket logic, 1099-NEC + T4A + self-employed lens, jurisdição toggle, FTC disclaimer — **14h**
- [ ] 2 pillar pages restantes (Income Tax + Currency, 2K+ words, FAQ schema, E-E-A-T inline, internal linking) + **Author bio `/about`** (Thiago creator + 4y Canadá + CAD/USD/BRL) — **12h**
- [ ] `@tnf/lgpd` configure + cookie banner — GDPR + LGPD + CCPA + AdSense Consent Mode v2. **Geo-gate:** EEA/UK/CH default denied; US/CA default granted (evita tank de AdSense eCPM); California: CCPA opt-out routing — **5h**
- [ ] Privacy Policy + ToS + FTC 16 CFR 255 disclosure pages (MDX per-locale EN-US, EN-CA) — **5h**
- [ ] **`/legal/disclaimer` + `/legal/accuracy`** (NEW, P0 compliance) — no CPA/CFP/attorney relationship, no fiduciary duty, jurisdictional limits, hold-harmless, IRS/CRA/RQ as authoritative sources, arbitration clause — **3h**
- [ ] **CCPA "Do Not Sell or Share My Personal Information"** footer link per-page + Global Privacy Control (GPC) signal honoring + multi-state opt-out routing (CA/CO/CT/VA/UT) — **2h**
- [ ] **`/contact` page** com email real + DMCA notice template (AdSense Publisher Policy requirement) — **1h**
- [ ] Brevo email capture + "Creator Tax Checklist US/CA" PDF lead magnet + welcome email (bilíngue) — **3h**
- [ ] GA4 + GSC setup + sitemap + conversion events (calc complete, affiliate click, email submit) — **3h**
- [ ] `@tnf/affiliate` integration (5 providers ao vivo, UTM tracking, **FTC disclosure per-link proximity** conforme 2023 FTC guidance + above-fold + footer) — **6h**
- [ ] 12 long-tail blog posts (batch 1b) — **24h**
- [ ] **Tax contractor engagement signed** — SoW em `docs/legal/contractor-sow-tax-2026.md`, nome + credencial + rate + deliverable PDF path + attribution rights (para reviewer byline) — **1h**

**Deliverables:**
- [ ] 4 calcs funcionais, 4 pillars, 20 posts
- [ ] LGPD + GDPR + CCPA + CCPA DNSMPI + FTC live cross-locale
- [ ] 5 afiliados gerando clicks trackeados
- [ ] GA4 + GSC ativos, conversion events disparando
- [ ] `/about`, `/contact`, `/legal/disclaimer`, `/legal/accuracy`, `/legal/privacy`, `/legal/terms`, `/legal/ftc-disclosure` ao vivo
- [ ] Tax contractor SoW assinado + review agendado pra S3 Week 1

**DoD adicional (YMYL-critical):**
- [ ] Cada calc tem citation (IRS.gov / CRA.gc.ca / Revenu Québec URL específica) + "Last reviewed 2026-05"
- [ ] FTC disclosure visível **per-link proximity** (mesma card/parágrafo do CTA, não só above-fold) — `16 CFR 255.5`
- [ ] Consent Mode v2: geo-gate testado (VPN EEA → denied; VPN US → granted)
- [ ] CCPA DNSMPI link visível no footer **em todas as páginas** + GPC signal honored (chrome://flags)
- [ ] `/about` inclui: 4y Canadá, freelance CAD/USD/BRL, YouTube presence (E-E-A-T: Experience + Authority)
- [ ] **Restricted-products content audit:** confirmar zero conteúdo sobre crypto trading advice / payday loans / debt consolidation / binary options (AdSense Publisher Restricted Categories)
- [ ] **LGPD/Consent Mode live ≥7 dias antes de AdSense submit** (prereq explícito — ver critical path)

**Go/No-Go G2 (2026-06-10):** 4 calcs + 4 pillars + 20 posts + LGPD+FTC+DNSMPI + 5 afiliados + tax contractor SoW signed + `/legal/*` live? ✅ contractor review start / ❌ atrasar AdSense 1 sprint.

**Riscos S2:**
- FTC per-link compliance complexity — **mitigação:** legal contractor mini-spike (2h)
- Tax contractor atrasa SoW signature — **mitigação:** começar outreach em S1 Week 2
- YMYL artifacts insuficientes → AdSense auto-reject — **mitigação:** E-E-A-T checklist em PR review
- Restricted-products adjacency via Credit Karma/NerdWallet loan products — **mitigação:** revisar ofertas ativas, whitelist só non-restricted verticals

**Carry-over para S3:** —

**Spec / Plan:** —

---

## Sprint 3 — Polish + AdSense + Launch Prep [☐ not-started] (55h)

**Goal:** Production-ready, AdSense app submitted, 25+ posts, 4 calcs polished, cross-browser QA, Lighthouse ≥90, LCP <2.0s, **tax contractor review received + remediation**, reviewer byline visível.
**Estimativa:** 2026-06-10 → 2026-07-07 (4 semanas × ~14h — polish sprint denso, NÃO é buffer)
**Depende de:** Sprint 2

**Epics** (soma = 55h):
- [ ] **Tax contractor review coordination + remediation** (NEW, P0 fix) — receber PDF, revisar findings, implementar correções em calc-engine + copy + citations, re-review loop — **4h**
- [ ] AdSense application submit — publisher account, site add, finance-vertical pre-submit checklist (jurisdição explícita, disclaimers per-calc, 30d+ age [cumprido pós-S0], 25+ posts, restricted-products audit signed, `/contact` live, ads.txt configurado) — **4h**
- [ ] `@tnf/ads` configure (wait approval) — slot strategy, Consent Mode integration, lazy-load — **7h**
- [ ] Share result via URL query params — polish (`?amount=X&rate=Y&locale=en-US`) — **4h**
- [ ] Sentry + uptime monitoring (free tier alerts) — **2h**
- [ ] OG image generator dynamic (Vercel OG lib) — per-calc + per-post social previews — **6h**
- [ ] Testes — Playwright smoke e2e 4 calcs + Vitest coverage ≥80% calc-engine + **visual regression snapshots pra disclaimer above-fold** (compliance artifact) — **8h**
- [ ] **calc-engine property-based tests (fast-check) nas bracket boundaries + golden snapshots per year** (NEW, P1 fix) — **3h**
- [ ] Performance pass — Lighthouse ≥90 mobile, **LCP <2.0s em 3G throttled** (YMYL finance stricter), CLS <0.1, bundle audit — **6h**
- [ ] Cross-browser QA — Safari macOS + iOS, Chrome, Firefox, Edge, mobile responsive — **4h**
- [ ] **Reviewer byline implementation** — "Reviewed by [Contractor name + credential], [Date]" em cada calc page (se contractor permite attribution per SoW) — **1h**
- [ ] 5 posts extra (batch 1c) — **6h**
- [ ] YouTube launch video EN + PT pre-record — **1h** (content work em paralelo)

> **Dark mode (3h) e Live FX (4h) NÃO estão mais em S3** — movidos de volta pra Fase 2. Audit flagou S3 como polish-denso, não buffer. Sprint tem 13 epics já.

**Deliverables:**
- [ ] AdSense submitted, approval pending (não-bloqueante)
- [ ] 25+ posts live
- [ ] Lighthouse mobile ≥90, LCP <2.0s em 3G throttled
- [ ] Cross-browser QA signed-off (sem P0 bugs)
- [ ] Reviewer byline visível nas 4 calcs
- [ ] Launch video EN + PT encoded
- [ ] `docs/legal/tax-review-2026-06.pdf` arquivado + findings remediados

**DoD adicional:**
- [ ] LCP <2.0s verificado em 3G throttled DevTools (finance YMYL)
- [ ] Zero console errors cross-browser
- [ ] AdSense pre-submit checklist 100%
- [ ] Tax contractor sign-off document + remediation diff committed
- [ ] `docs/legal/ftc-disclosure-audit-2026-06.md` committed (por-link audit)
- [ ] Property-based tests passing em 10K+ iterações (brackets boundaries)

**Go/No-Go G3 — NOVA DATA 2026-07-07 (end of S3, antes de Launch Week):**
- ✅ 4 calcs functional cross-browser
- ✅ Tax contractor sign-off + remediation done
- ✅ Lighthouse ≥90, LCP <2.0s
- ✅ Sentry + GA4 + GSC live
- ✅ AdSense submitted (approval pode estar pending)
- ✅ 5 afiliados ativos trackeando
- ✅ Zero P0 bugs abertos
- ✅ Reviewer byline implementado

Qualquer ❌ → **adiar Launch Week 1 semana** (decisão antes de investir em PH assets). Buffer 17.5% absorve.

**Riscos S3:**
- AdSense approval 7-30d — **mitigação:** launch não bloqueado (5 afiliados Day 1)
- AdSense rejection 1ª tentativa (prob Média) — **mitigação:** pre-submit checklist rigoroso; resubmit em M4 se necessário
- Contractor review flag 3+ issues forçando >4h remediação — **mitigação:** buffer 57h global absorve
- **NPM_TOKEN rotation** PAT expira e CI quebra silencioso — **mitigação:** calendar reminder + `gh auth status` check M1

**Carry-over para Launch:** —

**Spec / Plan:** —

---

## Launch Week (2026-07-08 → 2026-07-15) [☐ not-started] (25h)

**Goal:** Go-live US+CA com comunicação multi-canal coordenada. **Apenas executa se G3 passou em Jul 7.**

**Tasks** (soma = 25h):
- [ ] Product Hunt submission + assets (gallery 6 imgs, tagline, maker first-comment) — **4h**
- [ ] Reddit soft posts — r/digitalnomad, r/creatoreconomy, r/PersonalFinanceCanada, r/freelance — **3h**
- [ ] YouTube launch video EN publish — **2h**
- [ ] YouTube Short PT publish — **1h**
- [ ] Communities outreach — Circle, Beehiiv, Creator Now, Discords creator-finance — **4h**
- [ ] Email blast newsletter existente — **2h**
- [ ] Monitor Sentry + GA4 realtime + respond bugs (first 72h crítico) — **6h**
- [ ] Fix P0 bugs identificados em prod (buffer) — **3h**

**Post-launch first week (Jul 15 → Jul 22):**
- Monitor metrics daily: sessions, bounce, **calc completion rate**, affiliate clicks, email signup
- Hotfix P0
- Respond YouTube comments/DMs
- Tweet thread launch-day metrics (transparency → trust signal)
- Baseline pra Go/No-Go G4 (M4, 2026-11-15)

---

## Cronograma visual

```
Sem:    0    1    2    3    4    5    6    7    8    9   10   11   12   13
        ├────┼────┼────┼────┼────┼────┼────┼────┼────┼────┼────┼────┼────┤
S0 Pkgs ████ ████
S1 App       ████ ████ ████
S2 Core                ████ ████ ████
S3 Polish                        ████ ████ ████ ████
Launch                                                      ████
Dates:  04/15 04/22 04/29 05/06 05/13 05/20 05/27 06/03 06/10 06/17 06/24 07/01 07/07 07/15
                  G0          G1                G2                         G3    🚀
```

## Capacidade vs plano por semana

| Sprint | Semanas | Horas | Horas/semana |
|---|:-:|:-:|:-:|
| S0 | 2 | 49h | ~24.5h ✓ |
| S1 | 3 | 60h | 20h ✓ |
| S2 | 3 | 79h | ~26h (denso — +1h/sem acima de cap 25h, **intencional**: compliance gate G2 é blocker de AdSense e não pode slippar. Se slippar, cortar 2.6 YouTube embeds de Fase 2 pra back-fill batch 2 posts S2 e reequilibrar) |
| S3 | 4 | 55h | ~14h (polish + wait AdSense) |
| Launch | 1 | 25h | 25h ✓ |
| **Total** | **13** | **268h** | **~20.6h média** |

**Capacidade:** 13 × 25h = **325h**. **Buffer: 57h (17.5%)**.

## Riscos específicos da Fase 1 (expandidos pós-audit)

| # | Risco | Prob | Impacto | Sprint | Mitigação |
|---|---|:-:|:-:|:-:|---|
| R1 | Dados fiscais US/CA/QC 2026 desatualizados/tardios | Média | 🔴 alto | S0, recurring | IRS + CRA T4127 + **RQ TP-1015.F** snapshots; contractor S3; **annual refresh Nov-Dec (IRS) + Jan+Jul (CRA/RQ)** |
| R2 | `@tnf/calc-engine` EXTEND estoura 16h → 24h+ | Média | 🟡 médio | S0 | Buffer; fallback cortar `tax/ca/qc` pra S1 |
| R3 | AdSense rejection 1ª tentativa (restricted products adjacency) | Média | 🟡 médio | S3 | Pre-submit rigoroso + restricted-products audit S2 |
| R4 | SEO ramp > 6 meses | Média | 🟡 médio | post-launch | YouTube canal principal = ICP |
| R5 | FTC/CCPA/YMYL/UPL non-compliance | Baixa | 🔴 alto | S2 | Tax + legal contractor; `/legal/disclaimer+accuracy`; DNSMPI; E-E-A-T |
| R6 | Wise/Questrade muda estrutura afiliado | Baixa | 🟡 médio | transversal | 5 afiliados diversificados Day 1 |
| R7 | Burnout | Média | 🔴 alto | transversal | 20.6h/sem média; US+CA only |
| R8 | Wise cookie não é 1-yr | Baixa | 🟢 baixo | S0 | Validar antes de hard-code |
| R9 | **Vercel free tier estourado** (OG images + traffic) | Baixa | 🟡 médio | post-launch | Monitor 80% quota; upgrade Pro $20/mo se >80GB/mês |
| R10 | **GitHub Actions `NPM_TOKEN` PAT expira silencioso** | Média | 🟡 médio | transversal | Calendar reminder; `gh auth status` check mensal; CI fail-fast em 401 |
| R11 | **Cloudflare DNS propagation no launch day** | Baixa | 🔴 alto | Launch | Propagar DNS 7+ dias antes; staging URL até S3 end |
| R12 | **Supply chain / deps audit** | Baixa | 🟡 médio | transversal | Dependabot + `npm audit` no CI; pinned versions; renovate weekly |

Mitigações detalhadas em `~/Workspace/ideias/finreckoner/03-roadmap-creator.md` §8 + este arquivo.

## Métricas de sucesso (primeiros 6 meses pós-launch)

| Métrica | M1 | M3 | M6 (Dez 2026) |
|---|:-:|:-:|:-:|
| Sessions/mês | 500 | 2K | 8-15K |
| Calc completion rate | >40% | >50% | >55% |
| Affiliate CTR | >2% | >3% | >4% |
| Email signup rate | >1% | >2% | >3% |
| MRR (afiliados + AdSense) | R$500 | R$2K | R$4-12K (cons/mod) |
| Lighthouse mobile | ≥90 | ≥92 | ≥94 |
| Indexed pages GSC | 25 | 40 | 60+ |

Baseline pra Go/No-Go G4 (M4, 2026-11-15) — trigger Fase 3.

## 🎉 Phase 1 Complete

Ao fechar Launch Week: MVP ao vivo US+CA, monetizando, indexando. Próximo marco Fase 2 (N2H incluindo dark mode + live FX + Calc 5/6) se M4 passar, ou iteração US+CA se não.
