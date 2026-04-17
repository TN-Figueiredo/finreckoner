import { test, expect } from '@playwright/test'

test('/blog/[slug] renders FTC disclosure when affiliate', async ({ page }) => {
  await page.goto('/blog/wise-vs-traditional-banks-transfer-fees')
  // Scope to <article> — YmylFooter + /legal/ftc-disclosure link can produce
  // near-duplicate text in strict mode.
  await expect(page.locator('article').getByText(/Affiliate disclosure/).first()).toBeVisible()
  await expect(page.locator('article').getByText(/Share:/)).toBeVisible()
})
