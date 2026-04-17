import { DnsmpiPage } from '@tn-figueiredo/lgpd/templates'
import { BRAND } from '@/lib/brand-config'

export const metadata = {
  title: 'Do Not Sell or Share My Personal Information — finreckoner',
  description: 'Exercise your CCPA/CPRA right to opt out of the sale or sharing of your personal information.',
  robots: { index: true, follow: true },
}

export default function Page() {
  return (
    <main className="max-w-3xl mx-auto px-4 py-12 prose prose-slate">
      <DnsmpiPage brand={BRAND.brandName} contactEmail={BRAND.supportEmail} lastUpdated="2026-04-15" />
    </main>
  )
}
