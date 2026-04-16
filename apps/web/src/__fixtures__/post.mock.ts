// INTERNAL — replace on CMS integration.
import { authorFixture } from './author.mock'
import { reviewerFixture } from './reviewer.mock'

export const postFixture = {
  slug: 'wise-vs-traditional-banks-transfer-fees',
  title: 'Wise vs traditional banks: transfer fees for cross-border freelancers',
  subtitle: 'How to save $300+/yr on USD→CAD payroll conversions',
  body: null,
  updatedAt: '2026-04-12T00:00:00Z',
  reviewedAt: '2026-04-10T00:00:00Z',
  publishedAt: '2026-04-12T00:00:00Z',
  author: authorFixture,
  reviewer: reviewerFixture,
  heroImage: null,
  citations: [],
  jurisdiction: 'US-CA' as const,
  hasAffiliateLinks: true,
}
