import { describe, it, expect, vi } from 'vitest'

vi.mock('@/lib/site-config', () => ({
  SITE_CONFIG: { url: 'https://finreckoner.com' },
}))

import { toAbsolute } from '../url'

describe('toAbsolute', () => {
  it('passes absolute URLs through', () => {
    expect(toAbsolute('https://example.com/x')).toBe('https://example.com/x')
  })
  it('resolves relative paths against siteUrl', () => {
    expect(toAbsolute('/pillars/foo')).toBe('https://finreckoner.com/pillars/foo')
  })
  it('handles leading-slash-less paths', () => {
    expect(toAbsolute('pillars/foo')).toBe('https://finreckoner.com/pillars/foo')
  })
})
