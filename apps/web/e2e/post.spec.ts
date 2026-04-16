import { test, expect } from '@playwright/test'

test('/blog/[slug] renders FTC disclosure when affiliate', async ({ page }) => {
  await page.goto('/blog/wise-vs-traditional-banks-transfer-fees')
  await expect(page.getByText(/Affiliate disclosure/)).toBeVisible()
  await expect(page.getByText(/Share:/)).toBeVisible()
})
