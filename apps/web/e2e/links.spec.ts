import { test, expect } from '@playwright/test'

test('internal navigation from home through content hits all 200s', async ({ page }) => {
  const route = async (path: string) => {
    const resp = await page.goto(path)
    expect(resp?.status()).toBeLessThan(400)
  }
  await route('/')
  await route('/pillars')
  await route('/pillars/us-ca-tax-basics')
  await route('/blog')
  await route('/blog/wise-vs-traditional-banks-transfer-fees')
})

test('external links open in new tab with rel="noopener noreferrer"', async ({ page }) => {
  await page.goto('/pillars/us-ca-tax-basics')
  const externals = page.locator('a[target="_blank"]')
  const count = await externals.count()
  for (let i = 0; i < count; i++) {
    const rel = await externals.nth(i).getAttribute('rel')
    expect(rel).toContain('noopener')
    expect(rel).toContain('noreferrer')
  }
})
