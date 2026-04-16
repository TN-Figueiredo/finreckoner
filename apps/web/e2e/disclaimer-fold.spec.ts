import { test, expect } from '@playwright/test'

test.use({ viewport: { width: 390, height: 844 } })

test('disclaimer is above the fold on iPhone 14 Pro viewport (pillar)', async ({ page }) => {
  await page.goto('/pillars/us-ca-tax-basics')
  const disclaimer = page.locator('aside[role="note"]').filter({ hasText: /Informational only/ })
  await expect(disclaimer.first()).toBeInViewport({ ratio: 0.5 })
})

test('FTC disclosure is above the fold on post with affiliate links', async ({ page }) => {
  await page.goto('/blog/wise-vs-traditional-banks-transfer-fees')
  const ftc = page.locator('aside[role="note"]').filter({ hasText: /Affiliate disclosure/ })
  await expect(ftc.first()).toBeInViewport({ ratio: 0.5 })
})
