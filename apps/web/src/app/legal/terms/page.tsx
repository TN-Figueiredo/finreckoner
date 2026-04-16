import { TermsPage } from '@tn-figueiredo/lgpd/templates'
import { BRAND } from '@/lib/brand-config'

export const metadata = {
  title: 'Terms of Service — finreckoner',
  description: 'Terms governing use of finreckoner.com calculators and content.',
}

export default function Page() {
  return (
    <main className="max-w-3xl mx-auto px-4 py-12 prose prose-slate">
      <TermsPage brand={BRAND} jurisdiction="US" governingLaw="State of Delaware" />
    </main>
  )
}
