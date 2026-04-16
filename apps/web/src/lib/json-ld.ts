import { SITE_CONFIG } from '@/lib/site-config'
import { toAbsolute } from '@/lib/url'
import type { PillarMock, PostMock } from '@/lib/content'

type Breadcrumb = { label: string; url?: string }

export function articleJsonLd(entity: PillarMock | PostMock, kind: 'pillar' | 'post') {
  const routePrefix = kind === 'pillar' ? '/pillars' : '/blog'
  const datePublished = 'publishedAt' in entity ? entity.publishedAt : entity.updatedAt
  return {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: entity.title,
    description: entity.subtitle,
    inLanguage: 'en',
    image: toAbsolute(entity.heroImage ?? SITE_CONFIG.defaultOgImage),
    datePublished,
    dateModified: entity.updatedAt,
    author: entity.author ? {
      '@type': 'Person',
      name: entity.author.name,
      ...(entity.author.url ? { url: toAbsolute(entity.author.url) } : {}),
    } : undefined,
    publisher: {
      '@type': 'Organization',
      name: SITE_CONFIG.organization.name,
      logo: {
        '@type': 'ImageObject',
        url: toAbsolute(SITE_CONFIG.organization.logoUrl),
      },
    },
    mainEntityOfPage: {
      '@type': 'WebPage',
      '@id': toAbsolute(`${routePrefix}/${entity.slug}`),
    },
    citation: entity.citations?.length
      ? entity.citations.map((c) => ({
          '@type': 'CreativeWork',
          name: c.label,
          url: toAbsolute(c.url),
          datePublished: c.publishedAt,
        }))
      : undefined,
  }
}

export function breadcrumbJsonLd(items: Breadcrumb[]) {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, i) => ({
      '@type': 'ListItem',
      position: i + 1,
      name: item.label,
      ...(item.url ? { item: toAbsolute(item.url) } : {}),
    })),
  }
}

export function organizationJsonLd() {
  return {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: SITE_CONFIG.organization.name,
    url: SITE_CONFIG.url,
    logo: toAbsolute(SITE_CONFIG.organization.logoUrl),
    ...(SITE_CONFIG.organization.sameAs?.length ? { sameAs: SITE_CONFIG.organization.sameAs } : {}),
  }
}
