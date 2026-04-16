import { PrivacyPolicyPage } from '@tn-figueiredo/lgpd/templates'
import { BRAND, JURISDICTIONS } from '@/lib/brand-config'

export const metadata = {
  title: 'Privacy Policy — finreckoner',
  description: 'How finreckoner collects, uses, and protects your data. GDPR, CCPA, and LGPD compliant.',
}

export default function Page() {
  return (
    <main className="max-w-3xl mx-auto px-4 py-12 prose prose-slate">
      <PrivacyPolicyPage brand={BRAND} jurisdictions={JURISDICTIONS} lastUpdated="2026-04-15" />
    </main>
  )
}
