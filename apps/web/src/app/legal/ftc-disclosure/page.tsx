import { FtcDisclosurePage } from '@tn-figueiredo/lgpd/templates'
import { BRAND } from '@/lib/brand-config'

export const metadata = {
  title: 'FTC Affiliate Disclosure — finreckoner',
  description: 'Material connections with affiliate partners per FTC 16 CFR Part 255.',
}

export default function Page() {
  return (
    <main className="max-w-3xl mx-auto px-4 py-12 prose prose-slate">
      <FtcDisclosurePage
        brand={BRAND}
        affiliateProviders={['Wise', 'Questrade', 'Wealthsimple', 'Credit Karma', 'NerdWallet']}
        lastUpdated="2026-04-15"
      />
    </main>
  )
}
