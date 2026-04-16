import { describe, it, expect } from 'vitest'
import { formatDate, formatYearMonth } from '../format'

describe('formatters', () => {
  it('formatDate renders en-US long month-day-year', () => {
    expect(formatDate('2026-04-15')).toBe('April 15, 2026')
  })
  it('formatYearMonth renders en-US long month-year', () => {
    expect(formatYearMonth('2026-04-15')).toBe('April 2026')
  })
  it('formatters handle ISO datetimes', () => {
    expect(formatDate('2026-04-15T12:30:00Z')).toBe('April 15, 2026')
  })
})
