// INTERNAL — replace on CMS integration.
import { authorFixture } from './author.mock'
import { reviewerFixture } from './reviewer.mock'

export const pillarFixture = {
  slug: 'us-ca-tax-basics',
  title: 'US & CA tax basics for multi-currency creators',
  subtitle: 'What freelancers earning across borders need to know before April',
  body: null, // ContentBody opaque; swapped on CMS integration
  updatedAt: '2026-04-15T00:00:00Z',
  reviewedAt: '2026-04-10T00:00:00Z',
  author: authorFixture,
  reviewer: reviewerFixture,
  heroImage: null,
  citations: [
    {
      label: 'IRS Rev. Proc. 2025-32',
      url: 'https://www.irs.gov/pub/irs-drop/rp-25-32.pdf',
      publishedAt: '2025-11-09',
    },
    {
      label: 'CRA T4127 January 2026',
      url: 'https://www.canada.ca/en/revenue-agency/services/forms-publications/payroll/t4127.html',
      publishedAt: '2026-01-01',
    },
  ],
  jurisdiction: 'US-CA' as const,
}
