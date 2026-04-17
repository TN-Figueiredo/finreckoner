import type { Author, BrandConfig, Jurisdiction, LegalLinks, Reviewer } from '@tn-figueiredo/ymyl-ui'

export const BRAND: BrandConfig = {
  brandName: 'finreckoner',
  brandUrl: 'https://finreckoner.com',
  supportEmail: 'hello@finreckoner.com',
  foundedYear: 2026,
  launchedAt: '2026-07-15',
}

export const AUTHOR: Author = {
  name: 'Thiago Figueiredo',
  credential: 'Creator · 4y Canada · multi-currency CAD/USD/BRL income',
  bioUrl: '/about',
  experience: 'Building tools for creators since 2023; finance hobbyist + freelancer tax filer (US 1099-NEC, CA T2125, BR Carnê-Leão).',
}

export const REVIEWER: Reviewer | undefined = undefined

export const JURISDICTIONS: readonly Jurisdiction[] = ['US', 'CA', 'CA-QC'] as const

export const LEGAL_LINKS: LegalLinks = {
  disclaimer: '/legal/disclaimer',
  accuracy: '/legal/accuracy',
  privacy: '/legal/privacy',
  terms: '/legal/terms',
  ftcDisclosure: '/legal/ftc-disclosure',
  contact: '/contact',
  dnsmpi: '/legal/dnsmpi',
}
