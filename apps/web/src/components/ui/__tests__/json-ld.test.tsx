import { describe, it, expect } from 'vitest'
import { renderToStaticMarkup } from 'react-dom/server'
import { JsonLd } from '../json-ld'

describe('JsonLd', () => {
  it('renders a script tag with application/ld+json', () => {
    const html = renderToStaticMarkup(<JsonLd data={{ a: 1 }} />)
    expect(html).toContain('<script type="application/ld+json">')
    expect(html).toContain('"a":1')
  })
  it('escapes </script> sequences', () => {
    const html = renderToStaticMarkup(<JsonLd data={{ x: '</script><script>alert(1)</script>' }} />)
    expect(html).not.toMatch(/<\/script><script/)
    expect(html).toContain('\\u003c/script')
  })
})
