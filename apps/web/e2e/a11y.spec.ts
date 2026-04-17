import { test, expect } from '@playwright/test'
import AxeBuilder from '@axe-core/playwright'

// WCAG 2.2 AA gate — zero violations on pillar + post fixtures. Covers the
// entire page including <YmylFooter> since @tn-figueiredo/ymyl-ui@0.1.1
// shipped inline padding + font-size baselines on the footer (CHANGELOG).

const TAGS = ['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'wcag22aa']

test('pillar page has zero WCAG 2.2 AA violations', async ({ page }) => {
  await page.goto('/pillars/us-ca-tax-basics')
  const results = await new AxeBuilder({ page }).withTags(TAGS).analyze()
  expect(results.violations, JSON.stringify(results.violations, null, 2)).toEqual([])
})

test('post page has zero WCAG 2.2 AA violations', async ({ page }) => {
  await page.goto('/blog/wise-vs-traditional-banks-transfer-fees')
  const results = await new AxeBuilder({ page }).withTags(TAGS).analyze()
  expect(results.violations, JSON.stringify(results.violations, null, 2)).toEqual([])
})

test('pillar index has zero WCAG 2.2 AA violations', async ({ page }) => {
  await page.goto('/pillars')
  const results = await new AxeBuilder({ page }).withTags(TAGS).analyze()
  expect(results.violations, JSON.stringify(results.violations, null, 2)).toEqual([])
})
