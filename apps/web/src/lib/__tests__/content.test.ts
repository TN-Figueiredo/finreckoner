import { describe, it, expect } from 'vitest'
import {
  getPillarSlugs,
  getPillarBySlug,
  getAllPillars,
  getPostSlugs,
  getPostBySlug,
  getAllPosts,
} from '../content'

describe('content seam', () => {
  it('getPillarSlugs returns fixture slugs', async () => {
    expect(await getPillarSlugs()).toContain('us-ca-tax-basics')
  })
  it('getPillarBySlug returns null for unknown', async () => {
    expect(await getPillarBySlug('nonexistent')).toBeNull()
  })
  it('getPillarBySlug returns object for known', async () => {
    const p = await getPillarBySlug('us-ca-tax-basics')
    expect(p?.title).toContain('tax basics')
  })
  it('getAllPillars returns array with at least one', async () => {
    expect((await getAllPillars()).length).toBeGreaterThan(0)
  })
  it('getPostSlugs returns fixture slugs', async () => {
    expect(await getPostSlugs()).toContain('wise-vs-traditional-banks-transfer-fees')
  })
  it('getAllPosts returns array with at least one', async () => {
    expect((await getAllPosts()).length).toBeGreaterThan(0)
  })
  it('getPostBySlug null for unknown', async () => {
    expect(await getPostBySlug('nope')).toBeNull()
  })
})
