← [Roadmap overview](README.md)

# Fase 2 — Nice-to-Have (pós-launch) [☐ not-started]

**Horas:** 50h (source doc §4.2 completo; dark mode e live FX voltaram pra cá após engineering audit flagar que S3 não é sprint buffer)
**Semanas:** ~4 flex (pós-launch, ritmo menor)
**Estimativa:** 2026-07-15 → 2026-09-01 (não-bloqueante; pode deslizar)
**Depende de:** Fase 1 DONE

**Goal:** Completar experiência creator-finance com calcs avançados (Retirement, SE Tax), batch 2 de conteúdo, YouTube integration, dark mode, live FX, print-friendly.

## Exit criteria (Fase 2 → DONE)

- [ ] Calc 5: Retirement Calculator (401k + IRA US, RRSP + TFSA CA) live
- [ ] Calc 6: Self-Employment Tax / Quarterly Estimated (IRS Form 1040-ES) **publicado antes de 2026-09-01** (captura Q3 estimated-tax search traffic, Sep 15 due date)
- [ ] 10 posts extra (batch 2) published
- [ ] YouTube video embeds em ≥3 pillar pages
- [ ] Print-friendly result pages funcionais em todas calcs
- [ ] Live FX rates live (ECB primary + Wise fallback)
- [ ] Dark mode toggle live

## Epics (total = 50h)

| # | Feature | Horas | Descrição |
|---|---|:-:|---|
| 2.1 | **Calc 5: Retirement Calculator** | 10h | 401k + IRA (US), RRSP + TFSA (CA). Contribution limits 2026, income phase-outs |
| 2.2 | **Calc 6: SE Tax / Quarterly Estimated** | 8h | IRS 1040-ES, creator-critical (Q1 tax season 2027). 15.3% SE + income + quarterly dates. **Publicar antes 2026-09-01** |
| 2.3 | Live FX rates (ECB + Wise fallback) | 4h | Replace static rates no Currency Converter |
| 2.4 | Dark mode toggle | 3h | Tailwind dark variant, localStorage preference |
| 2.5 | Print-friendly result pages | 3h | `@media print` CSS, remove CTAs/ads, keep calc result + citation + timestamp |
| 2.6 | 10 more blog posts (batch 2) | 20h | — |
| 2.7 | YouTube video embeds em pillars | 2h | Reforço E-E-A-T, autoplay=0 |

**Total:** **50h** (rev2: audit corrigiu citação anterior "42h" — source doc soma 50h).

## DoD adicional (YMYL — mesma régua de Fase 1)

- [ ] Calcs 5 e 6 têm disclaimer inline + citation (IRS.gov / CRA.gc.ca) + "Last reviewed YYYY-MM"
- [ ] **SE Tax calc passa por tax contractor mini-review** (R$200-400) antes de publicar — creator-critical accuracy
- [ ] **SE Tax calc publicada antes 2026-09-01** (Q3 quarterly due Sep 15) — não depois de Nov-Dec refresh
- [ ] Avaliar afiliado QuickBooks Self-Employed ou FreshBooks pra SE Tax calc — com FTC per-link proximity disclosure
- [ ] Print-friendly preserva citation + disclaimer (compliance, não só UX)
- [ ] Live FX: caching + rate-limit strategy documentada (ECB daily, não realtime)
- [ ] Dark mode respects `prefers-color-scheme` media query + explicit toggle

## Riscos Fase 2

| # | Risco | Prob | Impacto | Mitigação |
|---|---|:-:|:-:|---|
| R13 | Retirement US/CA mais complexa (phase-outs, spousal RRSP) | Média | 🟡 médio | Orçar +4h buffer; escopo MVP = single filer |
| R14 | SE Tax precisão crítica pra audiência creator | Média | 🔴 alto | Ghost-test YouTube audiência; mini-review contractor |
| R15 | Batch 2 atrasa se M4 metrics forçam iteração US+CA | Alta | 🟢 baixo | Fase 2 é flex |
| R16 | **SE Tax perdendo janela Sep 15 Q3** | Média | 🟡 médio | Priorizar 2.2 antes de 2.6 (posts); publicar 2.2 em ~Jul-Ago |
| R17 | ECB FX API rate limits | Baixa | 🟢 baixo | Cache 24h + Wise fallback (dois providers) |

## Integração com Fase 1 outcomes

Fase 2 começa só se:
- Fase 1 launch estável (sem P0 aberto por >1 semana)
- Tax contractor relationship mantido (mini-reviews 2.1, 2.2)
- Bandwidth Thiago ≥15h/sem pós-launch

Caso contrário, **skip Fase 2** e iterar US+CA (mais posts, SEO) até M4 gate.

## Ordem sugerida de execução

1. **2.2 SE Tax** (8h) — **priority**, janela Sep 15
2. **2.1 Retirement** (10h) — anchor pra Q4 retirement-season searches
3. **2.3 Live FX + 2.4 Dark mode + 2.5 Print** (10h) — polish técnico em batch
4. **2.7 YT embeds** (2h) — quick win E-E-A-T
5. **2.6 Posts batch 2** (20h) — spread over 4-6 weeks

## Post-Fase 2 outcomes

- 6 calcs totais → aumenta surface area SEO + cross-linking authority
- SE Tax âncora pra tax season 2027 (Mar-Apr) — evergreen
- Print-friendly → conversão soft (usuários compartilham com contador)
- Dark mode → retenção (creator audience preference signal)

## Changelog

- **2026-04-15 rev2:** total corrigido 43h → 50h (audit flagou citação errada "42h"); dark mode + live FX restaurados (S3 não era buffer); SE Tax timing explícito (publicar antes Sep 15 2026).
