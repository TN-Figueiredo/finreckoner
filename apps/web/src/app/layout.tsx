import './globals.css'
import { Footer } from '@/components/Footer'
import { SITE_CONFIG } from '@/lib/site-config'

// hreflang alternates intentionally omitted until /[locale]/* routes exist (Sprint 1+).
// When locale routes ship, wire `buildAlternates` from `@tn-figueiredo/seo/alternates`
// with a populated RouteInventory so build-time validation catches missing paths.
export const metadata = {
  title: 'finreckoner — Financial calculators for creators',
  description: 'Multi-country, multi-currency tax & finance calculators built for creators, freelancers, and remote workers.',
  alternates: {
    canonical: SITE_CONFIG.url,
  },
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        {children}
        <Footer />
      </body>
    </html>
  )
}
