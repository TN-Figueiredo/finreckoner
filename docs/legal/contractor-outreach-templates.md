# Tax contractor outreach templates

**Purpose:** Three ready-to-send email templates for tax contractor
outreach during Sprint 1 Week 2 (target: 2026-05-06). Outreach 3
candidates in parallel; first to sign SoW within 5 business days wins.
If none responds: activate Legal Angels fallback per
[ADR 005](../decisions/005-wave3-publish-watch.md) + roadmap S2 Riscos.

**Where to source candidates:**
- Upwork (search: "US tax CPA freelance" + "Canada CRA T4127")
- LinkedIn (filter: CPA OR EA + "freelance" + multi-jurisdiction)
- AICPA member directory (https://us.aicpa.org/findacpa)
- CPA Canada referral (https://www.cpacanada.ca)

**Required credentials:** US CPA OR EA (Enrolled Agent) for federal
review; CA CPA Canada designation for federal/provincial review;
Quebec-licensed CPA for Revenu Québec TP-1015.F if separate scope.

---

## Template 1 — Cold outreach (Upwork / LinkedIn)

**Subject:** Tax review SoW — multi-jurisdiction calculator (US fed +
CA fed/prov + QC) for finance content site

Hi [Name],

I run **finreckoner.com** — a multi-country financial calculator hub
launching July 15, 2026, with US + Canada coverage. The site is YMYL
finance vertical (Google's strictest E-E-A-T scrutiny tier), so I'm
hiring a credentialed tax professional to review my tax calculation
engine and `/legal/accuracy` pages **before launch**.

**Scope (rough):**
- Review tax bracket data + outputs from a TypeScript calculation engine
  (`@tn-figueiredo/calc-engine`) — 6 anchor cases per jurisdiction:
  US federal (IRS Rev. Proc. 2025-32 / TY2026), CA federal + Ontario
  provincial (CRA T4127 Jan 2026 edition), Québec separate
  (RQ TP-1015.F 2026).
- Produce a PDF report with findings + remediation diff.
- Optional: allow attribution as "Reviewed by" byline on calc pages
  (improves YMYL E-E-A-T per Google QRG 2024).

**Deliverable + timeline:**
- 15 business day turnaround standard, or 5 business day rush option
  (priced separately).
- 1 round of revisions included.

**Budget:**
- Standard: USD $500–1000 (depending on scope detail)
- Rush: USD $1500
- 50% on signature, 50% on PDF delivery.

I have a 13-section SoW template ready to send; I'd love to schedule a
15-minute intro call this week if you're interested. **Earliest
availability: this week**; I'd like a signed SoW by 2026-05-09 to start
work in S2 (May 13).

If this isn't your fit but you can refer a qualified colleague (US CPA
OR EA + CA CPA preferred for the multi-jurisdiction scope), I'd be
grateful — I'm happy to send a referral fee.

Thanks,
Thiago Figueiredo
finreckoner.com · [calendar link if you have one]

---

## Template 2 — Warm intro (referral, mutual contact)

**Subject:** Tax review for a YMYL finance site — Brian (or [referrer])
suggested I reach out

Hi [Name],

[Referrer name] mentioned you might be a fit for a tax review SoW I'm
sourcing for **finreckoner.com**, a multi-country financial calculator
hub launching July 15, 2026.

The work is a **one-time pre-launch review** of my tax calculation
engine (US federal + CA federal/provincial + Québec) plus the
`/legal/accuracy` page wording. Sweet spot is a CPA or EA with both
US and Canada experience — I have ~6 anchor cases per jurisdiction
already prepared with sources cited (IRS Rev. Proc., CRA T4127, RQ
TP-1015.F).

Budget USD $500–1000, 15 business day turnaround, signed SoW template
ready to send. I'd love a 15-min intro call to sanity-check fit.

Are you open to a conversation this week?

Thanks for considering it,
Thiago

---

## Template 3 — Follow-up (after 3 business days, no response)

**Subject:** Re: Tax review SoW — finreckoner.com

Hi [Name],

Following up on my note from [date]. I have outreach to 2 other
candidates active and want to be respectful of your time —

If now isn't a fit, **no need to reply**; I'll close out my pipeline by
[date+5 business days].

If interested but bandwidth-constrained, even a 5-min "yes I can
respond by next week" is enough to keep you in the conversation.

If a referral comes to mind (US CPA + CA CPA / EA), I'd appreciate the
intro.

Thanks,
Thiago

---

## Negotiation cheat sheet

| If they say... | Counter / response |
|---|---|
| "$500 too low" | Reframe as "review of pre-prepared anchor cases, not original tax research." Offer middle of range ($750) or carve scope (US-only @ $500, add CA later). |
| "I don't do CA + QC" | Scope to US-only at $500. Source CA contractor separately (Upwork CA tax pros). |
| "I need to review the calc engine code" | Send `~/Workspace/tnf-ecosystem-s0-hygiene/packages/calc-engine/src/tax/` source (US/CA/QC bracket files + tests). Offer NDA. |
| "15 business days too tight" | Negotiate 20 business days IF they sign by 2026-05-06 (gives buffer back). Beyond that, activate fallback. |
| "Can I see prior work?" | Send the GitHub repo URL (calc-engine README + CHANGELOG + tests). Mention 165 tests + 6 externally-verified anchors. |
| "Attribution clause concerns me" | Optional. SoW template has `attributionAllowed: false` toggle — anonymous "qualified contributor" byline works for Google E-E-A-T. |

## Escalation triggers (per ADR 005)

- **Day 5 (no responses):** Send Template 3 follow-up to all 3
  candidates. Begin Legal Angels fallback inquiry in parallel.
- **Day 8 (still no SoW signed):** Activate Legal Angels primary —
  $600 1-time consult covers `/legal/disclaimer` + `/legal/accuracy`
  language review only. Schedule contractor 4 (Upwork
  Posted-Project) for the calc-engine review piece.
- **Day 10 (S1 W3, hard wall):** Document escalation in
  `docs/incidents/2026-05-XX-tax-contractor-fallback.md` — invoke S2
  with reduced scope (Legal Angels only, defer engine review to S3
  with $1500 rush budget).

## Where to track

- This file: outreach script.
- `docs/legal/contractor-sow-template.md`: the SoW to send once
  someone's interested.
- `docs/decisions/005-wave3-publish-watch.md`: dates + escalation
  triggers (the schedule master).
- `docs/roadmap/phase-1-mvp.md` Sprint 2 Riscos section: where the
  fallback is documented.
