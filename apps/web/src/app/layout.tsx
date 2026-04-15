import './globals.css'
import { Footer } from '@/components/Footer'
import { SITE_CONFIG } from '@/lib/site-config'

export const metadata = {
  title: 'finreckoner — Financial calculators for creators',
  description: 'Multi-country, multi-currency tax & finance calculators built for creators, freelancers, and remote workers.',
  alternates: {
    canonical: SITE_CONFIG.url,
    languages: {
      'en-US': `${SITE_CONFIG.url}/en-US`,
      'en-CA': `${SITE_CONFIG.url}/en-CA`,
      'x-default': SITE_CONFIG.url,
    },
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
