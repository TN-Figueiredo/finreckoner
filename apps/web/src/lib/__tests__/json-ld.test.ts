import { describe, it, expect, vi } from 'vitest'

vi.mock('@/lib/site-config', () => ({
  SITE_CONFIG: {
    url: 'https://finreckoner.com',
    siteName: 'finreckoner',
    defaultOgImage: 'https://finreckoner.com/og/default.png',
    organization: {
      name: 'finreckoner',
      logoUrl: 'https://finreckoner.com/logo.png',
      sameAs: ['https://twitter.com/tnfigueiredo'],
    },
  },
}))

import { articleJsonLd, breadcrumbJsonLd, organizationJsonLd } from '../json-ld'
import type { PillarMock } from '../content'

const pillar: PillarMock = {
  slug: 'us-tax-basics',
  title: 'US Tax Basics',
  subtitle: 'What every freelancer should know',
  body: null,
  updatedAt: '2026-04-15T00:00:00Z',
  reviewedAt: '2026-04-01T00:00:00Z',
  author: { name: 'Thiago Figueiredo', url: '/about' },
  reviewer: { name: 'Jane CPA', credential: 'CPA', date: '2026-04-02' },
  heroImage: null,
  citations: [{ label: 'IRS Rev. Proc. 2025-32', url: 'https://irs.gov/x', publishedAt: '2025-11-09' }],
  jurisdiction: 'US',
}

describe('articleJsonLd', () => {
  it('emits required Article fields with absolute URLs', () => {
    const ld = articleJsonLd(pillar, 'pillar')
    expect(ld['@context']).toBe('https://schema.org')
    expect(ld['@type']).toBe('Article')
    expect(ld.headline).toBe('US Tax Basics')
    expect(ld.inLanguage).toBe('en')
    expect(ld.image).toBe('https://finreckoner.com/og/default.png')
    expect(ld.datePublished).toBe('2026-04-15T00:00:00Z')
    expect(ld.dateModified).toBe('2026-04-15T00:00:00Z')
    expect(ld.author).toEqual({ '@type': 'Person', name: 'Thiago Figueiredo', url: 'https://finreckoner.com/about' })
    expect(ld.publisher.logo.url).toBe('https://finreckoner.com/logo.png')
    expect(ld.mainEntityOfPage['@id']).toBe('https://finreckoner.com/pillars/us-tax-basics')
    expect(ld.citation).toHaveLength(1)
    expect(ld.citation?.[0]?.url).toBe('https://irs.gov/x')
  })
  it('omits author.url when absent (null-safe)', () => {
    const ld = articleJsonLd({ ...pillar, author: { name: 'Someone' } }, 'pillar')
    expect(ld.author).toEqual({ '@type': 'Person', name: 'Someone' })
  })
  it('omits author entirely when null', () => {
    const ld = articleJsonLd({ ...pillar, author: null }, 'pillar')
    expect(ld.author).toBeUndefined()
  })
  it('omits citation array when empty', () => {
    const ld = articleJsonLd({ ...pillar, citations: [] }, 'pillar')
    expect(ld.citation).toBeUndefined()
  })
  it('falls back to defaultOgImage when heroImage null', () => {
    const ld = articleJsonLd(pillar, 'pillar')
    expect(ld.image).toBe('https://finreckoner.com/og/default.png')
  })
})

describe('breadcrumbJsonLd', () => {
  it('emits positions starting at 1, last item has no item url', () => {
    const ld = breadcrumbJsonLd([
      { label: 'Home', url: '/' },
      { label: 'Pillars', url: '/pillars' },
      { label: 'US Tax Basics' },
    ])
    expect(ld.itemListElement[0]).toMatchObject({ position: 1, name: 'Home', item: 'https://finreckoner.com/' })
    expect(ld.itemListElement[1]).toMatchObject({ position: 2, name: 'Pillars', item: 'https://finreckoner.com/pillars' })
    expect(ld.itemListElement[2].item).toBeUndefined()
  })
})

describe('organizationJsonLd', () => {
  it('emits Organization with sameAs array', () => {
    const ld = organizationJsonLd()
    expect(ld['@type']).toBe('Organization')
    expect(ld.sameAs).toEqual(['https://twitter.com/tnfigueiredo'])
    expect(ld.logo).toBe('https://finreckoner.com/logo.png')
  })
})

describe('snapshot stability', () => {
  it('pillar article JSON-LD snapshot', () => {
    expect(articleJsonLd(pillar, 'pillar')).toMatchSnapshot()
  })
})
