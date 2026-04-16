import { ContactPage } from '@tn-figueiredo/ymyl-ui/templates'
import { BRAND } from '@/lib/brand-config'

export const metadata = {
  title: 'Contact — finreckoner',
  description: 'Get in touch with finreckoner. Includes DMCA takedown notice template per 17 U.S.C. § 512(c).',
}

export default function Page() {
  return (
    <main className="max-w-3xl mx-auto px-4 py-12 prose prose-slate">
      <ContactPage brand={BRAND} />
    </main>
  )
}
