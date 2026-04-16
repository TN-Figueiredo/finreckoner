import { test, expect } from '@playwright/test'
import AxeBuilder from '@axe-core/playwright'

// WCAG 2.2 AA gate — zero violations on pillar + post fixtures.
// When CMS-provided content lands in Wave 5, re-run manually with real content
// before launch (same assertion level); this spec catches template regressions.

test('pillar page has zero WCAG 2.2 AA violations', async ({ page }) => {
  await page.goto('/pillars/us-ca-tax-basics')
  const results = await new AxeBuilder({ page })
    .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'wcag22aa'])
    .analyze()
  expect(results.violations, JSON.stringify(results.violations, null, 2)).toEqual([])
})

test('post page has zero WCAG 2.2 AA violations', async ({ page }) => {
  await page.goto('/blog/wise-vs-traditional-banks-transfer-fees')
  const results = await new AxeBuilder({ page })
    .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'wcag22aa'])
    .analyze()
  expect(results.violations, JSON.stringify(results.violations, null, 2)).toEqual([])
})

test('pillar index has zero WCAG 2.2 AA violations', async ({ page }) => {
  await page.goto('/pillars')
  const results = await new AxeBuilder({ page })
    .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'wcag22aa'])
    .analyze()
  expect(results.violations, JSON.stringify(results.violations, null, 2)).toEqual([])
})
