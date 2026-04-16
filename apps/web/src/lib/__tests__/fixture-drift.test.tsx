// Fixture-to-template drift guard. Renders both templates with fixture data
// and asserts zero React warnings about missing keys/undefined fields. When
// CMS integration reshapes types, this test fails fast if a template reads a
// field the normalizer doesn't provide.
//
// @vitest-environment happy-dom
import { describe, it, expect, vi, afterEach } from 'vitest'
import { render, cleanup } from '@testing-library/react'
import { PillarTemplate } from '@/components/templates/pillar-template'
import { PostTemplate } from '@/components/templates/post-template'
import { pillarFixture } from '@/__fixtures__/pillar.mock'
import { postFixture } from '@/__fixtures__/post.mock'

afterEach(() => cleanup())

describe('fixture drift guard', () => {
  it('PillarTemplate renders fixture without console errors or warnings', () => {
    const errorSpy = vi.spyOn(console, 'error').mockImplementation(() => {})
    const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {})
    render(<PillarTemplate pillar={pillarFixture} content={<p>body</p>} />)
    expect(errorSpy).not.toHaveBeenCalled()
    expect(warnSpy).not.toHaveBeenCalled()
    errorSpy.mockRestore()
    warnSpy.mockRestore()
  })

  it('PostTemplate renders fixture without console errors or warnings', () => {
    const errorSpy = vi.spyOn(console, 'error').mockImplementation(() => {})
    const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {})
    render(<PostTemplate post={postFixture} content={<p>body</p>} />)
    expect(errorSpy).not.toHaveBeenCalled()
    expect(warnSpy).not.toHaveBeenCalled()
    errorSpy.mockRestore()
    warnSpy.mockRestore()
  })
})
