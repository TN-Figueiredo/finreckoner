import './globals.css'
import type { Metadata } from 'next'
import { Footer } from '@/components/Footer'
import { SITE_CONFIG } from '@/lib/site-config'
import { SkipLink } from '@/components/layout/skip-link'
import { JsonLd } from '@/components/ui/json-ld'
import { organizationJsonLd } from '@/lib/json-ld'

// hreflang alternates intentionally omitted until /[locale]/* routes exist (Sprint 1+).
// When locale routes ship, wire `buildAlternates` from `@tn-figueiredo/seo/alternates`
// with a populated RouteInventory so build-time validation catches missing paths.
export const metadata: Metadata = {
  title: 'finreckoner — Financial calculators for creators',
  description: 'Multi-country, multi-currency tax & finance calculators built for creators, freelancers, and remote workers.',
  alternates: {
    canonical: SITE_CONFIG.url,
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      'max-image-preview': 'large',
      'max-snippet': -1,
      'max-video-preview': -1,
    },
  },
}

export function generateViewport() {
  return { colorScheme: 'light' as const, themeColor: '#ffffff' }
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <SkipLink />
        {children}
        <Footer />
        <JsonLd data={organizationJsonLd()} />
      </body>
    </html>
  )
}
