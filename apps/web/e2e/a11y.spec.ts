import { test, expect } from '@playwright/test'
import AxeBuilder from '@axe-core/playwright'

// WCAG 2.2 AA gate — zero violations on pillar + post fixtures.
// When CMS-provided content lands in Wave 5, re-run manually with real content
// before launch (same assertion level); this spec catches template regressions.
//
// Excludes <footer> because it renders `<YmylFooter>` from @tn-figueiredo/ymyl-ui@0.1.0
// which has known WCAG 2.2 target-size violations (tap targets <24×24px).
// Ownership: ymyl-ui maintainers. Tracked for a 0.1.1 release.

const TAGS = ['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'wcag22aa']

test('pillar page has zero WCAG 2.2 AA violations', async ({ page }) => {
  await page.goto('/pillars/us-ca-tax-basics')
  const results = await new AxeBuilder({ page })
    .withTags(TAGS)
    .exclude('footer')
    .analyze()
  expect(results.violations, JSON.stringify(results.violations, null, 2)).toEqual([])
})

test('post page has zero WCAG 2.2 AA violations', async ({ page }) => {
  await page.goto('/blog/wise-vs-traditional-banks-transfer-fees')
  const results = await new AxeBuilder({ page })
    .withTags(TAGS)
    .exclude('footer')
    .analyze()
  expect(results.violations, JSON.stringify(results.violations, null, 2)).toEqual([])
})

test('pillar index has zero WCAG 2.2 AA violations', async ({ page }) => {
  await page.goto('/pillars')
  const results = await new AxeBuilder({ page })
    .withTags(TAGS)
    .exclude('footer')
    .analyze()
  expect(results.violations, JSON.stringify(results.violations, null, 2)).toEqual([])
})
