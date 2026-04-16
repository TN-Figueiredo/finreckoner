import type { Metadata } from 'next'
import { getAllPillars } from '@/lib/content'
import { PillarIndex } from '@/components/templates/pillar-index'
import { SITE_CONFIG } from '@/lib/site-config'

const url = `${SITE_CONFIG.url}/pillars`

export const metadata: Metadata = {
  title: `Pillars — ${SITE_CONFIG.siteName}`,
  description: 'Comprehensive guides for cross-border creators and freelancers.',
  alternates: { canonical: url, languages: { 'en-US': url, 'en-CA': url, 'x-default': url } },
  openGraph: { title: 'Pillars', description: 'Cross-border creator guides', url, siteName: SITE_CONFIG.siteName, type: 'website' },
}

export default async function PillarsPage() {
  const pillars = await getAllPillars()
  return <PillarIndex pillars={pillars} />
}
