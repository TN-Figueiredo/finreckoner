import { test, expect } from '@playwright/test'

test.describe('/pillars/[slug]', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/pillars/us-ca-tax-basics')
  })

  test('renders H1, meta, disclaimer, citations', async ({ page }) => {
    await expect(page.locator('h1')).toHaveText(/tax basics/i)
    await expect(page.getByText(/By /)).toBeVisible()
    // Scope to the above-fold <aside role="note"> to avoid collision with footer disclaimer copy
    await expect(page.locator('aside[role="note"]').filter({ hasText: /Informational only/ }).first()).toBeVisible()
    await expect(page.getByText('Sources')).toBeVisible()
  })

  test('emits Article JSON-LD', async ({ page }) => {
    // Organization, BreadcrumbList, and Article JSON-LD all render; scan all script blocks.
    const lds = await page.locator('script[type="application/ld+json"]').allTextContents()
    const article = lds.find(ld => ld.includes('"@type":"Article"'))
    expect(article).toBeTruthy()
    expect(article!).toContain('"datePublished"')
    expect(article!).toContain('"publisher"')
  })

  test('emits BreadcrumbList JSON-LD', async ({ page }) => {
    const lds = await page.locator('script[type="application/ld+json"]').allTextContents()
    expect(lds.some(ld => ld.includes('"@type":"BreadcrumbList"'))).toBe(true)
  })
})
