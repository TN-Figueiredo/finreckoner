import { test, expect } from '@playwright/test'

test.describe('/pillars/[slug]', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/pillars/us-ca-tax-basics')
  })

  test('renders H1, meta, disclaimer, citations', async ({ page }) => {
    await expect(page.locator('h1')).toHaveText(/tax basics/i)
    await expect(page.getByText(/By /)).toBeVisible()
    await expect(page.getByText(/Informational only/)).toBeVisible()
    await expect(page.getByText('Sources')).toBeVisible()
  })

  test('emits Article JSON-LD', async ({ page }) => {
    const ld = await page.locator('script[type="application/ld+json"]').first().textContent()
    expect(ld).toContain('"@type":"Article"')
    expect(ld).toContain('"datePublished"')
    expect(ld).toContain('"publisher"')
  })

  test('emits BreadcrumbList JSON-LD', async ({ page }) => {
    const lds = await page.locator('script[type="application/ld+json"]').allTextContents()
    expect(lds.some(ld => ld.includes('"@type":"BreadcrumbList"'))).toBe(true)
  })
})
