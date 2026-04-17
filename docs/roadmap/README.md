# finreckoner — Roadmap

> Multi-country financial calculators hub — creator/freelancer/remote-worker lens.
> **Source of truth de execução:** este diretório.
> **Rationale de produto e scoring:** `~/Workspace/ideias/finreckoner/` (docs 01–05, 2026-04-15).

**Versão:** 2026-04-15 · **Revisão:** 3 (post-S0 audit)

---

## 🟡 Pre-S1 prep phase (2026-04-16 → 04-29)

Três waves antes do S1 kickoff:

1. **Wave 3** ✅ **COMPLETE** — ecosystem 5 packages published (ymyl-ui@0.1.0, lgpd/seo/calc-engine/partner-links @0.2.0)
2. **Wave 4** ✅ **COMPLETE** — CMS consumer scaffold + hygiene · spec [`docs/superpowers/specs/2026-04-16-cms-consumer-scaffold-design.md`](../superpowers/specs/2026-04-16-cms-consumer-scaffold-design.md) · plan [`docs/superpowers/plans/2026-04-16-cms-consumer-scaffold-plan.md`](../superpowers/plans/2026-04-16-cms-consumer-scaffold-plan.md) · ADRs [006](../decisions/006-wave3-hard-escalation-fallback.md) [007](../decisions/007-cms-scaffold-and-wait.md) [008](../decisions/008-cms-consumption-decision.md)
3. **Wave 5** ☐ gated — CMS integration, aguarda `@tn-figueiredo/cms@1.0.0` ship · skeleton [`docs/superpowers/specs/2026-04-16-cms-integration-wave-5-design.md`](../superpowers/specs/2026-04-16-cms-integration-wave-5-design.md)

**G0 (2026-04-29):** Waves 3 ✅ + 4 ✅ done; Wave 5 gated em CMS 1.0.0. S1 kickoff destravado.

## Visão macro

| Fase | Sprints | Horas | Semanas | Status | Arquivo |
|------|:-------:|:-----:|:-------:|:------:|---------|
| **1 — MVP (US+CA launch)** | 0–3 + Launch | 268h | 13 | ☐ not-started | [phase-1-mvp.md](phase-1-mvp.md) |
| **2 — Nice-to-Have (pós-launch)** | — | 50h | ~4 | ☐ not-started | [phase-2-nice-to-have.md](phase-2-nice-to-have.md) |
| **3 — Expansion (UK/BR/PT + Premium)** | M4+ | ~316h teto (realista 120-150h) | TBD | ☐ gated | [phase-3-expansion.md](phase-3-expansion.md) |
| **Total MVP** | 4 sprints + launch | **268h** | **13** | | |

> **Nota sobre totais:** sprint totals = autoridade de execução. Feature catalog do source (216h) diverge por incluir somente features-as-deliverables; sprint totals agregam polish/QA/Lighthouse/cross-browser/compliance coordenação que aparece nos totals mas não é line-item. Revisão 2 pós-audit: Sprint 2 +7h (4 epics compliance P0: `/legal/disclaimer+accuracy` 3h, CCPA DNSMPI 2h, Consent Mode geo-gate 1h, `/contact` 1h); S0 +1h (affiliate terms archive); S3 +4h tax contractor coordination +3h property-based tests −3h dark mode −4h live FX (re-alocados a Fase 2). Sprint 2 typo "65h" → 72h → **79h** pós compliance epics. Phase 2 source citation corrigida de "42h" → **50h**.

**Timeline:** **13 semanas** (não 12 — audit corrigiu: Apr 15 → Jul 15 = 91 dias = 13 sem) a partir de 2026-04-15 → launch US+CA em **2026-07-15**.
**Capacidade planejada:** 25h/semana. **Capacidade total: 13 × 25 = 325h**.
**Buffer global:** 325h − 268h = **57h (17.5%)** — confortável.

## Progresso global

```
░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░  0% (0h / 268h — Sprint 0 não iniciado)
```

