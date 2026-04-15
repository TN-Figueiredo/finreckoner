← [Roadmap overview](README.md)

# Fase 3 — Expansion (locales + Premium + B2B) [☐ gated]

**Horas:** ~240h (breakdown por sub-fase abaixo)
**Semanas:** TBD (gated por métricas M4, 2026-11-15)
**Estimativa:** 2026-11 em diante (earliest start)
**Depende de:** Fase 1 DONE + **Go/No-Go G4 passed**

**Goal:** Expandir locales (UK → BR → PT), calcs (Luxo), e monetização avançada (Premium tier, embeds B2B, API pública) conforme sinal real de demanda — não especulativo.

## Gate de entrada G4 (2026-11-15, M4 post-launch)

| Critério | Threshold | Fonte |
|---|---|---|
| Orgânico mensal | **>1K sessions/mês** | GSC + GA4 |
| Monetização | **OR >$500 MRR** (afiliados + AdSense) | Stripe-style dashboard de tracking |
| Sign-offs | Tax contractor ainda disponível | — |

- ✅ Passa: ativar sub-fases na ordem abaixo
- ❌ Falha: **iterar US+CA** 3 meses (mais posts, SEO, YouTube), re-gate em Fev 2027

---

## Sub-fase 3A — Locale UK (M4–M5, 2026-11 → 2026-12)

**Horas:** ~38h (com UK solicitor review, audit flagou PensionBee + FCA risk)
**Decisão domínio:** (a) registrar `finreckoner.io` OR (b) subdomain `uk.finreckoner.com`. Recomendação: **(b) subdomain** (SEO authority compounds, sem custo extra). Validar com 04-marketing.

**Epics** (soma = 38h):
- [ ] `@tnf/calc-engine` EXTEND: `tax/uk` (HMRC Income Tax 2026-27 brackets, NI Class 2/4 self-employed, Scottish bands separados) — **12h**
- [ ] hreflang EN-GB adicionado ao `@tnf/seo` config — **3h**
- [ ] Calcs 1–6 adaptados UK — Mortgage UK (stamp duty, LTV tiers), Income Tax HMRC (personal allowance, Scottish/rest-UK split) — **8h**
- [ ] 2 pillar pages UK + 5 posts UK (creator-angled: contractor IR35, side-hustle) — **10h**
- [ ] Afiliados UK — Monzo Business, Starling, Wise UK leg. **PensionBee EXCLUÍDO até UK solicitor confirmar Art 33 FPO (Financial Promotion Order) introducer exemption compliance** — **2h**
- [ ] **UK solicitor review (não generalist contractor)** — FCA PERG 8 + s.21 FSMA: "invitation or inducement to engage in investment activity" precisa authorization ou exempt. Pensions são regulated activity. Budget R$3-5K — **3h coordination**

**DoD YMYL UK:**
- [ ] Citations HMRC.gov.uk inline
- [ ] IR35 disclaimer (complexo, creator-relevant)
- [ ] Scottish vs rest-of-UK explícito onde aplicável
- [ ] **Zero affiliate link touching pensions/investments sem UK solicitor sign-off**
- [ ] "Informational only" framing + FCA disclaimer específico em UK pages

---

## Sub-fase 3B — Locale BR + PT (M6+, ~2027-Q1)

**Horas:** ~38h (bumped from 30h — audit flagou CVM 178/2023 + CVM 175 scope subestimado)
**Depende de:** MEISimples ter `@tnf/calc-engine` tax/br estável e compartilhado

**Epics** (soma = 38h):
- [ ] hreflang PT-BR + PT-PT — **3h**
- [ ] Conteúdo traduzido (4 pillars + 20 posts chave, não todos 25+) — **20h**
- [ ] Afiliados BR — Rico, NuInvest, Wise BR leg — **3h**
- [ ] **CVM 178/2023 + CVM 175 compliance review** com BR counsel dedicado (R$3-5K, não legal generalist) — **12h**. Calcs "invest X → retire with Y" brush against analista de valores mobiliários regulation; afiliados Rico/NuInvest (distribuidoras) + allocation suggestions triggers CVM scope. Framing: "educacional, não recomendação de investimento" explícito.

**DoD YMYL BR/PT:**
- [ ] CVM 178/2023 + CVM 175 disclaimers em páginas com investment-related content
- [ ] Citações: Receita Federal (BR), Portal das Finanças (PT)
- [ ] **BR counsel sign-off** (não legal generalist) pra qualquer affiliate link investment-adjacent
- [ ] Zero allocation suggestions sem explicit "educational only, not recommendation"

