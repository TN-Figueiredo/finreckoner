import { AccuracyPage } from '@tn-figueiredo/ymyl-ui/templates'
import { BRAND } from '@/lib/brand-config'

export const metadata = {
  title: 'Accuracy & sources — finreckoner',
  description: 'Tax data sources (IRS, CRA T4127, Revenu Québec TP-1015.F, ECB) and refresh cadence for finreckoner calculators.',
}

export default function Page() {
  return (
    <main className="max-w-3xl mx-auto px-4 py-12 prose prose-slate">
      <AccuracyPage brand={BRAND} lastReviewed="2026-04-15" />
    </main>
  )
}
