import { PrivacyPolicyPage } from '@tn-figueiredo/lgpd/templates'
import { BRAND } from '@/lib/brand-config'

export const metadata = {
  title: 'Privacy Policy — finreckoner',
  description: 'How finreckoner collects, uses, and protects your data. GDPR, CCPA, and LGPD compliant.',
}

// Data-protection regulations we acknowledge (lgpd/templates jurisdictions enum).
// Distinct from brand-config JURISDICTIONS which are tax jurisdictions (US, CA, CA-QC).
const DATA_JURISDICTIONS: Array<'GDPR' | 'CCPA/CPRA' | 'LGPD' | 'UK-GDPR' | 'PIPEDA'> = [
  'GDPR',
  'CCPA/CPRA',
  'LGPD',
  'UK-GDPR',
  'PIPEDA',
]

export default function Page() {
  return (
    <main className="max-w-3xl mx-auto px-4 py-12 prose prose-slate">
      <PrivacyPolicyPage brand={BRAND.brandName} jurisdictions={DATA_JURISDICTIONS} lastUpdated="2026-04-15" />
    </main>
  )
}
