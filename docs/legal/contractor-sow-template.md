# Tax Contractor — Statement of Work (SoW) Template

> **Purpose:** reusable template for engaging a tax contractor (CPA / EA / tax attorney) to perform a YMYL compliance review of finreckoner.com calc-engine outputs + on-page disclaimers prior to AdSense submit + public launch.
>
> **Status:** template — copy to `docs/legal/contractor-sow-tax-2026.md` and fill in per-engagement.
>
> **Referenced by:** `docs/roadmap/phase-1-mvp.md` S2 epic "Tax contractor engagement signed" + R5 mitigation + escalation chain.
>
> **Date template last updated:** 2026-04-15

---

## 1. Parties

- **Client:** Thiago Figueiredo (operating `finreckoner.com`), `tnfigueiredotv@gmail.com`
- **Contractor:** `[Name, Credential — e.g., Jane Doe, CPA (US) + EA]`
- **Effective date:** `[YYYY-MM-DD]`
- **Engagement ID:** `contractor-sow-tax-<YYYY>`

## 2. Scope

Contractor will perform a technical review of tax calculation outputs and on-page compliance artifacts for:

- **US federal** — 2026 tax year, IRS Rev. Proc. 2025-32 brackets, standard deduction, FICA + self-employment tax where applicable
- **CA federal + provincial** — 12 provinces/territories per CRA T4127 (Jan 2026 edition)
- **CA QC** — Revenu Québec TP-1015.F (2026) — reviewed as separate jurisdiction (NOT in T4127)

**Review sample:** 6 anchor cases per jurisdiction (18 total) covering low/median/high income + edge-case bracket boundaries, selected from `packages/calc-engine/__tests__/golden/`.

**Scope explicitly excludes:** investment tax (cap gains), estate, international tax treaties, state-level US tax (only federal), corporate tax.

## 3. Deliverables

1. **PDF report** (`docs/legal/tax-review-<YYYY-MM>.pdf`) including:
   - Methodology summary
   - Per-jurisdiction findings (pass / fail / advisory)
   - Bracket table verification against authoritative sources (URL + retrieval date)
   - Disclaimer/citation language review (inline + `/legal/disclaimer` + `/legal/accuracy`)
   - Recommendations with severity (P0 blocker / P1 ship-with-note / P2 nice-to-have)
2. **Remediation diff** — signed-off list of required copy / bracket / citation corrections
3. **Attribution rights** for reviewer byline:
   - ☐ Yes — contractor grants right to display "Reviewed by [Name, Credential], [Date]" on calc pages
   - ☐ No — reviewer remains anonymous; internal audit trail only

## 4. Timeline

- **Standard turnaround:** 15 business days from SoW signature + access grant
- **Rush option:** 5 business days (+50% fee)
- **Revision loop:** up to 1 round of re-review on remediated items, bundled into standard fee; additional rounds billed hourly

## 5. Budget

| Option | Fee range | Notes |
|---|:-:|---|
| Standard (15 bd) | **$500 – $1,000 USD** | flat fee, 3 jurisdictions, 6 anchors each |
| Rush (5 bd) | **$1,500 USD** | flat, same scope, expedited |
| Additional revisions | $150 / hr | after first revision round |
| Out-of-scope spike | $150 / hr | capped at 4h without re-SoW |

## 6. Payment terms

- **50%** on SoW signature (deposit, non-refundable after work start)
- **50%** on PDF delivery + sign-off
- Wire or Wise transfer; contractor invoice required for each milestone
- Currency: USD (default) or CAD (contractor preference, FX locked on SoW date)

## 7. Revisions & change management

- 1 revision round included for items flagged P0/P1
- P2 items batched for annual refresh (Nov-Dec IRS, Jan+Jul CRA/RQ)
- Scope changes require written amendment (email OK) + possible fee adjustment

## 8. Backup escalation (primary contractor unavailable)

If primary contractor cannot sign SoW within 5 business days of outreach (per R5 mitigation, phase-1-mvp.md S2):

1. **Legal Angels** — $600 1-time legal consult (not full tax review)
2. **Per-calc compliance audit** — $150/calc à la carte for disclaimer + citation review only
3. Re-attempt full tax review in S3 Week 2 if escalation path used, else defer to post-launch annual refresh

Escalation trigger is documented in roadmap R5; client initiates within 24h of SoW deadline miss.

## 9. Confidentiality

- Mutual NDA — **reference:** mutual-nda-v1 (to be executed as addendum; template from ContractsCounsel / LegalZoom)
- Contractor shall not disclose: unpublished calc logic, internal TODO lists, commercial terms, client PII
- Client shall not disclose: contractor rates, credential details beyond attribution granted in §3
- Survives termination for 3 years

## 10. Termination

- Either party may terminate with 5 business days written notice
- On termination:
  - Deposit retained for work performed
  - Contractor delivers partial findings in current state (no PDF polish required)
  - Work-product transfers to client on final payment
- Automatic termination if contractor loses credential standing (CPA/EA license)

## 11. Warranties & liability

- Contractor warrants professional standard of care consistent with credential
- Client warrants accuracy of bracket data provided + timely access to repo/staging
- Liability capped at total fees paid under this SoW
- **No fiduciary duty created** — engagement is advisory, not representation

## 12. Governing law

- Jurisdiction: `[Ontario, Canada]` (client residence) — amend to contractor jurisdiction if required
- Disputes: good-faith negotiation → mediation → arbitration (single arbitrator)

## 13. Signatures

```
Client:     __________________________  Date: __________
            Thiago Figueiredo

Contractor: __________________________  Date: __________
            [Name, Credential]
```

---

## Appendix A — Repo access checklist (client provides on signature)

- [ ] Read-only GitHub access to `finreckoner/apps/web` + `tnf-ecosystem/packages/calc-engine`
- [ ] Staging URL + disclaimer copy snapshot
- [ ] Golden test fixtures (`packages/calc-engine/__tests__/golden/`)
- [ ] Bracket source citations (`packages/calc-engine/src/tax/*/years/2026.ts`)
- [ ] Prior review PDFs (if any — first year: n/a)

## Appendix B — Review acceptance criteria (client-side)

- PDF report addresses all 18 anchor cases
- Each finding cites authoritative source URL (IRS.gov / CRA.gc.ca / revenuquebec.ca)
- Severity labels applied consistently (P0/P1/P2)
- Remediation diff is actionable (file path + line range or copy suggestion)
- Reviewer byline attribution decision explicitly documented