---

## Sub-fase 3C — Luxo (qualquer M6+, gated por bandwidth)

| # | Feature | Horas | Trigger |
|---|---|:-:|---|
| 3C.1 | +10 calcs (BMI, tip, refinance, loan payoff, net worth, savings goal, etc) | 80h | >5K sessions/mês |
| 3C.2 | Saved calculations (localStorage → Supabase) | 20h | >500 email subs |
| 3C.3 | PWA + offline mode (service worker, manifest) | 12h | >20% mobile repeat visits |
| 3C.4 | Comparison tool (2 scenarios lado-a-lado) | 16h | Feedback explícito de usuários |

**Soma Luxo:** 128h total, mas cada feature é independente — fazer só as que passarem trigger.

---

## Sub-fase 3D — Monetização avançada (M8–M12+)

| # | Feature | Horas | Trigger |
|---|---|:-:|---|
| 3D.1 | **Premium tier** $4.99/mo (no ads, saved history, priority email) | 40h | >500 email subs + >5% abriram "would pay" signal |
| 3D.2 | `@tnf/admin` básico (user mgmt, metrics dashboard) | 16h | 3D.1 triggered |
| 3D.3 | Embed widgets B2B (iframe calcs + tracking) | 24h | Inbound inquiry from publisher |
| 3D.4 | API pública rate-limited (Fastify + Supabase) | 32h | 3D.3 triggered + ≥3 publishers |

**Soma Monetização Avançada:** 112h.

**Anti-pattern guard:** não construir Premium/API/Embeds sem demand signal real. Thiago não quer sales motion — **inbound-only**.

---

## Resumo de horas Fase 3

| Sub-fase | Horas | Gating |
|---|:-:|---|
| 3A — UK (inclui solicitor review) | 38h | G4 ✅ + UK solicitor available |
| 3B — BR+PT (inclui CVM counsel) | 38h | MEISimples tax/br pronto + BR counsel |
| 3C — Luxo (total) | 128h | Per-feature trigger |
| 3D — Monetização avançada | 112h | Per-feature demand signal |
| **Soma teto** | **316h** | — |

Realisticamente em 2027: 3A + 3B + 2-3 items Luxo + Premium se sinal = **~130-160h**.

## Riscos Fase 3

| # | Risco | Prob | Impacto | Mitigação |
|---|---|:-:|:-:|---|
| R12 | Premium conversion <1% | Alta | 🟡 médio | Gate em 500 subs + explicit signal; não codar antes |
| R13 | UK tax law change (post-Brexit complexity) | Baixa | 🟡 médio | HMRC tracking + annual refresh |
| R14 | MEISimples não compartilha tax/br a tempo | Média | 🟢 baixo | Fase 3B é flex; pode adiar |
| R15 | CVM 178/2023 review BR mais caro que esperado | Média | 🟡 médio | Orçar R$2K buffer legal; considerar "informational" framing agressivo |
| R16 | Embed B2B requer sales motion que Thiago não quer | Média | 🟡 médio | Inbound-only; se não vier, skip 3D.3/3D.4 |

## Interação com ecossistema @tnf/*

Fase 3 contribuições de volta ao ecossistema:

| Package | Contribuição | Beneficiário |
|---|---|---|
| `@tnf/calc-engine` | `tax/uk` subpath novo | Futuro UK-finance site |
| `@tnf/affiliate` | +UK providers, +BR providers | Sites creator BR/UK |
| `@tnf/admin` | Consumer #2 (após bythiagofigueiredo) | Valida design genérico |
| `@tnf/billing` | Primeiro consumer real (Premium) | MEISimples future |

## 🎯 Definition of Fase 3 Complete

Fase 3 não tem "done" monolítico — é modular. Cada sub-fase fecha independente.

**Success signal global:** MRR composto >R$8-12K em Dez 2026 (source doc target moderado) ou >R$15-20K (otimista). Se hit → Thiago valida founder-market fit e pode justificar focus.

## Changelog

- **2026-04-15 rev2:** pós-audit compliance — UK 3A bumped 35h→38h (UK solicitor + PensionBee exclusão); BR 3B bumped 30h→38h (CVM 178/2023 + CVM 175 scope real, BR counsel R$3-5K). Total teto 305h → **316h**; realista 120-150h → 130-160h.
- **2026-04-15 rev1:** versão inicial, extraída de source doc §4.3 + §4.4 + §12 com gating explícito e triggers per-feature.
