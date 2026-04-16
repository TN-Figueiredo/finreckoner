import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { getPillarSlugs, getPillarBySlug } from '@/lib/content'
import { PillarTemplate } from '@/components/templates/pillar-template'
import { SITE_CONFIG } from '@/lib/site-config'
import { toAbsolute } from '@/lib/url'

export async function generateStaticParams() {
  const slugs = await getPillarSlugs()
  return slugs.map(slug => ({ slug }))
}

export async function generateMetadata(
  { params }: { params: Promise<{ slug: string }> },
): Promise<Metadata> {
  const { slug } = await params
  const pillar = await getPillarBySlug(slug)
  if (!pillar) return {}
  const url = toAbsolute(`/pillars/${pillar.slug}`)
  const image = toAbsolute(pillar.heroImage ?? SITE_CONFIG.defaultOgImage)
  return {
    title: `${pillar.title} — ${SITE_CONFIG.siteName}`,
    description: pillar.subtitle,
    alternates: { canonical: url, languages: { 'en-US': url, 'en-CA': url, 'x-default': url } },
    openGraph: {
      title: pillar.title, description: pillar.subtitle, url,
      siteName: SITE_CONFIG.siteName, type: 'article',
      images: [{ url: image }],
    },
    twitter: { card: 'summary_large_image' },
  }
}

export default async function PillarDetailPage(
  { params }: { params: Promise<{ slug: string }> },
) {
  const { slug } = await params
  const pillar = await getPillarBySlug(slug)
  if (!pillar) notFound()
  return (
    <main id="main-content">
      <PillarTemplate pillar={pillar} content={<p>Pillar content body will be sourced from CMS post-Wave-5. This placeholder renders until then.</p>} />
    </main>
  )
}
