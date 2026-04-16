import './globals.css'
import type { Metadata } from 'next'
import { Footer } from '@/components/Footer'
import { SITE_CONFIG } from '@/lib/site-config'
import { SkipLink } from '@/components/layout/skip-link'
import { JsonLd } from '@/components/ui/json-ld'
import { organizationJsonLd } from '@/lib/json-ld'

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
