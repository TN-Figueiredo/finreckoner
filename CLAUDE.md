# finreckoner

Multi-country financial calculators hub — creator/freelancer/remote-worker lens. [finreckoner.com](https://finreckoner.com).

Source of truth de produto/scoring: `~/Workspace/ideias/finreckoner/` (docs 01–05).
Source of truth de execução: `docs/roadmap/`.

## Stack (intended)

| Camada | Stack | Reuso |
|---|---|---|
| Web | Next.js 15 SSG + React 19 + Tailwind 4 + TypeScript 5 | tnf-scaffold |
| Content | MDX via `@tnf/cms` | INSTALL |
| Calcs | `@tnf/calc-engine` + tax/us + tax/ca + fx | EXTEND (S0) |
| SEO | `@tnf/seo` (hreflang EN-US + EN-CA) | CONFIGURE |
| Consent | `@tnf/lgpd` (LGPD + GDPR + CCPA + Consent Mode v2) | CONFIGURE |
| Ads | `@tnf/ads` (AdSense, lazy-load) | CONFIGURE (pós-approval) |
| Affiliate | `@tnf/affiliate` + Wise + Questrade + Wealthsimple + Credit Karma + NerdWallet | EXTEND (S0) |
| Analytics | GA4 + GSC | Manual |
| Monitoring | Sentry free tier | Manual |
| Hosting | Vercel free tier (M1-M3) | — |

**Reuso:** ~90% (12 INSTALL + 2 EXTEND + 0 NEW).

## Database

**MVP: zero tabelas.** Site é 100% SSG. `localStorage` pra fallbacks de calc. Email captures direto pro Brevo via API.

Pós-launch (M8+): Supabase para `users`, `saved_calcs`, `subscriptions` (gated por Premium tier demand — ver [phase-3-expansion.md](docs/roadmap/phase-3-expansion.md)).

## Packages @tnf/* novos/extendidos

| Package | Sprint | Horas | Tipo |
|---|:-:|:-:|:-:|
| `@tnf/calc-engine` (+ tax/us, tax/ca, fx subpaths) | S0 | 20h (16+4 tests) | EXTEND |
| `@tnf/affiliate` (+4 providers: Questrade, Wealthsimple, Credit Karma, NerdWallet) | S0 | 6h | EXTEND |

**Zero package NEW.** Estratégia pura de reuso + extend.

## Workflow (superpowers)

1. **Brainstorm** → `superpowers:brainstorming` → `docs/superpowers/specs/YYYY-MM-DD-<topic>-design.md`
2. **Plan** → `superpowers:writing-plans` → `docs/superpowers/plans/YYYY-MM-DD-<topic>-plan.md`
3. **Execute** → `superpowers:executing-plans` ou `superpowers:subagent-driven-development`
4. **Update roadmap:** flip status ☐ → 🟡 → ✅, link spec/plan, commit `docs(roadmap): close sprint N`

## YMYL Compliance (Your Money Your Life — Google finance vertical)

Finance sofre escrutínio máximo. **Todo calc page + pillar precisa:**

1. **Author byline** linkando para `/about` (Thiago creator, 4y Canadá, multi-currency CAD/USD/BRL income)
2. **Reviewer byline** (quando tax contractor permitir attribution per SoW) — "Reviewed by [Name, Credential], [Date]". Google QRG 2024 valoriza reviewer credenciado separado do author em YMYL.
3. **"Last reviewed: YYYY-MM"** com tax data source citation:
   - US: IRS.gov Rev. Proc. (publicado Nov-Dec ano anterior)
   - CA (12 prov + terr): CRA T4127 (Jan + Jul editions)
   - **CA QC: Revenu Québec TP-1015.F** (separado, NÃO está no T4127)
   - UK: HMRC.gov.uk
4. **Disclaimer inline, above fold:** "Informational only — not tax, legal, or financial advice. Consult a licensed professional for your specific situation."
5. **Dedicated `/legal/disclaimer` + `/legal/accuracy`** pages (não basta ToS) — UPL (unauthorized practice of law/tax) risk nos US requer disclaimer standalone conspicuous com no-attorney/CPA relationship + no fiduciary duty + jurisdictional limits + hold-harmless.
6. **FTC 16 CFR Part 255 per-link proximity** (2023 guidance update): disclosure deve estar "unavoidable" adjacente a cada endorsement (mesma card/parágrafo do CTA), não só above-fold banner + footer.
7. **Jurisdição explícita:** "US federal only" / "CA federal + provincial (QC treated separately)" — nunca ambíguo
8. **Tax contractor review** pre-launch (S2/S3) e **annual refresh duplo:** Nov-Dec (IRS) + Jan+Jul (CRA/RQ)

## AdSense Finance vertical (rules específicas)

- Cada calc page tem disclaimer dedicado (não basta o global)
- **Sem linguagem "guaranteed returns", "make money fast", "no risk"**
- **Consent Mode v2 geo-gate:** EEA/UK/CH default **denied** (GDPR opt-in); US/CA default **granted** (CCPA opt-out model — senão tank de eCPM). California: CCPA DNSMPI link roteado.
- **CCPA/CPRA "Do Not Sell or Share My Personal Information"** footer link **conspicuous em todas páginas** (wording exato) + **GPC signal** honored + multi-state (CA/CO/CT/VA/UT) opt-out routing.
- **`/contact` page** com email real (AdSense Publisher Policy requirement).
- **ads.txt** servido na raiz desde S0 (placeholder até approval).
- **Restricted-products content audit:** zero crypto trading advice, payday loans, debt-relief services, binary options (Google Publisher Restricted Categories). Credit Karma/NerdWallet ofertas precisam ser whitelisted pra evitar adjacency trip.
- Pre-submit checklist: 30+ days site age, 25+ quality posts, YMYL artifacts completos, privacy + ToS + FTC + `/legal/disclaimer` + `/legal/accuracy` + `/contact` live, Consent Mode geo-gate live ≥7 dias antes.

## Code standards

- TypeScript `strict: true`. **Nunca `any`** — use `unknown` ou tipo específico.
- Zod pra validação de schemas (API input, env vars, tax data).
- Files: kebab-case (`tax-calculator-us.tsx`).
- Classes: PascalCase. Interfaces: `IFooService`. DB columns: snake_case.
- Commits: `tipo: descrição` — `feat`, `fix`, `chore`, `refactor`, `docs`, `ci`.
- Branches: **`main` only** (ecosystem strategy, diferente da regra TNG `staging` + `main`).

## CI (esperado)

`.github/workflows/ci.yml` — typecheck + test + audit + secret-scan + ecosystem pinning + Lighthouse CI (mobile ≥90).

## Roadmap

`docs/roadmap/README.md` — 3 fases.

- **Fase 1 — MVP US+CA:** S0–S3 + Launch, **268h, 13 sem** (Apr 15 → Jul 15, 2026); buffer 17.5%
- **Fase 2 — Nice-to-Have:** 50h, pós-launch flex (inclui dark mode, live FX, Calc 5/6, batch 2 posts)
- **Fase 3 — Expansion (UK/BR/PT/Premium):** gated by G4 metrics M4 (Nov 2026); teto ~316h, realista 120-150h

## O que NÃO fazer

- **Não lançar calc sem disclaimer YMYL inline.** Rejeição automática por Google.
- **Não commitar tax data sem citation oficial** (IRS Rev. Proc. / CRA T4127 / HMRC).
- **Não aceitar afiliado sem FTC disclosure visível above-fold.**
- **Não pular contractor review pré-launch** — custa $500-1K, evita R$10K+ em retrabalho de compliance.
- **Não assumir AdSense aprovado no launch.** 5 afiliados Day 1 cobrem o risco; launch com "ads pending" é aceitável.
- **Não hard-code "1-year cookie" em copy Wise** sem validar no partner portal (S0 task).
- **Não skipar annual tax refresh** (Nov-Dec) — tax brackets desatualizados = calc errado = liability + SEO penalty.