**Sprint ativo:** pre-S1 waves ✅ all shipped (Wave 3 publish + Wave 4 scaffold + POST-WAVE-3 swap PR #6). Wave 5 gated em CMS 1.0.0. **S1 kickoff 2026-04-29 (G0)** — calcs + pillars + posts.

## Legenda de status

```
☐ not-started    🟡 in-progress    ✅ done    ⏸ blocked    ❌ cancelled    ⚠ gated
```

Aplicada em 3 níveis: fase, sprint, epic.

## Packages @tnf/* deste projeto

Entregáveis reutilizáveis no ecossistema:

| Package | Sprint | Horas | Tipo | Subpaths | ROI estimado |
|---------|:------:|:-----:|:----:|----------|:------------:|
| `@tnf/calc-engine` | S0 | 20h | EXTEND | `tax/us`, `tax/ca`, `fx` | Reuso MEISimples + Travel + N sites finance future |
| `@tnf/affiliate` | S0 | 6h | EXTEND | Questrade, Wealthsimple, Credit Karma, NerdWallet providers | Reuso todo ecossistema creator-economy |

**Zero package NEW** (estratégia pura de extend + install, diferente do bythiagofigueiredo que teve 3 packages NEW).

## Monetização Day 1 (diversificada)

| Canal | Modelo | Aprovação? | Bloqueia launch? |
|---|---|:-:|:-:|
| **AdSense** (finance $15-50 CPM) | CPM | 7-30d Google | ❌ Não (launch com "ads pending") |
| **Wise** affiliate | CPA $10-50, cookie ⚠ *a validar S0* | Já aprovado | ✅ Day 1 |
| **Questrade** (CA broker) | CPA $70 | Self-service | ✅ Day 1 |
| **Wealthsimple** (CA fintech) | CPA $50 | Self-service | ✅ Day 1 |
| **Credit Karma** (US) | CPA $7-25 | Via network | ✅ Day 1 |
| **NerdWallet** (US) | CPA $100 | Via network | ✅ Day 1 |

> ⚠ **Wise cookie duration:** source doc alega "1-year cookie". Claim não verificado. **Task S0:** confirmar via Wise Partner Portal antes de hard-code em copy. Fallback: usar "long-window affiliate" (neutro).

## YMYL & Compliance (finance vertical — escrutínio máximo Google)

Artifacts baked-in ao cronograma (não são afterthought):

| Artifact | Sprint | Sprint Epic |
|---|:-:|---|
| Author bio `/about` (Thiago creator + multi-currency experience) | S2 | E-E-A-T |
| Calc page disclaimers inline ("not advice") | S1–S2 | Cada calc |
| Tax data citations (IRS.gov, CRA.gc.ca) + "Last reviewed YYYY-MM" | S2 | E-E-A-T |
| FTC 16 CFR 255 affiliate disclosure (above-fold + footer) | S2 | Compliance |
| AdSense Finance-vertical disclaimers + jurisdição explícita | S3 | Ads prep |
| Tax contractor review (signed-off pre-launch) | S3 | Legal gate |
| **Annual tax data refresh (Nov-Dec)** | recurring | Maintenance |

Detalhamento em `CLAUDE.md` e em cada fase.

## Exit criteria — Fase 1 DONE (2026-07-15)

- [ ] `finreckoner.com` live US+CA, SSL, hreflang EN-US + EN-CA, **ads.txt servido**
- [ ] 4 calcs functional: Mortgage (US+CA), Compound Interest, Income Tax (US fed + CA fed/prov + **QC separado via RQ TP-1015.F**), Currency Converter
- [ ] 4 pillar pages + 20 blog posts published (+5 extras em S3 = 25 total mínimo pra AdSense)
- [ ] `@tnf/calc-engine@x.y.0` + `@tnf/affiliate@x.y.0` released em `@figueiredo-technology` registry + cross-repo consumers (MEISimples, bythiagofigueiredo, fan-stamp) bumped sem regressão
- [ ] 5 afiliados ativos + **FTC disclosure per-link proximity** (16 CFR 255.5) + above-fold + footer
- [ ] AdSense submitted (approval pode estar pending — não-bloqueante)
- [ ] LGPD + GDPR + CCPA + Consent Mode v2 live, **com geo-gate** (EEA/UK/CH default denied; US/CA default granted)
- [ ] **CCPA "Do Not Sell or Share My Personal Information"** footer link per-page + **GPC signal honored** + multi-state opt-out routing (CA/CO/CT/VA/UT)
- [ ] `/contact`, `/legal/disclaimer`, `/legal/accuracy`, `/legal/privacy`, `/legal/terms`, `/legal/ftc-disclosure` todos live
- [ ] **Tax contractor review signed-off + remediation done** (YMYL gate)
- [ ] **Reviewer byline** ("Reviewed by [Name, Credential], [Date]") visível em cada calc (se contractor permite attribution per SoW)
- [ ] `/about` com author bio E-E-A-T + citations nas calcs (IRS.gov / CRA T4127 / RQ TP-1015.F / ECB)
- [ ] **Restricted-products content audit** signed-off (zero crypto trading/payday/debt-relief content per AdSense Publisher Restricted Categories)
- [ ] Lighthouse mobile ≥90, **LCP <2.0s em 3G throttled** (YMYL finance), CLS <0.1
- [ ] Sentry + GA4 + GSC ativos, conversion events disparando
- [ ] **Property-based tests (fast-check)** passing em brackets boundaries + golden snapshots per year
- [ ] YouTube launch video EN + PT publicado

## Critical path (visual)

```
S0 [Apr 15–29]    ┌─ @tnf/calc-engine EXTEND (tax/us+ca+fx) ─┐
                  ├─ @tnf/affiliate EXTEND ─┐                │
                  └─ scaffold+domain+cms ───┴─┐              │
                                              ▼              ▼
S1 [Apr 29–May 20]                       cms ready    calc-engine consumer
                  ┌─ 3 calcs (Mortgage, Compound, Currency) ─┐
                  ├─ 2 pillars ─┐                            │
                  └─ 8 posts ───┘                            ▼
                                                      3 calcs live
S2 [May 20–Jun 10]                                           │
                  ┌─ Income Tax US+CA+QC (14h) ──────────────┤
                  ├─ 2 pillars + 12 posts                    │
                  ├─ LGPD + Consent Mode geo-gate ──┐        │
                  ├─ /legal/* + CCPA DNSMPI ────┐   │        │
                  ├─ FTC per-link + /about ─┐   │   │        │
                  ├─ Tax contractor SoW ─┐  │   │   │        │
                  └─ 5 affiliates ───────┴──┴───┴───┴────┐   ▼
                                                        ▼ [LGPD live +7d req]
S3 [Jun 10–Jul 7] compliance OK                             │
                  ├─ Tax contractor review + remediation    │
                  ├─ AdSense app submit + @tnf/ads config    │
                  ├─ Property-based tests + golden snaps     │
                  ├─ OG + share + e2e + Lighthouse ≥90       │
                  └─ Reviewer byline + cross-browser QA      ▼
                                                      Launch Jul 15
```

Critical path: **10-11 semanas**. Timeline: 13 sem. Buffer estrutural: **17.5%**.

**Prereq explícito:** LGPD + Consent Mode v2 devem estar live ≥7 dias antes de AdSense submit (sem isso, submit é auto-reject por policy).

## Go/No-Go gates

| Gate | Data | Critério | Fallback se ❌ |
|---|:-:|---|---|
| **G0 — packages ready** | 2026-04-29 | calc-engine tax/us+ca+fx+qc released, @tnf/affiliate 4 providers released, ads.txt servido, CI green | Cortar tax/ca/qc pra S1 |
| **G1 — S1 end** | 2026-05-20 | 3 calcs + 2 pillars + 8 posts live | Cortar Currency pra S2 |
| **G2 — S2 end** | 2026-06-10 | 4 calcs + 4 pillars + 20 posts + LGPD+FTC+DNSMPI + 5 afiliados + `/legal/*` + tax contractor SoW signed + restricted-products audit | Atrasar AdSense submit 1 sprint |
| **G3 — S3 end** | **2026-07-07** (antes de Launch Week) | Lighthouse ≥90, LCP <2.0s, Sentry live, contractor sign-off + remediation, reviewer byline, zero P0 | Adiar Launch Week 1 sem (buffer absorve) |
| **G4 — M4 metrics** | 2026-11-15 | >1K orgânicos/mês OR >$500 MRR | Iterar US+CA, adiar Fase 3 3 meses |

## Review cadence

- **Fim de cada sprint:** flip status, adicionar links Spec/Plan, commit `docs(roadmap): close sprint N — <resumo>`.
- **Fim de cada fase:** revalidar exit criteria, atualizar changelog, reconsiderar scope próxima fase.
- **Trimestral:** revisar riscos, confrontar estimativas vs realidade, refresh tax data (Nov-Dec).

## Estrutura do diretório

```
docs/
├── roadmap/
│   ├── README.md              ← você está aqui
│   ├── phase-1-mvp.md
│   ├── phase-2-nice-to-have.md
│   └── phase-3-expansion.md
└── superpowers/
    ├── specs/                 ← design docs por milestone
    └── plans/                 ← implementation plans por milestone
```

## Riscos globais (top 5 — lista completa de 12 em phase-1)

| # | Risco | Prob | Impacto | Sprint | Mitigação |
|---|---|:-:|:-:|:-:|---|
| R1 | Dados fiscais US/CA/QC 2026 desatualizados | Média | 🔴 alto | S0, recurring | IRS + CRA T4127 + **RQ TP-1015.F** snapshots; contractor S3; refresh Nov-Dec (IRS) + Jan+Jul (CRA/RQ) |
| R3 | AdSense rejection 1ª tentativa (restricted-products adjacency) | Média | 🟡 médio | S3 | 30d+ age, 25+ posts, YMYL+FTC completo, finance vertical rules, restricted audit |
| R5 | FTC/CCPA/YMYL/UPL non-compliance | Baixa | 🔴 alto | S2 | Legal contractor; per-link disclosure; DNSMPI; `/legal/disclaimer+accuracy`; E-E-A-T |
| R7 | Burnout | Média | 🔴 alto | transversal | 20.6h/sem média (13 sem × 25h cap); buffer 17.5%; US+CA only |
| R11 | Cloudflare DNS propagation no launch day | Baixa | 🔴 alto | Launch | Propagar DNS 7+ dias antes; staging URL até S3 end |

Lista completa de 12 riscos em [phase-1-mvp.md#riscos](phase-1-mvp.md).

## Changelog

- **rev3.4 (2026-04-17):** POST-WAVE-3 swap ✅ shipped — PR #6 merged to `main` (`2391834`). `AuthorByline` + `ReviewerByline` from `@tn-figueiredo/ymyl-ui@0.1.1` replaced inline bylines em pillar + post templates (scope revisto 9 → 4 → 2 componentes após runtime inspection do built JS: `YmylDisclaimer` e `FTCDisclosure` têm semântica calc-specific / per-CTA, impróprias pra content pages). 5 blocks restantes (`YmylDisclaimer` genérico, `FTCDisclosure` above-fold, Jurisdiction, Citations, Last-reviewed fallback) stay inline by design — awaiting `ymyl-ui@0.1.2` epic para `<YmylContentDisclaimer>` / `<Citations>` / `<Jurisdiction>` / `<LastReviewed>`. Adapters (`author.url → bioUrl`, `reviewer.date → reviewedAt`) inline até Wave 5 CMS normalization. CI green: verify + e2e × 2 runs. Spec: [`docs/superpowers/specs/2026-04-17-post-wave-3-swap-design.md`](../superpowers/specs/2026-04-17-post-wave-3-swap-design.md).

- **rev3.3 (2026-04-16 late):** Wave 3 ecosystem publish ✅ COMPLETE — 5 packages live (ymyl-ui@0.1.0 NEW + lgpd/seo/calc-engine/partner-links @0.2.0) via 4 PRs merged to tnf-ecosystem/main. React dispatcher duplication fixed monorepo-wide (consolidate devDeps at root). Staging branch with Wave 2 hygiene legal/* routes now merges cleanly. finreckoner unblocked for POST-WAVE-3 swap (9 inline JSX slots → ymyl-ui components).
- **rev3.2 (2026-04-16):** Pre-S1 prep phase estabelecida — Wave 4 (CMS consumer scaffold + hygiene, independent of Wave 3) + Wave 5 (CMS integration, gated em CMS 1.0.0 ship). Spec + plan + ADRs 006/007/008 + Wave 5 skeleton commitados em `cms-consumer-scaffold` branch.
- **rev3 (2026-04-15):** added R13-R15 (CMS extraction, subagent-speedup decay, Recharts LCP), reduced S2 from 79h→75h, renamed S3, added contractor escalation chain — driven by post-S0 audit.

- **2026-04-15 rev2:** fixes pós 2 auditorias independentes (compliance + engenharia).
  - **P0 calendário:** 12 → **13 semanas** (91 dias = 13 sem); capacidade real 325h; buffer 17.5% (não 13%).
  - **P0 compliance:** `/legal/disclaimer` + `/legal/accuracy` separados (UPL risk); CCPA DNSMPI link + GPC signal; `/contact` page + ads.txt (AdSense Publisher Policy); QC é Revenu Québec TP-1015.F (NÃO CRA T4127).
  - **P0 engenharia:** tax contractor coordination +remediation ganhou 4h em S3 (antes 0h).
  - **P1:** FTC per-link proximity (2023 guidance); Consent Mode geo-gate (US/CA granted, EEA denied); property-based tests (fast-check) em brackets boundaries; cross-repo changeset cascade checklist; reviewer byline visível (se SoW permite); affiliate terms validation archive S0.
  - **P1 S3 não-buffer:** dark mode + live FX voltaram pra Fase 2 (audit flagou 13 epics em S3); S3 agora focado em polish + AdSense + contractor remediation.
  - **P1 G3 movido** Jul 14 → **Jul 7** (antes de Launch Week investment).
  - **P1 AdSense prereq explícito:** LGPD + Consent Mode live ≥7d antes de submit.
  - **Riscos expandidos** R9-R12: Vercel free tier, NPM_TOKEN rotation, DNS propagation, supply chain.
  - **Phase 2 total:** 43h → 50h (source citation corrigida).
  - **Phase 3 total:** ~240h → ~316h teto (realista 120-150h).

- **2026-04-15 rev1:** versão inicial, traduzida de `ideias/finreckoner/03-roadmap-creator.md`. Math sprint totals = autoridade; Sprint 2 typo fixado (65h → 72h); YMYL/E-E-A-T explícito; AdSense finance rules; Wise cookie flag; annual refresh; DoD quantificada; critical path visual; G0–G4 datados.
