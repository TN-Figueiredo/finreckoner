// @vitest-environment happy-dom
import { describe, it, expect } from 'vitest'
import { render } from '@testing-library/react'
import { Breadcrumb } from '../breadcrumb'

describe('Breadcrumb', () => {
  it('renders nav + visible links + JSON-LD', () => {
    const { container } = render(
      <Breadcrumb items={[
        { label: 'Home', url: '/' },
        { label: 'Pillars', url: '/pillars' },
        { label: 'US Tax Basics' },
      ]} />
    )
    expect(container.querySelector('nav[aria-label="Breadcrumb"]')).toBeTruthy()
    expect(container.querySelectorAll('a').length).toBe(2)
    expect(container.querySelector('script[type="application/ld+json"]')?.textContent).toContain('BreadcrumbList')
  })
})
