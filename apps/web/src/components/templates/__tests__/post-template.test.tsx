// @vitest-environment happy-dom
import { describe, it, expect, afterEach } from 'vitest'
import { render, cleanup } from '@testing-library/react'
import { PostTemplate } from '../post-template'
import { postFixture } from '@/__fixtures__/post.mock'

afterEach(() => cleanup())

describe('PostTemplate', () => {
  it('renders FTC disclosure when hasAffiliateLinks true', () => {
    const { getByText } = render(<PostTemplate post={postFixture} content={null} />)
    expect(getByText(/Affiliate disclosure/)).toBeTruthy()
  })
  it('omits FTC when hasAffiliateLinks false', () => {
    const { queryByText } = render(
      <PostTemplate post={{ ...postFixture, hasAffiliateLinks: false }} content={null} />
    )
    expect(queryByText(/Affiliate disclosure/)).toBeNull()
  })
  it('renders ShareButtons', () => {
    const { container } = render(<PostTemplate post={postFixture} content={null} />)
    expect(container.textContent).toContain('Share:')
  })
})
