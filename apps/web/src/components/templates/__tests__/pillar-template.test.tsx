// @vitest-environment happy-dom
import { describe, it, expect, afterEach } from 'vitest'
import { render, cleanup } from '@testing-library/react'
import { PillarTemplate } from '../pillar-template'
import { pillarFixture } from '@/__fixtures__/pillar.mock'

afterEach(() => cleanup())

describe('PillarTemplate', () => {
  it('renders h1, author byline, disclaimer, citations', () => {
    const { container, getByText } = render(
      <PillarTemplate pillar={pillarFixture} content={<p>body content</p>} />
    )
    expect(container.querySelector('h1')?.textContent).toBe(pillarFixture.title)
    expect(getByText(/By/)).toBeTruthy()
    expect(getByText(/Informational only/)).toBeTruthy()
    expect(getByText('Sources')).toBeTruthy()
    expect(container.querySelector('script[type="application/ld+json"]')).toBeTruthy()
  })
  it('omits citations section when empty', () => {
    const pillar = { ...pillarFixture, citations: [] }
    const { queryByText } = render(<PillarTemplate pillar={pillar} content={null} />)
    expect(queryByText('Sources')).toBeNull()
  })
  it('omits reviewer when null', () => {
    const pillar = { ...pillarFixture, reviewer: null }
    const { queryByText } = render(<PillarTemplate pillar={pillar} content={null} />)
    expect(queryByText(/Reviewed by/)).toBeNull()
  })
})
