import { DisclaimerPage } from '@tn-figueiredo/ymyl-ui/templates'
import { BRAND, JURISDICTIONS } from '@/lib/brand-config'

export const metadata = {
  title: 'Disclaimer — finreckoner',
  description: 'Informational only — no professional advisory relationship. Jurisdictional limits and authoritative sources for finreckoner.com.',
}

export default function Page() {
  return (
    <main className="max-w-3xl mx-auto px-4 py-12 prose prose-slate">
      <DisclaimerPage
        brand={BRAND}
        jurisdictions={JURISDICTIONS}
        lastUpdated="2026-04-15"
      />
    </main>
  )
}
